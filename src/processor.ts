import {RawSourceMap} from 'source-map';
import {IConditionalJSLoaderOptions, INormalizedConditionalJSLoaderOptions, normalizeOptions, ProcessAction} from './options';
import {Optional} from './utils';
import {parse, ParseResult} from '@babel/parser';
import MagicString from 'magic-string';
import {BlocksMatcher} from './blocks_matcher';
import {EvalExecutor, Executor, IsolatedVmExecutor} from './executor';
import {StatementType} from './statement';
import {StatementParser} from './statement_parser';
// @ts-ignore
import * as merge from 'merge-source-map';

export interface ProcessResult {
    transformed_source: string;
    transformed_map: Optional<string | RawSourceMap>;
    processor: ConditionalJsProcessor;
}

export interface IFileContext {
    file_name?: string;
    source_map?: string | RawSourceMap;
}

export class ConditionalJsProcessor {
    private options: INormalizedConditionalJSLoaderOptions;
    private readonly executor: Executor;
    private statement_parser: StatementParser;

    constructor(options?: IConditionalJSLoaderOptions) {
        this.options = normalizeOptions(options);
        if (typeof this.options.sandbox === 'undefined') {
            this.executor = new EvalExecutor(Object.entries(this.options.definitions));
        } else {
            this.executor = new IsolatedVmExecutor(Object.entries(this.options.definitions), this.options.sandbox);
        }
        this.statement_parser = new StatementParser(this.options.parser);
    }

    public release() {
        this.executor.release();
    }

    async process(source: string, context: IFileContext = {}): Promise<ProcessResult> {
        if (!this.options.parser.file_detect.test(source)) {
            return {
                processor: this,
                transformed_map: context.source_map,
                transformed_source: source,
            };
        }

        const ast: ParseResult<import('@babel/types').File> = parse(source, {
            sourceType: 'unambiguous',
            sourceFilename: context.file_name,
            errorRecovery: true,
            strictMode: false,
        });

        if (!ast.comments || !ast.comments.length) {
            return {
                processor: this,
                transformed_map: context.source_map,
                transformed_source: source,
            };
        }

        const s = new MagicString(source);

        const blocks = new BlocksMatcher();

        await this.executor.newContext();

        for (const comment of ast.comments) {
            const statement = this.statement_parser.parseString(
                comment.value, {
                    filename: context.file_name,
                    line: comment.loc.start.line,
                    column: comment.loc.start.column,
                    map: context.source_map
                },
            );

            if (!statement) {
                continue;
            }

            s.remove(comment.start, comment.end + 1);

            if (statement.type === StatementType.else) {
                blocks.add_else(comment);
                continue;
            } else if (statement.type === StatementType.endif) {
                blocks.close(comment);
                continue;
            } else if (blocks.current_block && !blocks.current_block.active) {
                if (statement.type === StatementType.error) {
                    continue;
                }
                if (statement.type === StatementType.define) {
                    continue;
                }
                if (statement.type === StatementType.undef) {
                    continue;
                }
            }

            await statement.updateLocation();

            const statement_result = await statement.execute(this.executor);

            if (typeof statement_result !== 'boolean') {
                continue;
            }

            switch (statement.type) {
                case StatementType.if:
                case StatementType.ifdef:
                case StatementType.ifndef:
                    blocks.add_if(comment, statement_result);
                    break;
                case StatementType.elif:
                case StatementType.elifdef:
                case StatementType.elifndef:
                    blocks.add_else_if(comment, statement_result);
                    break;
            }
        }

        if (!blocks.closed) {
            throw new Error('Conditional JS block was not closed');
        }

        for (const block of blocks.inactive_blocks) {
            if (block.end) {
                if (this.options.action === ProcessAction.remove) {
                    s.remove(block.start.end, block.end.start);
                } else if (this.options.action === ProcessAction.comment) {
                    for (const node of ast.program.body) {
                        if (node.start && node.end && node.start >= block.start.end && node.end <= block.end.start) {
                            s.overwrite(node.start, node.end, `/* ${s.original.slice(node.start, node.end)} */`);
                        }
                    }
                }
            }
        }

        let context_filename = context.file_name;
        if (typeof context.source_map === 'object' && context.source_map.hasOwnProperty('file')) {
            context_filename = context.source_map.file;
        }
        let transformed_map = s.generateMap({
            source: context_filename,
            includeContent: true,
        });

        if (context.source_map) {
            transformed_map = merge(context.source_map, transformed_map);
        }

        return {
            processor: this,
            transformed_map,
            transformed_source: s.toString(),
        };
    }
}