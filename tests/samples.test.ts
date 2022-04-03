import * as fs from 'fs';
import {ConditionalJsProcessor} from '../src';
import * as path from 'path';
import 'jest-extended';
// @ts-ignore
import {parse as vueParse} from 'vue/compiler-sfc';

let sample_index = 0;
while (fs.existsSync(path.resolve(__dirname, `./samples/${++sample_index}.input.js`))) {
    const input_path = path.resolve(__dirname, `./samples/${sample_index}.input.js`);
    const output_path = path.resolve(__dirname, `./samples/${sample_index}.output.js`);
    const context_path = path.resolve(__dirname, `./samples/${sample_index}.context.json`);
    const input_data = fs.readFileSync(input_path).toString();
    const expected_data = fs.readFileSync(output_path).toString();
    let context = {};
    if (fs.existsSync(context_path)) {
        context = JSON.parse(fs.readFileSync(context_path).toString());
    }
    const processor = new ConditionalJsProcessor({definitions: context});
    test(`sample test #${sample_index}`, async () => {
        const result = await processor.process(input_data, {file_name: input_path});
        expect(result.transformed_source).toEqualIgnoringWhitespace(expected_data);
    });
}

test(`vue-loader combine source maps`, async () => {
    const input_path = path.resolve(__dirname, `./samples/vue.input.vue`);
    const input_data = fs.readFileSync(input_path).toString();
    const vue_result = vueParse(input_data, {
        sourceMap: true,
        filename: input_path,
    });
    const processor = new ConditionalJsProcessor();
    // @ts-ignore
    const cjs_result = await processor.process(vue_result.descriptor.script.content, {
        file_name: vue_result.descriptor.filename,
        // @ts-ignore
        source_map: vue_result.descriptor.script.map
    });
    // TODO: Test source map by parsing and colocating
    expect(cjs_result.transformed_map).toBeTruthy();
});

test(`vue-loader proper error lines from prior source map`, async () => {
    const input_path = path.resolve(__dirname, `./samples/vue2.input.vue`);
    const input_data = fs.readFileSync(input_path).toString();
    const vue_result = vueParse(input_data, {
        sourceMap: true,
        filename: input_path,
    });
    const processor = new ConditionalJsProcessor();
    // @ts-ignore
    await expect(processor.process(vue_result.descriptor.script.content, {
        file_name: vue_result.descriptor.filename,
        // @ts-ignore
        source_map: vue_result.descriptor.script.map
    })).rejects.toThrow(`Unexpected identifier [${input_path}:29:14]`);
});