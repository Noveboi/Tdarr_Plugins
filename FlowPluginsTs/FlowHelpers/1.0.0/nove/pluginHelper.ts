/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/no-explicit-any */

import type {
  IFileObject,
} from '../interfaces/synced/IFileObject';

import type Ijob from '../interfaces/synced/jobInterface';
import type { IscanTypes } from '../fileUtils';

import type {
  IconfigVars,
  IffmpegCommand,
  IffmpegCommandStream,
  Ilog,
  IpluginInputArgs,
  IupdateWorker,
  Ivariables,
} from '../interfaces/interfaces';

type StreamOverrides = Partial<IffmpegCommandStream>;

export const fileObject = (overrides: Partial<IFileObject> = {}): IFileObject => ({
  _id: 'test-file-id',
  file: '/media/input.mkv',
  container: 'mkv',
  scannerReads: {
    ffProbeRead: '{}',
    exiftoolRead: '{}',
    mediaInfoRead: '{}',
    closedCaptionRead: '{}',
  },
  ...overrides,
} as IFileObject);

export const videoStream = (overrides: StreamOverrides = {}): IffmpegCommandStream => ({
  index: 0,
  codec_name: 'h264',
  codec_type: 'video',
  width: 1920,
  height: 1080,
  pix_fmt: 'yuv420p',
  removed: false,
  forceEncoding: false,
  inputArgs: [],
  outputArgs: [],
  ...overrides,
});

export const audioStream = (overrides: StreamOverrides = {}): IffmpegCommandStream => ({
  index: 0,
  codec_name: 'aac',
  codec_type: 'audio',
  channels: 2,
  sample_rate: '48000',
  removed: false,
  forceEncoding: false,
  inputArgs: [],
  outputArgs: [],
  ...overrides,
});

export const subtitleStream = (overrides: StreamOverrides = {}): IffmpegCommandStream => ({
  index: 0,
  codec_name: 'subrip',
  codec_type: 'subtitle',
  tags: {
    language: 'eng',
  },
  removed: false,
  forceEncoding: false,
  inputArgs: [],
  outputArgs: [],
  ...overrides,
});

export const dataStream = (overrides: StreamOverrides = {}): IffmpegCommandStream => ({
  index: 0,
  codec_name: 'bin_data',
  codec_type: 'data',
  removed: false,
  forceEncoding: false,
  inputArgs: [],
  outputArgs: [],
  ...overrides,
});

export const otherStream = (
  codecType: string,
  overrides: StreamOverrides = {},
): IffmpegCommandStream => ({
  index: 0,
  codec_name: codecType,
  codec_type: codecType,
  removed: false,
  forceEncoding: false,
  inputArgs: [],
  outputArgs: [],
  ...overrides,
});

export class FfmpegCommandBuilder {
  private command: IffmpegCommand;

  constructor(overrides: Partial<IffmpegCommand> = {}) {
    this.command = {
      init: true,
      inputFiles: ['input.mkv'],
      streams: [],
      container: 'mkv',
      hardwareDecoding: false,
      shouldProcess: true,
      overallInputArguments: [],
      overallOuputArguments: [],
      ...overrides,
    };
  }

  withInputFiles(inputFiles: string[]): this {
    this.command.inputFiles = inputFiles;
    return this;
  }

  withInputFile(inputFile: string): this {
    this.command.inputFiles = [inputFile];
    return this;
  }

  withContainer(container: string): this {
    this.command.container = container;
    return this;
  }

  withShouldProcess(shouldProcess: boolean): this {
    this.command.shouldProcess = shouldProcess;
    return this;
  }

  withHardwareDecoding(hardwareDecoding: boolean): this {
    this.command.hardwareDecoding = hardwareDecoding;
    return this;
  }

  withStreams(streams: IffmpegCommandStream[]): this {
    this.command.streams = streams;
    return this;
  }

  clearStreams(): this {
    this.command.streams = [];
    return this;
  }

  addStream(stream: IffmpegCommandStream): this {
    this.command.streams.push({
      ...stream,
      index: stream.index ?? this.command.streams.length,
    });

    return this;
  }

  addVideoStream(overrides: StreamOverrides = {}): this {
    return this.addStream(videoStream({
      index: this.command.streams.length,
      ...overrides,
    }));
  }

  addAudioStream(overrides: StreamOverrides = {}): this {
    return this.addStream(audioStream({
      index: this.command.streams.length,
      ...overrides,
    }));
  }

  addSubtitleStream(overrides: StreamOverrides = {}): this {
    return this.addStream(subtitleStream({
      index: this.command.streams.length,
      ...overrides,
    }));
  }

  addDataStream(overrides: StreamOverrides = {}): this {
    return this.addStream(dataStream({
      index: this.command.streams.length,
      ...overrides,
    }));
  }

  addOtherStream(codecType: string, overrides: StreamOverrides = {}): this {
    return this.addStream(otherStream(codecType, {
      index: this.command.streams.length,
      ...overrides,
    }));
  }

  build(): IffmpegCommand {
    return this.command;
  }
}

export const ffmpegCommand = (
  overrides: Partial<IffmpegCommand> = {},
): IffmpegCommand => new FfmpegCommandBuilder(overrides).build();

export const variables = (
  overrides: Partial<Ivariables> = {},
): Ivariables => ({
  ffmpegCommand: ffmpegCommand(),
  flowFailed: false,
  user: {},
  ...overrides,
});

export const defaultDeps = (
  configVars: IconfigVars = {} as IconfigVars,
): IpluginInputArgs['deps'] => ({
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
  configVars,
});

