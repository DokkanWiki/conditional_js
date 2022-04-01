import {DEFAULT_OPTIONS, ParseFlavor} from '../../src/defaults';
import {normalizeOptions} from '../../src/options';
import {structuredClone} from '../../src/utils';

const getOptions = () => structuredClone(DEFAULT_OPTIONS);

test('default option normalize', () => {
    const default_options = normalizeOptions();
    expect(typeof default_options.parser.if === 'function').toBe(true);
});

test('option function normalize', () => {
    const options = getOptions();
    // @ts-ignore
    options.parser.if = (s: string) => s.split('');
    const default_options = normalizeOptions(options);
    expect(typeof default_options.parser.define === 'function').toBe(true);
    expect(typeof default_options.parser.if === 'function').toBe(true);
    expect(default_options.parser.if('test')).toStrictEqual(['t', 'e', 's', 't']);
});

test('option string normalize', () => {
    const options = getOptions();
    // @ts-ignore
    options.parser.file_detect = 'test';
    // @ts-ignore
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
    options.definitions = undefined;
    const default_options = normalizeOptions(options);
    expect(default_options.definitions).toStrictEqual({});
});

test('option set defines', () => {
    const options = getOptions();
    options.definitions = {
        'global': 'value',
    };
    const default_options = normalizeOptions(options);
    expect(default_options.definitions).toStrictEqual({
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

test('Test flavor parsing', () => {
    const options = getOptions();
    options.parser = ParseFlavor.at;
    let default_options = normalizeOptions(options);
    expect(default_options.parser.if('@if test')).toStrictEqual(['@if test', 'test']);
    options.parser = ParseFlavor.hash;
    default_options = normalizeOptions(options);
    expect(default_options.parser.if('#if test')).toStrictEqual(['#if test', 'test']);
});