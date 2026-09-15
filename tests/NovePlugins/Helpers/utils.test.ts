import { CodecType } from '../../../FlowPluginsTs/FlowHelpers/1.0.0/nove/ffmpeg';
import {
  containsKeywords, getAvailableStreams, isValidLanguageCode, parseBoolean, parseCommaSeparatedValues,
  parseNumber,
} from '../../../FlowPluginsTs/FlowHelpers/1.0.0/nove/utils';
import { audioStream, subtitleStream, videoStream } from '../pluginHelper';

describe('parseBoolean', () => {
  test.each([
    0,
    undefined,
    null,
    'false',
    '',
    false,
  ])('Parse "%p" as false', (value) => {
    expect(parseBoolean(value)).toBe(false);
  });

  test.each([
    1,
    'true',
    true,
  ])('Parse "%p" as true', (value) => {
    expect(parseBoolean(value)).toBe(true);
  });

  test.each([
    2,
    'ok!',
    -1,
    ' ',
  ])('Throw for unknown values', (value) => {
    expect(() => parseBoolean(value)).toThrow(`Unknown value '${value}'`);
  });
});

describe('isValidLanguageCode', () => {
  test.each([
    'abc', 'eng', '!)3', 'gre', '   ',
  ])('Accepts only 3-letter strings (%p)', (value) => {
    expect(isValidLanguageCode(value)).toBe(true);
  });

  test.each([
    '', ' ', '  ', 'a', 'ab', 'abcd', 'eng!', 'el', 'en',
  ])('False non 3-letter strings (%p)', (value) => {
    expect(isValidLanguageCode(value)).toBe(false);
  });
});

describe('parseCommaSeparatedValues', () => {
  test('Returns a list of strings from one string, each value separated by a comma', () => {
    const input = 'one,two,three,four';
    const result = parseCommaSeparatedValues(input);
    expect(result).toEqual(['one', 'two', 'three', 'four']);
  });

  test('Trim leading whitespace between commas by default', () => {
    const input = 'one, two, three, four';
    const result = parseCommaSeparatedValues(input);
    expect(result).toEqual(['one', 'two', 'three', 'four']);
  });

  test('Trim trailing whitespace betweem commas by default', () => {
    const input = ' one, two ,    three     ,          four ';
    const result = parseCommaSeparatedValues(input);
    expect(result).toEqual(['one', 'two', 'three', 'four']);
  });

  test('Do not modify case by default', () => {
    const input = 'One,Two,THREE,foUR';
    const result = parseCommaSeparatedValues(input);
    expect(result).toEqual(['One', 'Two', 'THREE', 'foUR']);
  });

  test('Convert strings to lowercase if specified', () => {
    const input = 'ONE,Two,three,FOUR';
    const result = parseCommaSeparatedValues(input, true);
    expect(result).toEqual(['one', 'two', 'three', 'four']);
  });

  test('Returns empty list when given empty string', () => {
    const input = '';
    const result = parseCommaSeparatedValues(input);
    expect(result).toEqual([]);
  });

  test('Returns empty list when given whitespace', () => {
    const input = '    ';
    const result = parseCommaSeparatedValues(input);
    expect(result).toEqual([]);
  });
});

describe('containsKeywords', () => {
  test('False if value is not contained within keyword list', () => {
    const value = 'bread';
    const keywords = ['salmon', 'tuna'];

    expect(containsKeywords(value, keywords)).toBe(false);
  });

  test('Always false if value is undefined', () => {
    const value = undefined;
    const keywords = ['', 'bread'];

    expect(containsKeywords(value, keywords)).toBe(false);
  });

  test.each([
    { kw: ['a', 'b', 'c'] },
    { kw: ['a', 'b'] },
    { kw: ['a'] },
  ])('True if value matches with at least one keyword', ({ kw }) => {
    const value = 'a';
    expect(containsKeywords(value, kw)).toBe(true);
  });

  test.each([
    'a', 'bca', 'bread', 'awdiejgiwejgo',
  ])('Always true if keyword list is empty (value: %p)', (value) => {
    const keywords: string[] = [];
    expect(containsKeywords(value, keywords)).toBe(true);
  });

  test('Ignore trailing or leading whitespace for value and keyword list', () => {
    const value = '    commentary  ';
    const keywords = ['  director ', ' commentary'];

    expect(containsKeywords(value, keywords)).toBe(true);
  });
});

