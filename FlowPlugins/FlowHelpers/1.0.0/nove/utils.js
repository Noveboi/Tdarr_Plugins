"use strict";
/*
Shared/common utilities. This module should contain PURE functions!!!
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToValidNumber = exports.getAvailableStreams = exports.containsKeywords = exports.parseCommaSeparatedValues = exports.isValidLanguageCode = exports.enumParser = exports.enumValues = void 0;
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
var isValidLanguageCode = function (code) { return code.length === 3; };
exports.isValidLanguageCode = isValidLanguageCode;
/**
 * Convert a simple string to an array of values, separated by commas.
 * @param value The input string
 * @param lowercase If true, converts each value to lowercase.
 */
var parseCommaSeparatedValues = function (value, lowercase) {
    if (lowercase === void 0) { lowercase = false; }
    if (!value) {
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
    if (!value) {
        return false;
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
    var availableStreams = streams.filter(function (stream) { return !stream.removed && stream.codec_type === type; });
    return availableStreams;
};
exports.getAvailableStreams = getAvailableStreams;
/**
 * Converts an unknown input to either an integer or float, whilst simultaneously ensuring the number is in a
 * given range [min, max].
 *
 * The conversion is done in Base 10.
 * @param input The value to convert
 * @param min The minimum allowed number that the value can be (inclusive)
 * @param max The maximum allowed number that the value can be (inclusive)
 * @param name What the value is called
 * @param type Is the value to bparseCommaSeparatedValuese treated as an integer or a float? Default: integer
 */
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
exports.convertToValidNumber = convertToValidNumber;
