import {ConditionalJSLoaderOptions, ProcessActions} from './options';

const DEFAULT_DETECT_FILE_REGEX = /^[^\S\r\n]*(?:\/\/|\/\*)[^\S\r\n]*@endif[^\S\r\n]*(?:\*\/)?$/mui;
const DEFAULT_DEFINE_REGEX = /^@define[^\S\r\n]+(\w+)(?:[^\S\r\n]+(.+))?$|^@define\(([^,]+)(?:,(.+))?\)$/mui;
const DEFAULT_IF_REGEX = /^@if\((.+)\)$|^@if[^\S\r\n]+(.+?)$/mui;
const DEFAULT_ELSE_REGEX = /^@else$/mui;
const DEFAULT_ELIF_REGEX = /^@elif\((.+)\)$|^@elif[^\S\r\n]+(.+?)$/mui;
const DEFAULT_IFDEF_REGEX = /^@ifdef\([^\S\r\n]*(\w+)[^\S\r\n]*\)$|^@ifdef[^\S\r\n]+(\w+?)$/mui;
const DEFAULT_IFNDEF_REGEX = /^@ifndef\([^\S\r\n]*(\w+)[^\S\r\n]*\)$|^@ifndef[^\S\r\n]+(\w+?)$/mui;
const DEFAULT_ELIFDEF_REGEX = /^@elifdef\([^\S\r\n]*(\w+)[^\S\r\n]*\)$|^@elifdef[^\S\r\n]+(\w+?)$/mui;
const DEFAULT_ELIFNDEF_REGEX = /^@elifndef\([^\S\r\n]*(\w+)[^\S\r\n]*\)$|^@elifndef[^\S\r\n]+(\w+?)$/mui;
const DEFAULT_ENDIF_REGEX = /^@endif$/mui;

export const DEEFAULT_MAKE_REGEX_PARSER_FN = (re: RegExp) => {
    return function(s: string) {
        const matches = re.exec(s);
        if (matches === null) {
            return undefined;
        }
        return matches.filter(Boolean);
    }
}

export const DEFAULT_OPTIONS: ConditionalJSLoaderOptions = {
    parser: {
        file_detect: DEFAULT_DETECT_FILE_REGEX,
        define: DEFAULT_DEFINE_REGEX,
        if: DEFAULT_IF_REGEX,
        else: DEFAULT_ELSE_REGEX,
        elif: DEFAULT_ELIF_REGEX,
        ifdef: DEFAULT_IFDEF_REGEX,
        ifndef: DEFAULT_IFNDEF_REGEX,
        elifdef: DEFAULT_ELIFDEF_REGEX,
        elifndef: DEFAULT_ELIFNDEF_REGEX,
        endif: DEFAULT_ENDIF_REGEX,
    },
    action: ProcessActions.remove,
    sandbox: {
        memory_limit: 128,
        timeout: 250,
    },
};

export {
    DEFAULT_DETECT_FILE_REGEX,
    DEFAULT_DEFINE_REGEX,
    DEFAULT_IF_REGEX,
    DEFAULT_ELSE_REGEX,
    DEFAULT_ELIF_REGEX,
    DEFAULT_IFDEF_REGEX,
    DEFAULT_IFNDEF_REGEX,
    DEFAULT_ELIFDEF_REGEX,
    DEFAULT_ELIFNDEF_REGEX,
    DEFAULT_ENDIF_REGEX,
};