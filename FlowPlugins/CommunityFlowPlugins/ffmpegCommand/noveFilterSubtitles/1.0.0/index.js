"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.details = exports.plugin = void 0;
var ffmpeg_1 = require("../../../../FlowHelpers/1.0.0/nove/ffmpeg");
var languages_1 = __importDefault(require("../../../../FlowHelpers/1.0.0/nove/languages"));
var utils_1 = require("../../../../FlowHelpers/1.0.0/nove/utils");
var OUT_SUCCESS = 1;
var OUT_FAIL = 2;
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
var details = function () { return ({
    name: 'Filter Subtitles',
    description: 'Remove subtitle tracks not matching the specified filters',
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
        {
            label: 'Keyword Blacklist',
            name: 'keywords',
            tooltip: "Comma-separated list of keywords you wish to blacklist.\n      Any subtitle stream containing the keyword present in the list will be excluded.",
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
            tooltip: 'Subtitle streams with the specified filters were found',
        },
        {
            number: OUT_FAIL,
            tooltip: 'Subtitle streams with the specified filters Swere not found',
        },
    ],
}); };
exports.details = details;
var plugin = (0, ffmpeg_1.ffMpegCommandPlugin)(details, function (args) {
    var languagesResult = languages_1.default.from((0, utils_1.parseCommaSeparatedValues)(String(args.inputs.languages)), {
        acceptEmptyList: true,
    });
    var backupLanguagesResult = languages_1.default.from((0, utils_1.parseCommaSeparatedValues)(String(args.inputs.backupLanguages)), {
        acceptEmptyList: true,
    });
    var keywords = (0, utils_1.parseCommaSeparatedValues)(String(args.inputs.keywords), true);
    if (!languagesResult.ok) {
        throw new Error(languagesResult.error);
    }
    if (!backupLanguagesResult.ok) {
        throw new Error(backupLanguagesResult.error);
    }
    var languages = languagesResult.value;
    var backupLanguages = backupLanguagesResult.value;
    var command = args.variables.ffmpegCommand;
    if (languages.length === 0 && backupLanguages.length > 0) {
        throw new Error('Backup languages can only be defined if `languages` is defined');
    }
    args.jobLog("Got ".concat(languages.length, " target languages: [").concat(languages.toString(), "]"));
    args.jobLog("Got ".concat(backupLanguages.length, " backup languages: [").concat(backupLanguages.toString(), "]"));
    args.jobLog("Got ".concat(keywords.length, " blacklist keywords: [").concat(keywords.join(', '), "]"));
    var subtitleStreams = command.streams
        .filter(function (stream) { return stream.codec_type === 'subtitle'; });
    var streamsToExcludeLanguages = subtitleStreams
        .filter(function (stream) { var _a; return !languages.contain((_a = stream.tags) === null || _a === void 0 ? void 0 : _a.language); });
    // true if ALL streams are to be excluded.
    if (streamsToExcludeLanguages.length === subtitleStreams.length && backupLanguages.length > 0) {
        args.jobLog('No subtitles with target languages found, falling back to backup languages');
        streamsToExcludeLanguages = subtitleStreams
            .filter(function (stream) { var _a; return !backupLanguages.contain((_a = stream.tags) === null || _a === void 0 ? void 0 : _a.language); });
    }
    var streamsToExcludeKeywords = subtitleStreams
        .filter(function (stream) { var _a; return (0, utils_1.containsKeywords)((_a = stream.tags) === null || _a === void 0 ? void 0 : _a.title, keywords); });
    var totalStreamsToExclude = new Set(__spreadArray(__spreadArray([], streamsToExcludeLanguages, true), streamsToExcludeKeywords, true));
    args.jobLog("Discarding ".concat(totalStreamsToExclude.size, " out of ").concat(subtitleStreams.length, " subtitle streams"));
    totalStreamsToExclude.forEach(function (stream) {
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
