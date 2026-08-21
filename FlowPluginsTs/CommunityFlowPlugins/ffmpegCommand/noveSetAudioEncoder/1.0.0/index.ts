/* eslint-disable no-param-reassign */
import { IpluginDetails } from '../../../../FlowHelpers/1.0.0/interfaces/interfaces';
import { CodecType, ffMpegCommandPlugin } from '../../../../FlowHelpers/1.0.0/nove/ffmpeg';

/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
const details = (): IpluginDetails => ({
  name: 'Set Audio Encoder',
  description: 'Transcode all audio streams using a specified codec',
  style: {
    borderColor: '#6efefc',
  },
  tags: 'audio, transcode',
  isStartPlugin: false,
  pType: '',
  requiresVersion: '2.11.01',
  sidebarPosition: -1,
  icon: '',
  inputs: [
    {
      label: 'Encoder',
      name: 'encoder',
      tooltip: `Which encoder to use. Typically, for good quality audio and full client support, AAC or EAC-3
      are good choices.`,
      defaultValue: 'aac',
      type: 'string',
      inputUI: {
        type: 'dropdown',
        options: [
          'aac',
          'ac3',
          'eac3',
          'libopus',
        ],
      },
    },
  ],
  outputs: [
    {
      number: 1,
      tooltip: 'Inputs were successfully validated, continue to next plugin',
    },
  ],
});

const plugin = ffMpegCommandPlugin(details, (args) => {
  const encoder = String(args.inputs.encoder);

  const audioStreams = args.variables.ffmpegCommand.streams
    .filter((stream) => stream.codec_type === CodecType.AUDIO);

  args.jobLog(`Found ${audioStreams.length} audio streams`);

  audioStreams.forEach((stream) => {
    stream.outputArgs.push('-c:{outputIndex}', encoder);
  });

  return {
    outputFileObj: args.inputFileObj,
    outputNumber: 1,
    variables: args.variables,
  };
});

export {
  details,
  plugin,
};
