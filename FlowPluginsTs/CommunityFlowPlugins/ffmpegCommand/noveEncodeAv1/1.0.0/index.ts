/* eslint-disable no-param-reassign */
import {
  IffmpegCommandStream, IpluginDetails, IpluginInputArgs,
} from '../../../../FlowHelpers/1.0.0/interfaces/interfaces';
import { CodecType, ffMpegCommandPlugin } from '../../../../FlowHelpers/1.0.0/nove/ffmpeg';
import { err, ok, Result } from '../../../../FlowHelpers/1.0.0/nove/types';
import { getAvailableStreams, parseBoolean, parseNumber } from '../../../../FlowHelpers/1.0.0/nove/utils';

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
      defaultValue: '6',
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
      defaultValue: '10',
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
    {
      label: 'Variance Boost',
      name: 'varianceBoost',
      tooltip: `Increases the quality of low-contrast, dark areas in videos.
      NOTE: This increases file size by a lot.`,
      defaultValue: 'false',
      type: 'boolean',
      inputUI: {
        type: 'switch',
      },
    },
    {
      label: 'Temporal Filtering',
      name: 'temporalFiltering',
      tooltip: `Temporal filtering combines information from multiple nearby video frames to
      create cleaner reference pictures with reduced noise, which helps improve
      compression quality especially for noisy source material.`,
      defaultValue: 'true',
      type: 'boolean',
      inputUI: {
        type: 'switch',
      },
    },
    {
      label: 'Sharpness',
      name: 'sharpness',
      tooltip: 'Part of the deblocking filter. Higher values (typically [1-2]) lead to better perceptual quality.',
      defaultValue: '0',
      type: 'number',
      inputUI: {
        type: 'slider',
        sliderOptions: {
          min: 0,
          max: 7,
        },
      },
    },
  ],
  outputs: [
    {
      number: 1,
      tooltip: 'Inputs were successfully validated, continue to next plugin',
    },
    {
      number: 2,
      tooltip: 'Found suspicious stream information, require review',
    },
  ],
});

const createParam = (name: string, value: unknown) => `${name}=${value}`;
const boolToInt = (value: boolean) => (value ? 1 : 0);

const checkForSuspiciousStreams = (args: IpluginInputArgs, streams: IffmpegCommandStream[]): Result => {
  // Check: More than one video stream?
  if (streams.length > 1) {
    args.jobLog('SUSPICIOUS: File has more than one video streams');
    streams.forEach((s) => {
      args.jobLog(`- "${s.tags?.title}", ${s.codec_name}, ${s.width}x${s.height}`);
    });

    return err('More than one video stream');
  }

  return ok(undefined);
};

const plugin = ffMpegCommandPlugin(details, (args) => {
  const preset = parseNumber(args.inputs.preset, { min: 0, max: 13, name: 'Preset' });
  const crf = parseNumber(args.inputs.crf, { min: 1, max: 70, name: 'CRF' });
  const tune = parseNumber(args.inputs.tune, { min: 0, max: 5, name: 'Tune' });
  const gop = parseNumber(args.inputs.gop, { min: 0.1, max: 100, name: 'GOP' });
  const sharpness = parseNumber(args.inputs.sharpness, { min: 0, max: 7, name: 'Sharpness' });

  const use10Bit = parseBoolean(args.inputs.bit10);
  const useVarianceBoost = parseBoolean(args.inputs.varianceBoost);
  const useTemporalFiltering = parseBoolean(args.inputs.temporalFiltering);

  args.variables.ffmpegCommand.shouldProcess = true;

  const videoStreams = getAvailableStreams(args.variables.ffmpegCommand.streams, CodecType.VIDEO);

  args.jobLog(`Found ${videoStreams.length} video streams`);

  const checkResult = checkForSuspiciousStreams(args, videoStreams);

  if (!checkResult.ok) {
    return {
      outputNumber: 2,
      outputFileObj: args.inputFileObj,
      variables: args.variables,
    };
  }

  videoStreams.forEach((stream) => {
    stream.outputArgs.push('-c:{outputIndex}', 'libsvtav1');
    stream.outputArgs.push('-preset', preset.toString());
    stream.outputArgs.push('-crf', crf.toString());
    stream.outputArgs.push('-pix_fmt', use10Bit ? 'yuv420p10le' : 'yuv420p');

    const params = [
      createParam('tune', tune),
      createParam('keyint', `${gop}s`),
      createParam('enable-variance-boost', boolToInt(useVarianceBoost)),
      createParam('enable-tf', boolToInt(useTemporalFiltering)),
      createParam('tf-strength', 1), // constrain to 1, higher values lead to artifacts.
      createParam('sharpness', sharpness),
    ];

    stream.outputArgs.push('-svtav1-params', params.join(':'));
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
