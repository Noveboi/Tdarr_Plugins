/* eslint-disable no-param-reassign */
import {
  IpluginDetails,
  IpluginInputArgs,
  IpluginOutputArgs,
} from '../../../../FlowHelpers/1.0.0/interfaces/interfaces';
import { ArrClient } from '../../../../FlowHelpers/1.0.0/nove/arr';
import { ParsedMediaInfo, parseMediaPath } from '../../../../FlowHelpers/1.0.0/nove/parser';
import { RadarrClient } from '../../../../FlowHelpers/1.0.0/nove/radarr';
import { SonarrClient } from '../../../../FlowHelpers/1.0.0/nove/sonarr';

const OUT_SUCCESS = 1;
const OUT_FAIL = 2;

const details = (): IpluginDetails => ({
  name: 'Detect Original Language',
  description:
    'Try to find the original/source language of the file by searching through public movie/TV databases',
  style: {
    borderColor: 'orange',
  },
  tags: 'language',
  isStartPlugin: false,
  pType: '',
  requiresVersion: '2.11.01',
  icon: 'faLanguage',
  inputs: [
    {
      label: 'Language Variable',
      name: 'langVariable',
      type: 'string',
      defaultValue: 'originalLanguage',
      inputUI: {
        type: 'text',
      },
      tooltip: 'This plugin will use this Flow Variable to store the detected original language of the movie/TV show.',
    },
  ],
  sidebarPosition: -1,
  outputs: [
    {
      number: OUT_SUCCESS,
      tooltip: 'The original language was detected.',
    },
    {
      number: OUT_FAIL,
      tooltip: 'The original was not detected',
    },
  ],
});

const getApiClient = (args: IpluginInputArgs, mediaInfo: ParsedMediaInfo): ArrClient => {
  switch (mediaInfo.mediaType) {
    case 'movie':
      const radarrApiKey = args.userVariables.library.radarrApiKey?.trim();
      const radarrUrl = args.userVariables.library.radarrUrl?.trim();

      if (!radarrApiKey) {
        throw new Error('Radarr API key was not defined');
      }

      if (!radarrUrl) {
        throw new Error('Radarr URL was not defined');
      }

      args.jobLog(`Initializing RadarrClient with URL "${radarrUrl}"`);
      return new RadarrClient(radarrUrl, radarrApiKey);

    case 'tv':
      const sonarrApiKey = args.userVariables.library.sonarrApiKey?.trim();
      const sonarrUrl = args.userVariables.library.sonarrUrl?.trim();

      if (!sonarrApiKey) {
        throw new Error('Sonarr API key was not defined');
      }

      if (!sonarrUrl) {
        throw new Error('Sonarr URL was not defined');
      }

      args.jobLog(`Initializing SonarrClient with URL "${sonarrUrl}"`);
      return new SonarrClient(sonarrUrl, sonarrApiKey);

    default:
      throw new Error();
  }
};

const plugin = async (args: IpluginInputArgs): Promise<IpluginOutputArgs> => {
  const lib = require('../../../../../methods/lib')();
  args.inputs = lib.loadDefaultValues(args.inputs, details);

  const variableName = String(args.inputs.langVariable).trim();
  const { file } = args.inputFileObj;

  args.jobLog(`Parsing file "${file}"`);

  const mediaInfo = parseMediaPath(file);

  args.jobLog(`Parsed info, got data: ${JSON.stringify(mediaInfo)}`);

  const client = getApiClient(args, mediaInfo);
  const mediaFetchResult = await client.getByTmdbId(mediaInfo.tmdbId);

  if (!mediaFetchResult.ok) {
    throw new Error(`Failed to fetch media: "${mediaFetchResult.error}"`);
  }

  const { originalLanguage } = mediaFetchResult.value;

  if (!originalLanguage) {
    args.jobLog(`Original language field not present in media info: ${JSON.stringify(mediaFetchResult.value)}`);
    return {
      outputFileObj: args.inputFileObj,
      outputNumber: OUT_FAIL,
      variables: args.variables,
    };
  }

  if (!args.variables.user) {
    args.variables.user = {};
  }

  const languageCode = client.parseLanguage(originalLanguage);

  if (!languageCode.ffmpegCode) {
    args.jobLog(`Language is unknown or not correctly specified: ${languageCode.name}`);
    return {
      outputFileObj: args.inputFileObj,
      outputNumber: OUT_FAIL,
      variables: args.variables,
    };
  }

  args.variables.user[variableName] = languageCode.ffmpegCode;
  args.variables.user[`${variableName}Full`] = languageCode.name;

  return {
    outputFileObj: args.inputFileObj,
    outputNumber: OUT_SUCCESS,
    variables: args.variables,
  };
};

export {
  plugin,
  details,
};
