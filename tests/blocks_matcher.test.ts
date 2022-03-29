import {BlocksMatcher} from '../src/blocks_matcher';
import {Comment} from '@babel/types';
import {parse} from '@babel/parser';

test('test 4 sequential block additions', () => {
    const matcher = new BlocksMatcher();

    for (let i = 0; i < 4; i++) {
        matcher.add_if(BLOCK_START, true);

        expect(matcher.closed).toBe(false);

        matcher.close(BLOCK_END);

        expect(matcher.closed).toBe(true);
    }

    expect(matcher.last_block?.start).toEqual(BLOCK_START);
    expect(matcher.last_block?.end).toEqual(BLOCK_END);

    expect([...matcher.inactive_blocks]).toHaveLength(0);
});

test('test 4 deep nested block additions', () => {
    const matcher = new BlocksMatcher();

    for (let i = 0; i < 4; i++) {
        matcher.add_if(BLOCK_START, true);

        expect(matcher.closed).toBe(false);
    }
    matcher.close(BLOCK_END);
    matcher.close(BLOCK_END);
    matcher.close(BLOCK_END);
    matcher.close(BLOCK_END);

    expect(matcher.closed).toBe(true);

    expect([...matcher.inactive_blocks]).toHaveLength(0);
});

test('test 2 inactive 2 active sequential blocks', () => {
    const matcher = new BlocksMatcher();

    for (let i = 0; i < 4; i++) {
        matcher.add_if(BLOCK_START, i % 2 === 0);

        expect(matcher.closed).toBe(false);

        matcher.close(BLOCK_END);

        expect(matcher.closed).toBe(true);
    }

    expect(matcher.last_block?.start).toEqual(BLOCK_START);
    expect(matcher.last_block?.end).toEqual(BLOCK_END);

    const inactive_blocks = [...matcher.inactive_blocks];
    expect(inactive_blocks).toHaveLength(2);
    expect(inactive_blocks[0].active).toBe(false);
    expect(inactive_blocks[1].active).toBe(false);
});

test('test no blocks', () => {
    const matcher = new BlocksMatcher();

    expect(matcher.closed).toBe(true);

    expect(matcher.last_block).toBeUndefined();

    expect(() => matcher.close(BLOCK_END)).toThrow('no blocks available to close');

    expect([...matcher.inactive_blocks]).toHaveLength(0);
});

test('test double close', () => {
    const matcher = new BlocksMatcher();

    matcher.add_if(BLOCK_START, false);

    matcher.close(BLOCK_END);

    expect(() => matcher.close(BLOCK_END)).toThrow('all blocks already closed');
});

test('test else is not active', () => {
    const matcher = new BlocksMatcher();

    matcher.add_if(BLOCK_START, true);
    matcher.add_else(BLOCK_ELSE);
    matcher.close(BLOCK_END);

    expect(matcher.closed).toBe(true);

    const inactive_blocks = [...matcher.inactive_blocks];
    expect(inactive_blocks).toHaveLength(1);
    expect(inactive_blocks[0].start).toBe(BLOCK_ELSE);
    expect(inactive_blocks[0].end).toBe(BLOCK_END);
});

test('test else is active', () => {
    const matcher = new BlocksMatcher();

    matcher.add_if(BLOCK_START, false);
    matcher.add_else(BLOCK_ELSE);
    matcher.close(BLOCK_END);

    expect(matcher.closed).toBe(true);

    const inactive_blocks = [...matcher.inactive_blocks];
    expect(inactive_blocks).toHaveLength(1);
    expect(inactive_blocks[0].start).toBe(BLOCK_START);
    expect(inactive_blocks[0].end).toBe(BLOCK_ELSE);
});

test('test else if, if block active', () => {
    const matcher = new BlocksMatcher();

    matcher.add_if(BLOCK_START, true);
    matcher.add_else_if(BLOCK_ELIF_FALSE, false);
    matcher.add_else(BLOCK_ELSE);
    matcher.close(BLOCK_END);

    expect(matcher.closed).toBe(true);

    const inactive_blocks = [...matcher.inactive_blocks];
    expect(inactive_blocks).toHaveLength(2);
    expect(inactive_blocks[0].start).toBe(BLOCK_ELIF_FALSE);
    expect(inactive_blocks[0].end).toBe(BLOCK_ELSE);
    expect(inactive_blocks[1].start).toBe(BLOCK_ELSE);
    expect(inactive_blocks[1].end).toBe(BLOCK_END);
});

