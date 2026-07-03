"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.details = exports.plugin = void 0;
var ffmpeg_1 = require("../../../../FlowHelpers/1.0.0/nove/ffmpeg");
var utils_1 = require("../../../../FlowHelpers/1.0.0/nove/utils");
var OUT_SUCCESS = 1;
var OUT_FAIL = 2;
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
var details = function () { return ({
    name: 'Filter Subtitles by Language',
    description: 'Remove subtitle tracks not matching the specified languages',
    style: {
        borderColor: '#6efefc',
    },
    tags: 'subtitles',
    isStartPlugin: false,
    pType: '',
    requiresVersion: '2.11.01',
    sidebarPosition: -1,
    icon: '',
    inputs: [
        {
            label: 'Languages',
            name: 'languages',
            tooltip: 'Comma-separated list of which languages to keep',
            defaultValue: '',
            type: 'string',
            inputUI: {
                type: 'text',
            },
        },
        {
            label: 'Backup Languages',
            name: 'backupLanguages',
            tooltip: "Comma-separated list of languages to keep in the event no subtitles\n      with languages from the main 'languages' list are found.",
            defaultValue: '',
            type: 'string',
            inputUI: {
                type: 'text',
            },
        },
    ],
    outputs: [
        {
            number: OUT_SUCCESS,
            tooltip: 'Subtitle streams with the specified languages were found',
        },
        {
            number: OUT_FAIL,
            tooltip: 'Subtitle streams with the specified languages were not found',
        },
    ],
}); };
exports.details = details;
var hasWantedLanguage = function (stream, languages) {
    var _a;
    if (((_a = stream.tags) === null || _a === void 0 ? void 0 : _a.language) === undefined) {
        return false;
    }
    var cleanLanguageTag = stream.tags.language.toLowerCase();
    return languages.includes(cleanLanguageTag);
};
var plugin = (0, ffmpeg_1.ffMpegCommandPlugin)(details, function (args) {
    var languagesResult = (0, utils_1.parseLanguageCodes)(String(args.inputs.languages));
    var backupLanguagesResult = (0, utils_1.parseLanguageCodes)(String(args.inputs.backupLanguages), true);
    if (!languagesResult.ok) {
        throw new Error(languagesResult.error);
    }
    if (!backupLanguagesResult.ok) {
        throw new Error(backupLanguagesResult.error);
    }
    var languages = languagesResult.value;
    var backupLanguages = backupLanguagesResult.value;
    var command = args.variables.ffmpegCommand;
    args.jobLog("Got ".concat(languages.length, " target languages: [").concat(languages.join(', '), "]"));
    args.jobLog("Got ".concat(backupLanguages.length, " backup languages: [").concat(backupLanguages.join(', '), "]"));
    var subtitleStreams = command.streams
        .filter(function (stream) { return stream.codec_type === 'subtitle'; });
    var streamsToExclude = subtitleStreams
        .filter(function (stream) { return !hasWantedLanguage(stream, languages); });
    // true if ALL streams are to be excluded.
    if (streamsToExclude.length === subtitleStreams.length && backupLanguages.length > 0) {
        args.jobLog('No subtitles with target languages found, falling back to backup languages');
        streamsToExclude = subtitleStreams
            .filter(function (stream) { return !hasWantedLanguage(stream, backupLanguages); });
    }
    args.jobLog("Discarding ".concat(streamsToExclude.length, " out of ").concat(subtitleStreams.length, " subtitle streams"));
    streamsToExclude.forEach(function (stream) {
        var _a, _b, _c;
        args.jobLog("Discarding \"".concat((_b = (_a = stream.tags) === null || _a === void 0 ? void 0 : _a.title) !== null && _b !== void 0 ? _b : '?', "\", lang=").concat((_c = stream.tags) === null || _c === void 0 ? void 0 : _c.language));
        stream.removed = true;
    });
    return {
        outputFileObj: args.inputFileObj,
        outputNumber: OUT_SUCCESS,
        variables: args.variables,
    };
});
exports.plugin = plugin;
