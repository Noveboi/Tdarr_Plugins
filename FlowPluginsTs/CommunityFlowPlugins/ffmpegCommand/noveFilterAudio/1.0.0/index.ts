/* eslint-disable no-param-reassign */
import { IffmpegCommandStream, IpluginDetails } from '../../../../FlowHelpers/1.0.0/interfaces/interfaces';
import { isValidLanguageCode, ffMpegCommandPlugin } from '../../../../FlowHelpers/1.0.0/nove/ffmpeg';

const OUT_SUCCESS = 1;
const OUT_FAIL = 2;

/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
const details = () :IpluginDetails => ({
  name: 'Filter Audio by Language',
  description: 'Remove audio tracks not matching the specified languages',
  style: {
    borderColor: '#6efefc',
  },
  tags: 'audio',
  isStartPlugin: false,
  pType: '',
  requiresVersion: '2.11.01',
  sidebarPosition: -1,
  icon: '',
  inputs: [
    {
      label: 'Languages',
      name: 'languages',
      tooltip: 'Comma-separated list of which languages to keep',
      defaultValue: '',
      type: 'string',
      inputUI: {
        type: 'text',
      },
    },
  ],
  outputs: [
    {
      number: OUT_SUCCESS,
      tooltip: 'Audio streams with the specified languages were found',
    },
    {
      number: OUT_FAIL,
      tooltip: 'audio streams with the specified languages were not found',
    },
  ],
});

const hasWantedLanguage = (stream: IffmpegCommandStream, languages: string[]): boolean => {
  if (stream.tags?.language === undefined) {
    return false;
  }

  const cleanLanguageTag = stream.tags.language.toLowerCase();
  return languages.includes(cleanLanguageTag);
};

const plugin = ffMpegCommandPlugin(details, (args) => {
  const languages = String(args.inputs.languages)
    .trim()
    .split(',');

  if (languages.length === 1 && !languages[0]) {
    throw new Error('Languages are empty. Specify at least one language');
  }

  const invalidLanguages = languages.filter((lang) => !isValidLanguageCode(lang));
  if (invalidLanguages.length > 0) {
    throw new Error(`Languages [${invalidLanguages.join(', ')}] are invalid codes for ffmpeg`);
  }

  const command = args.variables.ffmpegCommand;

  args.jobLog(`Got ${languages.length} languages to keep: [${languages.join(', ')}]`);

  const audioStreams = command.streams
    .filter((stream) => stream.codec_type === 'audio');

  const streamsToExclude = audioStreams
    .filter((stream) => !hasWantedLanguage(stream, languages));

  if (streamsToExclude.length === audioStreams.length) {
    args.jobLog(`Current media does not contain audio streams with languages: ${languages.join(', ')}`);
    return {
      outputFileObj: args.inputFileObj,
      outputNumber: OUT_FAIL,
      variables: args.variables,
    };
  }

  args.jobLog(`Discarding ${streamsToExclude.length} out of ${audioStreams.length} audio streams`);

  streamsToExclude.forEach((stream) => {
    args.jobLog(`Discarding "${stream.tags?.title ?? '?'}", lang=${stream.tags?.language}`);
    stream.removed = true;
  });

  return {
    outputFileObj: args.inputFileObj,
    outputNumber: OUT_SUCCESS,
    variables: args.variables,
  };
});

export { plugin, details };
