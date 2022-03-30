import {Optional} from './utils';
import {DEFAULT_OPTIONS, PARSE_FLAVORS, ParseFlavor} from './defaults';

export enum ProcessAction {
    remove = 'remove', comment = 'comment'
}

export interface ISandboxOptions {
    memory_limit?: number,
    timeout?: number
}

/**
 * @callback TParseMethod
 * @param  {string} line        - Line to parse
 * @return {string[]|undefined} - Array of identifiers or expression strings
 */
export type TParseMethod = (line: string) => Optional<string[]>;

export type TParseMethodOption = string | RegExp | TParseMethod;

export interface IParseOptions {
    /**
     * Regex to detect if file has any conditionals to skip unnecessary parsing. No capture/return groups required.
     */
    file_detect: string | RegExp;
    /**
     * Regex or function to detect and parse #define. Must capture/return a single identifier; additionally capture/return optional assignment expression.
     */
    define: TParseMethodOption;
    /**
     * Regex or function to detect and parse #if. Must have 1 capture capture/return.
     */
    if: TParseMethodOption;
    /**
     * Regex or function to detect and parse #ifdef. Must capture/return a single identifier.
     */
    ifdef: TParseMethodOption;
    /**
     * Regex or function to detect and parse #ifndef. Must capture/return a single identifier.
     */
    ifndef: TParseMethodOption;
    /**
     * Regex or function to detect and parse #elif. Must have 1 capture/return group.
     */
    elif: TParseMethodOption;
    /**
     * Regex or function to detect and parse #else. No capture/return groups required.
     */
    else: TParseMethodOption;
    /**
     * Regex or function to detect and parse #elifdef. Must capture/return a single identifier.
     */
    elifdef: TParseMethodOption;
    /**
     * Regex or function to detect and parse #elifndef. Must capture/return a single identifier.
     */
    elifndef: TParseMethodOption;
    /**
     * Regex or function to detect and parse #endif. No capture/return groups required.
     */
    endif: TParseMethodOption;
    /**
     * Regex or function to detect and parse #undef. Much capture/return a single identifier
     */
    undef: TParseMethodOption;
    /**
     * Regex or function to detect and parse #error. Must have 1 capture/return group.
     */
    error: TParseMethodOption;
}

export interface IConditionalJSLoaderOptions {
    /**
     * Regular expressions used to parse conditional comment lines. Alternatively supply a key string for a particular parse flavor.
     *
     * Current supported flavors are:
     *  - `at` for `@`
     *  - `hash` for `#`
     */
    parser?: IParseOptions | ParseFlavor;
    /**
     * Action to perform on blocks removed by the conditional pre-processing.
     */
    action?: ProcessAction;
    /**
     * Global definitions used to execute conditional statements.
     */
    definitions?: {
        [k: string]: any
    };
    /**
     * Execute conditional code expressions in `isolate-vm`.
     */
    sandbox?: boolean | ISandboxOptions;
}

export interface INormalizedParseOptions {
    /**
     * Regex to detect if file has any conditionals to skip unnecessary parsing.
     */
    file_detect: RegExp;
    /**
     * Function to detect and parse #define. Must return a single identifier; additionally return optional assignment expression.
     */
    define: TParseMethod;
    /**
     * Function to detect and parse #if. Must return single string expression.
     */
    if: TParseMethod;
    /**
     * Function to detect and parse #ifdef. Must return single string expression.
     */
    ifdef: TParseMethod;
    /**
     * Function to detect and parse #ifndef. Must return single identifier.
     */
    ifndef: TParseMethod;
    /**
     * Function to detect and parse #elif. Must return single identifier.
     */
    elif: TParseMethod;
    /**
     * Function to detect and parse #else. Must return single string expression.
     */
    else: TParseMethod;
    /**
     * Function to detect and parse #elifdef. Must return single string expression.
     */
    elifdef: TParseMethod;
    /**
     * Function to detect and parse #elifndef. Must return a single identifier.
     */
    elifndef: TParseMethod;
    /**
     * Function to detect and parse #endif.
     */
    endif: TParseMethod;
    /**
     * Function to detect and parse #undef. Must return a single identifier.
     */
    undef: TParseMethod;
    /**
     * Function to detect and parse #error. Must return a single string expression.
     */
    error: TParseMethod;
}

export interface INormalizedConditionalJSLoaderOptions {
    /**
     * Functions used to parse conditional comment lines.
     */
    parser: INormalizedParseOptions;
    /**
     * Action to perform on blocks removed by the conditional pre-processing.
     */
    action: ProcessAction;
    /**
     * Global definitions used to execute conditional statements.
     */
    definitions: {
        [k: string]: any
    };
    /**
     * Execute conditional code expressions in `isolate-vm`.
     */
    sandbox: Optional<ISandboxOptions>;
}

const makeRegexParseFn = (re: RegExp) => {
    return function (s: string) {
        const matches = re.exec(s);
        if (matches === null) {
            return undefined;
        }
        return matches.filter(Boolean);
    };
};

export function normalizeOptions(options?: IConditionalJSLoaderOptions): INormalizedConditionalJSLoaderOptions {

    const makeParserOption = (opt: TParseMethodOption): TParseMethod => {
        if (typeof opt === 'string') {
            return makeRegexParseFn(
                new RegExp(opt, 'mui'),
            );
        } else if (opt instanceof RegExp) {
            return makeRegexParseFn(opt);
        } else if (typeof opt === 'function') {
            return opt;
        }
        throw new Error(`Invalid parsing option: expected string, RegExp, or function`);
    };

    if (typeof options === 'undefined') {
        options = DEFAULT_OPTIONS;
    }

    let sandbox_options: Optional<ISandboxOptions> = {
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

    let parser_options: IParseOptions;
    if (typeof options.parser === 'undefined') {
        parser_options = PARSE_FLAVORS[ParseFlavor.at];
    } else if (typeof options.parser === 'string') {
        parser_options = PARSE_FLAVORS[options.parser];
    } else {
        parser_options = options.parser;
    }

    return {
        parser: {
            file_detect: typeof parser_options.file_detect === 'string' ? new RegExp(parser_options.file_detect) : parser_options.file_detect,
            define: makeParserOption(parser_options.define),
            if: makeParserOption(parser_options.if),
            ifdef: makeParserOption(parser_options.ifdef),
            ifndef: makeParserOption(parser_options.ifndef),
            else: makeParserOption(parser_options.else),
            elif: makeParserOption(parser_options.elif),
            elifdef: makeParserOption(parser_options.elifdef),
            elifndef: makeParserOption(parser_options.elifndef),
            endif: makeParserOption(parser_options.endif),
            undef: makeParserOption(parser_options.undef),
            error: makeParserOption(parser_options.error),
        },
        action: options.action ?? ProcessAction.remove,
        definitions: options.definitions ?? {},
        sandbox: sandbox_options,
    };
}