import {Executor} from './executor';
import {Optional} from './utils';
import {RawSourceMap, SourceMapConsumer} from 'source-map';
import {IParseMatch} from './options';

export enum StatementType {
    define, if, else, elif,
    ifdef, ifndef, elifdef, elifndef,
    endif, undef, error
}

export const STATEMENT_TEST_TYPES = [
    StatementType.ifdef,
    StatementType.ifndef,
    StatementType.elifdef,
    StatementType.elifndef,
];
export const STATEMENT_TEST_NEGATE_TYPES = [
    StatementType.ifndef,
    StatementType.elifndef,
];

export interface StatementLocation {
    filename?: string,
    line?: number,
    column?: number,
    map?: string | RawSourceMap
}

export class Statement {
    type: StatementType;
    params: IParseMatch[];
    location?: StatementLocation;
    value: Optional<boolean>;

    constructor(type: StatementType, params: IParseMatch[], location?: StatementLocation) {
        this.type = type;
        this.params = params;
        this.location = location;
    }

    async updateLocation() {
        if (this.location && this.location.map && this.location.line && this.location.column) {
            const smc = await new SourceMapConsumer(this.location.map);
            const {source, line, column} = smc.originalPositionFor({
                line: this.location.line,
                column: this.location.column
            });
            if (source) {
                this.location.filename = source;
            }
            if (line) {
                this.location.line = line;
            }
            if (column) {
                this.location.column = column;
            }
        }
    }

    async execute(executor: Executor): Promise<Optional<boolean>> {
        if (this.type === StatementType.define) {
            await executor.addDefinition(
                this.params[0].value.trim(),
                this.params.length === 1 ? true : JSON.parse(this.params[1].value.trim()),
            );
            this.value = undefined;
        } else if (this.type === StatementType.undef) {
            await executor.removeDefinition(this.params[0].value.trim());
            this.value = undefined;
        } else if (this.type === StatementType.error) {
            throw new EvalError(`Error directive: ${this.params[0].value.trim()} at [${this.location?.filename ?? 'anonymous'}:${this.location?.line ?? ''}:${this.location?.column ?? ''}]`);
        } else if (STATEMENT_TEST_TYPES.includes(this.type)) {
            const code = `typeof ${this.params[0].value.trim()} !== 'undefined'`;
            let result = !!await executor.exec(code);
            if (STATEMENT_TEST_NEGATE_TYPES.includes(this.type)) {
                result = !result;
            }
            this.value = result;
        } else {
            this.value = !!await executor.exec(
                this.params[0].value.trim(),
                this.location?.filename,
                this.location?.line,
                this.location?.column,
            );
        }
        return this.value;
    }

}

