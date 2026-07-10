/* eslint-disable no-param-reassign */
import { promises as fs } from 'fs';
import path from 'path';
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
  description: `Extract subtitle tracks to separate files.
  NOTE: This does not guarantee ALL subtitles are extracted. For example, bitmap subtitles (such as PGS)
  are handled differently and could be skipped entirely.

  Do not blindly remove all subtitles after extraction, as it may result in unwanted data loss.`,
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
      tooltip: `Choose how to handle bitmap subtitles (very common in anime)

      As it stands (2026-07-10), external bitmap subtitles (PGS, etc...) do not play well with
      streaming clients such as Jellyfin. It is therefore recommended to
      leave the option as 'skip' and have them remain embedded.`,
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
      tooltip: `The directory where the extracted subtitle files should be placed.

      Use the keyword "original" to use the original media file directory as the extraction point.`,
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
});

const displaySubtitleLanguages = (streams: readonly Istreams[]): string => streams
  .map((s) => s.tags?.language ?? '?')
  .join(', ');

const createSubtitleFilename = (
  fileObj: IFileObject,
  stream: Istreams,
  index: number,
  extension: string,
  extractDirectory: string,
): Result<string> => {
  const language = stream.tags?.language;

  if (!language) {
    return err('No language defined for subtitle');
  }

  const cleanLanguage = language
    .toLowerCase()
    .replace(/[^a-z0-9_-]/gi, '_')
    .slice(0, 16);

  if (!cleanLanguage) {
    return err('Subtitle language is empty after filename sanitization');
  }

  const inputFilename = path.basename(fileObj.file);
  const inputExtension = path.extname(inputFilename);

  const mediaBase = inputExtension
    ? inputFilename.slice(0, -inputExtension.length)
    : inputFilename;

  const subtitleFilename = `${mediaBase}.${cleanLanguage}.track${index}.${extension}`;

  return ok(extractDirectory
    ? path.join(extractDirectory, subtitleFilename)
    : subtitleFilename);
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

const getSubtitleStreams = (args: IpluginInputArgs): Result<Istreams[]> => ok(args.variables.ffmpegCommand.streams
  .filter((s) => s.codec_type === 'subtitle' && !s.removed));

const validateExtractionDirectory = async (
  args: IpluginInputArgs,
  extractDirectoryInput: string,
): Promise<Result<string>> => {
  const extractDirectory = extractDirectoryInput.trim();

  if (!extractDirectory) {
    return err('Extraction directory cannot be empty');
  }

  if (extractDirectory === 'original') {
    const dir = path.dirname(args.originalLibraryFile.file);
    args.jobLog(`Using original directory as extraction directory: ${dir}`);

    return ok(dir);
  }

  const resolvedDirectory = path.resolve(extractDirectory);

  try {
    const stats = await fs.stat(resolvedDirectory);

    if (!stats.isDirectory()) {
      return err(`Extraction path is not a directory: ${resolvedDirectory}`);
    }

    return ok(resolvedDirectory);
  } catch (error) {
    const fileError = error as NodeJS.ErrnoException;

    if (fileError.code === 'ENOENT') {
      return err(`Extraction directory does not exist: ${resolvedDirectory}`);
    }

    if (fileError.code === 'EACCES') {
      return err(`Extraction directory cannot be accessed: ${resolvedDirectory}`);
    }

    return err(
      `Unable to inspect extraction directory "${resolvedDirectory}": `
      + `${fileError.message}`,
    );
  }
};

const plugin = async (args: IpluginInputArgs): Promise<IpluginOutputArgs> => {
  const lib = require('../../../../../methods/lib')();
  args.inputs = lib.loadDefaultValues(args.inputs, details);

  const extractDirectoryInput = String(args.inputs.extractDir).trim();
  const bitmapSubtitleHandling = String(args.inputs.bitmapSubtitleHandling).trim();
  const bitmapHandlingResult = enumParser(BitmapHandling)(bitmapSubtitleHandling);

  const directoryValidation = await validateExtractionDirectory(args, extractDirectoryInput);

  if (!directoryValidation.ok) {
    throw new Error(directoryValidation.error);
  }

  const extractDirectory = directoryValidation.value;

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

  const spawnArgs: string[] = ['-n', '-i', args.inputFileObj.file];
  const outputFilenames: string[] = [];
  let intentionalSkipFlag = false;

  subtitleStreams.forEach((stream, i) => {
    const action = getSubtitleAction(stream.codec_name, bitmapHandlingResult.value);

    if (action.action === 'skip') {
      args.jobLog(`Skipping subtitle #${i}, reason: ${action.reason}`);
      intentionalSkipFlag = true;
      return;
    }

    const outputFilenameResult = createSubtitleFilename(
      args.inputFileObj, stream, i, action.extension, extractDirectory,
    );

    if (!outputFilenameResult.ok) {
      args.jobLog(`Skipping subtitle #${i}, reason: ${outputFilenameResult.error}`);
      return;
    }

    const filename = outputFilenameResult.value;

    spawnArgs.push('-map', `0:${stream.index}`, '-c:s', action.codec, filename);
    outputFilenames.push(filename);
  });

  if (outputFilenames.length === 0) {
    args.jobLog('No extractable subtitles found');
    return {
      outputNumber: intentionalSkipFlag ? 3 : 2,
      outputFileObj: args.inputFileObj,
      variables: args.variables,
    };
  }

  const executeResult = await executeCliCommand(args, spawnArgs, outputFilenames);

  if (executeResult.ok) {
    return intentionalSkipFlag
      ? {
        outputNumber: 3,
        outputFileObj: args.inputFileObj,
        variables: args.variables,
      }
      : {
        outputNumber: 1,
        outputFileObj: args.inputFileObj,
        variables: args.variables,
      };
  }

  args.jobLog('Subtitle extraction failed, continuing without extraction. See errors below for more information');
  executeResult.error.forEach((error) => args.jobLog(error));

  throw new Error('Subtitle extraction failed, see errors in log');
};

export { plugin, details };
