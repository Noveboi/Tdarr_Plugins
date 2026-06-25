import { MovieDetails, TMDB, TvShowDetails } from 'tmdb-ts';
import {
  AsyncResult,
  err, ok, Result, TMDBId,
} from './types';

interface ITMDBService {
  getMovieById(id: TMDBId): AsyncResult<MovieDetails>
  getTvShowById(id: TMDBId): AsyncResult<TvShowDetails>
}

class TMDBService implements ITMDBService {
  private readonly tmdb: TMDB;

  constructor(token: string) {
    this.tmdb = new TMDB(token);
  }

  async getMovieById(id: TMDBId): Promise<Result<MovieDetails>> {
    const movie = await this.tmdb.movies.details(id);

    if (movie === undefined || movie === null) {
      return err(`Failed to retrieve movie with ID ${id}`);
    }

    return ok(movie);
  }

  async getTvShowById(id: TMDBId): Promise<Result<TvShowDetails>> {
    const tvShow = await this.tmdb.tvShows.details(id);

    if (tvShow === undefined || tvShow === null) {
      return err(`Failed to retrieve TV show with ID ${id}`);
    }

    return ok(tvShow);
  }
}

const TMDB_ID_PATTERN = /\[tmdbid-(\d+)\]/i;

const extractId = (fileName: string): Result<TMDBId> => {
  const match = TMDB_ID_PATTERN.exec(fileName);

  if (!match) {
    return err(`File name "${fileName}" does not contain the match for [tmdbid-<number>]`);
  }

  const cleanId = match[1].trim();

  if (cleanId === null) {
    return err(`ID in "${fileName}" is empty`);
  }

  const idAsNumber = Number.parseInt(cleanId, 10);

  if (!Number.isSafeInteger(idAsNumber)) {
    return err(`ID "${cleanId}" is not an integer`);
  }

  return ok(idAsNumber);
};

export { ITMDBService, TMDBService, extractId as parseId };
