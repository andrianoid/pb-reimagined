# JSON Schema Tests

This suite validates example `ShowEvent` JSON Lines against the `schema/show-event.schema.json` definition using [Ajv](https://ajv.js.org/). All `.jsonl` files found in `tests/fixtures` and the top-level [`examples/`](../examples/) directory are checked.

## Running

```sh
npm install
npm test
```

## Expected Results

All tests should pass, confirming each sample flow conforms to the schema. To add new scenarios, drop a `.jsonl` file into the `examples` directory.
