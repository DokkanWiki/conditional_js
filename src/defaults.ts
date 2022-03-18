import {IConditionalJSLoaderOptions, ProcessAction} from './options';

/**
 *  TODO: Modify parentheses versions to allow multiline expressions
 */

export enum ParseFlavor {
    at = '@', hash = '#'
}

export const PARSE_FLAVORS = {
    [ParseFlavor.at]: {
        file_detect: /^[^\S\r\n]*(?:\/\/|\/\*)[^\S\r\n]*@endif[^\S\r\n]*(?:\*\/)?$/mui,
        define: /^@define[^\S\r\n]+(\w+)(?:[^\S\r\n]+(.+))?$|^@define\(([^,]+)(?:,(.+))?\)$/mui,
        if: /^@if\((.+)\)$|^@if[^\S\r\n]+(.+?)$/mui,
        else: /^@else$/mui,
        elif: /^@elif\((.+)\)$|^@elif[^\S\r\n]+(.+?)$/mui,
        ifdef: /^@ifdef\([^\S\r\n]*(\w+)[^\S\r\n]*\)$|^@ifdef[^\S\r\n]+(\w+?)$/mui,
        ifndef: /^@ifndef\([^\S\r\n]*(\w+)[^\S\r\n]*\)$|^@ifndef[^\S\r\n]+(\w+?)$/mui,
        elifdef: /^@elifdef\([^\S\r\n]*(\w+)[^\S\r\n]*\)$|^@elifdef[^\S\r\n]+(\w+?)$/mui,
        elifndef: /^@elifndef\([^\S\r\n]*(\w+)[^\S\r\n]*\)$|^@elifndef[^\S\r\n]+(\w+?)$/mui,
        endif: /^@endif$/mui,
    },
    [ParseFlavor.hash]: {
        file_detect: /^[^\S\r\n]*(?:\/\/|\/\*)[^\S\r\n]*#endif[^\S\r\n]*(?:\*\/)?$/mui,
        define: /^#define[^\S\r\n]+(\w+)(?:[^\S\r\n]+(.+))?$|^#define\(([^,]+)(?:,(.+))?\)$/mui,
        if: /^#if\((.+)\)$|^#if[^\S\r\n]+(.+?)$/mui,
        else: /^#else$/mui,
        elif: /^#elif\((.+)\)$|^#elif[^\S\r\n]+(.+?)$/mui,
        ifdef: /^#ifdef\([^\S\r\n]*(\w+)[^\S\r\n]*\)$|^#ifdef[^\S\r\n]+(\w+?)$/mui,
        ifndef: /^#ifndef\([^\S\r\n]*(\w+)[^\S\r\n]*\)$|^#ifndef[^\S\r\n]+(\w+?)$/mui,
        elifdef: /^#elifdef\([^\S\r\n]*(\w+)[^\S\r\n]*\)$|^#elifdef[^\S\r\n]+(\w+?)$/mui,
        elifndef: /^#elifndef\([^\S\r\n]*(\w+)[^\S\r\n]*\)$|^#elifndef[^\S\r\n]+(\w+?)$/mui,
        endif: /^#endif$/mui,
    },
};

export const DEFAULT_OPTIONS: IConditionalJSLoaderOptions = {
    parser: PARSE_FLAVORS[ParseFlavor.at],
    action: ProcessAction.remove,
    sandbox: {
        memory_limit: 128,
        timeout: 250,
    },
};