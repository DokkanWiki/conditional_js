import {
    DEFAULT_DEFINE_REGEX,
    DEFAULT_DETECT_FILE_REGEX,
    DEFAULT_ELIF_REGEX,
    DEFAULT_ELIFDEF_REGEX,
    DEFAULT_ELIFNDEF_REGEX,
    DEFAULT_ELSE_REGEX,
    DEFAULT_ENDIF_REGEX,
    DEFAULT_IF_REGEX,
    DEFAULT_IFDEF_REGEX,
    DEFAULT_IFNDEF_REGEX,
} from './defaults';

test('detect js conditional', () => {
    expect(DEFAULT_DETECT_FILE_REGEX.test(TEST_FILE)).toBe(true);
    expect(DEFAULT_DETECT_FILE_REGEX.test(TEST_BLOCK_FILE)).toBe(true);
    expect(DEFAULT_DETECT_FILE_REGEX.test('Lorem Ipsum')).toBe(false);
});

describe.each([
    ['@define identifier', DEFAULT_DEFINE_REGEX, ['identifier']],
    ['@define(identifier)', DEFAULT_DEFINE_REGEX, ['identifier']],
    ['@define(identifier)', DEFAULT_DEFINE_REGEX, ['identifier']],
    ['@define( identifier )', DEFAULT_DEFINE_REGEX, ['identifier']],
    ['    @define    identifier', DEFAULT_DEFINE_REGEX, ['identifier']],
    ['@define identifier value', DEFAULT_DEFINE_REGEX, ['identifier', 'value']],
    ['@define(identifier,value)', DEFAULT_DEFINE_REGEX, ['identifier', 'value']],
    ['@define(identifier, value)', DEFAULT_DEFINE_REGEX, ['identifier', 'value']],
    ['@define( identifier , value )', DEFAULT_DEFINE_REGEX, ['identifier', 'value']],
    ['    @define    identifier    value', DEFAULT_DEFINE_REGEX, ['identifier', 'value']],
    ['@if identifier == value', DEFAULT_IF_REGEX, ['identifier == value']],
    ['@if identifier', DEFAULT_IF_REGEX, ['identifier']],
    ['@if(identifier)', DEFAULT_IF_REGEX, ['identifier']],
    ['@if( identifier )', DEFAULT_IF_REGEX, ['identifier']],
    ['    @if    identifier == value    ', DEFAULT_IF_REGEX, ['identifier == value']],
    ['@ifdef identifier', DEFAULT_IFDEF_REGEX, ['identifier']],
    ['@ifdef(identifier)', DEFAULT_IFDEF_REGEX, ['identifier']],
    ['@ifdef( identifier )', DEFAULT_IFDEF_REGEX, ['identifier']],
    ['    @ifdef    identifier    ', DEFAULT_IFDEF_REGEX, ['identifier']],
    ['@ifndef identifier', DEFAULT_IFNDEF_REGEX, ['identifier']],
    ['@ifndef(identifier)', DEFAULT_IFNDEF_REGEX, ['identifier']],
    ['@ifndef( identifier )', DEFAULT_IFNDEF_REGEX, ['identifier']],
    ['    @ifndef    identifier    ', DEFAULT_IFNDEF_REGEX, ['identifier']],
    ['@else', DEFAULT_ELSE_REGEX, []],
    ['    @else    ', DEFAULT_ELSE_REGEX, []],
    ['@elif identifier == value', DEFAULT_ELIF_REGEX, ['identifier == value']],
    ['@elif(identifier == value)', DEFAULT_ELIF_REGEX, ['identifier == value']],
    ['@elif( identifier == value )', DEFAULT_ELIF_REGEX, ['identifier == value']],
    ['    @elif    identifier == value    ', DEFAULT_ELIF_REGEX, ['identifier == value']],
    ['@elifdef identifier', DEFAULT_ELIFDEF_REGEX, ['identifier']],
    ['@elifdef(identifier)', DEFAULT_ELIFDEF_REGEX, ['identifier']],
    ['@elifdef( identifier )', DEFAULT_ELIFDEF_REGEX, ['identifier']],
    ['    @elifdef    identifier    ', DEFAULT_ELIFDEF_REGEX, ['identifier']],
    ['@elifndef identifier', DEFAULT_ELIFNDEF_REGEX, ['identifier']],
    ['@elifndef(identifier)', DEFAULT_ELIFNDEF_REGEX, ['identifier']],
    ['@elifndef( identifier )', DEFAULT_ELIFNDEF_REGEX, ['identifier']],
    ['    @elifndef    identifier    ', DEFAULT_ELIFNDEF_REGEX, ['identifier']],
    ['@endif', DEFAULT_ENDIF_REGEX, []],
    ['    @endif    ', DEFAULT_ENDIF_REGEX, []],
])('%s', function (target, regex, expected) {
    test(`match ${JSON.stringify(expected)}`, () => {
        expect(regex.test(target.trim())).toBe(true);
        expect(regexMatches(regex.exec(target.trim()))).toStrictEqual(expected);
    });
});

