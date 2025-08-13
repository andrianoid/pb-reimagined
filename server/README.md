# PaceBuddy Server Stub

This stub provides a minimal WebSocket server implemented with core Node.js modules. Incoming messages are validated against the JSON schemas in `schemas/` and accepted events are broadcast to all connected clients. The sender receives an `ack` response containing an `eventSeq` number.

## Running the server

```bash
cd server
npm start
```

The server listens on `ws://localhost:3000`. Connect with a WebSocket client and send messages matching the `schemas/wire-message.schema.json` `event` definition.

A simple health check is available at `http://localhost:3000/health`.

## Tests

No automated tests are defined. The default test script simply reports that no tests are present.
