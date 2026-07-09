import getSubtitleAction from '../../../FlowPluginsTs/FlowHelpers/1.0.0/nove/subtitles';

describe('getSubtitleAction', () => {
  describe('text subtitles', () => {
    it('should extract subrip as srt using stream copy', () => {
      expect(getSubtitleAction('subrip', 'skip')).toEqual({
        action: 'extract',
        extension: 'srt',
        codec: 'copy',
      });
    });

    it('should extract ass as ass using stream copy', () => {
      expect(getSubtitleAction('ass', 'skip')).toEqual({
        action: 'extract',
        extension: 'ass',
        codec: 'copy',
      });
    });

    it('should extract ssa as ass using stream copy', () => {
      expect(getSubtitleAction('ssa', 'skip')).toEqual({
        action: 'extract',
        extension: 'ass',
        codec: 'copy',
      });
    });

    it('should extract webvtt as vtt using stream copy', () => {
      expect(getSubtitleAction('webvtt', 'skip')).toEqual({
        action: 'extract',
        extension: 'vtt',
        codec: 'copy',
      });
    });

    it('should handle codec names case-insensitively', () => {
      expect(getSubtitleAction('SUBRIP', 'skip')).toEqual({
        action: 'extract',
        extension: 'srt',
        codec: 'copy',
      });

      expect(getSubtitleAction('HdMv_PgS_sUbTiTlE', 'extract_sup')).toEqual({
        action: 'extract',
        extension: 'sup',
        codec: 'copy',
      });
    });
  });

  describe('bitmap subtitles', () => {
    it('should skip PGS subtitles when bitmap handling is skip', () => {
      expect(getSubtitleAction('hdmv_pgs_subtitle', 'skip')).toEqual({
        action: 'skip',
        reason: 'PGS is bitmap-based, OCR is required for SRT',
      });
    });

    it('should extract PGS subtitles as sup when bitmap handling is extract_sup', () => {
      expect(getSubtitleAction('hdmv_pgs_subtitle', 'extract_sup')).toEqual({
        action: 'extract',
        extension: 'sup',
        codec: 'copy',
      });
    });

    it('should skip dvd_subtitle', () => {
      expect(getSubtitleAction('dvd_subtitle', 'extract_sup')).toEqual({
        action: 'skip',
        reason: 'dvd_subtitle is bitmap-based, OCR or format-specific extraction is required',
      });
    });

    it('should skip dvb_subtitle', () => {
      expect(getSubtitleAction('dvb_subtitle', 'extract_sup')).toEqual({
        action: 'skip',
        reason: 'dvb_subtitle is bitmap-based, OCR or format-specific extraction is required',
      });
    });
  });

  describe('unsupported codecs', () => {
    it('should skip unsupported subtitle codecs', () => {
      expect(getSubtitleAction('mov_text', 'skip')).toEqual({
        action: 'skip',
        reason: 'Unsupported subtitle codec: mov_text',
      });
    });

    it('should skip missing subtitle codecs safely', () => {
      expect(getSubtitleAction(undefined, 'skip')).toEqual({
        action: 'skip',
        reason: 'Unsupported subtitle codec: ?',
      });
    });
  });
});
