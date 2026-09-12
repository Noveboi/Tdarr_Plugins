"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.details = void 0;
var ffmpeg_1 = require("../../../../FlowHelpers/1.0.0/nove/ffmpeg");
var utils_1 = require("../../../../FlowHelpers/1.0.0/nove/utils");
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
var details = function () { return ({
    name: 'Process Audio',
    description: 'Process available audio streams and perform various operations on them, based on your preferences.',
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
            label: 'Codec',
            name: 'codec',
            tooltip: "Which audio encoder to use.\n\n      This operation will be applied to all available audio streams.\n      If left blank, the audio streams will not be transcoded.",
            defaultValue: '',
            type: 'string',
            inputUI: {
                type: 'dropdown',
                options: [
                    '',
                    'AAC',
                    'AC3',
                    'E-AC3',
                    'Opus',
                ],
            },
        },
        {
            label: 'Desired Channel Count',
            name: 'channels',
            tooltip: "The channel count that is most desirable for you. We call this the \"target\" count.\n\n      Every available audio stream will have its (\"base\") channel count examined.\n      - If the \"base\" channel count is higher than the \"target\" count, the channels will be reduced to match\n        the \"target\" count.\n      - If the \"target\" channel count is less than or equal to the \"target\" count, no-op.\n\n      Special value '0' can be used to skip channel count mapping.",
            defaultValue: '0',
            type: 'number',
            inputUI: {
                type: 'dropdown',
                options: [
                    // Determined with help from:
                    // https://trac.ffmpeg.org/wiki/AudioChannelManipulation#Mergedandmappedaudiochannels
                    '0', // no-op
                    '1', // mono
                    '2', // stereo | downmix
                    '3', // 2.1 | 3.0
                    '4', // 4.0 | quad | 3.1
                    '5', // 5.0 | 5.0(side) | 4.1
                    '6', // 5.1 | 5.1(side) | 6.0 | 6.0(front) | hexagonal
                    '7', // 6.1 | 6.1(back) | 6.1(front) | 7.0 | 7.0(front)
                    '8', // 7.1 | 7.1(wide) | 7.1(wide-side) | 7.1(top) | octagonal | cube
                    '16', // hexadecagonal
                    '24', // 22.2 (damn dude how many speakers do you need!!!!) (no offense btw)
                ],
            },
        },
    ],
    outputs: [
        {
            number: 1,
            tooltip: 'Inputs were successfully validated, continue to next plugin',
        },
    ],
}); };
exports.details = details;
var encoderMap = new Map([
    ['AAC', 'aac'],
    ['AC3', 'ac3'],
    ['E-AC3', 'eac3'],
    ['Opus', 'libopus'],
]);
var getEncoderFromCodecName = function (codec) {
    var _a;
    if (!codec) {
        return null;
    }
    if (!encoderMap.has(codec)) {
        throw new Error("Unknown codec name \"".concat(codec, "\""));
    }
    return (_a = encoderMap.get(codec)) !== null && _a !== void 0 ? _a : 'Uh oh!';
};
var plugin = (0, ffmpeg_1.ffMpegCommandPlugin)(details, function (args) {
    var codec = String(args.inputs.codec);
    var targetChannels = (0, utils_1.convertToValidNumber)(args.inputs.channels, 0, 24, 'Desired Channel Count');
    var encoder = getEncoderFromCodecName(codec);
    var audioStreams = (0, utils_1.getAvailableStreams)(args.variables.ffmpegCommand.streams, ffmpeg_1.CodecType.AUDIO);
    args.jobLog("Found ".concat(audioStreams.length, " audio stream(s)"));
    // Main processing loop:
    audioStreams.forEach(function (stream) {
        var _a, _b, _c, _d;
        args.jobLog("Processing: \"".concat((_b = (_a = stream.tags) === null || _a === void 0 ? void 0 : _a.title) !== null && _b !== void 0 ? _b : '?', "\""));
        if (!stream.channels || stream.channels < 0) {
            throw new Error("Invalid channel count for audio stream \"".concat((_d = (_c = stream.tags) === null || _c === void 0 ? void 0 : _c.title) !== null && _d !== void 0 ? _d : '?', "\""));
        }
        if (encoder) {
            stream.outputArgs.push('-c:{outputIndex}', encoder);
            args.jobLog("- Setting encoder to \"".concat(encoder, "\""));
        }
        else {
            args.jobLog('- Not encoding');
        }
        if (targetChannels && targetChannels < stream.channels) {
            stream.outputArgs.push('-ac:{outputIndex}', targetChannels.toString());
            args.jobLog("- Setting channel count to ".concat(targetChannels, " (currently: ").concat(stream.channels, ")"));
        }
        else {
            args.jobLog('- Keeping original channel count');
        }
    });
    return {
        outputFileObj: args.inputFileObj,
        outputNumber: 1,
        variables: args.variables,
    };
});
exports.plugin = plugin;
