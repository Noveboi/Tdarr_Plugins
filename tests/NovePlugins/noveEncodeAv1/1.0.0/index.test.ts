import { plugin } from '../../../../FlowPluginsTs/CommunityFlowPlugins/ffmpegCommand/noveEncodeAv1/1.0.0/index';
import { PluginInputArgsBuilder } from '../../pluginHelper';

describe('AV1 Encoding', () => {
  describe('Parameters', () => {
    test('-svtav1-params formatting', async () => {
      const args = new PluginInputArgsBuilder()
        .withInput('tune', 3)
        .withInput('gop', 2)
        .withInput('varianceBoost', true)
        .addVideoStream()
        .build();

      const result = await plugin(args);
      const stream = result.variables.ffmpegCommand.streams[0];

      expect(stream.outputArgs).toEqual(
        expect.arrayContaining(
          [
            '-svtav1-params',
            'tune=3:keyint=2s:enable-variance-boost=1:enable-tf=1:tf-strength=1:sharpness=0',
          ],
        ),
      );
    });
  });
});
