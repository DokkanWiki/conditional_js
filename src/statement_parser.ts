import {ParserOptions} from './options';
import {Optional} from './utils';
import {Statement, StatementLocation, StatementType} from './statement';

export class StatementParser {
    private parser_options: ParserOptions;

    constructor(options: ParserOptions) {
        this.parser_options = options;
    }

    public parseString(s: string, location?: StatementLocation): Optional<Statement> {
        let matches;

        s = s.trim();

        if ((matches = this.parser_options.define(s)) !== undefined) {
            return new Statement(StatementType.define, matches.slice(1), location);
        }

        if ((matches = this.parser_options.if(s)) !== undefined) {
            return new Statement(StatementType.if, [matches[1]], location);
        }

        if (this.parser_options.else(s) !== undefined) {
            return new Statement(StatementType.else, [], location);
        }

        if ((matches = this.parser_options.elif(s)) !== undefined) {
            return new Statement(StatementType.elif, [matches[1]], location);
        }

        if ((matches = this.parser_options.ifdef(s)) !== undefined) {
            return new Statement(StatementType.ifdef, [matches[1]], location);
        }

        if ((matches = this.parser_options.ifndef(s)) !== undefined) {
            return new Statement(StatementType.ifndef, [matches[1]], location);
        }

        if ((matches = this.parser_options.elifdef(s)) !== undefined) {
            return new Statement(StatementType.elifdef, [matches[1]], location);
        }

        if ((matches = this.parser_options.elifndef(s)) !== undefined) {
            return new Statement(StatementType.elifndef, [matches[1]], location);
        }

        if (this.parser_options.endif(s) !== undefined) {
            return new Statement(StatementType.endif, [], location);
        }
    }
}