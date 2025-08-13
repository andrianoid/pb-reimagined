import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import assert from 'node:assert';
import Ajv from 'ajv/dist/2020.js';

const schemaPath = join('schema', 'show-event.schema.json');
const schema = JSON.parse(readFileSync(schemaPath, 'utf8'));
const ajv = new Ajv({ allErrors: true, strict: false });
const validate = ajv.compile(schema);

const jsonlDirs = [join('tests', 'fixtures'), 'examples'];

for (const dir of jsonlDirs) {
  const files = readdirSync(dir).filter((f) => f.endsWith('.jsonl'));
  for (const file of files) {
    const filePath = join(dir, file);
    const lines = readFileSync(filePath, 'utf8').trim().split('\n');

    test(`ShowEvent JSONL flow matches schema: ${filePath}`, () => {
      for (const [index, line] of lines.entries()) {
        const event = JSON.parse(line);
        const valid = validate(event);
        assert.ok(
          valid,
          `Line ${index + 1} in ${filePath} failed validation: ${ajv.errorsText(validate.errors)}`
        );
      }
    });
  }
}
