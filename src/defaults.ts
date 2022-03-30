import {IConditionalJSLoaderOptions, ProcessAction} from './options';

export enum ParseFlavor {
    at = '@', hash = '#'
}

const PARSE_FLAVORS = Object.fromEntries(Object.values(ParseFlavor).map(v => {
    const mr = (r: string) => new RegExp(r.replace(/@/g, v), 'mui');
    return [
        v, {
            file_detect: mr(String.raw`@endif`),
            define: mr(String.raw`^@define[^\S\r\n]+(\w+?)(?:[^\S\r\n]+(.+?))?$|^@define\(([\w\s]+?)(?:,([\S\s]+?))?\)$`),
            if: mr(String.raw`^@if\(([\S\s]+?)\)$|^@if[^\S\r\n]+(.+?)$`),
            else: mr(String.raw`^@else$`),
            elif: mr(String.raw`^@elif\(([\S\s]+?)\)$|^@elif[^\S\r\n]+(.+?)$`),
            ifdef: mr(String.raw`^@ifdef\([^\S\r\n]*(\w+)[^\S\r\n]*\)$|^@ifdef[^\S\r\n]+(\w+?)$`),
            ifndef: mr(String.raw`^@ifndef\([^\S\r\n]*(\w+)[^\S\r\n]*\)$|^@ifndef[^\S\r\n]+(\w+?)$`),
            elifdef: mr(String.raw`^@elifdef\([^\S\r\n]*(\w+)[^\S\r\n]*\)$|^@elifdef[^\S\r\n]+(\w+?)$`),
            elifndef: mr(String.raw`^@elifndef\([^\S\r\n]*(\w+)[^\S\r\n]*\)$|^@elifndef[^\S\r\n]+(\w+?)$`),
            endif: mr(String.raw`^@endif$`),
            undef: mr(String.raw`^@undef\([^\S\r\n]*(\w+)[^\S\r\n]*\)$|^@undef[^\S\r\n]+(\w+?)$`),
            error: mr(String.raw`^@error\(([\S\s]+?)\)$|^@error[^\S\r\n]+(.+?)$`),
        },
    ];
}));

const DEFAULT_PARSE_OPTIONS = PARSE_FLAVORS[ParseFlavor.at];

const DEFAULT_ACTION = 'remove';

const DEFAULT_SANDBOX_OPTIONS = {
    memory_limit: 128,
    timeout: 250,
};

const DEFAULT_OPTIONS: IConditionalJSLoaderOptions = {
    parser: DEFAULT_PARSE_OPTIONS,
    action: DEFAULT_ACTION as ProcessAction,
    sandbox: DEFAULT_SANDBOX_OPTIONS,
};

export {PARSE_FLAVORS, DEFAULT_SANDBOX_OPTIONS, DEFAULT_ACTION, DEFAULT_OPTIONS};