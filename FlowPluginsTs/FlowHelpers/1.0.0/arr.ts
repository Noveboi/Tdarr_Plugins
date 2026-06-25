import { Result, TMDBId } from './types';

// Common module for *Arr apps.
export interface MediaLanguage {
  id: number
  name?: string
}

export interface MediaInfo {
  id: number
  title?: string
  originalLanguage: MediaLanguage
  year: number
}

export interface ArrFfmpegLanguage {
  name: string
  /**
   * ffmpeg stream metadata language code.
   *
   * Null means the Arr value is not an actual language.
   */
  ffmpegCode: string | null

  /**
   * Optional modern language tag for your own app/domain model.
   * Do not assume every ffmpeg muxer will preserve this as-is.
   */
  bcp47?: string
}

export interface ArrClient {
  mediaType: string
  parseLanguage: (language: MediaLanguage) => ArrFfmpegLanguage
  getByTmdbId: (tmdbId: TMDBId) => Promise<Result<MediaInfo>>
}