describe('getAvailableStreams', () => {
  test('Filter streams tagged as "removed"', () => {
    const s1 = videoStream();
    const s2 = audioStream();
    const s3 = audioStream({ removed: true });
    const s4 = audioStream({ removed: true });
    const s5 = subtitleStream();
    const s6 = subtitleStream({ removed: true });

    const result = getAvailableStreams([s1, s2, s3, s4, s5, s6]);

    expect(result).toEqual([s1, s2, s5]);
  });

  test('Filter streams based on codec type if specified', () => {
    const s1 = videoStream();
    const s2 = audioStream();
    const s3 = audioStream();
    const s4 = subtitleStream();

    const result = getAvailableStreams([s1, s2, s3, s4], CodecType.AUDIO);

    expect(result).toEqual([s2, s3]);
  });

  test('Return all streams if not removed and codec type not specified', () => {
    const s1 = videoStream();
    const s2 = audioStream();
    const s3 = audioStream();
    const s4 = audioStream();
    const s5 = subtitleStream();
    const s6 = subtitleStream();
    const input = [s1, s2, s3, s4, s5, s6];

    const result = getAvailableStreams(input);

    expect(result).toEqual(input);
  });
});

describe('parseNumber', () => {
  test.each([
    1, '1', '1 ', ' 1', '1  ', '  1',
  ])('Parse number from number or strings (ignoring whitespace)', (value) => {
    const result = parseNumber(value);
    expect(result).toBe(1);
  });

  test('Parse negative number from string', () => {
    const value = '-100';
    const result = parseNumber(value);
    expect(result).toBe(-100);
  });

  test('Parse number successfully when in given range', () => {
    const min = 0;
    const max = 4;
    const value = 2;

    const result = parseNumber(value, { min, max });

    expect(result).toBe(2);
  });

  test('Throw when number is less than minimum allowed value', () => {
    const min = 5;
    const value = 2;

    const call = () => parseNumber(value, { min });

    expect(call).toThrow('Value 2 is out of range: [5, +∞]');
  });

  test('Throw when number is greater than maximum allowed value', () => {
    const max = 5;
    const value = 6;

    const call = () => parseNumber(value, { max });

    expect(call).toThrow('Value 6 is out of range: [-∞, 5]');
  });

  test('Throw when number is outside of the given valid range', () => {
    const min = -10;
    const max = 10;
    const value = -11;

    const call = () => parseNumber(value, { min, max });

    expect(call).toThrow('Value -11 is out of range: [-10, 10]');
  });

  test.each([
    undefined, null,
  ])('Throw when input is undefined or null', (value) => {
    const call = () => parseNumber(value);
    expect(call).toThrow('Undefined values are not allowed');
  });

  test.each([
    '',
    ' ',
    '    ',
  ])('Throw when input is empty string or whitespace', (value) => {
    const call = () => parseNumber(value);
    expect(call).toThrow('Empty strings are not allowed');
  });

  test('Use `name` option when throwing errors', () => {
    const call = () => parseNumber(0, { min: 10, name: 'Test!' });

    expect(call).toThrow('Value 0 for \'Test!\' is out of range: [10, +∞]');
  });

  test.each([
    { input: '10.5', expected: 10.5 },
    { input: '-10.5', expected: -10.5 },
    { input: '10.0', expected: 10.0 },
    { input: '8.3', expected: 8.3 },
  ])('Parse floating-point values if specified', ({ input, expected }) => {
    const result = parseNumber(input, { type: 'float' });
    expect(result).toBeCloseTo(expected, 5);
  });

  test.each([
    ' 10',
    '10 ',
    ' 10 ',
    '     10  ',
  ])('Remove leading/trailimg whitespace from string input', (input) => {
    const result = parseNumber(input);
    expect(result).toBe(10);
  });
});
