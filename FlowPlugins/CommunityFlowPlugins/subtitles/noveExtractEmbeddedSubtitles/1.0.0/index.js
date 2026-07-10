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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.details = exports.plugin = void 0;
/* eslint-disable no-param-reassign */
var fs_1 = require("fs");
var path_1 = __importDefault(require("path"));
var cliUtils_1 = require("../../../../FlowHelpers/1.0.0/cliUtils");
var subtitles_1 = __importStar(require("../../../../FlowHelpers/1.0.0/nove/subtitles"));
var types_1 = require("../../../../FlowHelpers/1.0.0/nove/types");
var utils_1 = require("../../../../FlowHelpers/1.0.0/nove/utils");
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
var details = function () { return ({
    name: 'Extract Embedded Subtitles',
    description: "Extract subtitle tracks to separate files.\n  NOTE: This does not guarantee ALL subtitles are extracted. For example, bitmap subtitles (such as PGS)\n  are handled differently and could be skipped entirely.\n\n  Do not blindly remove all subtitles after extraction, as it may result in unwanted data loss.",
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
            tooltip: "Choose how to handle bitmap subtitles (very common in anime)\n\n      As it stands (2026-07-10), external bitmap subtitles (PGS, etc...) do not play well with\n      streaming clients such as Jellyfin. It is therefore recommended to\n      leave the option as 'skip' and have them remain embedded.",
            type: 'string',
            defaultValue: 'skip',
            inputUI: {
                type: 'dropdown',
                options: ['skip', 'extract_sup'],
            },
        },
        {
            label: 'Extraction Directory',
            name: 'extractDir',
            tooltip: "The directory where the extracted subtitle files should be placed.\n\n      Use the keyword \"original\" to use the original media file directory as the extraction point.",
            type: 'string',
            defaultValue: 'original',
            inputUI: {
                type: 'text',
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
            tooltip: 'One or more subtitles were skipped and not extracted',
        },
    ],
}); };
exports.details = details;
var displaySubtitleLanguages = function (streams) { return streams
    .map(function (s) { var _a, _b; return (_b = (_a = s.tags) === null || _a === void 0 ? void 0 : _a.language) !== null && _b !== void 0 ? _b : '?'; })
    .join(', '); };
