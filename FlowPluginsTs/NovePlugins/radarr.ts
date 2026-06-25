import {
  ArrFfmpegLanguage, MediaInfo, ArrClient, MediaLanguage,
} from './arr';
import {
  err, ok, Result, TMDBId,
} from './types';

export const RADARR_LANGUAGE_ID_TO_FFMPEG: Record<number, ArrFfmpegLanguage> = {
  [-2]: { name: 'Original', ffmpegCode: null },
  [-1]: { name: 'Any', ffmpegCode: null },
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
  26: { name: 'Hindi', ffmpegCode: 'hin', bcp47: 'hi' },
  27: { name: 'Romanian', ffmpegCode: 'rum', bcp47: 'ro' },
  28: { name: 'Thai', ffmpegCode: 'tha', bcp47: 'th' },
  29: { name: 'Bulgarian', ffmpegCode: 'bul', bcp47: 'bg' },
  30: { name: 'Portuguese (Brazil)', ffmpegCode: 'por', bcp47: 'pt-BR' },
  31: { name: 'Arabic', ffmpegCode: 'ara', bcp47: 'ar' },
  32: { name: 'Ukrainian', ffmpegCode: 'ukr', bcp47: 'uk' },
  33: { name: 'Persian', ffmpegCode: 'per', bcp47: 'fa' },
  34: { name: 'Bengali', ffmpegCode: 'ben', bcp47: 'bn' },
  35: { name: 'Slovak', ffmpegCode: 'slo', bcp47: 'sk' },
  36: { name: 'Latvian', ffmpegCode: 'lav', bcp47: 'lv' },
  37: { name: 'Spanish (Latino)', ffmpegCode: 'spa', bcp47: 'es-419' },
  38: { name: 'Catalan', ffmpegCode: 'cat', bcp47: 'ca' },
  39: { name: 'Croatian', ffmpegCode: 'hrv', bcp47: 'hr' },
  40: { name: 'Serbian', ffmpegCode: 'srp', bcp47: 'sr' },
  41: { name: 'Bosnian', ffmpegCode: 'bos', bcp47: 'bs' },
  42: { name: 'Estonian', ffmpegCode: 'est', bcp47: 'et' },
  43: { name: 'Tamil', ffmpegCode: 'tam', bcp47: 'ta' },
  44: { name: 'Indonesian', ffmpegCode: 'ind', bcp47: 'id' },
  45: { name: 'Telugu', ffmpegCode: 'tel', bcp47: 'te' },
  46: { name: 'Macedonian', ffmpegCode: 'mac', bcp47: 'mk' },
  47: { name: 'Slovenian', ffmpegCode: 'slv', bcp47: 'sl' },
  48: { name: 'Malayalam', ffmpegCode: 'mal', bcp47: 'ml' },
  49: { name: 'Kannada', ffmpegCode: 'kan', bcp47: 'kn' },
  50: { name: 'Albanian', ffmpegCode: 'alb', bcp47: 'sq' },
  51: { name: 'Afrikaans', ffmpegCode: 'afr', bcp47: 'af' },
  52: { name: 'Marathi', ffmpegCode: 'mar', bcp47: 'mr' },
  53: { name: 'Tagalog', ffmpegCode: 'tgl', bcp47: 'tl' },
  54: { name: 'Urdu', ffmpegCode: 'urd', bcp47: 'ur' },
  55: { name: 'Romansh', ffmpegCode: 'roh', bcp47: 'rm' },
  56: { name: 'Mongolian', ffmpegCode: 'mon', bcp47: 'mn' },
  57: { name: 'Georgian', ffmpegCode: 'geo', bcp47: 'ka' },
};

interface RadarrAlternateTitleResource {
  id: number
  sourceType: 'tmdb' | 'mappings' | 'user' | 'indexer'
  movieMetadataId: number
  title?: string
  cleanTitle?: string
}

export interface RadarrMovieInfo extends MediaInfo {
  originalTitle?: string
  alternateTitles?: RadarrAlternateTitleResource[]
  genres: string[]
}

// https://radarr.video/docs/api/#/Movie/get_api_v3_movie__id_
export class RadarrClient implements ArrClient {
  private readonly baseUrl: string;

  private readonly apiKey: string;

  public readonly mediaType: string = 'movies';

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
    return RADARR_LANGUAGE_ID_TO_FFMPEG[language.id];
  }

  public async getByTmdbId(tmdbId: TMDBId): Promise<Result<RadarrMovieInfo>> {
    const response = await fetch(this.getApiPath(`movie/lookup/tmdb?tmdbId=${tmdbId}`), {
      method: 'GET',
      headers: this.defaultHeaders(),
    });

    if (response.status === 404) {
      return err(`Movie with TMDB ID "${tmdbId}" does not exist in Radarr`);
    }

    if (response.status !== 200) {
      return err(`Unknown error occurred: ${response.status} ${response.statusText}`);
    }

    const movieInfo = await response.json() as RadarrMovieInfo;

    return ok(movieInfo);
  }
}
