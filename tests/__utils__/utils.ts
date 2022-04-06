import {MappedPosition, SourceMapConsumer} from 'source-map';
import {Optional} from '../../src/utils';
import {ProcessResult} from '../../src/processor';

export const locationOfStr = (haystack: string, needle: string) => {
    return haystack.split(/\r\n|[\r\n]/)
    .map(l => l.indexOf(needle))
    .reduce((pv, cv, idx) => {
        return cv >= 0 ? {line: idx + 1, column: cv + 1} : pv;
    }, {line: -1, column: -1});
};

export const searchInMap = async (cjs_result: ProcessResult, search_for: string): Promise<Optional<MappedPosition>> => {
    const transformed_position = locationOfStr(cjs_result.transformed_source, search_for);

    // @ts-ignore
    const smc = await new SourceMapConsumer(cjs_result.transformed_map);

    let result = smc.originalPositionFor(
        Object.assign({}, transformed_position, {bias: SourceMapConsumer.LEAST_UPPER_BOUND}),
    );

    if (result.line === null) {
        result = smc.originalPositionFor(
            Object.assign({}, transformed_position, {bias: SourceMapConsumer.GREATEST_LOWER_BOUND}),
        );
    }

    if (result.line === null) {
        return undefined;
    }

    return result as MappedPosition;
};