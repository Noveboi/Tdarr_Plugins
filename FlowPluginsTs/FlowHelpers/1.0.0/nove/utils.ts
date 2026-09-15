/*
Shared/common utilities.

This module should contain PURE functions!!!
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

/**
 * Ensures a string is valid for an ffmpeg-style language code.
 */
export const isValidLanguageCode = (value: string): boolean => value.length === 3;

/**
 * Convert a simple string to an array of values, separated by commas.
 * @param value The input string
 * @param lowercase If true, converts each value to lowercase.
 */
export const parseCommaSeparatedValues = (value: string, lowercase = false): string[] => {
  if (!(value?.trim())) {
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
  if (!(value?.trim())) {
    return false;
  }

  if (keywords.length === 0) {
    return true;
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
export const getAvailableStreams = (
  streams: IffmpegCommandStream[],
  type: CodecType | undefined = undefined,
): IffmpegCommandStream[] => {
  const availableStreams = streams.filter((stream) => !stream.removed && (!type || stream.codec_type === type));
  return availableStreams;
};

const formatValidRange = (min: number | undefined, max: number | undefined) => {
  if (min === undefined && max === undefined) {
    return '[-∞, +∞]';
  }

  if (min === undefined) {
    return `[-∞, ${max}]`;
  }

  if (max === undefined) {
    return `[${min}, +∞]`;
  }

  return `[${min}, ${max}]`;
};

interface ParseNumberOptions {
  min: number | undefined
  max: number | undefined
  name: string | undefined
  type: 'integer' | 'float'
}

/**
 * Converts an unknown input to either an integer or float, whilst simultaneously ensuring the number is in a
 * given range [min, max].
 *
 * The conversion is done in Base 10.
 * @param input The value to convert
 * @param options Various options that further specify the format and validity of the output.
 */
export const parseNumber = (
  input: unknown,
  options: Partial<ParseNumberOptions> = {},
): number => {
  if (input === undefined || input === null) {
    throw new Error('Undefined values are not allowed');
  }

  const type = options.type ?? 'integer';
  const { min, max, name } = options;

  const valueAsString = String(input).trim();

  if (valueAsString === '') {
    throw new Error('Empty strings are not allowed');
  }

  const value = type === 'integer'
    ? Number.parseInt(valueAsString, 10)
    : Number.parseFloat(valueAsString);

  if ((min !== undefined && value < min) || (max !== undefined && value > max)) {
    const variableName = name
      ? ` for '${name}'`
      : '';

    throw new Error(`Value ${value}${variableName} is out of range: ${formatValidRange(min, max)}`);
  }

  return value;
};

/**
 * Parse a value into a boolean.
 * This method is strict and will throw if the value is unexpected.
 *
 * `true` for: 1, 'true'.
 *
 * `false` for: 0, 'false', `undefined`, `null`
 */
export const parseBoolean = (value: unknown): boolean => {
  if (!value) {
    return false;
  }

  if (value === true || value === 1 || value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  throw new Error(`Unknown value '${value}'`);
};
