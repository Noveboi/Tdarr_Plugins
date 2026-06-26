"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-param-reassign */
var flowUtils_1 = require("../interfaces/flowUtils");
var ffMpegCommandPlugin = function (details, callback) { return function (args) {
    var lib = require('../../../../methods/lib')();
    args.inputs = lib.loadDefaultValues(args.inputs, details);
    (0, flowUtils_1.checkFfmpegCommandInit)(args);
    return callback(args);
}; };
exports.default = ffMpegCommandPlugin;
