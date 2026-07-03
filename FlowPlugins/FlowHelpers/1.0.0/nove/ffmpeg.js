"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ffMpegCommandPlugin = exports.CodecType = void 0;
/* eslint-disable no-param-reassign */
var flowUtils_1 = require("../interfaces/flowUtils");
exports.CodecType = {
    VIDEO: 'video',
    AUDIO: 'audio',
    SUBTITLE: 'subtitle',
};
var ffMpegCommandPlugin = function (details, callback) { return function (args) {
    var lib = require('../../../../methods/lib')();
    args.inputs = lib.loadDefaultValues(args.inputs, details);
    (0, flowUtils_1.checkFfmpegCommandInit)(args);
    return callback(args);
}; };
exports.ffMpegCommandPlugin = ffMpegCommandPlugin;
