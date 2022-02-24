import {DEFAULT_OPTIONS} from './defaults';
import {normalizeOptions} from './options';
import {structuredClone} from './utils';

const getOptions = () => structuredClone(DEFAULT_OPTIONS);

test('default option normalize', () => {
    const default_options = normalizeOptions(getOptions());
    expect(typeof default_options.parser.if === 'function').toBe(true);
});

test('option function normalize', () => {
    const options = getOptions();
    options.parser.if = (s: string) => s.split('');
    const default_options = normalizeOptions(options);
    expect(typeof default_options.parser.define === 'function').toBe(true);
    expect(typeof default_options.parser.if === 'function').toBe(true);
    expect(default_options.parser.if('test')).toStrictEqual(['t', 'e', 's', 't']);
});

test('option string normalize', () => {
    const options = getOptions();
    options.parser.file_detect = 'test';
    options.parser.if = 'test';
    const default_options = normalizeOptions(options);
    expect(default_options.parser.file_detect).toBeInstanceOf(RegExp);
    expect(typeof default_options.parser.if === 'function').toBe(true);
});

test('option unknown normalize', () => {
    const options = getOptions();
    // @ts-ignore
    options.parser.if = {};
    expect(() => normalizeOptions(options)).toThrow('Invalid parsing option: expected string, RegExp, or function');
});

test('option empty defines', () => {
    const options = getOptions();
    options.defines = undefined;
    const default_options = normalizeOptions(options);
    expect(default_options.defines).toStrictEqual({});
});

test('option set defines', () => {
    const options = getOptions();
    options.defines = {
        'global': 'value',
    };
    const default_options = normalizeOptions(options);
    expect(default_options.defines).toStrictEqual({
        'global': 'value',
    });
});

test('testing boolean false sandbox', () => {
    const options = getOptions();
    options.sandbox = false;
    const default_options = normalizeOptions(options);
    expect(default_options.sandbox).toBeUndefined();
});

test('testing boolean true sandbox', () => {
    const options = getOptions();
    options.sandbox = true;
    const default_options = normalizeOptions(options);
    expect(default_options.sandbox).toStrictEqual({
        memory_limit: 128,
        timeout: 10000,
    });
});