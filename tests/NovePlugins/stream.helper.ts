import { IffmpegCommandStream, IpluginOutputArgs } from '../../FlowPluginsTs/FlowHelpers/1.0.0/interfaces/interfaces';

// eslint-disable-next-line import/prefer-default-export
export const getOnlyStream = (output: IpluginOutputArgs): IffmpegCommandStream => {
  const { streams } = output.variables.ffmpegCommand;

  if (streams.length === 0 || streams.length > 1) {
    throw new Error(`Expected one stream, got ${streams.length}`);
  }

  return streams[0];
};

export const getStream = (output: IpluginOutputArgs, index: number): IffmpegCommandStream => {
  const { streams } = output.variables.ffmpegCommand;

  if (index > streams.length - 1) {
    throw new Error(`Expected at least ${index + 1} streams, got ${streams.length}`);
  }

  return streams[index];
};
