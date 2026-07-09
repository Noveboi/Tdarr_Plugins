type SubtitleAction =
  | { action: 'extract'; extension: string; codec: string }
  | { action: 'skip'; reason: string };

export const BitmapHandling = {
  SKIP: 'skip',
  EXTRACT_SUP: 'extract_sup',
} as const;

export type BitmapHandling = typeof BitmapHandling[keyof typeof BitmapHandling];

const getSubtitleAction = (
  codec: string | undefined,
  bitmapHandling: BitmapHandling,
): SubtitleAction => {
  switch (codec?.toLowerCase()) {
    case 'subrip':
      return { action: 'extract', extension: 'srt', codec: 'copy' };

    case 'ass':
    case 'ssa':
      return { action: 'extract', extension: 'ass', codec: 'copy' };

    case 'webvtt':
      return { action: 'extract', extension: 'vtt', codec: 'copy' };

    case 'hdmv_pgs_subtitle':
      if (bitmapHandling === BitmapHandling.EXTRACT_SUP) {
        return { action: 'extract', extension: 'sup', codec: 'copy' };
      }

      return {
        action: 'skip',
        reason: 'PGS is bitmap-based, OCR is required for SRT',
      };

    case 'dvd_subtitle':
    case 'dvb_subtitle':
      return {
        action: 'skip',
        reason: `${codec} is bitmap-based, OCR or format-specific extraction is required`,
      };

    default:
      return {
        action: 'skip',
        reason: `Unsupported subtitle codec: ${codec ?? '?'}`,
      };
  }
};

export default getSubtitleAction;
