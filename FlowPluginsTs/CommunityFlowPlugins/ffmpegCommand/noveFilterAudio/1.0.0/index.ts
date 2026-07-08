/* eslint-disable no-param-reassign */
import { IpluginDetails } from '../../../../FlowHelpers/1.0.0/interfaces/interfaces';
import { ffMpegCommandPlugin } from '../../../../FlowHelpers/1.0.0/nove/ffmpeg';
import LanguageSet from '../../../../FlowHelpers/1.0.0/nove/languages';
import {
  containsKeywords, parseCommaSeparatedValues,
} from '../../../../FlowHelpers/1.0.0/nove/utils';

const OUT_SUCCESS = 1;
const OUT_FAIL_LANGUAGE = 2;
const OUT_FAIL_NO_AUDIO = 3;

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
    {
      label: 'Keyword Blacklist',
      name: 'keywords',
      tooltip: `Comma-separated list of case-insensitive keywords to blacklist.
      Any keyword present in the title of the audio stream will be excluded`,
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
      number: OUT_FAIL_LANGUAGE,
      tooltip: 'Audio streams with the specified languages were not found',
    },
    {
      number: OUT_FAIL_NO_AUDIO,
      tooltip: 'All audio streams were going to be discarded, leaving the media without audio',
    },
  ],
});

const plugin = ffMpegCommandPlugin(details, (args) => {
  const languagesResult = LanguageSet.from(parseCommaSeparatedValues(String(args.inputs.languages)), {
    acceptEmptyList: true,
  });

  const keywords = parseCommaSeparatedValues(String(args.inputs.keywords), true);

  if (!languagesResult.ok) {
    throw new Error(languagesResult.error);
  }

  const languages = languagesResult.value;

  const command = args.variables.ffmpegCommand;

  if (languages.length > 0) {
    args.jobLog(`Got ${languages.length} languages to keep: [${languages.toString()}]`);
  }

  args.jobLog(`Got ${keywords.length} keywords to blacklist: [${keywords.join(', ')}]`);

  const audioStreams = command.streams
    .filter((stream) => stream.codec_type === 'audio');

  const streamsToExcludeLanguage = languages.length > 0
    ? audioStreams
      .filter((stream) => !languages.contain(stream.tags?.language))
    : [];

  if (streamsToExcludeLanguage.length === audioStreams.length) {
    args.jobLog(`Current media does not contain audio streams with languages: ${languages.toString()}`);
    return {
      outputFileObj: args.inputFileObj,
      outputNumber: OUT_FAIL_LANGUAGE,
      variables: args.variables,
    };
  }

  const streamsToExcludeKeywords = audioStreams
    .filter((stream) => containsKeywords(stream.tags?.title, keywords));

  const totalStreamsToExclude = new Set([
    ...streamsToExcludeKeywords,
    ...streamsToExcludeLanguage,
  ]);

  if (totalStreamsToExclude.size === audioStreams.length) {
    args.jobLog('Current filtering setup with given languages and keywords would wipe all audio. Failing defensively');
    return {
      outputFileObj: args.inputFileObj,
      outputNumber: OUT_FAIL_NO_AUDIO,
      variables: args.variables,
    };
  }

  args.jobLog(`Discarding ${totalStreamsToExclude.size} out of ${audioStreams.length} audio streams`);

  totalStreamsToExclude.forEach((stream) => {
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
