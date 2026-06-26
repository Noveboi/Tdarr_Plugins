"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("../../../../FlowPluginsTs/CommunityFlowPlugins/ffmpegCommand/noveFilterAudio/1.0.0/index");
var pluginHelper_1 = require("../../../../FlowPluginsTs/FlowHelpers/1.0.0/nove/pluginHelper");
describe('Filtering Audio Streams by Language', function () {
    describe('Standard Behavior', function () {
        it('should discard unwanted languages when stream with target language exists', function () {
            var targetLanguage = 'gre';
            var args = new pluginHelper_1.PluginInputArgsBuilder()
                .withInput('languages', targetLanguage)
                .addAudioStream({ tags: { language: targetLanguage } })
                .addAudioStream({ tags: { language: 'eng' } })
                .build();
            var output = (0, index_1.plugin)(args);
            var streams = output.variables.ffmpegCommand.streams;
            expect(output.outputNumber).toBe(1);
            expect(output.outputFileObj).toBe(args.inputFileObj);
            expect(streams).toEqual(expect.arrayContaining([
                expect.objectContaining({ removed: true, tags: { language: 'eng' } }),
                expect.objectContaining({ removed: false, tags: { language: targetLanguage } }),
            ]));
        });
        it('should discard multiple unwanted languages when stream with target language exists', function () {
            var targetLanguage = 'kor';
            var args = new pluginHelper_1.PluginInputArgsBuilder()
                .withInput('languages', targetLanguage)
                .addAudioStream({ tags: { language: targetLanguage } })
                .addAudioStream({ tags: { language: 'eng' } })
                .addAudioStream({ tags: { language: 'fre' } })
                .build();
            var output = (0, index_1.plugin)(args);
            var streams = output.variables.ffmpegCommand.streams;
            expect(output.outputNumber).toBe(1);
            expect(output.outputFileObj).toBe(args.inputFileObj);
            expect(streams).toEqual(expect.arrayContaining([
                expect.objectContaining({ removed: true, tags: { language: 'fre' } }),
                expect.objectContaining({ removed: true, tags: { language: 'eng' } }),
                expect.objectContaining({ removed: false, tags: { language: targetLanguage } }),
            ]));
        });
        // Were the plugin to do anything in the scenario below, all audio streams would be wiped.
        it('should not do anything when stream with target language does not exist', function () {
            var args = new pluginHelper_1.PluginInputArgsBuilder()
                .withInput('languages', 'gre')
                .addAudioStream({ tags: { language: 'eng' } })
                .build();
            var output = (0, index_1.plugin)(args);
            var streams = output.variables.ffmpegCommand.streams;
            expect(output.outputNumber).toBe(2);
            expect(output.outputFileObj).toBe(args.inputFileObj);
            expect(streams).toEqual(args.variables.ffmpegCommand.streams);
        });
        it('should accept multiple comma-separated target languages if all target languages exist', function () {
            var args = new pluginHelper_1.PluginInputArgsBuilder()
                .withInput('languages', 'jap,gre')
                .addAudioStream({ tags: { language: 'eng' } })
                .addAudioStream({ tags: { language: 'jap' } })
                .addAudioStream({ tags: { language: 'gre' } })
                .build();
            var output = (0, index_1.plugin)(args);
            var streams = output.variables.ffmpegCommand.streams;
            expect(output.outputNumber).toBe(1);
            expect(output.outputFileObj).toBe(args.inputFileObj);
            expect(streams).toEqual(expect.arrayContaining([
                expect.objectContaining({ removed: false, tags: { language: 'jap' } }),
                expect.objectContaining({ removed: false, tags: { language: 'gre' } }),
                expect.objectContaining({ removed: true, tags: { language: 'eng' } }),
            ]));
        });
        it('should accept multiple comma-separated target languages if at least one target language exists', function () {
            var args = new pluginHelper_1.PluginInputArgsBuilder()
                .withInput('languages', 'jap,gre')
                .addAudioStream({ tags: { language: 'eng' } })
                .addAudioStream({ tags: { language: 'gre' } })
                .build();
            var output = (0, index_1.plugin)(args);
            var streams = output.variables.ffmpegCommand.streams;
            expect(output.outputNumber).toBe(1);
            expect(output.outputFileObj).toBe(args.inputFileObj);
            expect(streams).toEqual(expect.arrayContaining([
                expect.objectContaining({ removed: false, tags: { language: 'gre' } }),
                expect.objectContaining({ removed: true, tags: { language: 'eng' } }),
            ]));
        });
    });
    describe('Invalid Usage', function () {
        it('should throw when "languages" input is not defined', function () {
            var args = new pluginHelper_1.PluginInputArgsBuilder().build();
            expect(function () { return (0, index_1.plugin)(args); }).toThrow(/empty.*specify.*language/i);
        });
        it('should throw when "languages" contains one or more invalid languages codes', function () {
            var args = new pluginHelper_1.PluginInputArgsBuilder()
                .withInput('languages', 'English, Greek')
                .build();
            expect(function () { return (0, index_1.plugin)(args); }).toThrow(/english.*greek/i);
        });
    });
});
