type Ok<T> = {
  readonly ok: true;
  readonly value: T;
  readonly error?: never;
};

type Err<E> = {
  readonly ok: false;
  readonly error: E;
  readonly value?: never;
};

export type Result<T = void, E = string> = Ok<T> | Err<E>;
export type AsyncResult<T, E = string> = Promise<Result<T, E>>

export const ok = <T>(value: T): Ok<T> => ({
  ok: true,
  value,
});

export const err = <E>(error: E): Err<E> => ({
  ok: false,
  error,
});

export type TMDBId = number;
