/* eslint-disable no-param-reassign */
import { IffmpegCommandStream, IpluginDetails } from '../../../../FlowHelpers/1.0.0/interfaces/interfaces';
import { IFileObject } from '../../../../FlowHelpers/1.0.0/interfaces/synced/IFileObject';
import { ffMpegCommandPlugin } from '../../../../FlowHelpers/1.0.0/nove/ffmpeg';
import { err, ok, Result } from '../../../../FlowHelpers/1.0.0/nove/types';

/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
const details = () :IpluginDetails => ({
  name: 'Filter Subtitles by Language',
  description: 'Remove subtitle tracks not matching the specified languages',
  style: {
    borderColor: '#6efefc',
  },
  tags: 'subtitles',
  isStartPlugin: false,
  pType: '',
  requiresVersion: '2.11.01',
  sidebarPosition: -1,
  icon: '',
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

const plugin = ffMpegCommandPlugin(details, (args) => {
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

  subtitleStreams.forEach((stream, idx) => {
    const outputFilenameResult = createSubtitleFilename(args.inputFileObj, stream);

    if (!outputFilenameResult.ok) {
      args.jobLog(`Skipping subtitle #${idx}, reason: ${outputFilenameResult.error}`);
      return;
    }

    stream.outputArgs.push('-map 0:s:{outputTypeIndex}', outputFilenameResult.value);
  });

  return {
    outputFileObj: args.inputFileObj,
    outputNumber: 1,
    variables: args.variables,
  };
});

export { plugin, details };
