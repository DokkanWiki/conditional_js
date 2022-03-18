import {DEFAULT_OPTIONS} from './defaults';
import {normalizeOptions, ISandboxOptions} from './options';
import {IsolatedVmExecutor} from './executor';
import {StatementParser} from './statement_parser';
import {StatementLocation} from './statement';

const default_options = normalizeOptions(DEFAULT_OPTIONS);

const executor = new IsolatedVmExecutor([], default_options.sandbox as ISandboxOptions);

test('execute define default', async () => {
    await executor.newContext();
    const parser = new StatementParser(default_options.parser);
    const define_stmt = parser.parseString('@define identifier');
    const test_stmt = parser.parseString('@if identifier');
    expect(define_stmt).toBeTruthy();
    expect(test_stmt).toBeTruthy();
    expect(await define_stmt?.execute(executor)).toBeUndefined();
    expect(await test_stmt?.execute(executor)).toBe(true);
});

test('execute define with value', async () => {
    await executor.newContext();
    const parser = new StatementParser(default_options.parser);
    const define_stmt = parser.parseString('@define identifier 6');
    const test_stmt = parser.parseString('@if identifier === 6');
    expect(define_stmt).toBeTruthy();
    expect(test_stmt).toBeTruthy();
    expect(await define_stmt?.execute(executor)).toBeUndefined();
    expect(await test_stmt?.execute(executor)).toBe(true);
});

test('execute not defined', async () => {
    await executor.newContext();
    const parser = new StatementParser(default_options.parser);
    const define_stmt = parser.parseString('@define different');
    const test_stmt = parser.parseString('@ifdef identifier');
    expect(define_stmt).toBeTruthy();
    expect(test_stmt).toBeTruthy();
    expect(await define_stmt?.execute(executor)).toBeUndefined();
    expect(await test_stmt?.execute(executor)).toBe(false);
});

test('execute define with wrong value', async () => {
    await executor.newContext();
    const parser = new StatementParser(default_options.parser);
    const define_stmt = parser.parseString('@define identifier 7');
    const test_stmt = parser.parseString('@if identifier === 6');
    expect(define_stmt).toBeTruthy();
    expect(test_stmt).toBeTruthy();
    expect(await define_stmt?.execute(executor)).toBeUndefined();
    expect(await test_stmt?.execute(executor)).toBe(false);
});

test('execute ifdef', async () => {
    await executor.newContext();
    const parser = new StatementParser(default_options.parser);
    const define_stmt = parser.parseString('@define identifier');
    const test_stmt = parser.parseString('@ifdef identifier');
    expect(define_stmt).toBeTruthy();
    expect(test_stmt).toBeTruthy();
    expect(await define_stmt?.execute(executor)).toBeUndefined();
    expect(await test_stmt?.execute(executor)).toBe(true);
});

test('execute ifdef not defined', async () => {
    await executor.newContext();
    const parser = new StatementParser(default_options.parser);
    const define_stmt = parser.parseString('@define different');
    const test_stmt = parser.parseString('@ifdef identifier');
    expect(define_stmt).toBeTruthy();
    expect(test_stmt).toBeTruthy();
    expect(await define_stmt?.execute(executor)).toBeUndefined();
    expect(await test_stmt?.execute(executor)).toBe(false);
});

test('execute ifndef not defined', async () => {
    await executor.newContext();
    const parser = new StatementParser(default_options.parser);
    const define_stmt = parser.parseString('@define different');
    const test_stmt = parser.parseString('@ifndef identifier');
    expect(define_stmt).toBeTruthy();
    expect(test_stmt).toBeTruthy();
    expect(await define_stmt?.execute(executor)).toBeUndefined();
    expect(await test_stmt?.execute(executor)).toBe(true);
});

test('execute ifndef', async () => {
    await executor.newContext();
    const parser = new StatementParser(default_options.parser);
    const define_stmt = parser.parseString('@define different');
    const test_stmt = parser.parseString('@ifndef identifier');
    expect(define_stmt).toBeTruthy();
    expect(test_stmt).toBeTruthy();
    expect(await define_stmt?.execute(executor)).toBeUndefined();
    expect(await test_stmt?.execute(executor)).toBe(true);
});

test('execute elifdef', async () => {
    await executor.newContext();
    const parser = new StatementParser(default_options.parser);
    const define_stmt = parser.parseString('@define identifier');
    const test_stmt = parser.parseString('@elifdef identifier');
    expect(define_stmt).toBeTruthy();
    expect(test_stmt).toBeTruthy();
    expect(await define_stmt?.execute(executor)).toBeUndefined();
    expect(await test_stmt?.execute(executor)).toBe(true);
});

test('execute elifdef not defined', async () => {
    await executor.newContext();
    const parser = new StatementParser(default_options.parser);
    const define_stmt = parser.parseString('@define different');
    const test_stmt = parser.parseString('@elifdef identifier');
    expect(define_stmt).toBeTruthy();
    expect(test_stmt).toBeTruthy();
    expect(await define_stmt?.execute(executor)).toBeUndefined();
    expect(await test_stmt?.execute(executor)).toBe(false);
});

test('execute elifndef not defined', async () => {
    await executor.newContext();
    const parser = new StatementParser(default_options.parser);
    const define_stmt = parser.parseString('@define different');
    const test_stmt = parser.parseString('@elifndef identifier');
    expect(define_stmt).toBeTruthy();
    expect(test_stmt).toBeTruthy();
    expect(await define_stmt?.execute(executor)).toBeUndefined();
    expect(await test_stmt?.execute(executor)).toBe(true);
});

test('execute elifndef', async () => {
    await executor.newContext();
    const parser = new StatementParser(default_options.parser);
    const define_stmt = parser.parseString('@define different');
    const test_stmt = parser.parseString('@elifndef identifier');
    expect(define_stmt).toBeTruthy();
    expect(test_stmt).toBeTruthy();
    expect(await define_stmt?.execute(executor)).toBeUndefined();
    expect(await test_stmt?.execute(executor)).toBe(true);
});

test('execute elif', async () => {
    await executor.newContext();
    const parser = new StatementParser(default_options.parser);
    const define_stmt = parser.parseString('@define identifier 6');
    const test_stmt = parser.parseString('@elif identifier === 6');
    expect(define_stmt).toBeTruthy();
    expect(test_stmt).toBeTruthy();
    expect(await define_stmt?.execute(executor)).toBeUndefined();
    expect(await test_stmt?.execute(executor)).toBe(true);
});

test('execute elif false', async () => {
    await executor.newContext();
    const parser = new StatementParser(default_options.parser);
    const define_stmt = parser.parseString('@define identifier 6');
    const test_stmt = parser.parseString('@elif identifier === 7');
    expect(define_stmt).toBeTruthy();
    expect(test_stmt).toBeTruthy();
    expect(await define_stmt?.execute(executor)).toBeUndefined();
    expect(await test_stmt?.execute(executor)).toBe(false);
});

test('failed conditional with error location', async () => {
    await executor.newContext();
    const parser = new StatementParser(default_options.parser);
    const location: StatementLocation = {
        filename: 'test.js',
        line: Math.ceil(Math.random() * 100),
        column: Math.ceil(Math.random() * 100),
    };
    const test_stmt = parser.parseString('@if .== 7', location);
    expect(test_stmt).toBeTruthy();
    await expect(test_stmt?.execute(executor)).rejects.toThrowError(`Unexpected token '.' [test.js:${location.line}:${location.column}]`);
});