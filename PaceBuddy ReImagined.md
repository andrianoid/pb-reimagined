
[[pbr-OverviewAndVision]]
[[pbr-Personas]]
[[pbr-ArchitectureOverview]]
pbr-Schema:
- **[[ShowEvent Envelope]] (event-only) JSON Schema v1.0.0**      
- **[[Wire Messages]] (event/ack/snapshot/heartbeat/error) JSON Schema v1.0.0**      
- **[[Examples (JSONL)]] for contract tests & dev stubs**  
[[pbr-MVP_Plan]]
![[pacebuddy_mvp_event_flow.png]]

![[performer_view_wireframe.png]]

![[stage_manager_view_wireframe.png]]

![[director_view_wireframe.png]]







Amazing—let’s lock in a clean first pass of the spec and give you actual artifacts you can hand to engineering.

Here are downloadable, ready‑to‑use files:

    

# What’s included (high-level)

- **Envelope fields:** `kind` (`event`), `version` (semver), `messageId` (UUID; rec UUIDv7), `correlationId`, `causationId`, `showId`, `eventType`, `createdAt` (UTC ISO‑8601), `actor{userId, role, deviceId, displayName?}`, optional `eventSeq` (server-assigned), `payload` (typed), optional `patch` (JSON Patch).
    
- **Event types (MVP):** `CueAdvanced`, `CueReverted`, `MicSwapped`, `MicAssigned`, `SegmentReordered`, `NoteAdded|Updated|Deleted`, `TimerStarted|Paused|Reset|SetOverride`, `EmergencyTriggered|Resolved`, `SnapshotRequested`, `ClientPresenceUpdated`.
    
- **Wire messages:** `event`, `ack` (with `ackOf` and optional `eventSeq`), `snapshot` (full state + `lastEventSeq`), `heartbeat`, `error` (typed codes).
    
- **Validation:** Draft 2020‑12 JSON Schema, with `$defs` for reusables (Timecode, JSON Patch, each payload).
    

# Operational guidance (concise, actionable)

- **Ordering & idempotency:**
    
    - Client generates `messageId`. Server dedupes and returns `ack` with authoritative `eventSeq` (monotonic per show).
        
    - Consumers apply strictly by `eventSeq`. Store last processed `eventSeq` per client to resume.
        
- **Timestamps:**
    
    - Clients send `createdAt`; server stamps authoritative time internally. Use UTC only.
        
- **Offline-first:**
    
    - Queue events locally (persist by `messageId`). On reconnect, send in original order and request `snapshot` if `eventSeq` gap is detected.
        
- **Conflict strategy:**
    
    - Permissioned roles; server enforces. For simultaneous changes, the first accepted eventSeq “wins”; subsequent conflicting events return `ack{status:error, code:CONFLICT}`.
        
- **JSON Patch usage:**
    
    - `payload` carries intent (domain event). `patch` is an **optional** companion for deterministic, client-friendly UI updates. Server must treat patch as advisory; the source of truth is the domain handler.
        

# Examples (glance)

**CueAdvanced**

```json
{
  "kind": "event",
  "version": "1.0.0",
  "messageId": "11111111-1111-4111-8111-111111111111",
  "eventType": "CueAdvanced",
  "showId": "pb_2025_08_openingNight",
  "createdAt": "2025-08-11T14:00:00Z",
  "actor": {"userId":"u-sm-01","role":"stageManager","deviceId":"ipad-sm-1"},
  "payload": {"segmentId":"seg-101","fromCueId":"cue-1","toCueId":"cue-2","showClockAt":"00:00:30.000"},
  "patch": [{"op":"replace","path":"/acts/0/segments/0/cues/1/status","value":"current"}]
}
```

**Ack (server → clients)**

```json
{
  "kind": "ack",
  "version": "1.0.0",
  "messageId": "22222222-2222-4222-8222-222222222222",
  "ackOf": "11111111-1111-4111-8111-111111111111",
  "status": "ok",
  "createdAt": "2025-08-11T14:00:00Z",
  "eventSeq": 42
}
```

**Snapshot (server → client)**

```json
{
  "kind":"snapshot",
  "version":"1.0.0",
  "messageId":"44444444-4444-4444-8444-444444444444",
  "showId":"pb_2025_08_openingNight",
  "createdAt":"2025-08-11T14:00:02Z",
  "lastEventSeq":42,
  "state":{"schemaVersion":"1.2.0","acts":[]}
}
```

# Suggested next moves

1. **Review & tweak enums/fields** to match your domain language (e.g., add `Note scope` types, emergency codes, timer semantics).
    
2. **Adopt UUIDv7** for `messageId` and `correlationId` (time-ordered)—I can generate a tiny helper lib if you want.
    
3. **Write 5–10 realistic example flows** (JSONL): a full mini‑show from pre‑show → opening → mic swap → emergency hold → resume → curtain.
    
4. **Wire up contract tests** (Ajv) on both client and server using these schemas + examples.
    
5. **Prototype the WebSocket handshake**: client `SnapshotRequested` on connect, server → `snapshot` + subsequent `event`s; echo `ack`s for all accepted events.
    

Want me to:

- add **QLab/OSC/MIDI** adapter event types (even if Phase 2), or
    
- generate a **minimal Node/Express + ws stub** that validates messages against this schema and broadcasts?