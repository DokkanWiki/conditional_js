import {DEFAULT_OPTIONS} from './defaults';
import {ConditionalJsLoader} from './loader';

test('test loader success', done => {
    const callback = (err?: any, content?: any, sourceMap?: any, additionalData?: any) => {
        expect(err).toBe(null);
        expect(content).toBe(source_test_result);
        expect(sourceMap).toEqual({
            "file": null,
            "mappings": "AAAA;AACA;AACA;AAGA;AAEA;AAMA;AAEA;AAMA;AACA;",
            "names": [],
            "sources": [
                "test.js"
            ],
            "sourcesContent": [source_test],
            "version": 3
        });
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