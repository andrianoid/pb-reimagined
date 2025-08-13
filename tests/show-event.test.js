import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import assert from 'node:assert';
import Ajv from 'ajv';

const schemaPath = join('schema', 'show-event.schema.json');
const schema = JSON.parse(readFileSync(schemaPath, 'utf8'));
const ajv = new Ajv({ allErrors: true, strict: false });
const validate = ajv.compile(schema);

const filePath = join('tests', 'fixtures', 'show-event-flow.jsonl');
const lines = readFileSync(filePath, 'utf8').trim().split('\n');

test('ShowEvent JSONL flow matches schema', () => {
  for (const [index, line] of lines.entries()) {
    const event = JSON.parse(line);
    const valid = validate(event);
    assert.ok(valid, `Line ${index + 1} failed validation: ${ajv.errorsText(validate.errors)}`);
  }
});
