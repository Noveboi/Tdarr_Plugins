"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.details = exports.plugin = void 0;
var ffmpeg_1 = require("../../../../FlowHelpers/1.0.0/nove/ffmpeg");
var types_1 = require("../../../../FlowHelpers/1.0.0/nove/types");
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
var details = function () { return ({
    name: 'Extract Embedded Subtitles',
    description: 'Extract subtitle tracks to separate files',
    style: {
        borderColor: '#6efefc',
    },
    tags: 'subtitles',
    isStartPlugin: false,
    pType: '',
    requiresVersion: '2.11.01',
    sidebarPosition: -1,
    icon: '',
    inputs: [],
    outputs: [
        {
            number: 1,
            tooltip: 'Found subtitles and extracted them',
        },
        {
            number: 2,
            tooltip: 'Did not found any subtitles, did nothing',
        },
    ],
}); };
exports.details = details;
var displaySubtitleLanguages = function (streams) { return streams
    .map(function (s) { var _a, _b; return (_b = (_a = s.tags) === null || _a === void 0 ? void 0 : _a.language) !== null && _b !== void 0 ? _b : '?'; })
    .join(', '); };
var createSubtitleFilename = function (fileObj, stream) {
    var _a;
    var filename = fileObj.file;
    var extension = 'srt';
    var language = (_a = stream.tags) === null || _a === void 0 ? void 0 : _a.language;
    if (!language) {
        return (0, types_1.err)('No language defined for subtitle');
    }
    var extensionIndex = filename.lastIndexOf('.');
    var filenameWithoutExtension = extensionIndex === -1
        ? filename
        : filename.substring(0, extensionIndex);
    return (0, types_1.ok)("".concat(filenameWithoutExtension, ".").concat(language, ".").concat(extension));
};
var plugin = (0, ffmpeg_1.ffMpegCommandPlugin)(details, function (args) {
    var subtitleStreams = args.variables.ffmpegCommand.streams
        .filter(function (s) { return s.codec_type === 'subtitle'; });
    if (subtitleStreams.length === 0) {
        args.jobLog('No subtitles found, exiting');
        return {
            outputFileObj: args.inputFileObj,
            outputNumber: 2,
            variables: args.variables,
        };
    }
    args.jobLog("Found ".concat(subtitleStreams.length, " subtitles to extract: [").concat(displaySubtitleLanguages(subtitleStreams), "]"));
    subtitleStreams.forEach(function (stream, idx) {
        var outputFilenameResult = createSubtitleFilename(args.inputFileObj, stream);
        if (!outputFilenameResult.ok) {
            args.jobLog("Skipping subtitle #".concat(idx, ", reason: ").concat(outputFilenameResult.error));
            return;
        }
        stream.outputArgs.push('-map', '0:s:{outputTypeIndex}', outputFilenameResult.value);
    });
    return {
        outputFileObj: args.inputFileObj,
        outputNumber: 1,
        variables: args.variables,
    };
});
exports.plugin = plugin;
