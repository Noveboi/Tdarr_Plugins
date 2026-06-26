/* eslint-disable no-param-reassign */
import { checkFfmpegCommandInit } from '../interfaces/flowUtils';
import { IpluginDetails, IpluginInputArgs, IpluginOutputArgs } from '../interfaces/interfaces';

type PluginCallback = (args: IpluginInputArgs) => IpluginOutputArgs;
type DetailsCallback = () => IpluginDetails;

const ffMpegCommandPlugin = (details: DetailsCallback, callback: PluginCallback): PluginCallback => (args) => {
  const lib = require('../../../../methods/lib')();
  args.inputs = lib.loadDefaultValues(args.inputs, details);

  checkFfmpegCommandInit(args);

  return callback(args);
};

export default ffMpegCommandPlugin;
