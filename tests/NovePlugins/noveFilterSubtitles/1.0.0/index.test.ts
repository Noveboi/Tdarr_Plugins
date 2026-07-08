import { plugin } from '../../../../FlowPluginsTs/CommunityFlowPlugins/ffmpegCommand/noveFilterSubtitles/1.0.0/index';
import { PluginInputArgsBuilder } from '../../../../FlowPluginsTs/FlowHelpers/1.0.0/nove/pluginHelper';

/*
Due to the similar nature of the `filterSubtitles` and `filterAudio` plugins,
the tests here are almost identical. I've intentionally refrained from creating utilities that encapsulate
common logic between the two plugins in order to keep them completely separate logically for future additions.
*/

describe('Filtering Subtitle Streams by Language', () => {
  describe('Standard Behavior', () => {
    it('should discard unwanted languages when stream with target language exists', async () => {
      const targetLanguage = 'ell';

      const args = new PluginInputArgsBuilder()
        .withInput('languages', targetLanguage)
        .addSubtitleStream({ tags: { language: targetLanguage } })
        .addSubtitleStream({ tags: { language: 'eng' } })
        .build();

      const output = await plugin(args);
      const { streams } = output.variables.ffmpegCommand;

      expect(output.outputNumber).toBe(1);
      expect(output.outputFileObj).toBe(args.inputFileObj);
      expect(streams).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ removed: true, tags: { language: 'eng' } }),
          expect.objectContaining({ removed: false, tags: { language: targetLanguage } }),
        ]),
      );
    });

    it('should discard multiple unwanted languages when stream with target language exists', async () => {
      const targetLanguage = 'kor';

      const args = new PluginInputArgsBuilder()
        .withInput('languages', targetLanguage)
        .addSubtitleStream({ tags: { language: targetLanguage } })
        .addSubtitleStream({ tags: { language: 'eng' } })
        .addSubtitleStream({ tags: { language: 'fre' } })
        .build();

      const output = await plugin(args);
      const { streams } = output.variables.ffmpegCommand;

      expect(output.outputNumber).toBe(1);
      expect(output.outputFileObj).toBe(args.inputFileObj);
      expect(streams).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ removed: true, tags: { language: 'fre' } }),
          expect.objectContaining({ removed: true, tags: { language: 'eng' } }),
          expect.objectContaining({ removed: false, tags: { language: targetLanguage } }),
        ]),
      );
    });

    // In contrast to `filterAudio`, `filterSubtitles` DOES wipe all subtitles if no matches exist.
    it('should remove all subtitles when target language does not exist and no backup languages', async () => {
      const args = new PluginInputArgsBuilder()
        .withInput('languages', 'ell')
        .addSubtitleStream({ tags: { language: 'eng' } })
        .build();

      const output = await plugin(args);
      const { streams } = output.variables.ffmpegCommand;

      expect(output.outputNumber).toBe(1);
      expect(output.outputFileObj).toBe(args.inputFileObj);
      expect(streams).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ removed: true, tags: { language: 'eng' } }),
        ]),
      );
    });

    it('should accept multiple comma-separated target languages if all target languages exist', async () => {
      const args = new PluginInputArgsBuilder()
        .withInput('languages', 'jap,ell')
        .addSubtitleStream({ tags: { language: 'eng' } })
        .addSubtitleStream({ tags: { language: 'jap' } })
        .addSubtitleStream({ tags: { language: 'ell' } })
        .build();

      const output = await plugin(args);
      const { streams } = output.variables.ffmpegCommand;

      expect(output.outputNumber).toBe(1);
      expect(output.outputFileObj).toBe(args.inputFileObj);
      expect(streams).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ removed: false, tags: { language: 'jap' } }),
          expect.objectContaining({ removed: false, tags: { language: 'ell' } }),
          expect.objectContaining({ removed: true, tags: { language: 'eng' } }),
        ]),
      );
    });

    it('should accept multiple comma-separated target languages if at least one target language exists', async () => {
      const args = new PluginInputArgsBuilder()
        .withInput('languages', 'jap,ell')
        .addSubtitleStream({ tags: { language: 'eng' } })
        .addSubtitleStream({ tags: { language: 'ell' } })
        .build();

      const output = await plugin(args);
      const { streams } = output.variables.ffmpegCommand;

      expect(output.outputNumber).toBe(1);
      expect(output.outputFileObj).toBe(args.inputFileObj);
      expect(streams).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ removed: false, tags: { language: 'ell' } }),
          expect.objectContaining({ removed: true, tags: { language: 'eng' } }),
        ]),
      );
    });
  });

  // This is a `filterSubtitles`-specific feature. If some media were to have no matches
  // for the target languages, some users may still want to have a secondary language available.
  // Personal Examples:
  // - In Anime, I want the main subtitle language to be 'Greek', however that's not always available, in that
  // case I still want subtitles so I resort to 'English' as a backup because I unfortunately don't speak Japanese.
  describe('Backup Languages', () => {
    it('should resort to using backup languages if the target languages are not found', async () => {
      const args = new PluginInputArgsBuilder()
        .withInput('languages', 'ell')
        .withInput('backupLanguages', 'eng')
        .addSubtitleStream({ tags: { language: 'eng' } })
        .addSubtitleStream({ tags: { language: 'fre' } })
        .build();

      const output = await plugin(args);
      const { streams } = output.variables.ffmpegCommand;

      expect(output.outputNumber).toBe(1);
      expect(output.outputFileObj).toBe(args.inputFileObj);
      expect(streams).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ removed: true, tags: { language: 'fre' } }),
          expect.objectContaining({ removed: false, tags: { language: 'eng' } }),
        ]),
      );
    });

    it('should not use backup languages if target languages exist', async () => {
      const args = new PluginInputArgsBuilder()
        .withInput('languages', 'ell')
        .withInput('backupLanguages', 'eng')
        .addSubtitleStream({ tags: { language: 'ell' } })
        .addSubtitleStream({ tags: { language: 'eng' } })
        .addSubtitleStream({ tags: { language: 'fre' } })
        .build();

      const output = await plugin(args);
      const { streams } = output.variables.ffmpegCommand;

      expect(output.outputNumber).toBe(1);
      expect(output.outputFileObj).toBe(args.inputFileObj);
      expect(streams).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ removed: false, tags: { language: 'ell' } }),
          expect.objectContaining({ removed: true, tags: { language: 'fre' } }),
          expect.objectContaining({ removed: true, tags: { language: 'eng' } }),
        ]),
      );
    });

    it('should still discard all subtitles if no target/backup languages exist', async () => {
      const args = new PluginInputArgsBuilder()
        .withInput('languages', 'ell')
        .withInput('backupLanguages', 'eng')
        .addSubtitleStream({ tags: { language: 'chi' } })
        .build();

      const output = await plugin(args);
      const { streams } = output.variables.ffmpegCommand;

      expect(output.outputNumber).toBe(1);
      expect(output.outputFileObj).toBe(args.inputFileObj);
      expect(streams).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ removed: true, tags: { language: 'chi' } }),
        ]),
      );
    });
  });

  describe('Edge Cases', () => {
    it('should trim spaces between commas in `languages` list', async () => {
      const args = new PluginInputArgsBuilder()
        .withInput('languages', ' eng, ell,jap,     fre')
        .addSubtitleStream({ tags: { language: 'eng' } })
        .addSubtitleStream({ tags: { language: 'ell' } })
        .addSubtitleStream({ tags: { language: 'jap' } })
        .addSubtitleStream({ tags: { language: 'fre' } })
        .addSubtitleStream({ tags: { language: 'esp' } })
        .build();

      const output = await plugin(args);
      const { streams } = output.variables.ffmpegCommand;

      expect(output.outputNumber).toBe(1);
      expect(output.outputFileObj).toBe(args.inputFileObj);
      expect(streams).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ removed: true, tags: { language: 'esp' } }),
          expect.objectContaining({ removed: false, tags: { language: 'eng' } }),
          expect.objectContaining({ removed: false, tags: { language: 'ell' } }),
          expect.objectContaining({ removed: false, tags: { language: 'jap' } }),
          expect.objectContaining({ removed: false, tags: { language: 'fre' } }),
        ]),
      );
    });
  });

  describe('Invalid Usage', () => {
    it('should throw when "languages" input is not defined but "backupLanguages" is', async () => {
      const args = new PluginInputArgsBuilder()
        .withInput('backupLanguages', 'eng,jpn,kor,ell')
        .build();

      await expect(() => plugin(args))
        .rejects
        .toThrow('Backup languages can only be defined if `languages` is defined');
    });

    it('should throw when "languages" contains one or more invalid languages codes', async () => {
      const args = new PluginInputArgsBuilder()
        .withInput('languages', 'English, Greek')
        .build();

      await expect(() => plugin(args)).rejects.toThrow(/english.*greek/i);
    });
  });
});
