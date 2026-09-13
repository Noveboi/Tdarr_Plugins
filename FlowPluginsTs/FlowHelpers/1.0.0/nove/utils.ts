/*
Shared/common utilities. This module should contain PURE functions!!!
*/

import { IffmpegCommandStream } from '../interfaces/interfaces';
import { CodecType } from './ffmpeg';
import { err, ok, Result } from './types';

export const enumValues = <const T extends Record<string, string>>(type: T): Array<T[keyof T]> => {
  const values = Object.values(type);
  return values as Array<T[keyof T]>;
};

export const enumParser = <const T extends Record<string, string>>(
  type: T,
): ((value: string) => Result<T[keyof T]>) => {
  const values = new Set(enumValues(type));

  return (value: string) => (values.has(value as T[keyof T])
    ? ok(value as T[keyof T])
    : err(`No member for ${value}`));
};

export const isValidLanguageCode = (code: string): boolean => code.length === 3;

/**
 * Convert a simple string to an array of values, separated by commas.
 * @param value The input string
 * @param lowercase If true, converts each value to lowercase.
 */
export const parseCommaSeparatedValues = (value: string, lowercase = false): string[] => {
  if (!value) {
    return [];
  }

  return (lowercase
    ? value
      .split(',')
      .map((val) => val.trim().toLowerCase())
    : value
      .split(',')
      .map((val) => val.trim())
  );
};

/**
 * Find one or more keywords in the given value.
 * @param value The value to search for keywords.
 * @param keywords A list of keywords.
 * @returns `true` if one or more keywords are present in the value. `false` otherwise.
 */
export const containsKeywords = (value: string | undefined, keywords: string[]): boolean => {
  if (!value) {
    return false;
  }

  const cleanValue = value.toLowerCase();
  return keywords.some((keyword) => cleanValue.includes(keyword));
};

/**
 * Filter the given stream collection to contain streams which are "available".
 * "Available" means the stream is not flagged for removal.
 * @param streams The input stream collection
 * @param type The type of stream you want (e.g: Video, Audio, Subtitle)
 */
export const getAvailableStreams = (streams: IffmpegCommandStream[], type: CodecType): IffmpegCommandStream[] => {
  const availableStreams = streams.filter((stream) => !stream.removed && stream.codec_type === type);
  return availableStreams;
};

/**
 * Converts an unknown input to either an integer or float, whilst simultaneously ensuring the number is in a
 * given range [min, max].
 *
 * The conversion is done in Base 10.
 * @param input The value to convert
 * @param min The minimum allowed number that the value can be (inclusive)
 * @param max The maximum allowed number that the value can be (inclusive)
 * @param name What the value is called
 * @param type Is the value to bparseCommaSeparatedValuese treated as an integer or a float? Default: integer
 */
export const convertToValidNumber = (
  input: unknown,
  min: number,
  max: number,
  name: string,
  type: 'integer' | 'float' = 'integer',
): number => {
  const valueAsString = String(input);
  const value = type === 'integer'
    ? Number.parseInt(valueAsString, 10)
    : Number.parseFloat(valueAsString);

  if (value < min || value > max) {
    throw new Error(`Value ${value} for '${name}' is out of range. Expected [${min}-${max}]`);
  }

  return value;
};
