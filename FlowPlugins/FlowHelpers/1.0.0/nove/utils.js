"use strict";
/*
Shared/common utilities. This module should contain PURE functions!!!
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.containsKeywords = exports.parseCommaSeparatedValues = exports.isValidLanguageCode = exports.enumParser = exports.enumValues = void 0;
var types_1 = require("./types");
var enumValues = function (obj) {
    var values = Object.values(obj);
    return values;
};
exports.enumValues = enumValues;
var enumParser = function (obj) {
    var values = new Set((0, exports.enumValues)(obj));
    return function (value) { return (values.has(value)
        ? (0, types_1.ok)(value)
        : (0, types_1.err)("No member for ".concat(value))); };
};
exports.enumParser = enumParser;
var isValidLanguageCode = function (code) { return code.length === 3; };
exports.isValidLanguageCode = isValidLanguageCode;
var parseCommaSeparatedValues = function (value, lowercase) {
    if (lowercase === void 0) { lowercase = false; }
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
