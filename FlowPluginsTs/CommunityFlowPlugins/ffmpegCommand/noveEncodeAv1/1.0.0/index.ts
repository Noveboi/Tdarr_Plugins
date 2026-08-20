/* eslint-disable no-param-reassign */
import { IpluginDetails } from '../../../../FlowHelpers/1.0.0/interfaces/interfaces';
import { CodecType, ffMpegCommandPlugin } from '../../../../FlowHelpers/1.0.0/nove/ffmpeg';

/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
const details = () :IpluginDetails => ({
  name: 'AV1 Transcode',
  description: 'Transcode the video stream using the SVT-AV1 codec',
  style: {
    borderColor: '#6efefc',
  },
  tags: 'video, av1',
  isStartPlugin: false,
  pType: '',
  requiresVersion: '2.11.01',
  sidebarPosition: -1,
  icon: '',
  inputs: [
    {
      label: 'Preset',
      name: 'preset',
      tooltip: `The encoder preset. Values range from 0 to 13. Higher preset values means faster encodes,
      with a quality tradeoff. For archivalit is recommended to use values between 3 and 6`,
      defaultValue: '5',
      type: 'number',
      inputUI: {
        type: 'slider',
        sliderOptions: {
          min: 0,
          max: 13,
        },
      },
    },
    {
      label: 'CRF',
      name: 'crf',
      tooltip: 'Constant Rate Factor. Recommended to use 21-25 for archival',
      defaultValue: '23',
      type: 'number',
      inputUI: {
        type: 'slider',
        sliderOptions: {
          min: 1,
          max: 70,
        },
      },
    },
    {
      label: 'Tune',
      name: 'tune',
      tooltip: `[SVT-AV1 GitLab] Optimize the encoding process for different desired outcomes
      [0 = VQ (video and still image), 1 = PSNR (video and still image), 2 = SSIM (video and still image),
      3 = IQ (still image only), 4 = MS-SSIM (video and still image), 5 = VMAF (video only)]`,
      defaultValue: '0',
      type: 'number',
      inputUI: {
        type: 'slider',
        sliderOptions: {
          min: 0,
          max: 5,
        },
      },
    },
    {
      label: 'GOP Interval',
      name: 'gop',
      tooltip: `The interval in seconds after which an I-frame (keyframe) is inserted. Frequent keyframes
      are useful for precise and fast seekability, but at the cost of reduced compression efficiency. For movies/TV,
      it is recommended to use 5-10 seconds`,
      defaultValue: '5',
      type: 'number',
      inputUI: {
        type: 'text',
      },
    },
    {
      label: '10-bit?',
      name: 'bit10',
      tooltip: 'Whether to use 10-bit or 8-bit. Set to `true` to use 10-bit.',
      defaultValue: 'true',
      type: 'boolean',
      inputUI: {
        type: 'switch',
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

const convertToValidNumber = (
  input: unknown,
  min: number,
  max: number,
  name: string,
  type: 'integer' | 'float' = 'integer',
): number => {
  const valueAsString = String(input);
  const value = type === 'integer'
    ? Number.parseInt(valueAsString, 10)
    : Number.parseFloat(valueAsString);

  if (value < min || value > max) {
    throw new Error(`Value ${value} for '${name}' is out of range. Expected [${min}-${max}]`);
  }

  return value;
};

const plugin = ffMpegCommandPlugin(details, (args) => {
  const preset = convertToValidNumber(args.inputs.preset, 0, 13, 'Preset');
  const crf = convertToValidNumber(args.inputs.crf, 1, 70, 'CRF');
  const tune = convertToValidNumber(args.inputs.tune, 0, 5, 'Tune');
  const gop = convertToValidNumber(args.inputs.gop, 0.1, 100, 'GOP');
  const use10Bit = Boolean(args.inputs.bit10);

  args.variables.ffmpegCommand.shouldProcess = true;

  const videoStreams = args.variables.ffmpegCommand.streams
    .filter((s) => s.codec_type === CodecType.VIDEO && s.codec_name !== 'mjpeg');

  args.jobLog(`Found ${videoStreams.length} video streams`);

  videoStreams.forEach((stream) => {
    stream.outputArgs.push('-c:{outputIndex}', 'libsvtav1');
    stream.outputArgs.push('-preset', preset.toString());
    stream.outputArgs.push('-crf', crf.toString());
    stream.outputArgs.push('-pix_fmt', use10Bit ? 'yuv420p10le' : 'yuv420p');
    stream.outputArgs.push('-svtav1-params', `tune=${tune}:keyint=${gop}s`);
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
