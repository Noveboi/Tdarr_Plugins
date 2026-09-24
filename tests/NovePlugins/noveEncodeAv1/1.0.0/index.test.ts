import { plugin } from '../../../../FlowPluginsTs/CommunityFlowPlugins/ffmpegCommand/noveEncodeAv1/1.0.0/index';
import { PluginInputArgsBuilder } from '../../pluginHelper';
import { getOnlyStream, getStream } from '../../stream.helper';

describe('AV1 Encoding', () => {
  describe('Parameters', () => {
    test('Defaults', async () => {
      const args = new PluginInputArgsBuilder()
        .addVideoStream()
        .build();

      const result = await plugin(args);
      const stream = getOnlyStream(result);

      expect(stream.outputArgs).toEqual(expect.arrayContaining([
        '-c:{outputIndex}', 'libsvtav1',
        '-preset', '6',
        '-crf', '23',
        '-pix_fmt', 'yuv420p10le',
        '-svtav1-params',
        'tune=0:keyint=10s:enable-variance-boost=0:enable-tf=1:tf-strength=1:sharpness=0',
      ]));
    });

    test('-svtav1-params formatting', async () => {
      const args = new PluginInputArgsBuilder()
        .withInput('tune', 3)
        .withInput('gop', 2)
        .withInput('varianceBoost', true)
        .addVideoStream()
        .build();

      const result = await plugin(args);
      const stream = getOnlyStream(result);

      expect(stream.outputArgs).toEqual(expect.arrayContaining([
        '-svtav1-params',
        'tune=3:keyint=2s:enable-variance-boost=1:enable-tf=1:tf-strength=1:sharpness=0',
      ]));
    });
  });

  describe('Stream Filtering', () => {
    test('Do not include non-available streams', async () => {
      const args = new PluginInputArgsBuilder()
        .addVideoStream()
        .addVideoStream({ removed: true })
        .build();

      const result = await plugin(args);
      const s1 = getStream(result, 0);
      const s2 = getStream(result, 1);

      expect(args.jobLog).toHaveBeenCalledWith('Found 1 video streams');
      expect(s1.outputArgs).not.toHaveLength(0);
      expect(s2.outputArgs).toHaveLength(0);
    });
  });

  describe('Flagging', () => {
    test('Flag secondary video stream as suspicious', async () => {
      const args = new PluginInputArgsBuilder()
        .addVideoStream({
          codec_name: 'h264', width: 1920, height: 1038, tags: { title: 'Movie!' },
        })
        .addVideoStream({
          codec_name: 'vp9', width: 720, height: 506, tags: { title: 'Suspicious!' },
        })
        .build();

      const result = await plugin(args);
      const s1 = getStream(result, 0);
      const s2 = getStream(result, 1);

      expect(result.outputNumber).toBe(2);
      expect(s1.outputArgs).toHaveLength(0);
      expect(s2.outputArgs).toHaveLength(0);
      expect(args.jobLog).toHaveBeenCalledWith('Found 2 video streams');
      expect(args.jobLog).toHaveBeenCalledWith('SUSPICIOUS: File has more than one video streams');
      expect(args.jobLog).toHaveBeenCalledWith('- "Movie!", h264, 1920x1038');
      expect(args.jobLog).toHaveBeenCalledWith('- "Suspicious!", vp9, 720x506');
    });
  });
});
