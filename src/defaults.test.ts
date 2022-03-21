import {PARSE_FLAVORS, ParseFlavor} from './defaults';

const AT_FLAVOR = PARSE_FLAVORS[ParseFlavor.at];

test('detect js conditional', () => {
    expect(AT_FLAVOR.file_detect.test(TEST_FILE)).toBe(true);
    expect(AT_FLAVOR.file_detect.test(TEST_BLOCK_FILE)).toBe(true);
    expect(AT_FLAVOR.file_detect.test('Lorem Ipsum')).toBe(false);
});

describe.each([
    ['@define identifier', AT_FLAVOR.define, ['identifier']],
    ['@define(identifier)', AT_FLAVOR.define, ['identifier']],
    ['@define(identifier)', AT_FLAVOR.define, ['identifier']],
    ['@define(\nidentifier)', AT_FLAVOR.define, ['identifier']],
    ['@define(identifier\n)', AT_FLAVOR.define, ['identifier']],
    ['@define(\nidentifier\n)', AT_FLAVOR.define, ['identifier']],
    ['@define( identifier )', AT_FLAVOR.define, ['identifier']],
    ['    @define    identifier', AT_FLAVOR.define, ['identifier']],
    ['@define identifier value', AT_FLAVOR.define, ['identifier', 'value']],
    ['@define(identifier,value)', AT_FLAVOR.define, ['identifier', 'value']],
    ['@define(identifier, value)', AT_FLAVOR.define, ['identifier', 'value']],
    ['@define(\nidentifier, value)', AT_FLAVOR.define, ['identifier', 'value']],
    ['@define(identifier,\n value)', AT_FLAVOR.define, ['identifier', 'value']],
    ['@define(identifier, value\n)', AT_FLAVOR.define, ['identifier', 'value']],
    ['@define(\nidentifier,\n value\n)', AT_FLAVOR.define, ['identifier', 'value']],
    ['@define( identifier , value )', AT_FLAVOR.define, ['identifier', 'value']],
    ['    @define    identifier    value', AT_FLAVOR.define, ['identifier', 'value']],
    ['@if identifier == value', AT_FLAVOR.if, ['identifier == value']],
    ['@if identifier', AT_FLAVOR.if, ['identifier']],
    ['@if(identifier)', AT_FLAVOR.if, ['identifier']],
    ['@if(\nidentifier)', AT_FLAVOR.if, ['identifier']],
    ['@if(identifier\n)', AT_FLAVOR.if, ['identifier']],
    ['@if(\nidentifier\n)', AT_FLAVOR.if, ['identifier']],
    ['@if( identifier )', AT_FLAVOR.if, ['identifier']],
    ['    @if    identifier == value    ', AT_FLAVOR.if, ['identifier == value']],
    ['@ifdef identifier', AT_FLAVOR.ifdef, ['identifier']],
    ['@ifdef(identifier)', AT_FLAVOR.ifdef, ['identifier']],
    ['@ifdef( identifier )', AT_FLAVOR.ifdef, ['identifier']],
    ['    @ifdef    identifier    ', AT_FLAVOR.ifdef, ['identifier']],
    ['@ifndef identifier', AT_FLAVOR.ifndef, ['identifier']],
    ['@ifndef(identifier)', AT_FLAVOR.ifndef, ['identifier']],
    ['@ifndef( identifier )', AT_FLAVOR.ifndef, ['identifier']],
    ['    @ifndef    identifier    ', AT_FLAVOR.ifndef, ['identifier']],
    ['@else', AT_FLAVOR.else, []],
    ['    @else    ', AT_FLAVOR.else, []],
    ['@elif identifier == value', AT_FLAVOR.elif, ['identifier == value']],
    ['@elif(identifier == value)', AT_FLAVOR.elif, ['identifier == value']],
    ['@elif(\nidentifier == value)', AT_FLAVOR.elif, ['identifier == value']],
    ['@elif(identifier == value\n)', AT_FLAVOR.elif, ['identifier == value']],
    ['@elif(\nidentifier == value\n)', AT_FLAVOR.elif, ['identifier == value']],
    ['@elif( identifier == value )', AT_FLAVOR.elif, ['identifier == value']],
    ['    @elif    identifier == value    ', AT_FLAVOR.elif, ['identifier == value']],
    ['@elifdef identifier', AT_FLAVOR.elifdef, ['identifier']],
    ['@elifdef(identifier)', AT_FLAVOR.elifdef, ['identifier']],
    ['@elifdef( identifier )', AT_FLAVOR.elifdef, ['identifier']],
    ['    @elifdef    identifier    ', AT_FLAVOR.elifdef, ['identifier']],
    ['@elifndef identifier', AT_FLAVOR.elifndef, ['identifier']],
    ['@elifndef(identifier)', AT_FLAVOR.elifndef, ['identifier']],
    ['@elifndef( identifier )', AT_FLAVOR.elifndef, ['identifier']],
    ['    @elifndef    identifier    ', AT_FLAVOR.elifndef, ['identifier']],
    ['@endif', AT_FLAVOR.endif, []],
    ['    @endif    ', AT_FLAVOR.endif, []],
])('%s', function (target, regex, expected) {
    test(`match ${JSON.stringify(expected)}`, () => {
        expect(regex.test(target.trim())).toBe(true);
        expect(regexMatches(regex.exec(target.trim()))).toStrictEqual(expected);
    });
});

describe.each([
    ['@define', AT_FLAVOR.define],
    ['@defineidentifier', AT_FLAVOR.define],
    ['@define(identifier,)', AT_FLAVOR.define],
    ['@define(identifier,', AT_FLAVOR.define],
    ['@if', AT_FLAVOR.if],
    ['@ifidentifier', AT_FLAVOR.if],
    ['@if(identifier,', AT_FLAVOR.if],
    ['@ifdef identifier identifier', AT_FLAVOR.ifdef],
    ['@ifdefidentifier', AT_FLAVOR.ifdef],
    ['@ifdef(identifier', AT_FLAVOR.ifdef],
    ['@ifndef identifier identifier', AT_FLAVOR.ifndef],
    ['@ifndefidentifier', AT_FLAVOR.ifndef],
    ['@ifndef(identifier', AT_FLAVOR.ifndef],
    ['@else identifier', AT_FLAVOR.else],
    ['@elseidentifier', AT_FLAVOR.else],
    ['@elif', AT_FLAVOR.elif],
    ['@elifidentifier', AT_FLAVOR.elif],
    ['@elif(identifier,', AT_FLAVOR.elif],
    ['@elifdef identifier identifier', AT_FLAVOR.elifdef],
    ['@elifdefidentifier', AT_FLAVOR.elifdef],
    ['@elifdef(identifier', AT_FLAVOR.elifdef],
    ['@elifndef identifier identifier', AT_FLAVOR.elifndef],
    ['@elifndefidentifier', AT_FLAVOR.elifndef],
    ['@elifndef(identifier', AT_FLAVOR.elifndef],
    ['@endif identifier', AT_FLAVOR.endif],
    ['@endifidentifier', AT_FLAVOR.endif],
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