var createSubtitleFilename = function (fileObj, stream, index, extension, extractDirectory) {
    var _a;
    var language = (_a = stream.tags) === null || _a === void 0 ? void 0 : _a.language;
    if (!language) {
        return (0, types_1.err)('No language defined for subtitle');
    }
    var cleanLanguage = language
        .toLowerCase()
        .replace(/[^a-z0-9_-]/gi, '_')
        .slice(0, 16);
    if (!cleanLanguage) {
        return (0, types_1.err)('Subtitle language is empty after filename sanitization');
    }
    var inputFilename = path_1.default.basename(fileObj.file);
    var inputExtension = path_1.default.extname(inputFilename);
    var mediaBase = inputExtension
        ? inputFilename.slice(0, -inputExtension.length)
        : inputFilename;
    var subtitleFilename = "".concat(mediaBase, ".").concat(cleanLanguage, ".track").concat(index, ".").concat(extension);
    return (0, types_1.ok)(extractDirectory
        ? path_1.default.join(extractDirectory, subtitleFilename)
        : subtitleFilename);
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
var getSubtitleStreams = function (args) { return (0, types_1.ok)(args.variables.ffmpegCommand.streams
    .filter(function (s) { return s.codec_type === 'subtitle' && !s.removed; })); };
var validateExtractionDirectory = function (args, extractDirectoryInput) { return __awaiter(void 0, void 0, void 0, function () {
    var extractDirectory, dir, resolvedDirectory, stats, error_1, fileError;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                extractDirectory = extractDirectoryInput.trim();
                if (!extractDirectory) {
                    return [2 /*return*/, (0, types_1.err)('Extraction directory cannot be empty')];
                }
                if (extractDirectory === 'original') {
                    dir = path_1.default.dirname(args.originalLibraryFile.file);
                    args.jobLog("Using original directory as extraction directory: ".concat(dir));
                    return [2 /*return*/, (0, types_1.ok)(dir)];
                }
                resolvedDirectory = path_1.default.resolve(extractDirectory);
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, fs_1.promises.stat(resolvedDirectory)];
            case 2:
                stats = _a.sent();
                if (!stats.isDirectory()) {
                    return [2 /*return*/, (0, types_1.err)("Extraction path is not a directory: ".concat(resolvedDirectory))];
                }
                return [2 /*return*/, (0, types_1.ok)(resolvedDirectory)];
            case 3:
                error_1 = _a.sent();
                fileError = error_1;
                if (fileError.code === 'ENOENT') {
                    return [2 /*return*/, (0, types_1.err)("Extraction directory does not exist: ".concat(resolvedDirectory))];
                }
                if (fileError.code === 'EACCES') {
                    return [2 /*return*/, (0, types_1.err)("Extraction directory cannot be accessed: ".concat(resolvedDirectory))];
                }
                return [2 /*return*/, (0, types_1.err)("Unable to inspect extraction directory \"".concat(resolvedDirectory, "\": ")
                        + "".concat(fileError.message))];
            case 4: return [2 /*return*/];
        }
    });
}); };
var plugin = function (args) { return __awaiter(void 0, void 0, void 0, function () {
    var lib, extractDirectoryInput, bitmapSubtitleHandling, bitmapHandlingResult, directoryValidation, extractDirectory, subtitleStreamsResult, subtitleStreams, spawnArgs, outputFilenames, intentionalSkipFlag, executeResult;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                lib = require('../../../../../methods/lib')();
                args.inputs = lib.loadDefaultValues(args.inputs, details);
                extractDirectoryInput = String(args.inputs.extractDir).trim();
                bitmapSubtitleHandling = String(args.inputs.bitmapSubtitleHandling).trim();
                bitmapHandlingResult = (0, utils_1.enumParser)(subtitles_1.BitmapHandling)(bitmapSubtitleHandling);
                return [4 /*yield*/, validateExtractionDirectory(args, extractDirectoryInput)];
            case 1:
                directoryValidation = _a.sent();
                if (!directoryValidation.ok) {
                    throw new Error(directoryValidation.error);
                }
                extractDirectory = directoryValidation.value;
                if (!bitmapHandlingResult.ok) {
                    throw new Error(bitmapHandlingResult.error);
                }
                subtitleStreamsResult = getSubtitleStreams(args);
                if (!subtitleStreamsResult.ok) {
                    throw new Error(subtitleStreamsResult.error);
                }
                subtitleStreams = subtitleStreamsResult.value;
                if (subtitleStreams.length === 0) {
                    args.jobLog('No subtitles found, exiting');
                    return [2 /*return*/, {
                            outputFileObj: args.inputFileObj,
                            outputNumber: 2,
                            variables: args.variables,
                        }];
                }
                args.jobLog("Found ".concat(subtitleStreams.length, " subtitles to extract: [").concat(displaySubtitleLanguages(subtitleStreams), "]"));
                spawnArgs = ['-n', '-i', args.inputFileObj.file];
                outputFilenames = [];
                intentionalSkipFlag = false;
                subtitleStreams.forEach(function (stream, i) {
                    var action = (0, subtitles_1.default)(stream.codec_name, bitmapHandlingResult.value);
                    if (action.action === 'skip') {
                        args.jobLog("Skipping subtitle #".concat(i, ", reason: ").concat(action.reason));
                        intentionalSkipFlag = true;
                        return;
                    }
                    var outputFilenameResult = createSubtitleFilename(args.inputFileObj, stream, i, action.extension, extractDirectory);
                    if (!outputFilenameResult.ok) {
                        args.jobLog("Skipping subtitle #".concat(i, ", reason: ").concat(outputFilenameResult.error));
                        return;
                    }
                    var filename = outputFilenameResult.value;
                    spawnArgs.push('-map', "0:".concat(stream.index), '-c:s', action.codec, filename);
                    outputFilenames.push(filename);
                });
                if (outputFilenames.length === 0) {
                    args.jobLog('No extractable subtitles found');
                    return [2 /*return*/, {
                            outputNumber: intentionalSkipFlag ? 3 : 2,
                            outputFileObj: args.inputFileObj,
                            variables: args.variables,
                        }];
                }
                return [4 /*yield*/, executeCliCommand(args, spawnArgs, outputFilenames)];
            case 2:
                executeResult = _a.sent();
                if (executeResult.ok) {
                    return [2 /*return*/, intentionalSkipFlag
                            ? {
                                outputNumber: 3,
                                outputFileObj: args.inputFileObj,
                                variables: args.variables,
                            }
                            : {
                                outputNumber: 1,
                                outputFileObj: args.inputFileObj,
                                variables: args.variables,
                            }];
                }
                args.jobLog('Subtitle extraction failed, continuing without extraction. See errors below for more information');
                executeResult.error.forEach(function (error) { return args.jobLog(error); });
                throw new Error('Subtitle extraction failed, see errors in log');
        }
    });
}); };
exports.plugin = plugin;
