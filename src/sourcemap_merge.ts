import remapping, {RawSourceMap} from '@ampproject/remapping';
import SourceMap from '@ampproject/remapping/dist/types/source-map';

export function sourceMapMerge(original: string | RawSourceMap, updated: string | RawSourceMap): SourceMap {
    return remapping([updated, original], () => null);
}