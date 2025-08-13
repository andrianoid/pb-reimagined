import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import Ajv from 'ajv/dist/2020.js';

describe('JSONL flow validation', () => {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const rootDir = join(__dirname, '..', '..');
  const ajv = new Ajv({ allErrors: true, strict: false });
  const showEventSchema = JSON.parse(readFileSync(join(rootDir, 'schema', 'show-event.schema.json'), 'utf8'));
  const wireMessageSchema = JSON.parse(readFileSync(join(rootDir, 'schema', 'wire-message.schema.json'), 'utf8'));
  const validateShow = ajv.compile(showEventSchema);
  const validateWire = ajv.compile(wireMessageSchema);
  const lines = readFileSync(join(rootDir, 'tests', 'fixtures', 'show-event-flow.jsonl'), 'utf8')
    .trim()
    .split('\n');
  it('matches show-event schema', () => {
    for (const [index, line] of lines.entries()) {
      const event = JSON.parse(line);
      const valid = validateShow(event);
      assert.ok(valid, `Line ${index + 1} failed: ${ajv.errorsText(validateShow.errors)}`);
    }
  });
  it('matches wire-message schema', () => {
    for (const [index, line] of lines.entries()) {
      const event = JSON.parse(line);
      const valid = validateWire(event);
      assert.ok(valid, `Line ${index + 1} failed: ${ajv.errorsText(validateWire.errors)}`);
    }
  });
});
