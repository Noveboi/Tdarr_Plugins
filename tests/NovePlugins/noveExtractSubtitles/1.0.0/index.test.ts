import {
  plugin as sut,
} from '../../../../FlowPluginsTs/CommunityFlowPlugins/ffmpegCommand/noveExtractEmbeddedSubtitles/1.0.0/index';

import {
  plugin as executeCommandPlugin,
} from '../../../../FlowPluginsTs/CommunityFlowPlugins/ffmpegCommand/ffmpegCommandExecute/1.0.0/index';

import { PluginInputArgsBuilder } from '../../../../FlowPluginsTs/FlowHelpers/1.0.0/nove/pluginHelper';
import { IpluginInputArgs } from '../../../../FlowPluginsTs/FlowHelpers/1.0.0/interfaces/interfaces';

// Mock the CLI class
jest.mock('../../../../FlowPluginsTs/FlowHelpers/1.0.0/cliUtils', () => ({
  CLI: jest.fn().mockImplementation(() => ({
    runCli: jest.fn().mockResolvedValue({ cliExitCode: 0 }),
  })),
}));

describe('Embedded Subtitle Extraction', () => {
  describe('Standard Use Cases', () => {
    it('should do nothing when no subtitles exist', () => {
      const args = new PluginInputArgsBuilder().build();

      const output = sut(args);

      expect(args.jobLog).toHaveBeenCalledWith('No subtitles found, exiting');
      expect(output.outputNumber).toBe(2);
      expect(output.outputFileObj).toBe(args.inputFileObj);
      expect(output.variables).toBe(args.variables);
    });

    it('should properly select stream for existing subtitle', () => {
      const args = new PluginInputArgsBuilder()
        .addSubtitleStream({})
        .build();

      const output = sut(args);
      const subStream = output.variables.ffmpegCommand.streams[0];

      expect(output.outputNumber).toBe(1);
      expect(output.outputFileObj).toBe(args.inputFileObj);
      expect(subStream.outputArgs).toContain('-map 0:s:{outputTypeIndex}');
    });

    it('should properly set output filename for subtitle stream', () => {
      const filenameNoExtension = 'Epic Movie';
      const extension = 'mkv';
      const args = new PluginInputArgsBuilder()
        .withInputFile(`${filenameNoExtension}.${extension}`)
        .addSubtitleStream({ tags: { language: 'eng' } })
        .build();

      const output = sut(args);
      const subStream = output.variables.ffmpegCommand.streams[0];

      expect(output.outputNumber).toBe(1);
      expect(output.outputFileObj).toBe(args.inputFileObj);
      expect(subStream.outputArgs).toContain('-map 0:s:{outputTypeIndex}');
      expect(subStream.outputArgs).toContain(`${filenameNoExtension}.eng.srt`);
    });

    it('should properly set output filename for multiple subtitle streams', () => {
      const filenameNoExtension = 'Obsession (2025)';
      const extension = 'mkv';
      const args = new PluginInputArgsBuilder()
        .withInputFile(`${filenameNoExtension}.${extension}`)
        .addSubtitleStream({ tags: { language: 'eng' } })
        .addSubtitleStream({ tags: { language: 'ell' } })
        .addSubtitleStream({ tags: { language: 'fre' } })
        .build();

      const output = sut(args);
      const engSubStream = output.variables.ffmpegCommand.streams[0];
      const ellSubStream = output.variables.ffmpegCommand.streams[1];
      const freSubStream = output.variables.ffmpegCommand.streams[2];

      expect(output.outputNumber).toBe(1);
      expect(output.outputFileObj).toBe(args.inputFileObj);
      expect(engSubStream.outputArgs).toContain('-map 0:s:{outputTypeIndex}');
      expect(ellSubStream.outputArgs).toContain('-map 0:s:{outputTypeIndex}');
      expect(freSubStream.outputArgs).toContain('-map 0:s:{outputTypeIndex}');
      expect(engSubStream.outputArgs).toContain(`${filenameNoExtension}.eng.srt`);
      expect(ellSubStream.outputArgs).toContain(`${filenameNoExtension}.ell.srt`);
      expect(freSubStream.outputArgs).toContain(`${filenameNoExtension}.fre.srt`);
    });

    it('should skip subtitle streams without a language tag', () => {
      const args = new PluginInputArgsBuilder()
        .addSubtitleStream({ tags: { language: 'ell' } })
        .addSubtitleStream({ tags: undefined })
        .build();

      const output = sut(args);

      expect(output.outputNumber).toBe(1);
      expect(output.outputFileObj).toBe(args.inputFileObj);
      expect(args.jobLog).toHaveBeenCalledWith('Skipping subtitle #1, reason: No language defined for subtitle');
    });
  });

  describe('Integration with "ffmpeg command execute" plugin', () => {
    const execute = executeCommandPlugin;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let cli: any;

    beforeEach(() => {
      cli = require('../../../../FlowPluginsTs/FlowHelpers/1.0.0/cliUtils').CLI;
      cli.mockImplementation(() => ({
        runCli: jest.fn().mockResolvedValue({ cliExitCode: 0 }),
      }));
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should map single subtitle stream to proper output file', async () => {
      const args = new PluginInputArgsBuilder()
        .withInputFile('Flow (2024).mkv')
        .addSubtitleStream({ tags: { language: 'ell' } })
        .build();

      const output = sut(args);
      const input: IpluginInputArgs = {
        ...args,
        variables: output.variables,
      };

      const result = await execute(input);
      const { spawnArgs } = cli.mock.calls[0];

      expect(result.outputNumber).toBe(1);
      expect(spawnArgs).toEqual(
        expect.arrayContaining([
          '-map 0:s:0 Flow (2024).ell.srt',
        ]),
      );
    });
  });
});
