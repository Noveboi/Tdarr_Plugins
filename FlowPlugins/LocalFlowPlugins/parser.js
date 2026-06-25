"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseMediaPath = void 0;
var types_1 = require("./types");
var TITLE_YEAR_TMDB_RE = /^(.+?)\s*\((\d{4})\)\s*\[tmdbid-(\d+)\]$/i;
var SEASON_FOLDER_RE = /^Season\s+(\d{1,3})$/i;
var EPISODE_CODE_RE = /\bS(\d{1,3})E(\d{1,4})\b/i;
var parseYear = function (value) {
    var year = Number.parseInt(value, 10);
    if (!Number.isSafeInteger(year) || year < 1800 || year > 3000) {
        throw new Error("Invalid release year: ".concat(value));
    }
    return year;
};
var parseTmdbId = function (value) {
    var tmdbId = Number.parseInt(value, 10);
    if (!Number.isSafeInteger(tmdbId) || tmdbId <= 0) {
        throw new Error("Invalid TMDB ID: ".concat(value));
    }
    return tmdbId;
};
var parsePositiveInt = function (value, label) {
    var parsed = Number.parseInt(value, 10);
    if (!Number.isSafeInteger(parsed) || parsed < 0) {
        throw new Error("Invalid ".concat(label, " number: ").concat(value));
    }
    return parsed;
};
var extractEpisodeTitle = function (fileName, episodeCodeIndex, episodeCode) {
    var afterEpisodeCode = fileName
        .slice(episodeCodeIndex + episodeCode.length)
        .trim();
    var titlePart = afterEpisodeCode.replace(/^\s*-\s*/, '').trim();
    if (!titlePart) {
        return (0, types_1.err)('No episode title');
    }
    var cleanTitlePart = titlePart
        .replace(/\s*(?:\[[^\]]*])+[-\w.]*$/i, '')
        .trim();
    return (0, types_1.ok)(cleanTitlePart);
};
var tryParseTvEpisodeFromSegments = function (segments) {
    var seriesSegmentIndex = segments.findIndex(function (segment) { return TITLE_YEAR_TMDB_RE.test(segment); });
    if (seriesSegmentIndex === -1) {
        return (0, types_1.err)('No series folder');
    }
    var seriesSegment = segments[seriesSegmentIndex];
    var seasonSegment = segments[seriesSegmentIndex + 1];
    var episodeFileName = segments[seriesSegmentIndex + 2];
    if (!seriesSegment || !seasonSegment || !episodeFileName) {
        return (0, types_1.err)('Incorrect folder structure for TV');
    }
    var seriesMatch = seriesSegment.match(TITLE_YEAR_TMDB_RE);
    var seasonMatch = seasonSegment.match(SEASON_FOLDER_RE);
    var episodeCodeMatch = episodeFileName.match(EPISODE_CODE_RE);
    if (!seriesMatch || !seasonMatch || !episodeCodeMatch || episodeCodeMatch.index === undefined) {
        return (0, types_1.err)('Could not find series name, and/or season, and/or episode code');
    }
    var seriesTitle = seriesMatch[1].trim();
    var releaseYear = parseYear(seriesMatch[2]);
    var tmdbId = parseTmdbId(seriesMatch[3]);
    var seasonFromFolder = parsePositiveInt(seasonMatch[1], 'season');
    var seasonFromFilename = parsePositiveInt(episodeCodeMatch[1], 'season');
    if (seasonFromFilename !== seasonFromFolder) {
        throw new Error("Season mismatch: Folder: ".concat(seasonFromFolder, ", Filename: ").concat(seasonFromFilename));
    }
    var episodeNumber = parsePositiveInt(episodeCodeMatch[2], 'episode');
    var episodeTitleResult = extractEpisodeTitle(episodeFileName, episodeCodeMatch.index, episodeCodeMatch[0]);
    if (!episodeTitleResult.ok) {
        return episodeTitleResult;
    }
    return (0, types_1.ok)({
        mediaType: 'tv',
        seasonNumber: seasonFromFolder,
        episodeTitle: episodeTitleResult.value,
        episodeNumber: episodeNumber,
        releaseYear: releaseYear,
        seriesTitle: seriesTitle,
        tmdbId: tmdbId,
    });
};
var tryParseMovieFromSegments = function (segments) {
    var _a;
    var filename = segments.at(-1);
    if (!filename) {
        throw new Error('Segment array is empty');
    }
    // {Movie Name} {(Year)} [tmdb-id-{xyz}] - [Bluray...]
    var moviePrefix = (_a = filename.split(/\s+-\s+/)[0]) === null || _a === void 0 ? void 0 : _a.trim();
    if (!moviePrefix) {
        return (0, types_1.err)('No movie prefix');
    }
    var match = moviePrefix.match(TITLE_YEAR_TMDB_RE);
    if (!match) {
        return (0, types_1.err)('Could not match movie pattern');
    }
    var movieTitle = match[1].trim();
    var year = parseYear(match[2]);
    var id = parseTmdbId(match[3]);
    return (0, types_1.ok)({
        mediaType: 'movie',
        title: movieTitle,
        releaseYear: year,
        tmdbId: id,
    });
};
var parseMediaPath = function (path) {
    if (!path) {
        throw new Error('Path is empty or null');
    }
    var cleanPath = path.trim();
    if (!cleanPath) {
        throw new Error('Path is whitespace');
    }
    var segments = cleanPath
        .split(/[\\/]+/)
        .map(function (segment) { return segment.trim(); })
        .filter(Boolean);
    // Try parsing TV first -- it's folder structure is more specific.
    var tvEpisodeParseResult = tryParseTvEpisodeFromSegments(segments);
    if (tvEpisodeParseResult.ok) {
        return tvEpisodeParseResult.value;
    }
    var movieParseResult = tryParseMovieFromSegments(segments);
    if (movieParseResult.ok) {
        return movieParseResult.value;
    }
    throw new Error("Failed to parse media path \"".concat(path, "\". Movie: \"").concat(movieParseResult.error, "\"\" | TV: \"").concat(tvEpisodeParseResult.error));
};
exports.parseMediaPath = parseMediaPath;
