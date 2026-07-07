/* eslint-disable no-param-reassign */
import { CLI } from '../../../../FlowHelpers/1.0.0/cliUtils';
import {
  IffmpegCommandStream, IliveSizeCompare, IpluginDetails, IpluginInputArgs,
  IpluginOutputArgs,
} from '../../../../FlowHelpers/1.0.0/interfaces/interfaces';
import { IFileObject } from '../../../../FlowHelpers/1.0.0/interfaces/synced/IFileObject';
import { err, ok, Result } from '../../../../FlowHelpers/1.0.0/nove/types';

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
  inputs: [],
  outputs: [
    {
      number: 1,
      tooltip: 'Found subtitles and extracted them',
    },
    {
      number: 2,
      tooltip: 'Did not found any subtitles, did nothing',
    },
  ],
});

const displaySubtitleLanguages = (streams: readonly IffmpegCommandStream[]): string => streams
  .map((s) => s.tags?.language ?? '?')
  .join(', ');

const createSubtitleFilename = (fileObj: IFileObject, stream: IffmpegCommandStream): Result<string> => {
  const filename = fileObj.file;
  const extension = 'srt';
  const language = stream.tags?.language;

  if (!language) {
    return err('No language defined for subtitle');
  }

  const extensionIndex = filename.lastIndexOf('.');
  const filenameWithoutExtension = extensionIndex === -1
    ? filename
    : filename.substring(0, extensionIndex);

  return ok(`${filenameWithoutExtension}.${language}.${extension}`);
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

const plugin = async (args: IpluginInputArgs): Promise<IpluginOutputArgs> => {
  const subtitleStreams = args.variables.ffmpegCommand.streams
    .filter((s) => s.codec_type === 'subtitle');

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

  for (let i = 0; i < subtitleStreams.length; i++) {
    const stream = subtitleStreams[i];
    const outputFilenameResult = createSubtitleFilename(args.inputFileObj, stream);

    if (!outputFilenameResult.ok) {
      args.jobLog(`Skipping subtitle #${i}, reason: ${outputFilenameResult.error}`);
    } else {
      const filename = outputFilenameResult.value;
      spawnArgs.push('-map', `0:${stream.index}`, '-c', 'copy', filename);
      outputFilenames.push(filename);
    }
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
    outputNumber: 2,
    outputFileObj: args.inputFileObj,
    variables: args.variables,
  };
};

export { plugin, details };
