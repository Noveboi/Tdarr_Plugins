import {
  plugin as sut,
} from '../../../../FlowPluginsTs/CommunityFlowPlugins/subtitles/noveExtractEmbeddedSubtitles/1.0.0/index';
import { CLI } from '../../../../FlowPluginsTs/FlowHelpers/1.0.0/cliUtils';

import { PluginInputArgsBuilder } from '../../../../FlowPluginsTs/FlowHelpers/1.0.0/nove/pluginHelper';

jest.mock('../../../../FlowPluginsTs/FlowHelpers/1.0.0/cliUtils', () => ({
  CLI: jest.fn().mockImplementation(() => ({
    runCli: jest.fn().mockResolvedValue({ cliExitCode: 0 }),
  })),
}));

describe('Embedded Subtitle Extraction', () => {
  const getCli = (): jest.Mock<CLI> => require('../../../../FlowPluginsTs/FlowHelpers/1.0.0/cliUtils').CLI;

  const getCliOptions = (cliMock?: jest.Mock<CLI>): Record<string, any> => {
    const cli = cliMock ?? getCli();
    const [cliOptions] = cli.mock.calls[0];

    return cliOptions;
  };

  const getSpawnArgs = (cliMock?: jest.Mock<CLI>): string[] => getCliOptions(cliMock).spawnArgs;

  const getSubtitleOutputFilenames = (spawnArgs: string[]): string[] => spawnArgs
    .filter((arg) => /\.(srt|ass|vtt|sup)$/i.test(arg));

  const withInputs = <T extends ReturnType<PluginInputArgsBuilder['build']>>(
    args: T,
    inputs: Record<string, unknown>,
  ): T => {
    Object.assign(args, {
      inputs: {
        ...(args as any).inputs,
        ...inputs,
      },
    });

    return args;
  };

  beforeEach(() => {
    const cli = require('../../../../FlowPluginsTs/FlowHelpers/1.0.0/cliUtils').CLI;

    cli.mockImplementation(() => ({
      runCli: jest.fn().mockResolvedValue({ cliExitCode: 0 }),
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('standard use cases', () => {
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
        .addSubtitleStream({
          codec_name: 'subrip',
          tags: { language: 'eng' },
        })
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
          '-c:s',
          'copy',
          'Gladiator (2000).eng.track0.srt',
        ]),
      );
    });

    it('should properly set output filename for subtitle stream', async () => {
      const args = new PluginInputArgsBuilder()
        .withInputFile('Project Hail Mary (2026).mkv')
        .addSubtitleStream({
          codec_name: 'subrip',
          tags: { language: 'ell' },
        })
        .build();

      const output = await sut(args);
      const spawnArgs = getSpawnArgs();

      expect(output.outputNumber).toBe(1);
      expect(output.outputFileObj).toBe(args.inputFileObj);

      expect(spawnArgs).toEqual(
        expect.arrayContaining([
          'Project Hail Mary (2026).ell.track0.srt',
        ]),
      );
    });

    it('should properly set output filenames for multiple subtitle streams', async () => {
      const args = new PluginInputArgsBuilder()
        .withInputFile('Obsession (2025).mkv')
        .addSubtitleStream({
          codec_name: 'subrip',
          tags: { language: 'eng' },
        })
        .addSubtitleStream({
          codec_name: 'subrip',
          tags: { language: 'ell' },
        })
        .addSubtitleStream({
          codec_name: 'subrip',
          tags: { language: 'fre' },
        })
        .build();

      const output = await sut(args);
      const spawnArgs = getSpawnArgs();

      expect(output.outputNumber).toBe(1);
      expect(output.outputFileObj).toBe(args.inputFileObj);

      expect(spawnArgs).toEqual(
        expect.arrayContaining([
          'Obsession (2025).eng.track0.srt',
          'Obsession (2025).ell.track1.srt',
          'Obsession (2025).fre.track2.srt',
        ]),
      );
    });
  });

  describe('codec-aware extraction', () => {
    it('should extract subrip subtitles as srt', async () => {
      const args = new PluginInputArgsBuilder()
        .withInputFile('Text Subtitle Movie.mkv')
        .addSubtitleStream({
          codec_name: 'subrip',
          tags: { language: 'eng' },
        })
        .build();

      const output = await sut(args);
      const spawnArgs = getSpawnArgs();

      expect(output.outputNumber).toBe(1);

      expect(spawnArgs).toEqual(
        expect.arrayContaining([
          '-map',
          '0:0',
          '-c:s',
          'copy',
          'Text Subtitle Movie.eng.track0.srt',
        ]),
      );
    });

    it('should extract ass subtitles as ass', async () => {
      const args = new PluginInputArgsBuilder()
        .withInputFile('Anime Movie.mkv')
        .addSubtitleStream({
          codec_name: 'ass',
          tags: { language: 'jpn' },
        })
        .build();

      const output = await sut(args);
      const spawnArgs = getSpawnArgs();

      expect(output.outputNumber).toBe(1);

      expect(spawnArgs).toEqual(
        expect.arrayContaining([
          '-map',
          '0:0',
          '-c:s',
          'copy',
          'Anime Movie.jpn.track0.ass',
        ]),
      );

      expect(spawnArgs).not.toContain('Anime Movie.jpn.track0.srt');
    });

    it('should extract ssa subtitles as ass', async () => {
      const args = new PluginInputArgsBuilder()
        .withInputFile('Classic Release.mkv')
        .addSubtitleStream({
          codec_name: 'ssa',
          tags: { language: 'eng' },
        })
        .build();

      const output = await sut(args);
      const spawnArgs = getSpawnArgs();

      expect(output.outputNumber).toBe(1);

      expect(spawnArgs).toEqual(
        expect.arrayContaining([
          'Classic Release.eng.track0.ass',
        ]),
      );
    });

    it('should extract webvtt subtitles as vtt', async () => {
      const args = new PluginInputArgsBuilder()
        .withInputFile('Streaming Release.mkv')
        .addSubtitleStream({
          codec_name: 'webvtt',
          tags: { language: 'eng' },
        })
        .build();

      const output = await sut(args);
      const spawnArgs = getSpawnArgs();

      expect(output.outputNumber).toBe(1);

      expect(spawnArgs).toEqual(
        expect.arrayContaining([
          'Streaming Release.eng.track0.vtt',
        ]),
      );
    });
  });

  describe('bitmap subtitle handling', () => {
    it('should skip PGS subtitles by default', async () => {
      const args = new PluginInputArgsBuilder()
        .withInputFile('Blu-ray Movie.mkv')
        .addSubtitleStream({
          codec_name: 'hdmv_pgs_subtitle',
          tags: { language: 'eng' },
        })
        .build();

      const output = await sut(args);
      const cli = getCli();

      expect(cli.mock.calls.length).toBe(0);
      expect(output.outputNumber).toBe(2);
      expect(output.outputFileObj).toBe(args.inputFileObj);

      expect(args.jobLog).toHaveBeenCalledWith(
        'Skipping subtitle #0, reason: PGS is bitmap-based, OCR is required for SRT',
      );
      expect(args.jobLog).toHaveBeenCalledWith(
        'No extractable subtitles found after filtering/skipping',
      );
    });

    it('should extract PGS subtitles as sup when bitmapSubtitleHandling is extract_sup', async () => {
      const args = withInputs(
        new PluginInputArgsBuilder()
          .withInputFile('Blu-ray Movie.mkv')
          .addSubtitleStream({
            codec_name: 'hdmv_pgs_subtitle',
            tags: { language: 'eng' },
          })
          .build(),
        {
          bitmapSubtitleHandling: 'extract_sup',
        },
      );

      const output = await sut(args);
      const cli = getCli();
      const spawnArgs = getSpawnArgs(cli);

      expect(cli.mock.calls.length).toBe(1);
      expect(output.outputNumber).toBe(1);

      expect(spawnArgs).toEqual(
        expect.arrayContaining([
          '-map',
          '0:0',
          '-c:s',
          'copy',
          'Blu-ray Movie.eng.track0.sup',
        ]),
      );
    });

    it('should include Jellyfin flags when extracting PGS as sup', async () => {
      const args = withInputs(
        new PluginInputArgsBuilder()
          .withInputFile('Blu-ray Movie.mkv')
          .addSubtitleStream({
            codec_name: 'hdmv_pgs_subtitle',
            tags: { language: 'eng' },
          })
          .build(),
        {
          bitmapSubtitleHandling: 'extract_sup',
        },
      );

      const output = await sut(args);
      const spawnArgs = getSpawnArgs();

      expect(output.outputNumber).toBe(1);

      expect(spawnArgs).toEqual(
        expect.arrayContaining([
          'Blu-ray Movie.eng.track0.sup',
        ]),
      );
    });

    it('should skip dvd_subtitle even when bitmapSubtitleHandling is extract_sup', async () => {
      const args = withInputs(
        new PluginInputArgsBuilder()
          .withInputFile('DVD Movie.mkv')
          .addSubtitleStream({
            codec_name: 'dvd_subtitle',
            tags: { language: 'eng' },
          })
          .build(),
        {
          bitmapSubtitleHandling: 'extract_sup',
        },
      );

      const output = await sut(args);
      const cli = getCli();

      expect(cli.mock.calls.length).toBe(0);
      expect(output.outputNumber).toBe(2);

      expect(args.jobLog).toHaveBeenCalledWith(
        'Skipping subtitle #0, reason: dvd_subtitle is bitmap-based, OCR or format-specific extraction is required',
      );
      expect(args.jobLog).toHaveBeenCalledWith(
        'No extractable subtitles found after filtering/skipping',
      );
    });

    it('should extract supported text subtitles while skipping PGS subtitles by default', async () => {
      const args = new PluginInputArgsBuilder()
        .withInputFile('Mixed Subtitle Movie.mkv')
        .addSubtitleStream({
          codec_name: 'subrip',
          tags: { language: 'eng' },
        })
        .addSubtitleStream({
          codec_name: 'hdmv_pgs_subtitle',
          tags: { language: 'fre' },
        })
        .build();

      const output = await sut(args);
      const cli = getCli();
      const spawnArgs = getSpawnArgs(cli);

      expect(cli.mock.calls.length).toBe(1);
      expect(output.outputNumber).toBe(1);

      expect(spawnArgs).toEqual(
        expect.arrayContaining([
          'Mixed Subtitle Movie.eng.track0.srt',
        ]),
      );

      expect(spawnArgs).not.toContain('Mixed Subtitle Movie.fre.track1.sup');

      expect(args.jobLog).toHaveBeenCalledWith(
        'Skipping subtitle #1, reason: PGS is bitmap-based, OCR is required for SRT',
      );
    });
  });

  describe('unsupported codec handling', () => {
    it('should skip unsupported subtitle codecs', async () => {
      const args = new PluginInputArgsBuilder()
        .withInputFile('Unsupported Subtitle Movie.mkv')
        .addSubtitleStream({
          codec_name: 'mov_text',
          tags: { language: 'eng' },
        })
        .build();

      const output = await sut(args);
      const cli = getCli();

      expect(cli.mock.calls.length).toBe(0);
      expect(output.outputNumber).toBe(2);

      expect(args.jobLog).toHaveBeenCalledWith(
        'Skipping subtitle #0, reason: Unsupported subtitle codec: mov_text',
      );
      expect(args.jobLog).toHaveBeenCalledWith(
        'No extractable subtitles found after filtering/skipping',
      );
    });

    it('should skip subtitle streams with no codec_name', async () => {
      const args = new PluginInputArgsBuilder()
        .withInputFile('Missing Codec Movie.mkv')
        .addSubtitleStream({
          codec_name: undefined,
          tags: { language: 'eng' },
        })
        .build();

      const output = await sut(args);
      const cli = getCli();

      expect(cli.mock.calls.length).toBe(0);
      expect(output.outputNumber).toBe(2);

      expect(args.jobLog).toHaveBeenCalledWith(
        'Skipping subtitle #0, reason: Unsupported subtitle codec: ?',
      );
      expect(args.jobLog).toHaveBeenCalledWith(
        'No extractable subtitles found after filtering/skipping',
      );
    });

    it('should not run CLI when all subtitle streams are skipped', async () => {
      const args = new PluginInputArgsBuilder()
        .withInputFile('All Skipped Movie.mkv')
        .addSubtitleStream({
          codec_name: 'hdmv_pgs_subtitle',
          tags: { language: 'eng' },
        })
        .addSubtitleStream({
          codec_name: 'dvd_subtitle',
          tags: { language: 'fre' },
        })
        .addSubtitleStream({
          codec_name: 'unknown_codec',
          tags: { language: 'spa' },
        })
        .build();

      const output = await sut(args);
      const cli = getCli();

      expect(cli.mock.calls.length).toBe(0);
      expect(output.outputNumber).toBe(2);
      expect(output.outputFileObj).toBe(args.inputFileObj);

      expect(args.jobLog).toHaveBeenCalledWith(
        'No extractable subtitles found after filtering/skipping',
      );
    });
  });

  describe('filename behavior', () => {
    it('should include track index in output filenames to avoid duplicate language collisions', async () => {
      const args = new PluginInputArgsBuilder()
        .withInputFile('Duplicate Language Movie.mkv')
        .addSubtitleStream({
          codec_name: 'subrip',
          tags: { language: 'eng' },
        })
        .addSubtitleStream({
          codec_name: 'subrip',
          tags: { language: 'eng' },
        })
        .build();

      const output = await sut(args);
      const spawnArgs = getSpawnArgs();
      const outputFilenames = getSubtitleOutputFilenames(spawnArgs);

      expect(output.outputNumber).toBe(1);

      expect(outputFilenames).toEqual(
        expect.arrayContaining([
          'Duplicate Language Movie.eng.track0.srt',
          'Duplicate Language Movie.eng.track1.srt',
        ]),
      );

      expect(new Set(outputFilenames).size).toBe(outputFilenames.length);
    });

    it('should sanitize language tags before using them in filenames', async () => {
      const args = new PluginInputArgsBuilder()
        .withInputFile('Odd Language Tag Movie.mkv')
        .addSubtitleStream({
          codec_name: 'subrip',
          tags: { language: 'en/GB' },
        })
        .build();

      const output = await sut(args);
      const spawnArgs = getSpawnArgs();

      expect(output.outputNumber).toBe(1);

      expect(spawnArgs).toEqual(
        expect.arrayContaining([
          'Odd Language Tag Movie.en_gb.track0.srt',
        ]),
      );

      expect(spawnArgs).not.toContain('Odd Language Tag Movie.en/GB.track0.srt');
    });

    it('should preserve media filenames with multiple dots', async () => {
      const args = new PluginInputArgsBuilder()
        .withInputFile('Movie.Name.Extended.Cut.2024.mkv')
        .addSubtitleStream({
          codec_name: 'subrip',
          tags: { language: 'eng' },
        })
        .build();

      const output = await sut(args);
      const spawnArgs = getSpawnArgs();

      expect(output.outputNumber).toBe(1);

      expect(spawnArgs).toEqual(
        expect.arrayContaining([
          'Movie.Name.Extended.Cut.2024.eng.track0.srt',
        ]),
      );
    });

    it('should handle input filenames without extensions', async () => {
      const args = new PluginInputArgsBuilder()
        .withInputFile('Movie Without Extension')
        .addSubtitleStream({
          codec_name: 'subrip',
          tags: { language: 'eng' },
        })
        .build();

      const output = await sut(args);
      const spawnArgs = getSpawnArgs();

      expect(output.outputNumber).toBe(1);

      expect(spawnArgs).toEqual(
        expect.arrayContaining([
          'Movie Without Extension.eng.track0.srt',
        ]),
      );
    });
  });

  describe('CLI behavior', () => {
    it('should pass the first extracted subtitle path as outputFilePath', async () => {
      const args = new PluginInputArgsBuilder()
        .withInputFile('Output Path Movie.mkv')
        .addSubtitleStream({
          codec_name: 'subrip',
          tags: { language: 'eng' },
        })
        .addSubtitleStream({
          codec_name: 'ass',
          tags: { language: 'jpn' },
        })
        .build();

      await sut(args);

      const cliOptions = getCliOptions();

      expect(cliOptions.outputFilePath).toBe('Output Path Movie.eng.track0.srt');
    });

    it('should disable live size compare for the extraction CLI without mutating original args', async () => {
      const args = new PluginInputArgsBuilder()
        .withInputFile('Live Size Movie.mkv')
        .addSubtitleStream({
          codec_name: 'subrip',
          tags: { language: 'eng' },
        })
        .build();

      args.variables.liveSizeCompare = {
        enabled: true,
        compareMethod: 'percent',
        thresholdPerc: 50,
        lowerThresholdPerc: 10,
        checkDelaySeconds: 30,
        error: true,
        errorType: '',
      };

      await sut(args);

      const cliOptions = getCliOptions();

      expect(cliOptions.args.variables.liveSizeCompare.enabled).toBe(false);
      expect(args.variables.liveSizeCompare.enabled).toBe(true);
    });
  });
});
