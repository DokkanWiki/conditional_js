import {ISandboxOptions} from './options';
import {Context, Isolate} from 'isolated-vm';

export abstract class Executor {
    public abstract newContext(): Promise<void>;

    public abstract removeDefinition(key: string): Promise<void>;

    public abstract addDefinition(key: string, val: any): Promise<void>;

    public abstract exec(code: string, source_filename?: string, source_line?: number, source_column?: number): Promise<any>;

    public abstract release(): void;
}

export class EvalExecutor implements Executor {
    private readonly global_definitions: Map<string, any>;
    private definitions: Map<string, any>;

    constructor(global_definitions: Iterable<[string, any]> = []) {
        this.definitions = new Map(global_definitions);
        this.global_definitions = new Map(global_definitions);
    }

    public async newContext() {
        this.definitions.clear();
        this.definitions = new Map(this.global_definitions);
    }

    public async addDefinition(key: string, val: any) {
        this.definitions.set(key, val);
    }

    public async removeDefinition(key: string) {
        this.definitions.delete(key);
    }

    /**
     * @param {string} code
     * @param {string} source_filename
     * @param {number} source_line
     * @param {number} source_column
     * @returns {Promise<any>}
     */
    public async exec(code: string, source_filename?: string, source_line?: number, source_column?: number): Promise<any> {
        try {
            return Function(...this.definitions.keys(), `return (${code});`)(...this.definitions.values());
        } catch (e) {
            throw new EvalError(`${e.message} at [${source_filename ?? 'anonymous'}:${source_line ?? ''}:${source_column ?? ''}]`);
        }
    }

    release() {
    }
}

export class IsolatedVmExecutor implements Executor {
    private readonly global_definitions: Map<string, any>;
    private options: ISandboxOptions;
    private vm: Isolate;
    private vm_context: Context;

    constructor(global_definitions: Iterable<[string, any]> = [], options: ISandboxOptions) {
        const {Isolate} = require('isolated-vm');
        this.global_definitions = new Map(global_definitions);
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
        for (const [key, val] of this.global_definitions.entries()) {
            await this.vm_context.global.set(key, val);
        }
    }

    public async addDefinition(key: string, val: any) {
        if (!this.vm_context) {
            await this.newContext();
        }
        await this.vm_context.global.set(key, val);
    }

    public async removeDefinition(key: string) {
        if (!this.vm_context) {
            await this.newContext();
        }
        await this.vm_context.global.delete(key);
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