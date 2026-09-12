"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.details = void 0;
var ffmpeg_1 = require("../../../../FlowHelpers/1.0.0/nove/ffmpeg");
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
            label: 'Encoder',
            name: 'encoder',
            tooltip: "Which audio encoder to use.\n\n      This operation will be applied to all available audio streams.",
            defaultValue: 'aac',
            type: 'string',
            inputUI: {
                type: 'dropdown',
                options: [
                    'aac',
                    'ac3',
                    'eac3',
                    'libopus',
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
var plugin = (0, ffmpeg_1.ffMpegCommandPlugin)(details, function (args) {
    var encoder = String(args.inputs.encoder);
    var audioStreams = args.variables.ffmpegCommand.streams
        .filter(function (stream) { return stream.codec_type === ffmpeg_1.CodecType.AUDIO; });
    args.jobLog("Found ".concat(audioStreams.length, " audio streams"));
    audioStreams.forEach(function (stream) {
        stream.outputArgs.push('-c:{outputIndex}', encoder);
    });
    return {
        outputFileObj: args.inputFileObj,
        outputNumber: 1,
        variables: args.variables,
    };
});
exports.plugin = plugin;