export class PluginInputArgsBuilder {
  private args: IpluginInputArgs;

  constructor(overrides: Partial<IpluginInputArgs> = {}) {
    const inputFileObj = fileObject();
    const configVars = {} as IconfigVars;

    this.args = {
      inputFileObj,
      librarySettings: {},
      inputs: {},
      userVariables: {
        global: {},
        library: {},
      },
      jobLog: jest.fn(),
      workDir: '/tmp/tdarr-test',
      platform: 'linux',
      arch: 'x64',
      handbrakePath: 'HandBrakeCLI',
      ffmpegPath: 'ffmpeg',
      mkvpropeditPath: 'mkvpropedit',
      originalLibraryFile: inputFileObj,
      nodeHardwareType: 'none',
      workerType: 'classic',
      nodeTags: '',
      config: {},
      job: {
        _id: 'test-job-id',
      } as unknown as Ijob,
      isAutomation: false,
      platform_arch_isdocker: 'linux_x64_false',
      variables: variables(),
      lastSuccesfulPlugin: null,
      lastSuccessfulRun: null,
      thisPlugin: {},
      updateWorker: jest.fn() as unknown as IupdateWorker,
      logFullCliOutput: false,
      logOutcome: jest.fn(),
      scanIndividualFile: jest.fn(),
      updateStat: jest.fn(),
      configVars,
      deps: defaultDeps(configVars),
      installClassicPluginDeps: jest.fn(),
      ...overrides,
    };
  }

  withOverrides(overrides: Partial<IpluginInputArgs>): this {
    this.args = {
      ...this.args,
      ...overrides,
    };

    return this;
  }

  withInputFile(file: string | Partial<IFileObject>): this {
    const inputFileObj = typeof file === 'string'
      ? fileObject({ file })
      : fileObject(file);

    this.args.inputFileObj = inputFileObj;
    this.args.originalLibraryFile = inputFileObj;

    if (typeof file === 'string') {
      this.args.variables.ffmpegCommand.inputFiles = [file];
    }

    return this;
  }

  withInputs(inputs: Record<string, unknown>): this {
    this.args.inputs = inputs;
    return this;
  }

  withInput(key: string, value: unknown): this {
    this.args.inputs[key] = value;
    return this;
  }

  withUserVariable(scope: 'global' | 'library', key: string, value: string): this {
    this.args.userVariables[scope][key] = value;
    return this;
  }

  withVariables(overrides: Partial<Ivariables>): this {
    this.args.variables = {
      ...this.args.variables,
      ...overrides,
    };

    return this;
  }

  withFfmpegCommand(command: IffmpegCommand): this {
    this.args.variables.ffmpegCommand = command;
    return this;
  }

  withContainer(container: string): this {
    this.args.variables.ffmpegCommand.container = container;
    return this;
  }

  withFfmpegInputFile(inputFile: string): this {
    this.args.variables.ffmpegCommand.inputFiles = [inputFile];
    return this;
  }

  withStreams(streams: IffmpegCommandStream[]): this {
    this.args.variables.ffmpegCommand.streams = streams;
    return this;
  }

  clearStreams(): this {
    this.args.variables.ffmpegCommand.streams = [];
    return this;
  }

  addStream(stream: IffmpegCommandStream): this {
    const { streams } = this.args.variables.ffmpegCommand;

    streams.push({
      ...stream,
      index: stream.index ?? streams.length,
    });

    return this;
  }

  addVideoStream(overrides: StreamOverrides = {}): this {
    return this.addStream(videoStream({
      index: this.args.variables.ffmpegCommand.streams.length,
      ...overrides,
    }));
  }

  addAudioStream(overrides: StreamOverrides = {}): this {
    return this.addStream(audioStream({
      index: this.args.variables.ffmpegCommand.streams.length,
      ...overrides,
    }));
  }

  addSubtitleStream(overrides: StreamOverrides = {}): this {
    return this.addStream(subtitleStream({
      index: this.args.variables.ffmpegCommand.streams.length,
      ...overrides,
    }));
  }

  addDataStream(overrides: StreamOverrides = {}): this {
    return this.addStream(dataStream({
      index: this.args.variables.ffmpegCommand.streams.length,
      ...overrides,
    }));
  }

  addOtherStream(codecType: string, overrides: StreamOverrides = {}): this {
    return this.addStream(otherStream(codecType, {
      index: this.args.variables.ffmpegCommand.streams.length,
      ...overrides,
    }));
  }

  build(): IpluginInputArgs {
    return this.args;
  }
}

export const pluginInputArgs = (
  overrides: Partial<IpluginInputArgs> = {},
): IpluginInputArgs => new PluginInputArgsBuilder(overrides).build();

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const getPluginInputMocks = (args: IpluginInputArgs) => ({
  logOutcome: args.logOutcome as jest.MockedFunction<IpluginInputArgs['logOutcome']>,
  updateStat: args.updateStat as jest.MockedFunction<IpluginInputArgs['updateStat']>,
  scanIndividualFile: args.scanIndividualFile as jest.MockedFunction<
    NonNullable<IpluginInputArgs['scanIndividualFile']>
  >,
  installClassicPluginDeps: args.installClassicPluginDeps as jest.MockedFunction<
    IpluginInputArgs['installClassicPluginDeps']
  >,
  axiosMiddleware: args.deps.axiosMiddleware as jest.MockedFunction<
    IpluginInputArgs['deps']['axiosMiddleware']
  >,
  crudTransDBN: args.deps.crudTransDBN as jest.MockedFunction<
    IpluginInputArgs['deps']['crudTransDBN']
  >,
});
