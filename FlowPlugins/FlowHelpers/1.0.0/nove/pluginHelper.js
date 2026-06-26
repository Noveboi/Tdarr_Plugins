"use strict";
/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/no-explicit-any */
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPluginInputMocks = exports.pluginInputArgs = exports.PluginInputArgsBuilder = exports.defaultDeps = exports.variables = exports.ffmpegCommand = exports.FfmpegCommandBuilder = exports.otherStream = exports.dataStream = exports.subtitleStream = exports.audioStream = exports.videoStream = exports.fileObject = void 0;
var fileObject = function (overrides) {
    if (overrides === void 0) { overrides = {}; }
    return (__assign({ _id: 'test-file-id', file: '/media/input.mkv', container: 'mkv', scannerReads: {
            ffProbeRead: '{}',
            exiftoolRead: '{}',
            mediaInfoRead: '{}',
            closedCaptionRead: '{}',
        } }, overrides));
};
exports.fileObject = fileObject;
var videoStream = function (overrides) {
    if (overrides === void 0) { overrides = {}; }
    return (__assign({ index: 0, codec_name: 'h264', codec_type: 'video', width: 1920, height: 1080, pix_fmt: 'yuv420p', removed: false, forceEncoding: false, inputArgs: [], outputArgs: [] }, overrides));
};
exports.videoStream = videoStream;
var audioStream = function (overrides) {
    if (overrides === void 0) { overrides = {}; }
    return (__assign({ index: 0, codec_name: 'aac', codec_type: 'audio', channels: 2, sample_rate: '48000', removed: false, forceEncoding: false, inputArgs: [], outputArgs: [] }, overrides));
};
exports.audioStream = audioStream;
var subtitleStream = function (overrides) {
    if (overrides === void 0) { overrides = {}; }
    return (__assign({ index: 0, codec_name: 'subrip', codec_type: 'subtitle', tags: {
            language: 'eng',
        }, removed: false, forceEncoding: false, inputArgs: [], outputArgs: [] }, overrides));
};
exports.subtitleStream = subtitleStream;
var dataStream = function (overrides) {
    if (overrides === void 0) { overrides = {}; }
    return (__assign({ index: 0, codec_name: 'bin_data', codec_type: 'data', removed: false, forceEncoding: false, inputArgs: [], outputArgs: [] }, overrides));
};
exports.dataStream = dataStream;
var otherStream = function (codecType, overrides) {
    if (overrides === void 0) { overrides = {}; }
    return (__assign({ index: 0, codec_name: codecType, codec_type: codecType, removed: false, forceEncoding: false, inputArgs: [], outputArgs: [] }, overrides));
};
exports.otherStream = otherStream;
var FfmpegCommandBuilder = /** @class */ (function () {
    function FfmpegCommandBuilder(overrides) {
        if (overrides === void 0) { overrides = {}; }
        this.command = __assign({ init: true, inputFiles: ['input.mkv'], streams: [], container: 'mkv', hardwareDecoding: false, shouldProcess: true, overallInputArguments: [], overallOuputArguments: [] }, overrides);
    }
    FfmpegCommandBuilder.prototype.withInputFiles = function (inputFiles) {
        this.command.inputFiles = inputFiles;
        return this;
    };
    FfmpegCommandBuilder.prototype.withInputFile = function (inputFile) {
        this.command.inputFiles = [inputFile];
        return this;
    };
    FfmpegCommandBuilder.prototype.withContainer = function (container) {
        this.command.container = container;
        return this;
    };
    FfmpegCommandBuilder.prototype.withShouldProcess = function (shouldProcess) {
        this.command.shouldProcess = shouldProcess;
        return this;
    };
    FfmpegCommandBuilder.prototype.withHardwareDecoding = function (hardwareDecoding) {
        this.command.hardwareDecoding = hardwareDecoding;
        return this;
    };
    FfmpegCommandBuilder.prototype.withStreams = function (streams) {
        this.command.streams = streams;
        return this;
    };
    FfmpegCommandBuilder.prototype.clearStreams = function () {
        this.command.streams = [];
        return this;
    };
    FfmpegCommandBuilder.prototype.addStream = function (stream) {
        var _a;
        this.command.streams.push(__assign(__assign({}, stream), { index: (_a = stream.index) !== null && _a !== void 0 ? _a : this.command.streams.length }));
        return this;
    };
    FfmpegCommandBuilder.prototype.addVideoStream = function (overrides) {
        if (overrides === void 0) { overrides = {}; }
        return this.addStream((0, exports.videoStream)(__assign({ index: this.command.streams.length }, overrides)));
    };
    FfmpegCommandBuilder.prototype.addAudioStream = function (overrides) {
        if (overrides === void 0) { overrides = {}; }
        return this.addStream((0, exports.audioStream)(__assign({ index: this.command.streams.length }, overrides)));
    };
    FfmpegCommandBuilder.prototype.addSubtitleStream = function (overrides) {
        if (overrides === void 0) { overrides = {}; }
        return this.addStream((0, exports.subtitleStream)(__assign({ index: this.command.streams.length }, overrides)));
    };
    FfmpegCommandBuilder.prototype.addDataStream = function (overrides) {
        if (overrides === void 0) { overrides = {}; }
        return this.addStream((0, exports.dataStream)(__assign({ index: this.command.streams.length }, overrides)));
    };
    FfmpegCommandBuilder.prototype.addOtherStream = function (codecType, overrides) {
        if (overrides === void 0) { overrides = {}; }
        return this.addStream((0, exports.otherStream)(codecType, __assign({ index: this.command.streams.length }, overrides)));
    };
    FfmpegCommandBuilder.prototype.build = function () {
        return this.command;
    };
    return FfmpegCommandBuilder;
}());
exports.FfmpegCommandBuilder = FfmpegCommandBuilder;
var ffmpegCommand = function (overrides) {
    if (overrides === void 0) { overrides = {}; }
    return new FfmpegCommandBuilder(overrides).build();
};
exports.ffmpegCommand = ffmpegCommand;
var variables = function (overrides) {
    if (overrides === void 0) { overrides = {}; }
    return (__assign({ ffmpegCommand: (0, exports.ffmpegCommand)(), flowFailed: false, user: {} }, overrides));
};
exports.variables = variables;
var defaultDeps = function (configVars) {
    if (configVars === void 0) { configVars = {}; }
    return ({
        fsextra: {},
        parseArgsStringToArgv: jest.fn(),
        importFresh: jest.fn(),
        axiosMiddleware: jest.fn(),
        requireFromString: jest.fn(),
        upath: {},
        gracefulfs: {},
        mvdir: {},
        ncp: {},
        axios: {},
        crudTransDBN: jest.fn(),
        configVars: configVars,
    });
};
exports.defaultDeps = defaultDeps;
var PluginInputArgsBuilder = /** @class */ (function () {
    function PluginInputArgsBuilder(overrides) {
        if (overrides === void 0) { overrides = {}; }
        var inputFileObj = (0, exports.fileObject)();
        var configVars = {};
        this.args = __assign({ inputFileObj: inputFileObj, librarySettings: {}, inputs: {}, userVariables: {
                global: {},
                library: {},
            }, jobLog: jest.fn(), workDir: '/tmp/tdarr-test', platform: 'linux', arch: 'x64', handbrakePath: 'HandBrakeCLI', ffmpegPath: 'ffmpeg', mkvpropeditPath: 'mkvpropedit', originalLibraryFile: inputFileObj, nodeHardwareType: 'none', workerType: 'classic', nodeTags: '', config: {}, job: {
                _id: 'test-job-id',
            }, isAutomation: false, platform_arch_isdocker: 'linux_x64_false', variables: (0, exports.variables)(), lastSuccesfulPlugin: null, lastSuccessfulRun: null, thisPlugin: {}, updateWorker: jest.fn(), logFullCliOutput: false, logOutcome: jest.fn(), scanIndividualFile: jest.fn(), updateStat: jest.fn(), configVars: configVars, deps: (0, exports.defaultDeps)(configVars), installClassicPluginDeps: jest.fn() }, overrides);
    }
    PluginInputArgsBuilder.prototype.withOverrides = function (overrides) {
        this.args = __assign(__assign({}, this.args), overrides);
        return this;
    };
    PluginInputArgsBuilder.prototype.withInputFile = function (file) {
        var inputFileObj = typeof file === 'string'
            ? (0, exports.fileObject)({ file: file })
            : (0, exports.fileObject)(file);
        this.args.inputFileObj = inputFileObj;
        this.args.originalLibraryFile = inputFileObj;
        if (typeof file === 'string') {
            this.args.variables.ffmpegCommand.inputFiles = [file];
        }
        return this;
    };
    PluginInputArgsBuilder.prototype.withInputs = function (inputs) {
        this.args.inputs = inputs;
        return this;
    };
    PluginInputArgsBuilder.prototype.withInput = function (key, value) {
        this.args.inputs[key] = value;
        return this;
    };
    PluginInputArgsBuilder.prototype.withUserVariable = function (scope, key, value) {
        this.args.userVariables[scope][key] = value;
        return this;
    };
    PluginInputArgsBuilder.prototype.withVariables = function (overrides) {
        this.args.variables = __assign(__assign({}, this.args.variables), overrides);
        return this;
    };
    PluginInputArgsBuilder.prototype.withFfmpegCommand = function (command) {
        this.args.variables.ffmpegCommand = command;
        return this;
    };
    PluginInputArgsBuilder.prototype.withContainer = function (container) {
        this.args.variables.ffmpegCommand.container = container;
        return this;
    };
    PluginInputArgsBuilder.prototype.withFfmpegInputFile = function (inputFile) {
        this.args.variables.ffmpegCommand.inputFiles = [inputFile];
        return this;
    };
    PluginInputArgsBuilder.prototype.withStreams = function (streams) {
        this.args.variables.ffmpegCommand.streams = streams;
        return this;
    };
    PluginInputArgsBuilder.prototype.clearStreams = function () {
        this.args.variables.ffmpegCommand.streams = [];
        return this;
    };
    PluginInputArgsBuilder.prototype.addStream = function (stream) {
        var _a;
        var streams = this.args.variables.ffmpegCommand.streams;
        streams.push(__assign(__assign({}, stream), { index: (_a = stream.index) !== null && _a !== void 0 ? _a : streams.length }));
        return this;
    };
    PluginInputArgsBuilder.prototype.addVideoStream = function (overrides) {
        if (overrides === void 0) { overrides = {}; }
        return this.addStream((0, exports.videoStream)(__assign({ index: this.args.variables.ffmpegCommand.streams.length }, overrides)));
    };
    PluginInputArgsBuilder.prototype.addAudioStream = function (overrides) {
        if (overrides === void 0) { overrides = {}; }
        return this.addStream((0, exports.audioStream)(__assign({ index: this.args.variables.ffmpegCommand.streams.length }, overrides)));
    };
    PluginInputArgsBuilder.prototype.addSubtitleStream = function (overrides) {
        if (overrides === void 0) { overrides = {}; }
        return this.addStream((0, exports.subtitleStream)(__assign({ index: this.args.variables.ffmpegCommand.streams.length }, overrides)));
    };
    PluginInputArgsBuilder.prototype.addDataStream = function (overrides) {
        if (overrides === void 0) { overrides = {}; }
        return this.addStream((0, exports.dataStream)(__assign({ index: this.args.variables.ffmpegCommand.streams.length }, overrides)));
    };
    PluginInputArgsBuilder.prototype.addOtherStream = function (codecType, overrides) {
        if (overrides === void 0) { overrides = {}; }
        return this.addStream((0, exports.otherStream)(codecType, __assign({ index: this.args.variables.ffmpegCommand.streams.length }, overrides)));
    };
    PluginInputArgsBuilder.prototype.build = function () {
        return this.args;
    };
    return PluginInputArgsBuilder;
}());
exports.PluginInputArgsBuilder = PluginInputArgsBuilder;
var pluginInputArgs = function (overrides) {
    if (overrides === void 0) { overrides = {}; }
    return new PluginInputArgsBuilder(overrides).build();
};
exports.pluginInputArgs = pluginInputArgs;
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
var getPluginInputMocks = function (args) { return ({
    logOutcome: args.logOutcome,
    updateStat: args.updateStat,
    scanIndividualFile: args.scanIndividualFile,
    installClassicPluginDeps: args.installClassicPluginDeps,
    axiosMiddleware: args.deps.axiosMiddleware,
    crudTransDBN: args.deps.crudTransDBN,
}); };
exports.getPluginInputMocks = getPluginInputMocks;
