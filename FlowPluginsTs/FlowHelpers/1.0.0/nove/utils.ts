/*
Shared/common utilities. This module should contain PURE functions!!!
*/

import { err, ok, Result } from './types';

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

/**
 * Parses a comma-separated string of values and returns list of normalized and validated ISO 639-3 language codes.
 * https://iso639-3.sil.org/code_tables/639/data
 *
 * @argument acceptEmpty
 * If false, the method returns an error when no languages are found from `value`.
 * If true, the method returns an empty array.
 */
export const parseLanguageCodes = (value: string, acceptEmpty = false): Result<string[]> => {
  const languages = value
    .split(',')
    .map((val) => val.trim());

  if (languages.length === 1 && !languages[0]) {
    return acceptEmpty
      ? ok([])
      : err('Languages are empty. Specify at least one language');
  }

  const invalidLanguages = languages.filter((lang) => !isValidLanguageCode(lang));

  if (invalidLanguages.length > 0) {
    return err(`Languages [${invalidLanguages.join(', ')}] are invalid ISO 639-3 codes`);
  }

  return ok(languages);
};
