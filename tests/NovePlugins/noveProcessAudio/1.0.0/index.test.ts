import { plugin as sut }
  from '../../../../FlowPluginsTs/CommunityFlowPlugins/ffmpegCommand/noveProcessAudio/1.0.0/index';

import { PluginInputArgsBuilder } from '../../../../FlowPluginsTs/FlowHelpers/1.0.0/nove/pluginHelper';
import { getOnlyStream, getStream } from '../../stream.helper';

const CODEC_PARAM = 'codec';
const CHANNELS_PARAM = 'channels';

describe('Set Codec', () => {
  test.each([
    { codec: 'AC3', enc: 'ac3' },
    { codec: 'E-AC3', enc: 'eac3' },
    { codec: 'AAC', enc: 'aac' },
    { codec: 'Opus', enc: 'libopus' },
  ])('Set encoder to `$enc` if $codec selected', async ({ enc, codec }) => {
    const args = new PluginInputArgsBuilder()
      .withInput(CODEC_PARAM, codec)
      .addAudioStream()
      .build();

    const result = await sut(args);
    const stream = getOnlyStream(result);

    expect(stream.outputArgs).toEqual(
      expect.arrayContaining([
        '-c:{outputIndex}',
        enc,
      ]),
    );
  });

  test.each([
    { input: '' },
    { input: undefined },
  ])('Do nothing is input is "$input"', async ({ input }) => {
    const args = new PluginInputArgsBuilder()
      .withInput(CODEC_PARAM, input)
      .addAudioStream()
      .build();

    const result = await sut(args);
    const stream = getOnlyStream(result);

    expect(stream.outputArgs).toHaveLength(0);
  });
});

describe('Channel Count', () => {
  test.each([
    { base: 8, target: 6 },
    { base: 6, target: 2 },
    { base: 4, target: 2 },
    { base: 2, target: 1 },
  ])('Set channel count if base channel count is higher than target channel count', async ({ base, target }) => {
    const args = new PluginInputArgsBuilder()
      .withInput(CHANNELS_PARAM, target) // "target" is the desired channel count
      .addAudioStream({ channels: base }) // "base" is the channel count found in the stream
      .build();

    const result = await sut(args);
    const stream = getOnlyStream(result);

    expect(stream.channels).toBe(base);
    expect(stream.outputArgs).toEqual(
      expect.arrayContaining([
        '-ac:{outputIndex}',
        target.toString(),
      ]),
    );
  });

  test.each([
    { base: 2, target: 6 },
    { base: 1, target: 2 },
    { base: 5, target: 6 },
    { base: 6, target: 8 },
    { base: 6, target: 6 },
    { base: 4, target: 4 },
  ])('Do nothing if base channel count is less than or equal to target channel count', async ({ base, target }) => {
    const args = new PluginInputArgsBuilder()
      .withInput(CHANNELS_PARAM, target) // "target" is the desired channel count
      .addAudioStream({ channels: base }) // "base" is the channel count found in the stream
      .build();

    const result = await sut(args);
    const stream = getOnlyStream(result);

    expect(stream.channels).toBe(base);
    expect(stream.outputArgs).toHaveLength(0);
  });

  test('Do nothing if target channel count is 0', async () => {
    const args = new PluginInputArgsBuilder()
      .withInput(CHANNELS_PARAM, 0) // "target" is the desired channel count
      .addAudioStream({ channels: 100 }) // "base" is the channel count found in the stream
      .build();

    const result = await sut(args);
    const stream = getOnlyStream(result);

    expect(stream.channels).toBe(100);
    expect(stream.outputArgs).toHaveLength(0);
  });

  test.each([
    { invalid: 0 },
    { invalid: undefined },
    { invalid: -1 },
  ])('Throw error if base channel count is $invalid', async ({ invalid }) => {
    const args = new PluginInputArgsBuilder()
      .withInput(CHANNELS_PARAM, 6)
      .addAudioStream({ channels: invalid, tags: { title: 'Testing!' } })
      .build();

    await expect(() => sut(args)).rejects.toThrow('Invalid channel count for audio stream "Testing!"');
  });
});

describe('Stream Handling', () => {
  test('Process audio streams only', async () => {
    const args = new PluginInputArgsBuilder()
      .withInput(CODEC_PARAM, 'AAC')
      .withInput(CHANNELS_PARAM, 6)
      .addAudioStream({ channels: 2, tags: { title: 'English' } })
      .addVideoStream({ tags: { title: 'Video!' } })
      .addSubtitleStream({ tags: { title: 'Subs!' } })
      .build();

    const result = await sut(args);
    const audio = getStream(result, 0);
    const video = getStream(result, 1);
    const sub = getStream(result, 2);

    expect(audio.outputArgs).toHaveLength(2);
    expect(video.outputArgs).toHaveLength(0);
    expect(sub.outputArgs).toHaveLength(0);

    expect(args.jobLog).toHaveBeenCalledWith('Found 1 audio stream(s)');
    expect(args.jobLog).toHaveBeenCalledWith('Processing: "English"');
    expect(args.jobLog).toHaveBeenCalledWith('- Setting encoder to "aac"');
    expect(args.jobLog).toHaveBeenCalledWith('- Keeping original channel count');
  });

  test('Every applicable audio stream is processed accordingly', async () => {
    const args = new PluginInputArgsBuilder()
      .withInput(CODEC_PARAM, 'E-AC3')
      .withInput(CHANNELS_PARAM, 2)
      .addAudioStream({ channels: 2, tags: { title: 'S1' } })
      .addAudioStream({ channels: 4, tags: { title: 'S2' } })
      .build();

    const result = await sut(args);
    const s1 = getStream(result, 0);
    const s2 = getStream(result, 1);

    expect(s1.channels).toBe(2);
    expect(s2.channels).toBe(4);
    expect(s1.outputArgs).toHaveLength(2);
    expect(s1.outputArgs).toEqual(expect.arrayContaining(['-c:{outputIndex}', 'eac3']));
    expect(s2.outputArgs).toHaveLength(4);
    expect(s2.outputArgs).toEqual(expect.arrayContaining(['-c:{outputIndex}', 'eac3', '-ac:{outputIndex}', '2']));

    expect(args.jobLog).toHaveBeenCalledWith('Found 2 audio stream(s)');
    expect(args.jobLog).toHaveBeenCalledWith('Processing: "S1"');
    expect(args.jobLog).toHaveBeenCalledWith('Processing: "S2"');
  });

  test('Do not process removed audio streams', async () => {
    const args = new PluginInputArgsBuilder()
      .withInput(CODEC_PARAM, 'E-AC3')
      .withInput(CHANNELS_PARAM, 2)
      .addAudioStream({ channels: 2, tags: { title: 'S1' }, removed: false })
      .addAudioStream({ channels: 4, tags: { title: 'S2' }, removed: true })
      .build();

    const result = await sut(args);
    const s1 = getStream(result, 0);
    const s2 = getStream(result, 1);

    expect(s1.channels).toBe(2);
    expect(s2.channels).toBe(4);
    expect(s1.outputArgs).toHaveLength(2);
    expect(s1.outputArgs).toEqual(
      expect.arrayContaining(['-c:{outputIndex}', 'eac3']),
    );
    expect(s2.outputArgs).toHaveLength(0);

    expect(args.jobLog).toHaveBeenCalledWith('Found 1 audio stream(s)');
    expect(args.jobLog).toHaveBeenCalledWith('Processing: "S1"');
  });
});
