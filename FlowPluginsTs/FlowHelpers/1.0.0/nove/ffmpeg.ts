/* eslint-disable no-param-reassign */
import { checkFfmpegCommandInit } from '../interfaces/flowUtils';
import { IpluginDetails, IpluginInputArgs, IpluginOutputArgs } from '../interfaces/interfaces';

export const CodecType = {
  VIDEO: 'video',
  AUDIO: 'audio',
  SUBTITLE: 'subtitle',
} as const;

export type CodecType = typeof CodecType[keyof typeof CodecType];

type PluginCallback = (args: IpluginInputArgs) => IpluginOutputArgs;
type DetailsCallback = () => IpluginDetails;

const isValidLanguageCode = (code: string): boolean => code.length === 3;

const ffMpegCommandPlugin = (details: DetailsCallback, callback: PluginCallback): PluginCallback => (args) => {
  const lib = require('../../../../methods/lib')();
  args.inputs = lib.loadDefaultValues(args.inputs, details);

  checkFfmpegCommandInit(args);

  return callback(args);
};

export default ffMpegCommandPlugin;
