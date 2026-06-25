import {
  ArrFfmpegLanguage, MediaInfo, ArrClient, MediaLanguage,
} from './arr';
import {
  err, ok, Result, TMDBId,
} from './types';

export const SONARR_LANGUAGE_ID_TO_FFMPEG: Record<number, ArrFfmpegLanguage> = {
  [-2]: { name: 'Original', ffmpegCode: null },
  0: { name: 'Unknown', ffmpegCode: 'und' },
  1: { name: 'English', ffmpegCode: 'eng', bcp47: 'en' },
  2: { name: 'French', ffmpegCode: 'fre', bcp47: 'fr' },
  3: { name: 'Spanish', ffmpegCode: 'spa', bcp47: 'es' },
  4: { name: 'German', ffmpegCode: 'ger', bcp47: 'de' },
  5: { name: 'Italian', ffmpegCode: 'ita', bcp47: 'it' },
  6: { name: 'Danish', ffmpegCode: 'dan', bcp47: 'da' },
  7: { name: 'Dutch', ffmpegCode: 'dut', bcp47: 'nl' },
  8: { name: 'Japanese', ffmpegCode: 'jpn', bcp47: 'ja' },
  9: { name: 'Icelandic', ffmpegCode: 'ice', bcp47: 'is' },
  10: { name: 'Chinese', ffmpegCode: 'chi', bcp47: 'zh' },
  11: { name: 'Russian', ffmpegCode: 'rus', bcp47: 'ru' },
  12: { name: 'Polish', ffmpegCode: 'pol', bcp47: 'pl' },
  13: { name: 'Vietnamese', ffmpegCode: 'vie', bcp47: 'vi' },
  14: { name: 'Swedish', ffmpegCode: 'swe', bcp47: 'sv' },
  15: { name: 'Norwegian', ffmpegCode: 'nor', bcp47: 'no' },
  16: { name: 'Finnish', ffmpegCode: 'fin', bcp47: 'fi' },
  17: { name: 'Turkish', ffmpegCode: 'tur', bcp47: 'tr' },
  18: { name: 'Portuguese', ffmpegCode: 'por', bcp47: 'pt' },
  19: { name: 'Flemish', ffmpegCode: 'dut', bcp47: 'nl-BE' },
  20: { name: 'Greek', ffmpegCode: 'gre', bcp47: 'el' },
  21: { name: 'Korean', ffmpegCode: 'kor', bcp47: 'ko' },
  22: { name: 'Hungarian', ffmpegCode: 'hun', bcp47: 'hu' },
  23: { name: 'Hebrew', ffmpegCode: 'heb', bcp47: 'he' },
  24: { name: 'Lithuanian', ffmpegCode: 'lit', bcp47: 'lt' },
  25: { name: 'Czech', ffmpegCode: 'cze', bcp47: 'cs' },
  26: { name: 'Arabic', ffmpegCode: 'ara', bcp47: 'ar' },
  27: { name: 'Hindi', ffmpegCode: 'hin', bcp47: 'hi' },
  28: { name: 'Bulgarian', ffmpegCode: 'bul', bcp47: 'bg' },
  29: { name: 'Malayalam', ffmpegCode: 'mal', bcp47: 'ml' },
  30: { name: 'Ukrainian', ffmpegCode: 'ukr', bcp47: 'uk' },
  31: { name: 'Slovak', ffmpegCode: 'slo', bcp47: 'sk' },
  32: { name: 'Thai', ffmpegCode: 'tha', bcp47: 'th' },
  33: { name: 'Portuguese (Brazil)', ffmpegCode: 'por', bcp47: 'pt-BR' },
  34: { name: 'Spanish (Latino)', ffmpegCode: 'spa', bcp47: 'es-419' },
  35: { name: 'Romanian', ffmpegCode: 'rum', bcp47: 'ro' },
  36: { name: 'Latvian', ffmpegCode: 'lav', bcp47: 'lv' },
  37: { name: 'Persian', ffmpegCode: 'per', bcp47: 'fa' },
  38: { name: 'Catalan', ffmpegCode: 'cat', bcp47: 'ca' },
  39: { name: 'Croatian', ffmpegCode: 'hrv', bcp47: 'hr' },
  40: { name: 'Serbian', ffmpegCode: 'srp', bcp47: 'sr' },
  41: { name: 'Bosnian', ffmpegCode: 'bos', bcp47: 'bs' },
  42: { name: 'Estonian', ffmpegCode: 'est', bcp47: 'et' },
  43: { name: 'Tamil', ffmpegCode: 'tam', bcp47: 'ta' },
  44: { name: 'Indonesian', ffmpegCode: 'ind', bcp47: 'id' },
  45: { name: 'Macedonian', ffmpegCode: 'mac', bcp47: 'mk' },
  46: { name: 'Slovenian', ffmpegCode: 'slv', bcp47: 'sl' },
};

export interface SonarrSeriesInfo extends MediaInfo {
  tvdbId?: number
  tvRageId?: number
  tvMazeId?: number
  tmdbId?: number
  imdbId?: string
  titleSlug?: string
  genres?: string[]
  tags?: number[]
  overview?: string
  status?: string
  monitored?: boolean
  seasons?: unknown[]
  statistics?: unknown
}

// https://sonarr.tv/docs/api/#v3/description/introduction
export class SonarrClient implements ArrClient {
  private readonly baseUrl: string;

  private readonly apiKey: string;

  public readonly mediaType: string = 'series';

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  private getApiPath(resource: string): string {
    return `${this.baseUrl}/api/v3/${resource}`;
  }

  private defaultHeaders(): HeadersInit {
    return {
      'X-Api-Key': this.apiKey,
      Accept: 'application/json',
    };
  }

  public parseLanguage(language: MediaLanguage): ArrFfmpegLanguage {
    return SONARR_LANGUAGE_ID_TO_FFMPEG[language.id];
  }

  public async getByTmdbId(tmdbId: TMDBId): Promise<Result<SonarrSeriesInfo>> {
    const response = await fetch(this.getApiPath(`series/lookup?term=tmdb:${tmdbId}`), {
      method: 'GET',
      headers: this.defaultHeaders(),
    });

    if (response.status === 404) {
      return err(`Series with TMDB ID "${tmdbId}" does not exist in Sonarr`);
    }

    if (response.status !== 200) {
      return err(`Unknown error occurred: ${response.status} ${response.statusText}`);
    }

    const seriesInfo = await response.json() as SonarrSeriesInfo;

    return ok(seriesInfo);
  }
}
