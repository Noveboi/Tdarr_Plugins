"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
/* eslint-disable no-param-reassign */
var cliUtils_1 = require("../../../../FlowHelpers/1.0.0/cliUtils");
var subtitles_1 = __importStar(require("../../../../FlowHelpers/1.0.0/nove/subtitles"));
var types_1 = require("../../../../FlowHelpers/1.0.0/nove/types");
var utils_1 = require("../../../../FlowHelpers/1.0.0/nove/utils");
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
var details = function () { return ({
    name: 'Extract Embedded Subtitles',
    description: 'Extract subtitle tracks to separate files',
    style: {
        borderColor: '#6efefc',
    },
    tags: 'subtitles',
    isStartPlugin: false,
    pType: '',
    requiresVersion: '2.11.01',
    sidebarPosition: -1,
    icon: 'faLanguage',
    inputs: [
        {
            label: 'Bitmap Subtitle Handling',
            name: 'bitmapSubtitleHandling',
            tooltip: 'Choose how to handle bitmap subtitles (very common in anime)',
            type: 'string',
            defaultValue: 'skip',
            inputUI: {
                type: 'dropdown',
                options: ['skip', 'extract_sup'],
            },
        },
    ],
    outputs: [
        {
            number: 1,
            tooltip: 'Found subtitles and extracted them',
        },
        {
            number: 2,
            tooltip: 'Did not found any subtitles, did nothing',
        },
        {
            number: 3,
            tooltip: 'Extraction failed due to ffmpeg error',
        },
    ],
}); };
exports.details = details;
var displaySubtitleLanguages = function (streams) { return streams
    .map(function (s) { var _a, _b; return (_b = (_a = s.tags) === null || _a === void 0 ? void 0 : _a.language) !== null && _b !== void 0 ? _b : '?'; })
    .join(', '); };
var createSubtitleFilename = function (fileObj, stream, extension) {
    var _a;
    var filename = fileObj.file;
    var language = (_a = stream.tags) === null || _a === void 0 ? void 0 : _a.language;
    if (!language) {
        return (0, types_1.err)('No language defined for subtitle');
    }
    var cleanLanguage = language
        .toLowerCase()
        .replace(/[^a-z0-9_-]/gi, '_')
        .slice(0, 16);
    var extensionIndex = filename.lastIndexOf('.');
    var base = extensionIndex === -1
        ? filename
        : filename.substring(0, extensionIndex);
    return (0, types_1.ok)("".concat(base, ".").concat(cleanLanguage, ".track").concat(stream.index, ".").concat(extension));
};
var executeCliCommand = function (args, spawnArgs, outputFilenames) { return __awaiter(void 0, void 0, void 0, function () {
    var defaultLiveSizeCompare, cliArgs, cli, res;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                defaultLiveSizeCompare = {
                    enabled: false,
                    compareMethod: '',
                    thresholdPerc: 0,
                    lowerThresholdPerc: 0,
                    checkDelaySeconds: 0,
                    error: false,
                    errorType: '',
                };
                cliArgs = __assign(__assign({}, args), { variables: __assign(__assign({}, args.variables), { liveSizeCompare: __assign(__assign({}, ((_a = args.variables.liveSizeCompare) !== null && _a !== void 0 ? _a : defaultLiveSizeCompare)), { enabled: false }) }) });
                cli = new cliUtils_1.CLI({
                    cli: args.ffmpegPath,
                    spawnArgs: spawnArgs,
                    spawnOpts: {},
                    jobLog: args.jobLog,
                    outputFilePath: outputFilenames[0],
                    inputFileObj: args.inputFileObj,
                    logFullCliOutput: args.logFullCliOutput,
                    updateWorker: args.updateWorker,
                    args: cliArgs,
                });
                return [4 /*yield*/, cli.runCli()];
            case 1:
                res = _b.sent();
                if (res.cliExitCode === 0) {
                    return [2 /*return*/, (0, types_1.ok)(undefined)];
                }
                return [2 /*return*/, (0, types_1.err)(res.errorLogFull)];
        }
    });
}); };
var plugin = function (args) { return __awaiter(void 0, void 0, void 0, function () {
    var bitmapSubtitleHandling, bitmapHandlingResult, subtitleStreams, spawnArgs, outputFilenames, executeResult;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                bitmapSubtitleHandling = String((_b = (_a = args.inputs) === null || _a === void 0 ? void 0 : _a.bitmapSubtitleHandling) !== null && _b !== void 0 ? _b : subtitles_1.BitmapHandling.SKIP).trim();
                bitmapHandlingResult = (0, utils_1.enumParser)(subtitles_1.BitmapHandling)(bitmapSubtitleHandling);
                if (!bitmapHandlingResult.ok) {
                    throw new Error(bitmapHandlingResult.error);
                }
                subtitleStreams = args.variables.ffmpegCommand.streams
                    .filter(function (s) { return s.codec_type === 'subtitle'; });
                if (subtitleStreams.length === 0) {
                    args.jobLog('No subtitles found, exiting');
                    return [2 /*return*/, {
                            outputFileObj: args.inputFileObj,
                            outputNumber: 2,
                            variables: args.variables,
                        }];
                }
                args.jobLog("Found ".concat(subtitleStreams.length, " subtitles to extract: [").concat(displaySubtitleLanguages(subtitleStreams), "]"));
                spawnArgs = ['-y', '-i', args.inputFileObj.file];
                outputFilenames = [];
                subtitleStreams.forEach(function (stream, i) {
                    var action = (0, subtitles_1.default)(stream.codec_name, bitmapHandlingResult.value);
                    if (action.action === 'skip') {
                        args.jobLog("Skipping subtitle #".concat(i, ", reason: ").concat(action.reason));
                        return;
                    }
                    var outputFilenameResult = createSubtitleFilename(args.inputFileObj, stream, action.extension);
                    if (!outputFilenameResult.ok) {
                        args.jobLog("Skipping subtitle #".concat(i, ", reason: ").concat(outputFilenameResult.error));
                    }
                    else {
                        var filename = outputFilenameResult.value;
                        spawnArgs.push('-map', "0:".concat(stream.index), '-c:s', action.codec, filename);
                        outputFilenames.push(filename);
                    }
                });
                if (outputFilenames.length === 0) {
                    args.jobLog('No extractable subtitles found after filtering/skipping');
                    return [2 /*return*/, {
                            outputNumber: 2,
                            outputFileObj: args.inputFileObj,
                            variables: args.variables,
                        }];
                }
                return [4 /*yield*/, executeCliCommand(args, spawnArgs, outputFilenames)];
            case 1:
                executeResult = _c.sent();
                if (executeResult.ok) {
                    return [2 /*return*/, {
                            outputNumber: 1,
                            outputFileObj: args.inputFileObj,
                            variables: args.variables,
                        }];
                }
                args.jobLog('Subtitle extraction failed, continuing without extraction. See errors below for more information');
                executeResult.error.forEach(function (error) { return args.jobLog(error); });
                return [2 /*return*/, {
                        outputNumber: 3,
                        outputFileObj: args.inputFileObj,
                        variables: args.variables,
                    }];
        }
    });
}); };
exports.plugin = plugin;
