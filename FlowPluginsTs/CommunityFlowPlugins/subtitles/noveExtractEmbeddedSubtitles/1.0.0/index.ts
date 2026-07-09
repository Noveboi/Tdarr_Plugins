/* eslint-disable no-param-reassign */
import { CLI } from '../../../../FlowHelpers/1.0.0/cliUtils';
import {
  IliveSizeCompare, IpluginDetails, IpluginInputArgs,
  IpluginOutputArgs,
} from '../../../../FlowHelpers/1.0.0/interfaces/interfaces';
import { IFileObject, Istreams } from '../../../../FlowHelpers/1.0.0/interfaces/synced/IFileObject';
import getSubtitleAction, { BitmapHandling } from '../../../../FlowHelpers/1.0.0/nove/subtitles';
import { err, ok, Result } from '../../../../FlowHelpers/1.0.0/nove/types';
import { enumParser } from '../../../../FlowHelpers/1.0.0/nove/utils';

/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
const details = () :IpluginDetails => ({
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
});

const displaySubtitleLanguages = (streams: readonly Istreams[]): string => streams
  .map((s) => s.tags?.language ?? '?')
  .join(', ');

const createSubtitleFilename = (
  fileObj: IFileObject,
  stream: Istreams,
  extension: string,
): Result<string> => {
  const filename = fileObj.file;
  const language = stream.tags?.language;

  if (!language) {
    return err('No language defined for subtitle');
  }

  const cleanLanguage = language
    .toLowerCase()
    .replace(/[^a-z0-9_-]/gi, '_')
    .slice(0, 16);

  const extensionIndex = filename.lastIndexOf('.');
  const base = extensionIndex === -1
    ? filename
    : filename.substring(0, extensionIndex);

  return ok(`${base}.${cleanLanguage}.track${stream.index}.${extension}`);
};

const executeCliCommand = async (
  args: IpluginInputArgs,
  spawnArgs: string[],
  outputFilenames: string[],
): Promise<Result<void, string[]>> => {
  // Subtitle output is tiny relative to the source file by design.
  // Clone args (don't mutate the shared object) and disable live size
  // compare so this unrelated, tiny-output side job can't be killed by a
  // safety check meant for the main transcode.
  const defaultLiveSizeCompare: IliveSizeCompare = {
    enabled: false,
    compareMethod: '',
    thresholdPerc: 0,
    lowerThresholdPerc: 0,
    checkDelaySeconds: 0,
    error: false,
    errorType: '',
  };

  const cliArgs = {
    ...args,
    variables: {
      ...args.variables,
      liveSizeCompare: {
        ...(args.variables.liveSizeCompare ?? defaultLiveSizeCompare),
        enabled: false,
      },
    },
  };

  const cli = new CLI({
    cli: args.ffmpegPath,
    spawnArgs,
    spawnOpts: {},
    jobLog: args.jobLog,
    outputFilePath: outputFilenames[0],
    inputFileObj: args.inputFileObj,
    logFullCliOutput: args.logFullCliOutput,
    updateWorker: args.updateWorker,
    args: cliArgs,
  });

  const res = await cli.runCli();

  if (res.cliExitCode === 0) {
    return ok(undefined);
  }

  return err(res.errorLogFull);
};

const getSubtitleStreams = (args: IpluginInputArgs): Result<Istreams[]> => {
  if (args.variables.ffmpegCommand.init) {
    return ok(args.variables.ffmpegCommand.streams.filter((s) => s.codec_type === 'subtitle' && !s.removed));
  }

  if (args.inputFileObj.ffProbeData.streams === undefined) {
    return err('No ffprobe data for input file');
  }

  return ok(args.inputFileObj.ffProbeData.streams.filter((s) => s.codec_name === 'subtitle'));
};

const plugin = async (args: IpluginInputArgs): Promise<IpluginOutputArgs> => {
  const lib = require('../../../../../methods/lib')();
  args.inputs = lib.loadDefaultValues(args.inputs, details);

  const bitmapSubtitleHandling = String(args.inputs.bitmapSubtitleHandling).trim();
  const bitmapHandlingResult = enumParser(BitmapHandling)(bitmapSubtitleHandling);

  if (!bitmapHandlingResult.ok) {
    throw new Error(bitmapHandlingResult.error);
  }

  const subtitleStreamsResult = getSubtitleStreams(args);

  if (!subtitleStreamsResult.ok) {
    throw new Error(subtitleStreamsResult.error);
  }

  const subtitleStreams = subtitleStreamsResult.value;

  if (subtitleStreams.length === 0) {
    args.jobLog('No subtitles found, exiting');
    return {
      outputFileObj: args.inputFileObj,
      outputNumber: 2,
      variables: args.variables,
    };
  }

  args.jobLog(`Found ${subtitleStreams.length} subtitles to extract: [${displaySubtitleLanguages(subtitleStreams)}]`);

  const spawnArgs: string[] = ['-y', '-i', args.inputFileObj.file];
  const outputFilenames: string[] = [];

  subtitleStreams.forEach((stream, i) => {
    const action = getSubtitleAction(stream.codec_name, bitmapHandlingResult.value);

    if (action.action === 'skip') {
      args.jobLog(`Skipping subtitle #${i}, reason: ${action.reason}`);
      return;
    }

    const outputFilenameResult = createSubtitleFilename(args.inputFileObj, stream, action.extension);

    if (!outputFilenameResult.ok) {
      args.jobLog(`Skipping subtitle #${i}, reason: ${outputFilenameResult.error}`);
    } else {
      const filename = outputFilenameResult.value;
      spawnArgs.push('-map', `0:${stream.index}`, '-c:s', action.codec, filename);
      outputFilenames.push(filename);
    }
  });

  if (outputFilenames.length === 0) {
    args.jobLog('No extractable subtitles found after filtering/skipping');
    return {
      outputNumber: 2,
      outputFileObj: args.inputFileObj,
      variables: args.variables,
    };
  }

  const executeResult = await executeCliCommand(args, spawnArgs, outputFilenames);

  if (executeResult.ok) {
    return {
      outputNumber: 1,
      outputFileObj: args.inputFileObj,
      variables: args.variables,
    };
  }

  args.jobLog('Subtitle extraction failed, continuing without extraction. See errors below for more information');
  executeResult.error.forEach((error) => args.jobLog(error));

  return {
    outputNumber: 3,
    outputFileObj: args.inputFileObj,
    variables: args.variables,
  };
};

export { plugin, details };
