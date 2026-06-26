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
Object.defineProperty(exports, "__esModule", { value: true });
exports.details = exports.plugin = void 0;
var parser_1 = require("../../../../FlowHelpers/1.0.0/nove/parser");
var radarr_1 = require("../../../../FlowHelpers/1.0.0/nove/radarr");
var sonarr_1 = require("../../../../FlowHelpers/1.0.0/nove/sonarr");
var OUT_SUCCESS = 1;
var OUT_FAIL = 2;
var details = function () { return ({
    name: 'Detect Original Language',
    description: 'Try to find the original/source language of the file by searching through public movie/TV databases',
    style: {
        borderColor: 'orange',
    },
    tags: 'language',
    isStartPlugin: false,
    pType: '',
    requiresVersion: '2.11.01',
    icon: 'faLanguage',
    inputs: [
        {
            label: 'Language Variable',
            name: 'langVariable',
            type: 'string',
            defaultValue: 'originalLanguage',
            inputUI: {
                type: 'text',
            },
            tooltip: 'This plugin will use this Flow Variable to store the detected original language of the movie/TV show.',
        },
    ],
    sidebarPosition: -1,
    outputs: [
        {
            number: OUT_SUCCESS,
            tooltip: 'The original language was detected.',
        },
        {
            number: OUT_FAIL,
            tooltip: 'The original was not detected',
        },
    ],
}); };
exports.details = details;
var getApiClient = function (args, mediaInfo) {
    var _a, _b, _c, _d;
    switch (mediaInfo.mediaType) {
        case 'movie':
            var radarrApiKey = (_a = args.userVariables.library.radarrApiKey) === null || _a === void 0 ? void 0 : _a.trim();
            var radarrUrl = (_b = args.userVariables.library.radarrUrl) === null || _b === void 0 ? void 0 : _b.trim();
            if (!radarrApiKey) {
                throw new Error('Radarr API key was not defined');
            }
            if (!radarrUrl) {
                throw new Error('Radarr URL was not defined');
            }
            args.jobLog("Initializing RadarrClient with URL \"".concat(radarrUrl, "\""));
            return new radarr_1.RadarrClient(radarrUrl, radarrApiKey);
        case 'tv':
            var sonarrApiKey = (_c = args.userVariables.library.sonarrApiKey) === null || _c === void 0 ? void 0 : _c.trim();
            var sonarrUrl = (_d = args.userVariables.library.sonarrUrl) === null || _d === void 0 ? void 0 : _d.trim();
            if (!sonarrApiKey) {
                throw new Error('Sonarr API key was not defined');
            }
            if (!sonarrUrl) {
                throw new Error('Sonarr URL was not defined');
            }
            args.jobLog("Initializing SonarrClient with URL \"".concat(sonarrUrl, "\""));
            return new sonarr_1.SonarrClient(sonarrUrl, sonarrApiKey);
        default:
            throw new Error();
    }
};
var plugin = function (args) { return __awaiter(void 0, void 0, void 0, function () {
    var lib, variableName, file, mediaInfo, client, mediaFetchResult, originalLanguage, languageCode;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                lib = require('../../../../../methods/lib')();
                args.inputs = lib.loadDefaultValues(args.inputs, details);
                variableName = String(args.inputs.langVariable).trim();
                file = args.inputFileObj.file;
                args.jobLog("Parsing file \"".concat(file, "\""));
                mediaInfo = (0, parser_1.parseMediaPath)(file);
                args.jobLog("Parsed info, got data: ".concat(JSON.stringify(mediaInfo)));
                client = getApiClient(args, mediaInfo);
                return [4 /*yield*/, client.getByTmdbId(mediaInfo.tmdbId)];
            case 1:
                mediaFetchResult = _a.sent();
                if (!mediaFetchResult.ok) {
                    throw new Error("Failed to fetch media: \"".concat(mediaFetchResult.error, "\""));
                }
                originalLanguage = mediaFetchResult.value.originalLanguage;
                if (!originalLanguage) {
                    args.jobLog("Original language field not present in media info: ".concat(JSON.stringify(mediaFetchResult.value)));
                    return [2 /*return*/, {
                            outputFileObj: args.inputFileObj,
                            outputNumber: OUT_FAIL,
                            variables: args.variables,
                        }];
                }
                if (!args.variables.user) {
                    args.variables.user = {};
                }
                languageCode = client.parseLanguage(originalLanguage);
                if (!languageCode.ffmpegCode) {
                    args.jobLog("Language is unknown or not correctly specified: ".concat(languageCode.name));
                    return [2 /*return*/, {
                            outputFileObj: args.inputFileObj,
                            outputNumber: OUT_FAIL,
                            variables: args.variables,
                        }];
                }
                args.variables.user[variableName] = languageCode.ffmpegCode;
                args.variables.user["".concat(variableName, "Full")] = languageCode.name;
                return [2 /*return*/, {
                        outputFileObj: args.inputFileObj,
                        outputNumber: OUT_SUCCESS,
                        variables: args.variables,
                    }];
        }
    });
}); };
exports.plugin = plugin;
