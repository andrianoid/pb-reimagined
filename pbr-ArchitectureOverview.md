# Architecture Overview

## Core Components
- **JSON Schema (Show Data):** The single source of truth for show structure (`schema/show-event.schema.json`, `schema/wire-message.schema.json`).
- **ShowEvent Messages:** Describe real-time changes (cue advance, mic swap).
- **Frontend Views:** Role-based UIs for Director, Stage Manager, Performer.
- **Backend:** Receives, validates, sequences, and broadcasts ShowEvents.

## Data Flow
1. Stage Manager performs an action (e.g., advance cue).
2. Client emits a `ShowEvent` via WebSocket.
3. Server validates against schema, assigns `eventSeq`, applies changes to state.
4. Server broadcasts event + optional JSON Patch to all connected clients.
5. Clients update local state and UI.

## Real-Time Protocol
- **WebSocket** connection per client.
- Event envelopes contain:
  - `kind`, `version`, `messageId`, `eventType`, `showId`, `createdAt`, `actor`, `payload`.
- All events ACKed with `status` and `eventSeq`.

## Offline Strategy
- Local queue for outgoing events.
- Request snapshot if sequence gap detected.
- Merge events via `eventSeq`.
