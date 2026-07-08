/*
Shared/common utilities. This module should contain PURE functions!!!
*/

import LanguageSet from './languages';
import { err, ok, Result } from './types';

interface LanguageCodeParseOptions {
  acceptEmpty?: boolean
  lowercase?: boolean
}

export const enumValues = <const T extends Record<string, string>>(obj: T): Array<T[keyof T]> => {
  const values = Object.values(obj);
  return values as Array<T[keyof T]>;
};

export const enumParser = <const T extends Record<string, string>>(obj: T): ((value: string) => Result<T[keyof T]>) => {
  const values = new Set(enumValues(obj));

  return (value: string) => (values.has(value as T[keyof T])
    ? ok(value as T[keyof T])
    : err(`No member for ${value}`));
};

export const isValidLanguageCode = (code: string): boolean => code.length === 3;

export const parseCommaSeparatedValues = (value: string, lowercase = false): string[] => (lowercase
  ? value
    .split(',')
    .map((val) => val.trim().toLowerCase())
  : value
    .split(',')
    .map((val) => val.trim())
);

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
