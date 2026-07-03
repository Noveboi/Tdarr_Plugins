"use strict";
/*
Shared/common utilities. This module should contain PURE functions!!!
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseLanguageCodes = exports.isValidLanguageCode = exports.enumParser = exports.enumValues = void 0;
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
/**
 * Parses a comma-separated string of values and returns list of normalized and validated ISO 639-3 language codes.
 * https://iso639-3.sil.org/code_tables/639/data
 *
 * @argument acceptEmpty
 * If false, the method returns an error when no languages are found from `value`.
 * If true, the method returns an empty array.
 */
var parseLanguageCodes = function (value, acceptEmpty) {
    if (acceptEmpty === void 0) { acceptEmpty = false; }
    var languages = value
        .split(',')
        .map(function (val) { return val.trim(); });
    if (languages.length === 1 && !languages[0]) {
        return acceptEmpty
            ? (0, types_1.ok)([])
            : (0, types_1.err)('Languages are empty. Specify at least one language');
    }
    var invalidLanguages = languages.filter(function (lang) { return !(0, exports.isValidLanguageCode)(lang); });
    if (invalidLanguages.length > 0) {
        return (0, types_1.err)("Languages [".concat(invalidLanguages.join(', '), "] are invalid ISO 639-3 codes"));
    }
    return (0, types_1.ok)(languages);
};
exports.parseLanguageCodes = parseLanguageCodes;
