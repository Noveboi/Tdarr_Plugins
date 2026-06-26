import {
  ParsedMoviePath,
  ParsedTvEpisodePath,
  parseMediaPath,
} from '../../FlowPluginsTs/FlowHelpers/1.0.0/nove/parser';

describe('Parsing Utility Module', () => {
  let samples: {moviePath: string, movieName: string, tvPath: string};

  beforeAll(() => {
    samples = {
      moviePath: `/media/movies/Whiplash (2014) [tmdbid-244786]/
      Whiplash (2014) [tmdbid-244786] - [Bluray-1080p Proper][AC3 5.1][x265]-YAWNTiC.mkv`,
      movieName: 'Whiplash (2014) [tmdbid-244786] - [Bluray-1080p Proper][AC3 5.1][x265]-YAWNTiC.mkv',
      tvPath: `/media/tv/Cowboy Bebop (1998) [tmdbid-30991]/
      Season 01/
      Cowboy Bebop (1998) - S01E01 - 001 - Session #1 Asteroid Blues [Bluray-1080p][FLAC 5.1][x264 10bit]-CTR.mkv`,
    };
  });

  describe('Parsing Movie Paths', () => {
    it('should parse full path', () => {
      const result = parseMediaPath(samples.moviePath);

      expect(result.mediaType).toBe('movie');

      const movie = result as ParsedMoviePath;
      expect(movie.releaseYear).toBe(2014);
      expect(movie.tmdbId).toBe(244786);
      expect(movie.title).toBe('Whiplash');
    });

    it('should parse only file name', () => {
      const result = parseMediaPath(samples.movieName);
      const movie = result as ParsedMoviePath;

      expect(result.mediaType).toBe('movie');
      expect(movie.releaseYear).toBe(2014);
      expect(movie.tmdbId).toBe(244786);
      expect(movie.title).toBe('Whiplash');
    });

    it('should throw when there is no TMDB ID in square brackets', () => {
      const input = 'Movie (2026) - [WEBRip-1080p]';

      expect(() => parseMediaPath(input)).toThrow();
    });

    it('should throw when there is no release year in parantheses', () => {
      const input = 'Movie [tmdbid-1234] - [HDTV-1080]';

      expect(() => parseMediaPath(input)).toThrow();
    });
  });

  describe('Parsing TV Paths', () => {
    it('should parse relative path with normal episode title', () => {
      const input = `Show (1999) [tmdbid-123]/
        Season 03/
        Show (1999) [tmdbid-123] - S03E64 - Big Episode Title For No Reason! [AMZN][WEBDL-1080p]`;

      const result = parseMediaPath(input);
      const tv = result as ParsedTvEpisodePath;

      expect(result.mediaType).toBe('tv');
      expect(tv.tmdbId).toBe(123);
      expect(tv.seriesTitle).toBe('Show');
      expect(tv.releaseYear).toBe(1999);
      expect(tv.seasonNumber).toBe(3);
      expect(tv.episodeNumber).toBe(64);
      expect(tv.episodeTitle).toBe('Big Episode Title For No Reason!');
    });

    it('should parse full path with episode title having dashes', () => {
      const result = parseMediaPath(samples.tvPath);
      const tv = result as ParsedTvEpisodePath;

      expect(result.mediaType).toBe('tv');
      expect(tv.tmdbId).toBe(30991);
      expect(tv.seriesTitle).toBe('Cowboy Bebop');
      expect(tv.releaseYear).toBe(1998);
      expect(tv.seasonNumber).toBe(1);
      expect(tv.episodeNumber).toBe(1);
      expect(tv.episodeTitle).toBe('001 - Session #1 Asteroid Blues');
    });

    it('should throw when seasons mismatch', () => {
      const input = `Show (1999) [tmdbid-123]/
        Season 02/
        Show (1999) [tmdbid-123] - S03E64 - Big Episode Title For No Reason! [AMZN][WEBDL-1080p]`;

      expect(() => parseMediaPath(input)).toThrow(/season mismatch/i);
    });
  });
});
