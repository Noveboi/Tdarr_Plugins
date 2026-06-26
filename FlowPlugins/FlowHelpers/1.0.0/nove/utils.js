"use strict";
/*
Shared/common utilities. This module should contain PURE functions!!!
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.enumParser = exports.enumValues = void 0;
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
