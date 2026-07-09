"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BitmapHandling = void 0;
exports.BitmapHandling = {
    SKIP: 'skip',
    EXTRACT_SUP: 'extract_sup',
};
var getSubtitleAction = function (codec, bitmapHandling) {
    switch (codec === null || codec === void 0 ? void 0 : codec.toLowerCase()) {
        case 'subrip':
            return { action: 'extract', extension: 'srt', codec: 'copy' };
        case 'ass':
        case 'ssa':
            return { action: 'extract', extension: 'ass', codec: 'copy' };
        case 'webvtt':
            return { action: 'extract', extension: 'vtt', codec: 'copy' };
        case 'hdmv_pgs_subtitle':
            if (bitmapHandling === exports.BitmapHandling.EXTRACT_SUP) {
                return { action: 'extract', extension: 'sup', codec: 'copy' };
            }
            return {
                action: 'skip',
                reason: 'PGS is bitmap-based, OCR is required for SRT',
            };
        case 'dvd_subtitle':
        case 'dvb_subtitle':
            return {
                action: 'skip',
                reason: "".concat(codec, " is bitmap-based, OCR or format-specific extraction is required"),
            };
        default:
            return {
                action: 'skip',
                reason: "Unsupported subtitle codec: ".concat(codec !== null && codec !== void 0 ? codec : '?'),
            };
    }
};
exports.default = getSubtitleAction;
