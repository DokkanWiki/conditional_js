import {DEFAULT_OPTIONS} from '../../src/defaults';
import {ConditionalJsLoader} from '../../src/loader';
import {locationOfStr, searchInMap} from '../__utils__/utils';

test('test loader success', done => {
    const test_file_name = 'test.js';
    const callback = async (err?: any, content?: any, sourceMap?: any, additionalData?: any) => {
        expect(err).toBe(null);
        expect(content).toBe(source_test_result);
        const lookup_str = 'const b = 1;';
        const original_position = locationOfStr(source_test, lookup_str)
        const cjs_result = {transformed_source: content, transformed_map: sourceMap};
        // @ts-ignore
        expect(await searchInMap(cjs_result, lookup_str)).toStrictEqual({
            column: original_position.column,
            line: original_position.line,
            name: null,
            source: test_file_name,
        });
        expect(additionalData).toBeUndefined();
        done();
    };
    ConditionalJsLoader.bind({
        resourcePath: test_file_name,
        getOptions() {
            return DEFAULT_OPTIONS;
        },
        async() {
            return callback;
        },
    })(source_test);
});

test('test loader failure', done => {
    const callback = (err?: any, content?: any, sourceMap?: any, additionalData?: any) => {
        expect(err).toStrictEqual(new Error('Conditional JS block was not closed'));
        expect(content).toBe(source_test_failed);
        expect(sourceMap).toBeUndefined();
        expect(additionalData).toBeUndefined();
        done();
    };
    ConditionalJsLoader.bind({
        resourcePath: 'test.js',
        getOptions() {
            return DEFAULT_OPTIONS;
        },
        async() {
            return callback;
        },
    })(source_test_failed);
});

const source_test = `
// Standard comment

// @define VERSION 1
// @define VERSION2 2

// @ifdef VERSION
const a = 1 + 1;
// @elifdef VERSION2
const a = 1 + 2;
// @elifndef VERSION3
const a = 1 + 3;
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

const source_test_result = `
// Standard comment


const a = 1 + 1;

const b = 1;

console.log({a, b});
`;

const source_test_failed = `
// @if 1==1
// @else
// @endif
// @if 2==2
`;