import {SandboxOptions} from './options';
import {Context, Isolate} from 'isolated-vm';

export abstract class Executor {
    public abstract newContext(): Promise<void>;

    public abstract addDefine(key: string, val: any): Promise<void>;

    public abstract exec(code: string, source_filename?: string, source_line?: number, source_column?: number): Promise<any>;

    public abstract release(): void;
}

export class EvalExecutor implements Executor {
    private readonly default_defines: Map<string, any>;
    private defines: Map<string, any>;

    constructor(default_defines: Iterable<[string, any]> = []) {
        this.defines = new Map(default_defines);
        this.default_defines = new Map(default_defines);
    }

    public async newContext() {
        this.defines.clear();
        this.defines = new Map(this.default_defines);
    }

    public async addDefine(key: string, val: any) {
        this.defines.set(key, val);
    }

    /**
     * TODO: Pass definitions as named arguments instead of defining them in scope
     *
     * @param {string} code
     * @param {string} source_filename
     * @param {number} source_line
     * @param {number} source_column
     * @returns {Promise<any>}
     */
    public async exec(code: string, source_filename?: string, source_line?: number, source_column?: number): Promise<any> {
        const lines = ['"use strict";'];
        for (const [key, val] of this.defines.entries()) {
            if (typeof val === 'string') {
                lines.push(`var ${key} = ${JSON.stringify(val)};`);
            } else {
                lines.push(`var ${key} = ${val};`);
            }
        }
        lines.push(`return (${code});`);
        try {
            return Function(lines.join('\n'))();
        } catch (e) {
            throw new EvalError(`${e.message} at [${source_filename ?? 'anonymous'}:${source_line}:${source_column}]`);
        }
    }

    release() {
    }
}

export class IsolatedVmExecutor implements Executor {
    private readonly default_defines: Map<string, any>;
    private options: SandboxOptions;
    private vm: Isolate;
    private vm_context: Context;

    constructor(default_defines: Iterable<[string, any]> = [], options: SandboxOptions) {
        const {Isolate} = require('isolated-vm');
        this.default_defines = new Map(default_defines);
        this.options = options;
        this.vm = new Isolate({
            memoryLimit: options.memory_limit,
        });
    }

    public async newContext() {
        if (this.vm_context) {
            this.vm_context.release();
        }
        this.vm_context = await this.vm.createContext();
        for (const [key, val] of this.default_defines.entries()) {
            await this.vm_context.global.set(key, val);
        }
    }

    public async addDefine(key: string, val: any) {
        if (!this.vm_context) {
            await this.newContext();
        }
        await this.vm_context.global.set(key, val);
    }

    public async exec(code: string, source_filename?: string, source_line?: number, source_column?: number): Promise<any> {
        if (!this.vm_context) {
            await this.newContext();
        }
        return this.vm_context.eval(code, {
            timeout: this.options.timeout,
            filename: source_filename,
            lineOffset: source_line ? source_line - 1 : undefined,
            columnOffset: source_column ? source_column - 1 : undefined,
        });
    }

    release() {
        if (this.vm_context) {
            this.vm_context.release();
        }
        this.vm.dispose();
    }

}