import {Optional} from './utils';
import {DEEFAULT_MAKE_REGEX_PARSER_FN} from './defaults';

export enum ProcessActions {
    remove = 'remove', comment = 'comment'
}

export interface SandboxOptions {
    memory_limit?: number,
    timeout?: number
}

/**
 * @callback ParsingMethod
 * @param  {string} line        - Line to parse
 * @return {string[]|undefined} - Array of identifiers or expression strings
 */
export type ParsingMethod = (line: string) => Optional<string[]>;

export type ParsingMethodOption = string | RegExp | ParsingMethod;

export interface ConditionalJSLoaderOptions {
    /**
     * Regular expressions used to parse conditional comment lines.
     */
    parser: {
        /**
         * Regex to detect if file has any conditionals to skip unnecessary parsing. No capture/return groups required.
         */
        file_detect: string | RegExp;
        /**
         * Regex or function to detect and parse #define. Must capture/return a single identifier; additionally capture/return optional assignment expression.
         */
        define: ParsingMethodOption;
        /**
         * Regex or function to detect and parse #if. Must have 1 capture capture/return.
         */
        if: ParsingMethodOption;
        /**
         * Regex or function to detect and parse #ifdef. Must captucapture/returnre a single identifier.
         */
        ifdef: ParsingMethodOption;
        /**
         * Regex or function to detect and parse #ifndef. Must capture/return a single identifier.
         */
        ifndef: ParsingMethodOption;
        /**
         * Regex or function to detect and parse #elif. Must have 1 capture/return group.
         */
        elif: ParsingMethodOption;
        /**
         * Regex or function to detect and parse #else. No capture/return groups required.
         */
        else: ParsingMethodOption;
        /**
         * Regex or function to detect and parse #elifdef. Must capture/return a single identifier.
         */
        elifdef: ParsingMethodOption;
        /**
         * Regex or function to detect and parse #elifndef. Must capture/return a single identifier.
         */
        elifndef: ParsingMethodOption;
        /**
         * Regex or function to detect and parse #endif. No capture/return groups required.
         */
        endif: ParsingMethodOption;
    };
    /**
     * Action to perform on blocks removed by the conditional pre-processing.
     */
    action: ProcessActions;
    /**
     * Global definitions used to execute conditional statements.
     */
    defines?: {
        [k: string]: any
    };
    /**
     * Execute conditional code expressions in `isolate-vm`.
     */
    sandbox: boolean | SandboxOptions;
}

export interface ParserOptions {
    /**
     * Regex to detect if file has any conditionals to skip unnecessary parsing.
     */
    file_detect: RegExp;
    /**
     * Function to detect and parse #define. Must return a single identifier; additionally return optional assignment expression.
     */
    define: ParsingMethod;
    /**
     * Function to detect and parse #if. Must return single string expression.
     */
    if: ParsingMethod;
    /**
     * Function to detect and parse #ifdef. Must return single string expression.
     */
    ifdef: ParsingMethod;
    /**
     * Function to detect and parse #ifndef. Must return single identifier.
     */
    ifndef: ParsingMethod;
    /**
     * Function to detect and parse #elif. Must return single identifier.
     */
    elif: ParsingMethod;
    /**
     * Function to detect and parse #else. Must return single string expression.
     */
    else: ParsingMethod;
    /**
     * Function to detect and parse #elifdef. Must return single string expression.
     */
    elifdef: ParsingMethod;
    /**
     * Regex to detect and parse #elifndef. Must return a single identifier.
     */
    elifndef: ParsingMethod;
    /**
     * Regex to detect and parse #endif.
     */
    endif: ParsingMethod;
}

export interface ConditionalJSLoaderNormalizedOptions {
    /**
     * Functions used to parse conditional comment lines.
     */
    parser: ParserOptions;
    /**
     * Action to perform on blocks removed by the conditional pre-processing.
     */
    action: ProcessActions;
    /**
     * Global definitions used to execute conditional statements.
     */
    defines: {
        [k: string]: any
    };
    /**
     * Execute conditional code expressions in `isolate-vm`.
     */
    sandbox: Optional<SandboxOptions>;
}

export function normalizeOptions(options: ConditionalJSLoaderOptions): ConditionalJSLoaderNormalizedOptions {

    const makeParserOption = (opt: ParsingMethodOption): ParsingMethod => {
        if (typeof opt === 'string') {
            return DEEFAULT_MAKE_REGEX_PARSER_FN(
                new RegExp(opt, 'mui'),
            );
        } else if (opt instanceof RegExp) {
            return DEEFAULT_MAKE_REGEX_PARSER_FN(opt);
        } else if (typeof opt === 'function') {
            return opt;
        }
        throw new Error(`Invalid parsing option: expected string, RegExp, or function`);
    };

    let sandbox_options: Optional<SandboxOptions> = {
        memory_limit: 128,
        timeout: 10000,
    };

    if (typeof options.sandbox === 'boolean' || typeof options.sandbox === 'undefined') {
        if (!options.sandbox) {
            sandbox_options = undefined;
        }
    } else {
        sandbox_options.memory_limit = options.sandbox.memory_limit;
        sandbox_options.timeout = options.sandbox.timeout;
    }

    return {
        parser: {
            file_detect: typeof options.parser.file_detect === 'string' ? new RegExp(options.parser.file_detect) : options.parser.file_detect,
            define: makeParserOption(options.parser.define),
            if: makeParserOption(options.parser.if),
            ifdef: makeParserOption(options.parser.ifdef),
            ifndef: makeParserOption(options.parser.ifndef),
            else: makeParserOption(options.parser.else),
            elif: makeParserOption(options.parser.elif),
            elifdef: makeParserOption(options.parser.elifdef),
            elifndef: makeParserOption(options.parser.elifndef),
            endif: makeParserOption(options.parser.endif),
        },
        action: options.action,
        defines: options.defines ?? {},
        sandbox: sandbox_options,
    };
}