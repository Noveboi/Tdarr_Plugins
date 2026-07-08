/* eslint-disable no-param-reassign */
import { IpluginDetails } from '../../../../FlowHelpers/1.0.0/interfaces/interfaces';
import { ffMpegCommandPlugin } from '../../../../FlowHelpers/1.0.0/nove/ffmpeg';
import LanguageSet from '../../../../FlowHelpers/1.0.0/nove/languages';
import {
  containsKeywords, parseCommaSeparatedValues,
} from '../../../../FlowHelpers/1.0.0/nove/utils';

const OUT_SUCCESS = 1;
const OUT_FAIL = 2;

/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
const details = () :IpluginDetails => ({
  name: 'Filter Subtitles',
  description: 'Remove subtitle tracks not matching the specified filters',
  style: {
    borderColor: '#6efefc',
  },
  tags: 'subtitles',
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
      label: 'Backup Languages',
      name: 'backupLanguages',
      tooltip: `Comma-separated list of languages to keep in the event no subtitles
      with languages from the main 'languages' list are found.`,
      defaultValue: '',
      type: 'string',
      inputUI: {
        type: 'text',
      },
    },
    {
      label: 'Keyword Blacklist',
      name: 'keywords',
      tooltip: `Comma-separated list of keywords you wish to blacklist.
      Any subtitle stream containing the keyword present in the list will be excluded.`,
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
      tooltip: 'Subtitle streams with the specified filters were found',
    },
    {
      number: OUT_FAIL,
      tooltip: 'Subtitle streams with the specified filters Swere not found',
    },
  ],
});

const plugin = ffMpegCommandPlugin(details, (args) => {
  const languagesResult = LanguageSet.from(parseCommaSeparatedValues(String(args.inputs.languages)), {
    acceptEmptyList: true,
  });

  const backupLanguagesResult = LanguageSet.from(parseCommaSeparatedValues(String(args.inputs.backupLanguages)), {
    acceptEmptyList: true,
  });

  const keywords = parseCommaSeparatedValues(String(args.inputs.keywords), true);

  if (!languagesResult.ok) {
    throw new Error(languagesResult.error);
  }

  if (!backupLanguagesResult.ok) {
    throw new Error(backupLanguagesResult.error);
  }

  const languages = languagesResult.value;
  const backupLanguages = backupLanguagesResult.value;
  const command = args.variables.ffmpegCommand;

  if (languages.length === 0 && backupLanguages.length > 0) {
    throw new Error('Backup languages can only be defined if `languages` is defined');
  }

  args.jobLog(`Got ${languages.length} target languages: [${languages.toString()}]`);
  args.jobLog(`Got ${backupLanguages.length} backup languages: [${backupLanguages.toString()}]`);
  args.jobLog(`Got ${keywords.length} blacklist keywords: [${keywords.join(', ')}]`);

  const subtitleStreams = command.streams
    .filter((stream) => stream.codec_type === 'subtitle');

  let streamsToExcludeLanguages = subtitleStreams
    .filter((stream) => !languages.contain(stream.tags?.language));

  // true if ALL streams are to be excluded.
  if (streamsToExcludeLanguages.length === subtitleStreams.length && backupLanguages.length > 0) {
    args.jobLog('No subtitles with target languages found, falling back to backup languages');

    streamsToExcludeLanguages = subtitleStreams
      .filter((stream) => !backupLanguages.contain(stream.tags?.language));
  }

  const streamsToExcludeKeywords = subtitleStreams
    .filter((stream) => containsKeywords(stream.tags?.title, keywords));

  const totalStreamsToExclude = new Set([
    ...streamsToExcludeLanguages,
    ...streamsToExcludeKeywords,
  ]);

  args.jobLog(`Discarding ${totalStreamsToExclude.size} out of ${subtitleStreams.length} subtitle streams`);

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
