import {DEFAULT_OPTIONS} from '../src/defaults';
import {ISandboxOptions, ProcessAction} from '../src/options';
import {ConditionalJsProcessor} from '../src/processor';
import {structuredClone} from '../src/utils';

const getOptions = (sandbox: boolean | ISandboxOptions, action: ProcessAction = ProcessAction.remove) => {
    const options = structuredClone(DEFAULT_OPTIONS);
    options.sandbox = sandbox;
    options.action = action;
    return options;
};

describe.each([DEFAULT_OPTIONS.sandbox, false])(`test processor (sandbox: %s)`, (sandbox_options) => {
    const file_context = {
        file_name: 'test.js',
    };
    for (let i = 0; i < 3; i++) {
        test(`successful parse test #${i}`, async () => {
            const source_test = source_test_template.replace(/%d/g, `${i}`);
            const processor = new ConditionalJsProcessor(
                getOptions(sandbox_options),
            );
            const {transformed_source} = await processor.process(source_test);
            expect(transformed_source).toBe(source_test_results[i]);
            processor.release();
        });
    }
    for (let i = 0; i < 3; i++) {
        test(`successful parse test #${i}, comment out`, async () => {
            const source_test = source_test_template.replace(/%d/g, `${i}`);
            const processor = new ConditionalJsProcessor(
                getOptions(sandbox_options, ProcessAction.comment),
            );
            const {transformed_source} = await processor.process(source_test);
            expect(transformed_source).toBe(source_test_results_comment[i]);
            processor.release();
        });
    }
    test('release', async () => {
        const source_test = source_test_template.replace(/%d/g, '2');
        const processor = new ConditionalJsProcessor(
            getOptions(sandbox_options),
        );
        await processor.process(source_test);
        processor.release();
    });
    test('test skip', async () => {
        const source_test = 'Lorem Ipsum';
        const processor = new ConditionalJsProcessor(
            getOptions(sandbox_options),
        );
        const {transformed_source} = await processor.process(source_test, file_context);
        expect(transformed_source).toBe(source_test);
        processor.release();
    });
    test('test open block', async () => {
        const source_test = `
        // @define TEST
        // @ifdef TEST
        console.log('test');
        // @endif
        // @ifndef TEST
        console.log('no test');
        `;
        const processor = new ConditionalJsProcessor(
            getOptions(sandbox_options),
        );
        await expect(processor.process(source_test, file_context)).rejects.toThrow('Conditional JS block was not closed');
        processor.release();
    });
    test('test source map', async () => {
        const source_test = source_test_template.replace(/%d/g, '3');
        const processor = new ConditionalJsProcessor(
            getOptions(sandbox_options),
        );
        const {transformed_map} = await processor.process(source_test, file_context);
        expect(transformed_map).toEqual({
            'file': null,
            'mappings': 'AAAA;AACA;AACA;AAEA;AAEA;AAQA;AAMA;AAEA;AACA;',
            'names': [],
            'sources': ['test.js'],
            'sourcesContent': [source_test],
            'version': 3,
        });
        processor.release();
    });
    test('test bad parser', async () => {
        const source_test = `
            "if";
        `;
        const options = getOptions(sandbox_options);
        // @ts-ignore
        options.parser.file_detect = /if/g;
        const processor = new ConditionalJsProcessor(options);
        const {transformed_source} = await processor.process(source_test, file_context);
        expect(transformed_source).toBe(source_test);
        processor.release();
    });
});

const source_test_template = `
// Standard comment

// @define VERSION %d

// @ifdef VERSION
const a = %d + 1;
/* 
    @elifdef(VERSION2)
*/
const a = %d + 2;
// @elifndef VERSION3
const a = %d + 3;
// @endif

// @if VERSION === 1
const b = 1;
// @elif VERSION === 2
const b = 2;
// @else
const b = 3;
// @endif

console.log({a, b});
`;

const source_test_results = [
    `
// Standard comment


const a = 0 + 1;

const b = 3;

console.log({a, b});
`,
    `
// Standard comment


const a = 1 + 1;

const b = 1;

console.log({a, b});
`,
    `
// Standard comment


const a = 2 + 1;

const b = 2;

console.log({a, b});
`,
];

const source_test_results_comment = [
    `
// Standard comment


const a = 0 + 1;
/* const a = 0 + 2; */
/* const a = 0 + 3; */

/* const b = 1; */
/* const b = 2; */
const b = 3;

console.log({a, b});
`,
    `
// Standard comment


const a = 1 + 1;
/* const a = 1 + 2; */
/* const a = 1 + 3; */

const b = 1;
/* const b = 2; */
/* const b = 3; */

console.log({a, b});
`,
    `
// Standard comment


const a = 2 + 1;
/* const a = 2 + 2; */
/* const a = 2 + 3; */

/* const b = 1; */
const b = 2;
/* const b = 3; */

console.log({a, b});
`,
];