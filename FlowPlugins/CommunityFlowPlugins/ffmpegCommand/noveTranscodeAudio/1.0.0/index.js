"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.details = void 0;
var ffmpeg_1 = require("../../../../FlowHelpers/1.0.0/nove/ffmpeg");
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
var details = function () { return ({
    name: 'Set Audio Codec',
    description: 'Transcode all audio streams using a specified codec',
    style: {
        borderColor: '#6efefc',
    },
    tags: 'audio, transcode',
    isStartPlugin: false,
    pType: '',
    requiresVersion: '2.11.01',
    sidebarPosition: -1,
    icon: '',
    inputs: [
        {
            label: 'Encoder',
            name: 'encoder',
            tooltip: "Which encoder to use. Typically, for good quality audio and full client support, AAC or EAC-3\n      are good choices.",
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
    args.jobLog("Found ".concat(audioStreams, " audio streams"));
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
