"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.details = void 0;
var ffmpeg_1 = require("../../../../FlowHelpers/1.0.0/nove/ffmpeg");
var types_1 = require("../../../../FlowHelpers/1.0.0/nove/types");
var utils_1 = require("../../../../FlowHelpers/1.0.0/nove/utils");
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
            defaultValue: '6',
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
            defaultValue: '10',
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
        {
            label: 'Variance Boost',
            name: 'varianceBoost',
            tooltip: "Increases the quality of low-contrast, dark areas in videos.\n      NOTE: This increases file size by a lot.",
            defaultValue: 'false',
            type: 'boolean',
            inputUI: {
                type: 'switch',
            },
        },
        {
            label: 'Temporal Filtering',
            name: 'temporalFiltering',
            tooltip: "Temporal filtering combines information from multiple nearby video frames to\n      create cleaner reference pictures with reduced noise, which helps improve\n      compression quality especially for noisy source material.",
            defaultValue: 'true',
            type: 'boolean',
            inputUI: {
                type: 'switch',
            },
        },
        {
            label: 'Sharpness',
            name: 'sharpness',
            tooltip: 'Part of the deblocking filter. Higher values (typically [1-2]) lead to better perceptual quality.',
            defaultValue: '0',
            type: 'number',
            inputUI: {
                type: 'slider',
                sliderOptions: {
                    min: 0,
                    max: 7,
                },
            },
        },
    ],
    outputs: [
        {
            number: 1,
            tooltip: 'Inputs were successfully validated, continue to next plugin',
        },
        {
            number: 2,
            tooltip: 'Found suspicious stream information, require review',
        },
    ],
}); };
exports.details = details;
var createParam = function (name, value) { return "".concat(name, "=").concat(value); };
var boolToInt = function (value) { return (value ? 1 : 0); };
var checkForSuspiciousStreams = function (args, streams) {
    // Check: More than one video stream?
    if (streams.length > 1) {
        args.jobLog('SUSPICIOUS: File has more than one video streams');
        streams.forEach(function (s) {
            var _a;
            args.jobLog("- \"".concat((_a = s.tags) === null || _a === void 0 ? void 0 : _a.title, "\", ").concat(s.codec_name, ", ").concat(s.width, "x").concat(s.height));
        });
        return (0, types_1.err)('More than one video stream');
    }
    return (0, types_1.ok)(undefined);
};
var plugin = (0, ffmpeg_1.ffMpegCommandPlugin)(details, function (args) {
    var preset = (0, utils_1.parseNumber)(args.inputs.preset, { min: 0, max: 13, name: 'Preset' });
    var crf = (0, utils_1.parseNumber)(args.inputs.crf, { min: 1, max: 70, name: 'CRF' });
    var tune = (0, utils_1.parseNumber)(args.inputs.tune, { min: 0, max: 5, name: 'Tune' });
    var gop = (0, utils_1.parseNumber)(args.inputs.gop, { min: 0.1, max: 100, name: 'GOP' });
    var sharpness = (0, utils_1.parseNumber)(args.inputs.sharpness, { min: 0, max: 7, name: 'Sharpness' });
    var use10Bit = (0, utils_1.parseBoolean)(args.inputs.bit10);
    var useVarianceBoost = (0, utils_1.parseBoolean)(args.inputs.varianceBoost);
    var useTemporalFiltering = (0, utils_1.parseBoolean)(args.inputs.temporalFiltering);
    args.variables.ffmpegCommand.shouldProcess = true;
    var videoStreams = (0, utils_1.getAvailableStreams)(args.variables.ffmpegCommand.streams, ffmpeg_1.CodecType.VIDEO);
    args.jobLog("Found ".concat(videoStreams.length, " video streams"));
    var checkResult = checkForSuspiciousStreams(args, videoStreams);
    if (!checkResult.ok) {
        return {
            outputNumber: 2,
            outputFileObj: args.inputFileObj,
            variables: args.variables,
        };
    }
    videoStreams.forEach(function (stream) {
        stream.outputArgs.push('-c:{outputIndex}', 'libsvtav1');
        stream.outputArgs.push('-preset', preset.toString());
        stream.outputArgs.push('-crf', crf.toString());
        stream.outputArgs.push('-pix_fmt', use10Bit ? 'yuv420p10le' : 'yuv420p');
        var params = [
            createParam('tune', tune),
            createParam('keyint', "".concat(gop, "s")),
            createParam('enable-variance-boost', boolToInt(useVarianceBoost)),
            createParam('enable-tf', boolToInt(useTemporalFiltering)),
            createParam('tf-strength', 1), // constrain to 1, higher values lead to artifacts.
            createParam('sharpness', sharpness),
        ];
        stream.outputArgs.push('-svtav1-params', params.join(':'));
    });
    return {
        outputFileObj: args.inputFileObj,
        outputNumber: 1,
        variables: args.variables,
    };
});
exports.plugin = plugin;
