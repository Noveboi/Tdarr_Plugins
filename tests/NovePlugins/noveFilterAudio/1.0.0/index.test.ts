import { plugin } from '../../../../FlowPluginsTs/CommunityFlowPlugins/ffmpegCommand/noveFilterAudio/1.0.0/index';
import { PluginInputArgsBuilder } from '../../../../FlowPluginsTs/FlowHelpers/1.0.0/nove/pluginHelper';

describe('Filtering Audio Streams by Language', () => {
  describe('Standard Behavior', () => {
    it('should discard unwanted languages when stream with target language exists', () => {
      const targetLanguage = 'gre';

      const args = new PluginInputArgsBuilder()
        .withInput('languages', targetLanguage)
        .addAudioStream({ tags: { language: targetLanguage } })
        .addAudioStream({ tags: { language: 'eng' } })
        .build();

      const output = plugin(args);
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

    it('should discard multiple unwanted languages when stream with target language exists', () => {
      const targetLanguage = 'kor';

      const args = new PluginInputArgsBuilder()
        .withInput('languages', targetLanguage)
        .addAudioStream({ tags: { language: targetLanguage } })
        .addAudioStream({ tags: { language: 'eng' } })
        .addAudioStream({ tags: { language: 'fre' } })
        .build();

      const output = plugin(args);
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
    it('should not do anything when stream with target language does not exist', () => {
      const args = new PluginInputArgsBuilder()
        .withInput('languages', 'gre')
        .addAudioStream({ tags: { language: 'eng' } })
        .build();

      const output = plugin(args);
      const { streams } = output.variables.ffmpegCommand;

      expect(output.outputNumber).toBe(2);
      expect(output.outputFileObj).toBe(args.inputFileObj);
      expect(streams).toEqual(args.variables.ffmpegCommand.streams);
    });

    it('should accept multiple comma-separated target languages if all target languages exist', () => {
      const args = new PluginInputArgsBuilder()
        .withInput('languages', 'jap,gre')
        .addAudioStream({ tags: { language: 'eng' } })
        .addAudioStream({ tags: { language: 'jap' } })
        .addAudioStream({ tags: { language: 'gre' } })
        .build();

      const output = plugin(args);
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

    it('should accept multiple comma-separated target languages if at least one target language exists', () => {
      const args = new PluginInputArgsBuilder()
        .withInput('languages', 'jap,gre')
        .addAudioStream({ tags: { language: 'eng' } })
        .addAudioStream({ tags: { language: 'gre' } })
        .build();

      const output = plugin(args);
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
  });

  describe('Invalid Usage', () => {
    it('should throw when "languages" input is not defined', () => {
      const args = new PluginInputArgsBuilder().build();
      expect(() => plugin(args)).toThrow(/empty.*specify.*language/i);
    });

    it('should throw when "languages" contains one or more invalid languages codes', () => {
      const args = new PluginInputArgsBuilder()
        .withInput('languages', 'English, Greek')
        .build();

      expect(() => plugin(args)).toThrow(/english.*greek/i);
    });
  });
});