test('test else if, elif block active', () => {
    const matcher = new BlocksMatcher();

    matcher.add_if(BLOCK_START, false);
    matcher.add_else_if(BLOCK_ELIF_TRUE, true);
    matcher.add_else(BLOCK_ELSE);
    matcher.close(BLOCK_END);

    expect(matcher.closed).toBe(true);

    const inactive_blocks = [...matcher.inactive_blocks];
    expect(inactive_blocks).toHaveLength(2);
    expect(inactive_blocks[0].start).toBe(BLOCK_START);
    expect(inactive_blocks[0].end).toBe(BLOCK_ELIF_TRUE);
    expect(inactive_blocks[1].start).toBe(BLOCK_ELSE);
    expect(inactive_blocks[1].end).toBe(BLOCK_END);
});

test('test else if, else block active', () => {
    const matcher = new BlocksMatcher();

    matcher.add_if(BLOCK_START, false);
    matcher.add_else_if(BLOCK_ELIF_FALSE, false);
    matcher.add_else(BLOCK_ELSE);
    matcher.close(BLOCK_END);

    expect(matcher.closed).toBe(true);

    const inactive_blocks = [...matcher.inactive_blocks];
    expect(inactive_blocks).toHaveLength(2);
    expect(inactive_blocks[0].start).toBe(BLOCK_START);
    expect(inactive_blocks[0].end).toBe(BLOCK_ELIF_FALSE);
    expect(inactive_blocks[1].start).toBe(BLOCK_ELIF_FALSE);
    expect(inactive_blocks[1].end).toBe(BLOCK_ELSE);
});

test('test multiple active else if', () => {
    const matcher = new BlocksMatcher();

    matcher.add_if(BLOCK_START, false);
    matcher.add_else_if(BLOCK_ELIF_TRUE, true);
    matcher.add_else_if(BLOCK_ELIF_TRUE, true);
    matcher.add_else(BLOCK_ELSE);
    matcher.close(BLOCK_END);

    expect(matcher.closed).toBe(true);

    const inactive_blocks = [...matcher.inactive_blocks];
    expect(inactive_blocks).toHaveLength(3);
    expect(inactive_blocks[0].start).toBe(BLOCK_START);
    expect(inactive_blocks[0].end).toBe(BLOCK_ELIF_TRUE);
    expect(inactive_blocks[1].start).toBe(BLOCK_ELIF_TRUE);
    expect(inactive_blocks[1].end).toBe(BLOCK_ELSE);
    expect(inactive_blocks[2].start).toBe(BLOCK_ELSE);
    expect(inactive_blocks[2].end).toBe(BLOCK_END);
});

test('test else if on no block', () => {
    const matcher = new BlocksMatcher();

    matcher.add_if(BLOCK_START, false);
    matcher.close(BLOCK_END);
    expect(
        () => matcher.add_else_if(BLOCK_ELIF_FALSE, false),
    ).toThrow('else if block has no matching if block');
});

test('test else if after else', () => {
    const matcher = new BlocksMatcher();

    matcher.add_if(BLOCK_START, false);
    matcher.add_else(BLOCK_ELSE);
    expect(
        () => matcher.add_else_if(BLOCK_ELIF_FALSE, false),
    ).toThrow('else if block cannot follow else block');
});

test('test else on no block', () => {
    const matcher = new BlocksMatcher();

    matcher.add_if(BLOCK_START, false);
    matcher.close(BLOCK_END);
    expect(
        () => matcher.add_else(BLOCK_ELSE),
    ).toThrow('else block has no matching if block');
});

test('test else after else', () => {
    const matcher = new BlocksMatcher();

    matcher.add_if(BLOCK_START, false);
    matcher.add_else(BLOCK_ELSE);
    expect(
        () => matcher.add_else(BLOCK_ELSE),
    ).toThrow('else block cannot follow else block');
});

const TEST_FILE = `
    // @ifdef false
    // @elif false
    // @elif true
    // @else
    // @endif
`;

const [
    BLOCK_START,
    BLOCK_ELIF_FALSE,
    BLOCK_ELIF_TRUE,
    BLOCK_ELSE,
    BLOCK_END,
] = parse(TEST_FILE).comments as Comment[];