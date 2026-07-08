import { plugin } from '../../../../FlowPluginsTs/CommunityFlowPlugins/ffmpegCommand/noveFilterAudio/1.0.0/index';
import { PluginInputArgsBuilder } from '../../../../FlowPluginsTs/FlowHelpers/1.0.0/nove/pluginHelper';

describe('Filtering Audio Streams by Language', () => {
  describe('Standard Behavior', () => {
    it('should discard unwanted languages when stream with target language exists', async () => {
      const targetLanguage = 'gre';

      const args = new PluginInputArgsBuilder()
        .withInput('languages', targetLanguage)
        .addAudioStream({ tags: { language: targetLanguage } })
        .addAudioStream({ tags: { language: 'eng' } })
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
        .addAudioStream({ tags: { language: targetLanguage } })
        .addAudioStream({ tags: { language: 'eng' } })
        .addAudioStream({ tags: { language: 'fre' } })
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

    // Were the plugin to do anything in the scenario below, all audio streams would be wiped.
    it('should not do anything when stream with target language does not exist', async () => {
      const args = new PluginInputArgsBuilder()
        .withInput('languages', 'gre')
        .addAudioStream({ tags: { language: 'eng' } })
        .build();

      const output = await plugin(args);
      const { streams } = output.variables.ffmpegCommand;

      expect(output.outputNumber).toBe(2);
      expect(output.outputFileObj).toBe(args.inputFileObj);
      expect(streams).toEqual(args.variables.ffmpegCommand.streams);
    });

    it('should accept multiple comma-separated target languages if all target languages exist', async () => {
      const args = new PluginInputArgsBuilder()
        .withInput('languages', 'jap,gre')
        .addAudioStream({ tags: { language: 'eng' } })
        .addAudioStream({ tags: { language: 'jap' } })
        .addAudioStream({ tags: { language: 'gre' } })
        .build();

      const output = await plugin(args);
      const { streams } = output.variables.ffmpegCommand;

      expect(output.outputNumber).toBe(1);
      expect(output.outputFileObj).toBe(args.inputFileObj);
      expect(streams).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ removed: false, tags: { language: 'jap' } }),
          expect.objectContaining({ removed: false, tags: { language: 'gre' } }),
          expect.objectContaining({ removed: true, tags: { language: 'eng' } }),
        ]),
      );
    });

    it('should accept multiple comma-separated target languages if at least one target language exists', async () => {
      const args = new PluginInputArgsBuilder()
        .withInput('languages', 'jap,gre')
        .addAudioStream({ tags: { language: 'eng' } })
        .addAudioStream({ tags: { language: 'gre' } })
        .build();

      const output = await plugin(args);
      const { streams } = output.variables.ffmpegCommand;

      expect(output.outputNumber).toBe(1);
      expect(output.outputFileObj).toBe(args.inputFileObj);
      expect(streams).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ removed: false, tags: { language: 'gre' } }),
          expect.objectContaining({ removed: true, tags: { language: 'eng' } }),
        ]),
      );
    });

    it('should discard streams with title containing given keywords', async () => {
      const args = new PluginInputArgsBuilder()
        .withInput('keywords', 'commentary,director')
        .addAudioStream({ tags: { language: 'jpn', title: 'Stereo' } })
        .addAudioStream({ tags: { language: 'eng', title: 'Stereo' } })
        .addAudioStream({ tags: { language: 'jpn', title: 'Episode Commentary by Cast' } })
        .addAudioStream({ tags: { language: 'jpn', title: "Director's Notes" } })
        .build();

      const output = await plugin(args);
      const { streams } = output.variables.ffmpegCommand;

      expect(output.outputNumber).toBe(1);
      expect(output.outputFileObj).toBe(args.inputFileObj);
      expect(streams).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ removed: false, tags: { title: 'Stereo', language: 'jpn' } }),
          expect.objectContaining({ removed: false, tags: { title: 'Stereo', language: 'eng' } }),
          expect.objectContaining({ removed: true, tags: { title: 'Episode Commentary by Cast', language: 'jpn' } }),
          expect.objectContaining({ removed: true, tags: { title: "Director's Notes", language: 'jpn' } }),
        ]),
      );
    });
  });

  describe('Edge Cases', () => {
    it('should trim spaces between commas in `languages` list', async () => {
      const args = new PluginInputArgsBuilder()
        .withInput('languages', ' eng, gre,jap,     fre')
        .addAudioStream({ tags: { language: 'eng' } })
        .addAudioStream({ tags: { language: 'gre' } })
        .addAudioStream({ tags: { language: 'jap' } })
        .addAudioStream({ tags: { language: 'fre' } })
        .addAudioStream({ tags: { language: 'esp' } })
        .build();

      const output = await plugin(args);
      const { streams } = output.variables.ffmpegCommand;

      expect(output.outputNumber).toBe(1);
      expect(output.outputFileObj).toBe(args.inputFileObj);
      expect(streams).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ removed: true, tags: { language: 'esp' } }),
          expect.objectContaining({ removed: false, tags: { language: 'eng' } }),
          expect.objectContaining({ removed: false, tags: { language: 'gre' } }),
          expect.objectContaining({ removed: false, tags: { language: 'jap' } }),
          expect.objectContaining({ removed: false, tags: { language: 'fre' } }),
        ]),
      );
    });
  });

  describe('Invalid Usage', () => {
    it('should throw when "languages" contains one or more invalid languages codes', async () => {
      const args = new PluginInputArgsBuilder()
        .withInput('languages', 'English, Greek')
        .build();

      await expect(() => plugin(args)).rejects.toThrow(/english.*greek/i);
    });
  });
});
