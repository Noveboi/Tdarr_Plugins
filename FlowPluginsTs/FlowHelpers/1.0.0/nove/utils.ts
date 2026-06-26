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
