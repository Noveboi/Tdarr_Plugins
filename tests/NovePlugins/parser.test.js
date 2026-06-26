"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var parser_1 = require("../../FlowPluginsTs/FlowHelpers/1.0.0/nove/parser");
describe('Parsing Utility Module', function () {
    var samples;
    beforeAll(function () {
        samples = {
            moviePath: "/media/movies/Whiplash (2014) [tmdbid-244786]/\n      Whiplash (2014) [tmdbid-244786] - [Bluray-1080p Proper][AC3 5.1][x265]-YAWNTiC.mkv",
            movieName: 'Whiplash (2014) [tmdbid-244786] - [Bluray-1080p Proper][AC3 5.1][x265]-YAWNTiC.mkv',
            tvPath: "/media/tv/Cowboy Bebop (1998) [tmdbid-30991]/\n      Season 01/\n      Cowboy Bebop (1998) - S01E01 - 001 - Session #1 Asteroid Blues [Bluray-1080p][FLAC 5.1][x264 10bit]-CTR.mkv",
        };
    });
    describe('Parsing Movie Paths', function () {
        it('should parse full path', function () {
            var result = (0, parser_1.parseMediaPath)(samples.moviePath);
            expect(result.mediaType).toBe('movie');
            var movie = result;
            expect(movie.releaseYear).toBe(2014);
            expect(movie.tmdbId).toBe(244786);
            expect(movie.title).toBe('Whiplash');
        });
        it('should parse only file name', function () {
            var result = (0, parser_1.parseMediaPath)(samples.movieName);
            var movie = result;
            expect(result.mediaType).toBe('movie');
            expect(movie.releaseYear).toBe(2014);
            expect(movie.tmdbId).toBe(244786);
            expect(movie.title).toBe('Whiplash');
        });
        it('should throw when there is no TMDB ID in square brackets', function () {
            var input = 'Movie (2026) - [WEBRip-1080p]';
            expect(function () { return (0, parser_1.parseMediaPath)(input); }).toThrow();
        });
        it('should throw when there is no release year in parantheses', function () {
            var input = 'Movie [tmdbid-1234] - [HDTV-1080]';
            expect(function () { return (0, parser_1.parseMediaPath)(input); }).toThrow();
        });
    });
    describe('Parsing TV Paths', function () {
        it('should parse relative path with normal episode title', function () {
            var input = "Show (1999) [tmdbid-123]/\n        Season 03/\n        Show (1999) [tmdbid-123] - S03E64 - Big Episode Title For No Reason! [AMZN][WEBDL-1080p]";
            var result = (0, parser_1.parseMediaPath)(input);
            var tv = result;
            expect(result.mediaType).toBe('tv');
            expect(tv.tmdbId).toBe(123);
            expect(tv.seriesTitle).toBe('Show');
            expect(tv.releaseYear).toBe(1999);
            expect(tv.seasonNumber).toBe(3);
            expect(tv.episodeNumber).toBe(64);
            expect(tv.episodeTitle).toBe('Big Episode Title For No Reason!');
        });
        it('should parse full path with episode title having dashes', function () {
            var result = (0, parser_1.parseMediaPath)(samples.tvPath);
            var tv = result;
            expect(result.mediaType).toBe('tv');
            expect(tv.tmdbId).toBe(30991);
            expect(tv.seriesTitle).toBe('Cowboy Bebop');
            expect(tv.releaseYear).toBe(1998);
            expect(tv.seasonNumber).toBe(1);
            expect(tv.episodeNumber).toBe(1);
            expect(tv.episodeTitle).toBe('001 - Session #1 Asteroid Blues');
        });
        it('should throw when seasons mismatch', function () {
            var input = "Show (1999) [tmdbid-123]/\n        Season 02/\n        Show (1999) [tmdbid-123] - S03E64 - Big Episode Title For No Reason! [AMZN][WEBDL-1080p]";
            expect(function () { return (0, parser_1.parseMediaPath)(input); }).toThrow(/season mismatch/i);
        });
    });
});
