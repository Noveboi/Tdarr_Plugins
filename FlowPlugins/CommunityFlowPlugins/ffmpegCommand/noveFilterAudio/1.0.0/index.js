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
var OUT_FAIL_LANGUAGE = 2;
var OUT_FAIL_NO_AUDIO = 3;
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
var details = function () { return ({
    name: 'Filter Audio by Language',
    description: 'Remove audio tracks not matching the specified languages',
    style: {
        borderColor: '#6efefc',
    },
    tags: 'audio',
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
            label: 'Keyword Blacklist',
            name: 'keywords',
            tooltip: "Comma-separated list of case-insensitive keywords to blacklist.\n      Any keyword present in the title of the audio stream will be excluded",
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
            tooltip: 'Audio streams with the specified languages were found',
        },
        {
            number: OUT_FAIL_LANGUAGE,
            tooltip: 'Audio streams with the specified languages were not found',
        },
        {
            number: OUT_FAIL_NO_AUDIO,
            tooltip: 'All audio streams were going to be discarded, leaving the media without audio',
        },
    ],
}); };
exports.details = details;
var plugin = (0, ffmpeg_1.ffMpegCommandPlugin)(details, function (args) {
    var languagesResult = languages_1.default.from((0, utils_1.parseCommaSeparatedValues)(String(args.inputs.languages)), {
        acceptEmptyList: true,
    });
    var keywords = (0, utils_1.parseCommaSeparatedValues)(String(args.inputs.keywords), true);
    if (!languagesResult.ok) {
        throw new Error(languagesResult.error);
    }
    var languages = languagesResult.value;
    var command = args.variables.ffmpegCommand;
    if (languages.length > 0) {
        args.jobLog("Got ".concat(languages.length, " languages to keep: [").concat(languages.toString(), "]"));
    }
    args.jobLog("Got ".concat(keywords.length, " keywords to blacklist: [").concat(keywords.join(', '), "]"));
    var audioStreams = command.streams
        .filter(function (stream) { return stream.codec_type === 'audio'; });
    var streamsToExcludeLanguage = languages.length > 0
        ? audioStreams
            .filter(function (stream) { var _a; return !languages.contain((_a = stream.tags) === null || _a === void 0 ? void 0 : _a.language); })
        : [];
    if (streamsToExcludeLanguage.length === audioStreams.length) {
        args.jobLog("Current media does not contain audio streams with languages: ".concat(languages.toString()));
        return {
            outputFileObj: args.inputFileObj,
            outputNumber: OUT_FAIL_LANGUAGE,
            variables: args.variables,
        };
    }
    var streamsToExcludeKeywords = audioStreams
        .filter(function (stream) { var _a; return (0, utils_1.containsKeywords)((_a = stream.tags) === null || _a === void 0 ? void 0 : _a.title, keywords); });
    var totalStreamsToExclude = new Set(__spreadArray(__spreadArray([], streamsToExcludeKeywords, true), streamsToExcludeLanguage, true));
    if (totalStreamsToExclude.size === audioStreams.length) {
        args.jobLog('Current filtering setup with given languages and keywords would wipe all audio. Failing defensively');
        return {
            outputFileObj: args.inputFileObj,
            outputNumber: OUT_FAIL_NO_AUDIO,
            variables: args.variables,
        };
    }
    args.jobLog("Discarding ".concat(totalStreamsToExclude.size, " out of ").concat(audioStreams.length, " audio streams"));
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
