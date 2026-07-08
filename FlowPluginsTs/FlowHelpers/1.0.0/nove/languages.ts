import { err, ok, Result } from './types';
import { isValidLanguageCode } from './utils';

interface LanguageSetOptions {
  acceptEmptyList: boolean
}

/**
 * Expresses a set of unique languages.
 * This class defines some commonly used methods that help with common plugin tasks.
 *
 * All languages in this set conform to the ISO 639-3 standard's codes.
 *
 * See here: https://iso639-3.sil.org/code_tables/639/data
 */
export default class LanguageSet {
  private readonly languages: Set<string>;

  public readonly length: number;

  constructor(languages: string[]) {
    this.languages = new Set(languages.map(this.normalize));
    this.length = this.languages.size;
  }

  public static from(
    languages: string[],
    options: LanguageSetOptions = { acceptEmptyList: false }
  ): Result<LanguageSet> {
    if (languages.length === 1 && !languages[0]) {
      return options.acceptEmptyList
        ? ok(new LanguageSet([]))
        : err('Languages are empty. Specify at least one language');
    }

    const invalidLanguages = languages.filter((lang) => !isValidLanguageCode(lang));

    if (invalidLanguages.length > 0) {
      return err(`Languages [${invalidLanguages.join(', ')}] are invalid ISO 639-3 codes`);
    }

    return ok(new LanguageSet(languages));
  }

  private normalize(value: string | undefined): string {
    return value
      ? value.trim().toLowerCase()
      : '';
  }

  public toString(): string {
    return Array.from(this.languages).join(', ');
  }

  /**
   * Detect whether the given language is present in the set.
   */
  public contain(language: string | undefined): boolean {
    return this.languages.has(this.normalize(language));
  }
}
