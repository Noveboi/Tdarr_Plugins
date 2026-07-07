/* eslint-disable no-param-reassign */
import { checkFfmpegCommandInit } from '../interfaces/flowUtils';
import { IpluginDetails, IpluginInputArgs, IpluginOutputArgs } from '../interfaces/interfaces';

export const CodecType = {
  VIDEO: 'video',
  AUDIO: 'audio',
  SUBTITLE: 'subtitle',
} as const;

export type CodecType = typeof CodecType[keyof typeof CodecType];

type PluginCallback =
  ((args: IpluginInputArgs) => IpluginOutputArgs) |
  ((args: IpluginInputArgs) => Promise<IpluginOutputArgs>);

type DetailsCallback = () => IpluginDetails;

export const ffMpegCommandPlugin = (
  details: DetailsCallback,
  callback: PluginCallback,
): PluginCallback => async (args) => {
  const lib = require('../../../../methods/lib')();
  args.inputs = lib.loadDefaultValues(args.inputs, details);

  checkFfmpegCommandInit(args);

  const callbackResult = await callback(args);
  return callbackResult;
};
