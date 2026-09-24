import {
  plugin as sut,
} from '../../../../FlowPluginsTs/CommunityFlowPlugins/ffmpegCommand/noveRemoveData/1.0.0/index';
import { PluginInputArgsBuilder } from '../../pluginHelper';

describe('Removal', () => {
  test('Remove all "data" streams', async () => {
    const args = new PluginInputArgsBuilder()
      .addVideoStream()
      .addDataStream()
      .addDataStream()
      .build();

    const result = await sut(args);
    const [s1, s2, s3] = result.variables.ffmpegCommand.streams;

    expect(s1.removed).toBe(false);
    expect(s2.removed).toBe(true);
    expect(s3.removed).toBe(true);
  });

  test('Remove "video" streams that have image codec', async () => {
    const args = new PluginInputArgsBuilder()
      .addVideoStream({ codec_name: 'libsvtav1' })
      .addVideoStream({ codec_name: 'libx264' })
      .addVideoStream({ codec_name: 'png' })
      .addVideoStream({ codec_name: 'mjpeg' })
      .build();

    const result = await sut(args);
    const [s1, s2, s3, s4] = result.variables.ffmpegCommand.streams;

    expect(s1.removed).toBe(false);
    expect(s2.removed).toBe(false);
    expect(s3.removed).toBe(true);
    expect(s4.removed).toBe(true);
  });
});
