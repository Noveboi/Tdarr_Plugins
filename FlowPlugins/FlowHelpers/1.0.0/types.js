"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.err = exports.ok = void 0;
var ok = function (value) { return ({
    ok: true,
    value: value,
}); };
exports.ok = ok;
var err = function (error) { return ({
    ok: false,
    error: error,
}); };
exports.err = err;
