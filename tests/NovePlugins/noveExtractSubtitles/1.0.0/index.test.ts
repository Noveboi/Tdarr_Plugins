import {
  plugin as sut,
} from '../../../../FlowPluginsTs/CommunityFlowPlugins/subtitles/noveExtractEmbeddedSubtitles/1.0.0/index';
import { CLI } from '../../../../FlowPluginsTs/FlowHelpers/1.0.0/cliUtils';

import { PluginInputArgsBuilder } from '../../../../FlowPluginsTs/FlowHelpers/1.0.0/nove/pluginHelper';

// Mock the CLI class
jest.mock('../../../../FlowPluginsTs/FlowHelpers/1.0.0/cliUtils', () => ({
  CLI: jest.fn().mockImplementation(() => ({
    runCli: jest.fn().mockResolvedValue({ cliExitCode: 0 }),
  })),
}));

describe('Embedded Subtitle Extraction', () => {
  const getCli = (): jest.Mock<CLI> => require('../../../../FlowPluginsTs/FlowHelpers/1.0.0/cliUtils').CLI;
  const getSpawnArgs = (cliMock?: jest.Mock<CLI>): string[] => {
    const cli = cliMock ?? getCli();
    const [cliOptions] = cli.mock.calls[0];

    return cliOptions.spawnArgs;
  };

  beforeEach(() => {
    const cli = require('../../../../FlowPluginsTs/FlowHelpers/1.0.0/cliUtils').CLI;
    cli.mockImplementation(() => ({
      runCli: jest.fn().mockResolvedValue({ cliExitCode: 0 }), // mock successful status code
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Standard Use Cases', () => {
    it('should do nothing when no subtitles exist', async () => {
      const args = new PluginInputArgsBuilder().build();

      const output = await sut(args);
      const cli = getCli();

      expect(cli.mock.calls.length).toBe(0);
      expect(args.jobLog).toHaveBeenCalledWith('No subtitles found, exiting');
      expect(output.outputNumber).toBe(2);
      expect(output.outputFileObj).toBe(args.inputFileObj);
      expect(output.variables).toBe(args.variables);
    });

    it('should properly select stream for existing subtitle', async () => {
      const args = new PluginInputArgsBuilder()
        .withInputFile('Gladiator (2000).mkv')
        .addSubtitleStream()
        .build();

      const output = await sut(args);
      const cli = getCli();
      const spawnArgs = getSpawnArgs(cli);

      expect(output.outputNumber).toBe(1);
      expect(output.outputFileObj).toBe(args.inputFileObj);

      expect(cli.mock.calls.length).toBe(1);
      expect(spawnArgs).toEqual(
        expect.arrayContaining([
          '-y',
          '-i',
          'Gladiator (2000).mkv',
          '-map',
          '0:0',
          '-c',
          'copy',
        ]),
      );
    });

    it('should properly set output filename for subtitle stream', async () => {
      const args = new PluginInputArgsBuilder()
        .withInputFile('Project Hail Mary (2026).mkv')
        .addSubtitleStream({ tags: { language: 'ell' } })
        .build();

      const output = await sut(args);
      const spawnArgs = getSpawnArgs();

      expect(output.outputNumber).toBe(1);
      expect(output.outputFileObj).toBe(args.inputFileObj);
      expect(spawnArgs).toEqual(
        expect.arrayContaining(['Project Hail Mary (2026).ell.srt']),
      );
    });

    it('should properly set output filename for multiple subtitle streams', async () => {
      const args = new PluginInputArgsBuilder()
        .withInputFile('Obsession (2025).mkv')
        .addSubtitleStream({ tags: { language: 'eng' } })
        .addSubtitleStream({ tags: { language: 'ell' } })
        .addSubtitleStream({ tags: { language: 'fre' } })
        .build();

      const output = await sut(args);
      const spawnArgs = getSpawnArgs();

      expect(output.outputNumber).toBe(1);
      expect(output.outputFileObj).toBe(args.inputFileObj);
      expect(spawnArgs).toEqual(
        expect.arrayContaining([
          'Obsession (2025).eng.srt',
          'Obsession (2025).ell.srt',
          'Obsession (2025).fre.srt',
        ]),
      );
    });

    it('should skip subtitle streams without a language tag', async () => {
      const args = new PluginInputArgsBuilder()
        .addSubtitleStream({ tags: { language: 'ell' } })
        .addSubtitleStream({ tags: undefined })
        .build();

      const output = await sut(args);

      expect(output.outputNumber).toBe(1);
      expect(output.outputFileObj).toBe(args.inputFileObj);
      expect(args.jobLog).toHaveBeenCalledWith('Skipping subtitle #1, reason: No language defined for subtitle');
    });
  });
});
