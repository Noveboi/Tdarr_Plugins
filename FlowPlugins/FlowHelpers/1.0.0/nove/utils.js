"use strict";
/*
Shared/common utilities.

This module should contain PURE functions!!!
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseBoolean = exports.parseNumber = exports.getAvailableStreams = exports.containsKeywords = exports.parseCommaSeparatedValues = exports.isValidLanguageCode = exports.enumParser = exports.enumValues = void 0;
var types_1 = require("./types");
var enumValues = function (type) {
    var values = Object.values(type);
    return values;
};
exports.enumValues = enumValues;
var enumParser = function (type) {
    var values = new Set((0, exports.enumValues)(type));
    return function (value) { return (values.has(value)
        ? (0, types_1.ok)(value)
        : (0, types_1.err)("No member for ".concat(value))); };
};
exports.enumParser = enumParser;
/**
 * Ensures a string is valid for an ffmpeg-style language code.
 */
var isValidLanguageCode = function (value) { return value.length === 3; };
exports.isValidLanguageCode = isValidLanguageCode;
/**
 * Convert a simple string to an array of values, separated by commas.
 * @param value The input string
 * @param lowercase If true, converts each value to lowercase.
 */
var parseCommaSeparatedValues = function (value, lowercase) {
    if (lowercase === void 0) { lowercase = false; }
    if (!(value === null || value === void 0 ? void 0 : value.trim())) {
        return [];
    }
    return (lowercase
        ? value
            .split(',')
            .map(function (val) { return val.trim().toLowerCase(); })
        : value
            .split(',')
            .map(function (val) { return val.trim(); }));
};
exports.parseCommaSeparatedValues = parseCommaSeparatedValues;
/**
 * Find one or more keywords in the given value.
 * @param value The value to search for keywords.
 * @param keywords A list of keywords.
 * @returns `true` if one or more keywords are present in the value. `false` otherwise.
 */
var containsKeywords = function (value, keywords) {
    if (!(value === null || value === void 0 ? void 0 : value.trim())) {
        return false;
    }
    if (keywords.length === 0) {
        return true;
    }
    var cleanValue = value.toLowerCase();
    return keywords.some(function (keyword) { return cleanValue.includes(keyword); });
};
exports.containsKeywords = containsKeywords;
/**
 * Filter the given stream collection to contain streams which are "available".
 * "Available" means the stream is not flagged for removal.
 * @param streams The input stream collection
 * @param type The type of stream you want (e.g: Video, Audio, Subtitle)
 */
var getAvailableStreams = function (streams, type) {
    if (type === void 0) { type = undefined; }
    var availableStreams = streams.filter(function (stream) { return !stream.removed && (!type || stream.codec_type === type); });
    return availableStreams;
};
exports.getAvailableStreams = getAvailableStreams;
var formatValidRange = function (min, max) {
    if (min === undefined && max === undefined) {
        return '[-∞, +∞]';
    }
    if (min === undefined) {
        return "[-\u221E, ".concat(max, "]");
    }
    if (max === undefined) {
        return "[".concat(min, ", +\u221E]");
    }
    return "[".concat(min, ", ").concat(max, "]");
};
/**
 * Converts an unknown input to either an integer or float, whilst simultaneously ensuring the number is in a
 * given range [min, max].
 *
 * The conversion is done in Base 10.
 * @param input The value to convert
 * @param options Various options that further specify the format and validity of the output.
 */
var parseNumber = function (input, options) {
    var _a;
    if (options === void 0) { options = {}; }
    if (input === undefined || input === null) {
        throw new Error('Undefined values are not allowed');
    }
    var type = (_a = options.type) !== null && _a !== void 0 ? _a : 'integer';
    var min = options.min, max = options.max, name = options.name;
    var valueAsString = String(input).trim();
    if (valueAsString === '') {
        throw new Error('Empty strings are not allowed');
    }
    var value = type === 'integer'
        ? Number.parseInt(valueAsString, 10)
        : Number.parseFloat(valueAsString);
    if ((min !== undefined && value < min) || (max !== undefined && value > max)) {
        var variableName = name
            ? " for '".concat(name, "'")
            : '';
        throw new Error("Value ".concat(value).concat(variableName, " is out of range: ").concat(formatValidRange(min, max)));
    }
    return value;
};
exports.parseNumber = parseNumber;
/**
 * Parse a value into a boolean.
 * This method is strict and will throw if the value is unexpected.
 *
 * `true` for: 1, 'true'.
 *
 * `false` for: 0, 'false', `undefined`, `null`
 */
var parseBoolean = function (value) {
    if (!value) {
        return false;
    }
    if (value === true || value === 1 || value === 'true') {
        return true;
    }
    if (value === 'false') {
        return false;
    }
    throw new Error("Unknown value '".concat(value, "'"));
};
exports.parseBoolean = parseBoolean;
