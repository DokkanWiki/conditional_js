import {StatementLocation, StatementType} from '../src/statement';
import {DEFAULT_OPTIONS} from '../src/defaults';
import {normalizeOptions} from '../src/options';
import {StatementParser} from '../src/statement_parser';

const default_options = normalizeOptions(DEFAULT_OPTIONS);

describe.each([
    ['@define identifier', StatementType.define, ['identifier']],
    ['@if identifier', StatementType.if, ['identifier']],
    ['@ifdef identifier', StatementType.ifdef, ['identifier']],
    ['@ifndef identifier', StatementType.ifndef, ['identifier']],
    ['@else', StatementType.else, []],
    ['@elif identifier', StatementType.elif, ['identifier']],
    ['@elifdef identifier', StatementType.elifdef, ['identifier']],
    ['@elifndef identifier', StatementType.elifndef, ['identifier']],
    ['@endif', StatementType.endif, []],
])('%s', (line, result_type, result_params) => {
    test(`match [${result_type}, ${JSON.stringify(result_params)}`, async () => {
        const parser = new StatementParser(default_options.parser);
        const location: StatementLocation = {
            filename: 'test.js',
            line: Math.ceil(Math.random() * 100),
            column: Math.ceil(Math.random() * 100),
        };
        expect(parser.parseString(line, location)).toEqual({
            type: result_type,
            params: result_params,
            location: location,
        });
    });
});