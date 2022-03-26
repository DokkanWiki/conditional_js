import {LoaderDefinitionFunction} from 'webpack';
import {IConditionalJSLoaderOptions} from './options';
import {ConditionalJsProcessor, IFileContext} from './processor';
import {RawSourceMap} from 'source-map';
import {Optional} from './utils';
import {DEFAULT_OPTIONS} from './defaults';
import * as OptionsSchema from './options.json';
import {JSONSchema7} from 'json-schema';

export const ConditionalJsLoader: LoaderDefinitionFunction<IConditionalJSLoaderOptions> = function (content, map, meta) {
    const loader_context = this;

    const options = Object.assign({}, DEFAULT_OPTIONS, loader_context.getOptions(OptionsSchema as JSONSchema7));

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