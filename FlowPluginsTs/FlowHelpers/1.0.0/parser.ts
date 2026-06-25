import {
  ok, err, Result, TMDBId,
} from './types';

export interface ParsedMoviePath {
  mediaType: 'movie'
  title: string;
  tmdbId: TMDBId;
  releaseYear: number;
}

export interface ParsedTvEpisodePath {
  mediaType: 'tv';
  seriesTitle: string;
  tmdbId: TMDBId;
  releaseYear: number;
  seasonNumber: number;
  episodeNumber: number;
  episodeTitle: string;
}

export type ParsedMediaInfo = ParsedMoviePath | ParsedTvEpisodePath;

const TITLE_YEAR_TMDB_RE = /^(.+?)\s*\((\d{4})\)\s*\[tmdbid-(\d+)\]$/i;

const SEASON_FOLDER_RE = /^Season\s+(\d{1,3})$/i;

const EPISODE_CODE_RE = /\bS(\d{1,3})E(\d{1,4})\b/i;

const parseYear = (value: string): number => {
  const year = Number.parseInt(value, 10);

  if (!Number.isSafeInteger(year) || year < 1800 || year > 3000) {
    throw new Error(`Invalid release year: ${value}`);
  }

  return year;
};

const parseTmdbId = (value: string): TMDBId => {
  const tmdbId = Number.parseInt(value, 10);

  if (!Number.isSafeInteger(tmdbId) || tmdbId <= 0) {
    throw new Error(`Invalid TMDB ID: ${value}`);
  }

  return tmdbId;
};

const parsePositiveInt = (value: string, label: string): number => {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isSafeInteger(parsed) || parsed < 0) {
    throw new Error(`Invalid ${label} number: ${value}`);
  }

  return parsed;
};

const extractEpisodeTitle = (fileName: string, episodeCodeIndex: number, episodeCode: string): Result<string> => {
  const afterEpisodeCode = fileName
    .slice(episodeCodeIndex + episodeCode.length)
    .trim();

  const titlePart = afterEpisodeCode.replace(/^\s*-\s*/, '').trim();

  if (!titlePart) {
    return err('No episode title');
  }

  const cleanTitlePart = titlePart
    .replace(/\s*(?:\[[^\]]*])+[-\w.]*$/i, '')
    .trim();

  return ok(cleanTitlePart);
};

const tryParseTvEpisodeFromSegments = (segments: string[]): Result<ParsedTvEpisodePath> => {
  const seriesSegmentIndex = segments.findIndex((segment) => TITLE_YEAR_TMDB_RE.test(segment));

  if (seriesSegmentIndex === -1) {
    return err('No series folder');
  }

  const seriesSegment = segments[seriesSegmentIndex];
  const seasonSegment = segments[seriesSegmentIndex + 1];
  const episodeFileName = segments[seriesSegmentIndex + 2];

  if (!seriesSegment || !seasonSegment || !episodeFileName) {
    return err('Incorrect folder structure for TV');
  }

  const seriesMatch = seriesSegment.match(TITLE_YEAR_TMDB_RE);
  const seasonMatch = seasonSegment.match(SEASON_FOLDER_RE);
  const episodeCodeMatch = episodeFileName.match(EPISODE_CODE_RE);

  if (!seriesMatch || !seasonMatch || !episodeCodeMatch || episodeCodeMatch.index === undefined) {
    return err('Could not find series name, and/or season, and/or episode code');
  }

  const seriesTitle = seriesMatch[1].trim();
  const releaseYear = parseYear(seriesMatch[2]);
  const tmdbId = parseTmdbId(seriesMatch[3]);

  const seasonFromFolder = parsePositiveInt(seasonMatch[1], 'season');
  const seasonFromFilename = parsePositiveInt(episodeCodeMatch[1], 'season');

  if (seasonFromFilename !== seasonFromFolder) {
    throw new Error(`Season mismatch: Folder: ${seasonFromFolder}, Filename: ${seasonFromFilename}`);
  }

  const episodeNumber = parsePositiveInt(episodeCodeMatch[2], 'episode');
  const episodeTitleResult = extractEpisodeTitle(episodeFileName, episodeCodeMatch.index, episodeCodeMatch[0]);

  if (!episodeTitleResult.ok) {
    return episodeTitleResult;
  }

  return ok({
    mediaType: 'tv',
    seasonNumber: seasonFromFolder,
    episodeTitle: episodeTitleResult.value,
    episodeNumber,
    releaseYear,
    seriesTitle,
    tmdbId,
  });
};

const tryParseMovieFromSegments = (segments: string[]): Result<ParsedMoviePath> => {
  const filename = segments.at(-1);

  if (!filename) {
    throw new Error('Segment array is empty');
  }

  // {Movie Name} {(Year)} [tmdb-id-{xyz}] - [Bluray...]
  const moviePrefix = filename.split(/\s+-\s+/)[0]?.trim();

  if (!moviePrefix) {
    return err('No movie prefix');
  }

  const match = moviePrefix.match(TITLE_YEAR_TMDB_RE);

  if (!match) {
    return err('Could not match movie pattern');
  }

  const movieTitle = match[1].trim();
  const year = parseYear(match[2]);
  const id = parseTmdbId(match[3]);

  return ok({
    mediaType: 'movie',
    title: movieTitle,
    releaseYear: year,
    tmdbId: id,
  });
};

const parseMediaPath = (path: string): ParsedMediaInfo => {
  if (!path) {
    throw new Error('Path is empty or null');
  }

  const cleanPath = path.trim();

  if (!cleanPath) {
    throw new Error('Path is whitespace');
  }

  const segments = cleanPath
    .split(/[\\/]+/)
    .map((segment) => segment.trim())
    .filter(Boolean);

  // Try parsing TV first -- it's folder structure is more specific.
  const tvEpisodeParseResult = tryParseTvEpisodeFromSegments(segments);

  if (tvEpisodeParseResult.ok) {
    return tvEpisodeParseResult.value;
  }

  const movieParseResult = tryParseMovieFromSegments(segments);

  if (movieParseResult.ok) {
    return movieParseResult.value;
  }

  throw new Error(
    `Failed to parse media path "${path}". Movie: "${movieParseResult.error}"" | TV: "${tvEpisodeParseResult.error}`,
  );
};

export { parseMediaPath };
