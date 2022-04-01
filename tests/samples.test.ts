import * as fs from 'fs';
import {ConditionalJsProcessor} from '../src';
import * as path from 'path';
import 'jest-extended';

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