describe.each([
    ['@define', DEFAULT_DEFINE_REGEX],
    ['@defineidentifier', DEFAULT_DEFINE_REGEX],
    ['@define(identifier,)', DEFAULT_DEFINE_REGEX],
    ['@define(identifier,', DEFAULT_DEFINE_REGEX],
    ['@if', DEFAULT_IF_REGEX],
    ['@ifidentifier', DEFAULT_IF_REGEX],
    ['@if(identifier,', DEFAULT_IF_REGEX],
    ['@ifdef identifier identifier', DEFAULT_IFDEF_REGEX],
    ['@ifdefidentifier', DEFAULT_IFDEF_REGEX],
    ['@ifdef(identifier', DEFAULT_IFDEF_REGEX],
    ['@ifndef identifier identifier', DEFAULT_IFNDEF_REGEX],
    ['@ifndefidentifier', DEFAULT_IFNDEF_REGEX],
    ['@ifndef(identifier', DEFAULT_IFNDEF_REGEX],
    ['@else identifier', DEFAULT_ELSE_REGEX],
    ['@elseidentifier', DEFAULT_ELSE_REGEX],
    ['@elif', DEFAULT_ELIF_REGEX],
    ['@elifidentifier', DEFAULT_ELIF_REGEX],
    ['@elif(identifier,', DEFAULT_ELIF_REGEX],
    ['@elifdef identifier identifier', DEFAULT_ELIFDEF_REGEX],
    ['@elifdefidentifier', DEFAULT_ELIFDEF_REGEX],
    ['@elifdef(identifier', DEFAULT_ELIFDEF_REGEX],
    ['@elifndef identifier identifier', DEFAULT_ELIFNDEF_REGEX],
    ['@elifndefidentifier', DEFAULT_ELIFNDEF_REGEX],
    ['@elifndef(identifier', DEFAULT_ELIFNDEF_REGEX],
    ['@endif identifier', DEFAULT_ENDIF_REGEX],
    ['@endifidentifier', DEFAULT_ENDIF_REGEX],
])('%s', function (target, regex) {
    test(`not match ${regex.source}`, () => {
        expect(regex.test(target.trim())).toBe(false);
    });
});

const TEST_FILE = `
    // @define identifier value
    
    // @if conditional == value
    // @else
    // @endif
    
    // @ifdef conditional
    // @elif conditional == value
    // @elifdef conditional
    // @elifndef conditional
    // @endif
    
    // @ifndef conditional
    // @endif
`;

const TEST_BLOCK_FILE = `
    /* @define identifier value */
    
    /* @if conditional == value */
    /* @else */
    /* @endif */
    
    /* @ifdef conditional */
    /* @elif conditional == value */
    /* @elifdef conditional */
    /* @elifndef conditional */
    /* @endif */
    
    /* @ifndef conditional */
    /* @endif */
`;

const regexMatches = (matches: RegExpExecArray | null): Array<string> => {
    if (matches === null) {
        return [];
    }
    return matches.filter(Boolean).map(s => s.trim()).slice(1);
};