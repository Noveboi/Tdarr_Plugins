/* eslint-disable no-param-reassign */
import { IffmpegCommandStream, IpluginDetails } from '../../../../FlowHelpers/1.0.0/interfaces/interfaces';
import { CodecType, ffMpegCommandPlugin } from '../../../../FlowHelpers/1.0.0/nove/ffmpeg';

/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
const details = () :IpluginDetails => ({
  name: 'Remove Data',
  description: 'Remove streams like data streams and images',
  style: {
    borderColor: '#6efefc',
  },
  tags: 'data',
  isStartPlugin: false,
  pType: '',
  requiresVersion: '2.11.01',
  sidebarPosition: -1,
  icon: '',
  inputs: [],
  outputs: [
    {
      number: 1,
      tooltip: 'Continue to next plugin',
    },
  ],
});

// Below is a list of supported video encoders that produce images
// This is a subset from the `ffmpeg -encoders` list.
//
// 2026-09-24: Using ffmpeg n9.0.2 on Arch
const videoCodecBlacklist: string[] = [
  'alias_pix',
  'apng',
  'bmp',
  'exr',
  'fits',
  'gif',
  'jpeg2000',
  'libopenjpeg',
  'jpegls',
  'libjxl',
  'libjxl_anim',
  'ljpeg',
  'mjpeg',
  'mjpeg_qsv',
  'mjpeg_vaapi',
  'pam',
  'pbm',
  'pcx',
  'pfm',
  'pgm',
  'pgmyuv',
  'phm',
  'png',
  'ppm',
  'qoi',
  'sgi',
  'sunrast',
  'targa',
  'tiff',
  'libwebp_anim',
  'libwebp',
  'xbm',
  'xface',
  'xwd',
];

const shouldRemoveStream = (stream: IffmpegCommandStream): boolean => {
  if (stream.codec_type === CodecType.DATA) {
    return true;
  }

  if (stream.codec_type === CodecType.VIDEO && videoCodecBlacklist.includes(stream.codec_name.toLowerCase())) {
    return true;
  }

  return false;
};

const plugin = ffMpegCommandPlugin(details, (args) => {
  const { streams } = args.variables.ffmpegCommand;
  const streamsToRemove = streams.filter(shouldRemoveStream);

  streamsToRemove.forEach((stream) => {
    stream.removed = true;
  });

  return {
    outputNumber: 1,
    outputFileObj: args.inputFileObj,
    variables: args.variables,
  };
});

export {
  details, plugin,
};
