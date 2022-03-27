import {EvalExecutor, IsolatedVmExecutor} from './executor';

const executors = [
    {executor: EvalExecutor}, {executor: IsolatedVmExecutor},
];

describe.each(executors)('test $executor.name', ({executor}) => {
    const buildExecutor = (defines?: Iterable<[string, any]>) => {
        if (executor === EvalExecutor) {
            return new EvalExecutor(defines);
        } else {
            return new IsolatedVmExecutor(defines, {
                memory_limit: 128,
                timeout: 10000,
            });
        }
    };

    describe('eval boolean', function () {

        test('eval true', async () => {
            const executor = buildExecutor();
            expect(await executor.exec('true')).toBe(true);
            executor.release();
        });

        test('default define a=true; eval a = true', async () => {
            const executor = buildExecutor([
                ['a', true],
            ]);
            expect(await executor.exec('a')).toBe(true);
            executor.release();
        });

        test('define a=true; eval a = true', async () => {
            const executor = buildExecutor();
            await executor.addDefinition('a', true);
            expect(await executor.exec('a')).toBe(true);
            executor.release();
        });

        test('default define a=() => true; eval a() = true', async () => {
            const executor = buildExecutor([['a', () => true]]);
            expect(await executor.exec('a()')).toBe(true);
            executor.release();
        });

        test('define a=() => true; eval a() = true', async () => {
            const executor = buildExecutor();
            await executor.addDefinition('a', () => true);
            expect(await executor.exec('a()')).toBe(true);
            executor.release();
        });

        test('default define a=true, b=false; eval a && b = false', async () => {
            const executor = buildExecutor([
                ['a', true],
                ['b', false],
            ]);
            expect(await executor.exec('a && b')).toBe(false);
            executor.release();
        });

        test('define a=true, b=false; eval a && b = false', async () => {
            const executor = buildExecutor();
            await executor.addDefinition('a', true);
            await executor.addDefinition('b', false);
            expect(await executor.exec('a && b')).toBe(false);
            executor.release();
        });

        test('default define a=() => true, b=false; eval a() && b = false', async () => {
            const executor = buildExecutor([['a', () => true], ['b', false]]);
            expect(await executor.exec('a() && b')).toBe(false);
            executor.release();
        });

        test('define a=() => true, b=false; eval a() && b = false', async () => {
            const executor = buildExecutor();
            await executor.addDefinition('a', () => true);
            await executor.addDefinition('b', false);
            expect(await executor.exec('a() && b')).toBe(false);
            executor.release();
        });
    });

    describe('eval number', function () {

        test('eval 5 + 5 = 10', async () => {
            const executor = buildExecutor();
            expect(await executor.exec('5 + 5')).toBe(10);
            executor.release();
        });

        test('default define a=5; eval a + 5 = 10', async () => {
            const executor = buildExecutor([
                ['a', 5],
            ]);
            expect(await executor.exec('a + 5')).toBe(10);
            executor.release();
        });

        test('define a=5; eval a + 5 = 10', async () => {
            const executor = buildExecutor();
            await executor.addDefinition('a', 5);
            expect(await executor.exec('a + 5')).toBe(10);
            executor.release();
        });

        test('default define a=() => 5; eval a() + 5 = 10', async () => {
            const executor = buildExecutor([['a', () => 5]]);
            expect(await executor.exec('a() + 5')).toBe(10);
            executor.release();
        });

        test('define a=() => 5; eval a() + 5 = 10', async () => {
            const executor = buildExecutor();
            await executor.addDefinition('a', () => 5);
            expect(await executor.exec('a() + 5')).toBe(10);
            executor.release();
        });

    });

    describe('eval string', function () {

        test('eval "a" + "b" = "ab"', async () => {
            const executor = buildExecutor();
            expect(await executor.exec('"a" + "b"')).toBe('ab');
            executor.release();
        });

        test('default define a="a"; eval a + "b" = "ab"', async () => {
            const executor = buildExecutor([
                ['a', 'a'],
            ]);
            expect(await executor.exec('a + "b"')).toBe('ab');
            executor.release();
        });

        test('define a="a"; eval a + "b" = "ab"', async () => {
            const executor = buildExecutor();
            await executor.addDefinition('a', 'a');
            expect(await executor.exec('a + "b"')).toBe('ab');
            executor.release();
        });

        test('default define a=() => "a"; eval a() + "b" = "ab""', async () => {
            const executor = buildExecutor([['a', () => 'a']]);
            expect(await executor.exec('a() + "b"')).toBe('ab');
            executor.release();
        });

        test('define a=() => "a"; eval a() + "b" = "ab"', async () => {
            const executor = buildExecutor();
            await executor.addDefinition('a', () => 'a');
            expect(await executor.exec('a() + "b"')).toBe('ab');
            executor.release();
        });

    });

    test('reset context should clear defines', async () => {
        expect.assertions(2);
        const executor = buildExecutor();
        await executor.addDefinition('a', () => 'a');
        expect(await executor.exec('a() + "b"')).toBe('ab');
        await executor.newContext();
        try {
            await executor.exec('a() + "b"');
        } catch (e) {
            expect(e.toString()).toMatch('a is not defined');
        }
        executor.release();
    });

    test('error statement location', async () => {
        expect.assertions(1);
        const executor = buildExecutor();
        try {
            await executor.exec(
                '1 s== 1',
                'executor.test.js',
                181, 34
            );
        } catch (e) {
            expect(e.toString()).toMatch(/^(EvalError: |SyntaxError: )?Unexpected identifier (at )?\[executor.test.js:181:3[4|6]]$/);
        }
        executor.release();
    });
});