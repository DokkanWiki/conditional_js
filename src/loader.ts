import {LoaderDefinitionFunction} from 'webpack';
import {ConditionalJSLoaderOptions} from './options';
import {ConditionalJsProcessor, IFileContext} from './processor';
import {RawSourceMap} from 'source-map';
import {Optional} from './utils';
import {DEFAULT_OPTIONS} from './defaults';

export const ConditionalJsLoader: LoaderDefinitionFunction<ConditionalJSLoaderOptions> = function (content, map, meta) {
    const loader_context = this;

    const options = Object.assign({}, DEFAULT_OPTIONS, loader_context.getOptions());

    const callback = loader_context.async();

    const processor = new ConditionalJsProcessor(options);

    const context: IFileContext = {
        file_name: loader_context.resourcePath,
        source_map: map as Optional<string | RawSourceMap>,
    };

    processor.process(content, context).then(({transformed_source, transformed_map}) => {
        callback(null, transformed_source, transformed_map, meta);
        processor.release();
    }).catch(err => {
        callback(err, content, map, meta);
        processor.release();
    });
};