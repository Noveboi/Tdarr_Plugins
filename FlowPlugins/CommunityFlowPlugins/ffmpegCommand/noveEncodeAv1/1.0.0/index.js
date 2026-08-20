"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.details = void 0;
var ffmpeg_1 = require("../../../../FlowHelpers/1.0.0/nove/ffmpeg");
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
var details = function () { return ({
    name: 'AV1 Transcode',
    description: 'Transcode the video stream using the SVT-AV1 codec',
    style: {
        borderColor: '#6efefc',
    },
    tags: 'video, av1',
    isStartPlugin: false,
    pType: '',
    requiresVersion: '2.11.01',
    sidebarPosition: -1,
    icon: '',
    inputs: [
        {
            label: 'Preset',
            name: 'preset',
            tooltip: "The encoder preset. Values range from 0 to 13. Higher preset values means faster encodes,\n      with a quality tradeoff. For archivalit is recommended to use values between 3 and 6",
            defaultValue: '5',
            type: 'number',
            inputUI: {
                type: 'slider',
                sliderOptions: {
                    min: 0,
                    max: 13,
                },
            },
        },
        {
            label: 'CRF',
            name: 'crf',
            tooltip: 'Constant Rate Factor. Recommended to use 21-25 for archival',
            defaultValue: '23',
            type: 'number',
            inputUI: {
                type: 'slider',
                sliderOptions: {
                    min: 1,
                    max: 70,
                },
            },
        },
        {
            label: 'Tune',
            name: 'tune',
            tooltip: "[SVT-AV1 GitLab] Optimize the encoding process for different desired outcomes\n      [0 = VQ (video and still image), 1 = PSNR (video and still image), 2 = SSIM (video and still image),\n      3 = IQ (still image only), 4 = MS-SSIM (video and still image), 5 = VMAF (video only)]",
            defaultValue: '0',
            type: 'number',
            inputUI: {
                type: 'slider',
                sliderOptions: {
                    min: 0,
                    max: 5,
                },
            },
        },
        {
            label: 'GOP Interval',
            name: 'gop',
            tooltip: "The interval in seconds after which an I-frame (keyframe) is inserted. Frequent keyframes\n      are useful for precise and fast seekability, but at the cost of reduced compression efficiency. For movies/TV,\n      it is recommended to use 5-10 seconds",
            defaultValue: '5',
            type: 'number',
            inputUI: {
                type: 'text',
            },
        },
        {
            label: '10-bit?',
            name: 'bit10',
            tooltip: 'Whether to use 10-bit or 8-bit. Set to `true` to use 10-bit.',
            defaultValue: 'true',
            type: 'boolean',
            inputUI: {
                type: 'switch',
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
var convertToValidNumber = function (input, min, max, name, type) {
    if (type === void 0) { type = 'integer'; }
    var valueAsString = String(input);
    var value = type === 'integer'
        ? Number.parseInt(valueAsString, 10)
        : Number.parseFloat(valueAsString);
    if (value < min || value > max) {
        throw new Error("Value ".concat(value, " for '").concat(name, "' is out of range. Expected [").concat(min, "-").concat(max, "]"));
    }
    return value;
};
var plugin = (0, ffmpeg_1.ffMpegCommandPlugin)(details, function (args) {
    var preset = convertToValidNumber(args.inputs.preset, 0, 13, 'Preset');
    var crf = convertToValidNumber(args.inputs.crf, 1, 70, 'CRF');
    var tune = convertToValidNumber(args.inputs.tune, 0, 5, 'Tune');
    var gop = convertToValidNumber(args.inputs.gop, 0.1, 100, 'GOP');
    var use10Bit = Boolean(args.inputs.bit10);
    args.variables.ffmpegCommand.shouldProcess = true;
    var videoStreams = args.variables.ffmpegCommand.streams
        .filter(function (s) { return s.codec_type === ffmpeg_1.CodecType.VIDEO && s.codec_name !== 'mjpeg'; });
    args.jobLog("Found ".concat(videoStreams.length, " video streams"));
    videoStreams.forEach(function (stream) {
        stream.outputArgs.push('-c:{outputIndex}', 'libsvtav1');
        stream.outputArgs.push('-preset', preset.toString());
        stream.outputArgs.push('-crf', crf.toString());
        stream.outputArgs.push('-pix_fmt', use10Bit ? 'yuv420p10le' : 'yuv420p');
        stream.outputArgs.push('-svtav1-params', "tune=".concat(tune, ":keyint=").concat(gop, "s"));
    });
    return {
        outputFileObj: args.inputFileObj,
        outputNumber: 1,
        variables: args.variables,
    };
});
exports.plugin = plugin;
