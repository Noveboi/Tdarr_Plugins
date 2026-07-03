/* eslint-disable no-param-reassign */
import { IffmpegCommandStream, IpluginDetails } from '../../../../FlowHelpers/1.0.0/interfaces/interfaces';
import { ffMpegCommandPlugin } from '../../../../FlowHelpers/1.0.0/nove/ffmpeg';
import { parseLanguageCodes } from '../../../../FlowHelpers/1.0.0/nove/utils';

const OUT_SUCCESS = 1;
const OUT_FAIL = 2;

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
  ],
  outputs: [
    {
      number: OUT_SUCCESS,
      tooltip: 'Subtitle streams with the specified languages were found',
    },
    {
      number: OUT_FAIL,
      tooltip: 'Subtitle streams with the specified languages were not found',
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
  const languagesResult = parseLanguageCodes(String(args.inputs.languages));
  const backupLanguagesResult = parseLanguageCodes(String(args.inputs.backupLanguages), true);

  if (!languagesResult.ok) {
    throw new Error(languagesResult.error);
  }

  if (!backupLanguagesResult.ok) {
    throw new Error(backupLanguagesResult.error);
  }

  const languages = languagesResult.value;
  const backupLanguages = backupLanguagesResult.value;
  const command = args.variables.ffmpegCommand;

  args.jobLog(`Got ${languages.length} target languages: [${languages.join(', ')}]`);
  args.jobLog(`Got ${backupLanguages.length} backup languages: [${backupLanguages.join(', ')}]`);

  const subtitleStreams = command.streams
    .filter((stream) => stream.codec_type === 'subtitle');

  let streamsToExclude = subtitleStreams
    .filter((stream) => !hasWantedLanguage(stream, languages));

  // true if ALL streams are to be excluded.
  if (streamsToExclude.length === subtitleStreams.length && backupLanguages.length > 0) {
    args.jobLog('No subtitles with target languages found, falling back to backup languages');

    streamsToExclude = subtitleStreams
      .filter((stream) => !hasWantedLanguage(stream, backupLanguages));
  }

  args.jobLog(`Discarding ${streamsToExclude.length} out of ${subtitleStreams.length} subtitle streams`);

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
