"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.details = void 0;
var ffmpeg_1 = require("../../../../FlowHelpers/1.0.0/nove/ffmpeg");
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
var details = function () { return ({
    name: 'Remove Data',
    description: 'Remove streams like data streams and images',
    style: {
        borderColor: '#6efefc',
    },
    tags: 'data',
    isStartPlugin: false,
    pType: '',
    requiresVersion: '2.11.01',
    sidebarPosition: -1,
    icon: '',
    inputs: [],
    outputs: [
        {
            number: 1,
            tooltip: 'Continue to next plugin',
        },
    ],
}); };
exports.details = details;
// Below is a list of supported video encoders that produce images
// This is a subset from the `ffmpeg -encoders` list.
//
// 2026-09-24: Using ffmpeg n9.0.2 on Arch
var videoCodecBlacklist = [
    'alias_pix',
    'apng',
    'bmp',
    'exr',
    'fits',
    'gif',
    'jpeg2000',
    'libopenjpeg',
    'jpegls',
    'libjxl',
    'libjxl_anim',
    'ljpeg',
    'mjpeg',
    'mjpeg_qsv',
    'mjpeg_vaapi',
    'pam',
    'pbm',
    'pcx',
    'pfm',
    'pgm',
    'pgmyuv',
    'phm',
    'png',
    'ppm',
    'qoi',
    'sgi',
    'sunrast',
    'targa',
    'tiff',
    'libwebp_anim',
    'libwebp',
    'xbm',
    'xface',
    'xwd',
];
var shouldRemoveStream = function (stream) {
    if (stream.codec_type === ffmpeg_1.CodecType.DATA) {
        return true;
    }
    if (stream.codec_type === ffmpeg_1.CodecType.VIDEO && videoCodecBlacklist.includes(stream.codec_name.toLowerCase())) {
        return true;
    }
    return false;
};
var plugin = (0, ffmpeg_1.ffMpegCommandPlugin)(details, function (args) {
    var streams = args.variables.ffmpegCommand.streams;
    var streamsToRemove = streams.filter(shouldRemoveStream);
    streamsToRemove.forEach(function (stream) {
        stream.removed = true;
    });
    return {
        outputNumber: 1,
        outputFileObj: args.inputFileObj,
        variables: args.variables,
    };
});
exports.plugin = plugin;
