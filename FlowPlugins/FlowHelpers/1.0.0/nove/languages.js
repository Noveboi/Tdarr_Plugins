"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var types_1 = require("./types");
var utils_1 = require("./utils");
/**
 * Expresses a set of unique languages.
 * This class defines some commonly used methods that help with common plugin tasks.
 *
 * All languages in this set conform to the ISO 639-3 standard's codes.
 *
 * See here: https://iso639-3.sil.org/code_tables/639/data
 */
var LanguageSet = /** @class */ (function () {
    function LanguageSet(languages) {
        this.languages = new Set(languages.map(this.normalize));
        this.length = this.languages.size;
    }
    LanguageSet.from = function (languages, options) {
        if (options === void 0) { options = { acceptEmptyList: false }; }
        if (languages.length === 1 && !languages[0]) {
            return options.acceptEmptyList
                ? (0, types_1.ok)(new LanguageSet([]))
                : (0, types_1.err)('Languages are empty. Specify at least one language');
        }
        var invalidLanguages = languages.filter(function (lang) { return !(0, utils_1.isValidLanguageCode)(lang); });
        if (invalidLanguages.length > 0) {
            return (0, types_1.err)("Languages [".concat(invalidLanguages.join(', '), "] are invalid ISO 639-3 codes"));
        }
        return (0, types_1.ok)(new LanguageSet(languages));
    };
    LanguageSet.prototype.normalize = function (value) {
        return value
            ? value.trim().toLowerCase()
            : '';
    };
    LanguageSet.prototype.toString = function () {
        return Array.from(this.languages).join(', ');
    };
    /**
     * Detect whether the given language is present in the set.
     */
    LanguageSet.prototype.contain = function (language) {
        return this.languages.has(this.normalize(language));
    };
    return LanguageSet;
}());
exports.default = LanguageSet;
