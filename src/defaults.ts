import {IConditionalJSLoaderOptions, ProcessAction} from './options';

export enum ParseFlavor {
    at = '@', hash = '#'
}

const PARSE_FLAVORS = Object.fromEntries(Object.values(ParseFlavor).map(v => {
    const mr = (r: string) => new RegExp(r.replace(/@/g, v), 'mui');
    return [
        v, {
            file_detect: mr(String.raw`^[^\S\r\n]*(?:\/\/|\/\*)[^\S\r\n]*@endif[^\S\r\n]*(?:\*\/)?$`),
            define: mr(String.raw`^@define[^\S\r\n]+(\w+?)(?:[^\S\r\n]+(.+?))?$|^@define\(([\w\s]+?)(?:,([\S\s]+?))?\)$`),
            if: mr(String.raw`^@if\(([\S\s]+?)\)$|^@if[^\S\r\n]+(.+?)$`),
            else: mr(String.raw`^@else$`),
            elif: mr(String.raw`^@elif\(([\S\s]+?)\)$|^@elif[^\S\r\n]+(.+?)$`),
            ifdef: mr(String.raw`^@ifdef\([^\S\r\n]*(\w+)[^\S\r\n]*\)$|^@ifdef[^\S\r\n]+(\w+?)$`),
            ifndef: mr(String.raw`^@ifndef\([^\S\r\n]*(\w+)[^\S\r\n]*\)$|^@ifndef[^\S\r\n]+(\w+?)$`),
            elifdef: mr(String.raw`^@elifdef\([^\S\r\n]*(\w+)[^\S\r\n]*\)$|^@elifdef[^\S\r\n]+(\w+?)$`),
            elifndef: mr(String.raw`^@elifndef\([^\S\r\n]*(\w+)[^\S\r\n]*\)$|^@elifndef[^\S\r\n]+(\w+?)$`),
            endif: mr(String.raw`^@endif$`),
        },
    ];
}));

export {PARSE_FLAVORS};

export const DEFAULT_OPTIONS: IConditionalJSLoaderOptions = {
    parser: PARSE_FLAVORS[ParseFlavor.at],
    action: ProcessAction.remove,
    sandbox: {
        memory_limit: 128,
        timeout: 250,
    },
};