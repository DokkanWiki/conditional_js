import {structuredClone} from '../src/utils';

test('structuredClone polyfill', () => {
    expect(structuredClone({a: 1, b: {c: 2, d: {e: 3}}})).toStrictEqual({a: 1, b: {c: 2, d: {e: 3}}});
})