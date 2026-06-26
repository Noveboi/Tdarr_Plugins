"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SonarrClient = void 0;
var types_1 = require("./types");
var SONARR_LANGUAGE_ID_TO_FFMPEG = (_a = {},
    _a[-2] = { name: 'Original', ffmpegCode: null },
    _a[0] = { name: 'Unknown', ffmpegCode: 'und' },
    _a[1] = { name: 'English', ffmpegCode: 'eng', bcp47: 'en' },
    _a[2] = { name: 'French', ffmpegCode: 'fre', bcp47: 'fr' },
    _a[3] = { name: 'Spanish', ffmpegCode: 'spa', bcp47: 'es' },
    _a[4] = { name: 'German', ffmpegCode: 'ger', bcp47: 'de' },
    _a[5] = { name: 'Italian', ffmpegCode: 'ita', bcp47: 'it' },
    _a[6] = { name: 'Danish', ffmpegCode: 'dan', bcp47: 'da' },
    _a[7] = { name: 'Dutch', ffmpegCode: 'dut', bcp47: 'nl' },
    _a[8] = { name: 'Japanese', ffmpegCode: 'jpn', bcp47: 'ja' },
    _a[9] = { name: 'Icelandic', ffmpegCode: 'ice', bcp47: 'is' },
    _a[10] = { name: 'Chinese', ffmpegCode: 'chi', bcp47: 'zh' },
    _a[11] = { name: 'Russian', ffmpegCode: 'rus', bcp47: 'ru' },
    _a[12] = { name: 'Polish', ffmpegCode: 'pol', bcp47: 'pl' },
    _a[13] = { name: 'Vietnamese', ffmpegCode: 'vie', bcp47: 'vi' },
    _a[14] = { name: 'Swedish', ffmpegCode: 'swe', bcp47: 'sv' },
    _a[15] = { name: 'Norwegian', ffmpegCode: 'nor', bcp47: 'no' },
    _a[16] = { name: 'Finnish', ffmpegCode: 'fin', bcp47: 'fi' },
    _a[17] = { name: 'Turkish', ffmpegCode: 'tur', bcp47: 'tr' },
    _a[18] = { name: 'Portuguese', ffmpegCode: 'por', bcp47: 'pt' },
    _a[19] = { name: 'Flemish', ffmpegCode: 'dut', bcp47: 'nl-BE' },
    _a[20] = { name: 'Greek', ffmpegCode: 'gre', bcp47: 'el' },
    _a[21] = { name: 'Korean', ffmpegCode: 'kor', bcp47: 'ko' },
    _a[22] = { name: 'Hungarian', ffmpegCode: 'hun', bcp47: 'hu' },
    _a[23] = { name: 'Hebrew', ffmpegCode: 'heb', bcp47: 'he' },
    _a[24] = { name: 'Lithuanian', ffmpegCode: 'lit', bcp47: 'lt' },
    _a[25] = { name: 'Czech', ffmpegCode: 'cze', bcp47: 'cs' },
    _a[26] = { name: 'Arabic', ffmpegCode: 'ara', bcp47: 'ar' },
    _a[27] = { name: 'Hindi', ffmpegCode: 'hin', bcp47: 'hi' },
    _a[28] = { name: 'Bulgarian', ffmpegCode: 'bul', bcp47: 'bg' },
    _a[29] = { name: 'Malayalam', ffmpegCode: 'mal', bcp47: 'ml' },
    _a[30] = { name: 'Ukrainian', ffmpegCode: 'ukr', bcp47: 'uk' },
    _a[31] = { name: 'Slovak', ffmpegCode: 'slo', bcp47: 'sk' },
    _a[32] = { name: 'Thai', ffmpegCode: 'tha', bcp47: 'th' },
    _a[33] = { name: 'Portuguese (Brazil)', ffmpegCode: 'por', bcp47: 'pt-BR' },
    _a[34] = { name: 'Spanish (Latino)', ffmpegCode: 'spa', bcp47: 'es-419' },
    _a[35] = { name: 'Romanian', ffmpegCode: 'rum', bcp47: 'ro' },
    _a[36] = { name: 'Latvian', ffmpegCode: 'lav', bcp47: 'lv' },
    _a[37] = { name: 'Persian', ffmpegCode: 'per', bcp47: 'fa' },
    _a[38] = { name: 'Catalan', ffmpegCode: 'cat', bcp47: 'ca' },
    _a[39] = { name: 'Croatian', ffmpegCode: 'hrv', bcp47: 'hr' },
    _a[40] = { name: 'Serbian', ffmpegCode: 'srp', bcp47: 'sr' },
    _a[41] = { name: 'Bosnian', ffmpegCode: 'bos', bcp47: 'bs' },
    _a[42] = { name: 'Estonian', ffmpegCode: 'est', bcp47: 'et' },
    _a[43] = { name: 'Tamil', ffmpegCode: 'tam', bcp47: 'ta' },
    _a[44] = { name: 'Indonesian', ffmpegCode: 'ind', bcp47: 'id' },
    _a[45] = { name: 'Macedonian', ffmpegCode: 'mac', bcp47: 'mk' },
    _a[46] = { name: 'Slovenian', ffmpegCode: 'slv', bcp47: 'sl' },
    _a);
// https://sonarr.tv/docs/api/#v3/description/introduction
var SonarrClient = /** @class */ (function () {
    function SonarrClient(baseUrl, apiKey) {
        this.mediaType = 'series';
        this.baseUrl = baseUrl;
        this.apiKey = apiKey;
    }
    SonarrClient.prototype.getApiPath = function (resource) {
        return "".concat(this.baseUrl, "/api/v3/").concat(resource);
    };
    SonarrClient.prototype.defaultHeaders = function () {
        return {
            'X-Api-Key': this.apiKey,
            Accept: 'application/json',
        };
    };
    SonarrClient.prototype.parseLanguage = function (language) {
        return SONARR_LANGUAGE_ID_TO_FFMPEG[language.id];
    };
    SonarrClient.prototype.getByTmdbId = function (tmdbId) {
        return __awaiter(this, void 0, void 0, function () {
            var response, seriesInfo;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch(this.getApiPath("series/lookup?term=tmdb:".concat(tmdbId)), {
                            method: 'GET',
                            headers: this.defaultHeaders(),
                        })];
                    case 1:
                        response = _a.sent();
                        if (response.status === 404) {
                            return [2 /*return*/, (0, types_1.err)("Series with TMDB ID \"".concat(tmdbId, "\" does not exist in Sonarr"))];
                        }
                        if (response.status !== 200) {
                            return [2 /*return*/, (0, types_1.err)("Unknown error occurred: ".concat(response.status, " ").concat(response.statusText))];
                        }
                        return [4 /*yield*/, response.json()];
                    case 2:
                        seriesInfo = _a.sent();
                        return [2 /*return*/, (0, types_1.ok)(seriesInfo)];
                }
            });
        });
    };
    return SonarrClient;
}());
exports.SonarrClient = SonarrClient;
