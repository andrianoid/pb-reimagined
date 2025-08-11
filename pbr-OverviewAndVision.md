# PaceBuddy

**PaceBuddy** is a real-time backstage control hub for live theatre and other staged productions.  
It replaces fragmented cue sheets and ad-hoc comms with a unified, role-specific interface that keeps **Directors**, **Stage Managers**, and **Performers** in sync.

## Vision
Transform backstage chaos into coordinated harmony by:
- Maintaining a **single source of truth** for show data (JSON schema).
- Delivering **persona-specific views** with exactly the right information.
- Updating **instantly** across all connected devices — even in spotty network conditions.
- Scaling easily to integrate audio, lighting, and automation systems in the future.

## Core Personas
- **Director:** High-level show overview, performance analytics, and production notes.
- **Stage Manager:** Command center with cue control, mic management, and emergency tools.
- **Performer:** Simple, distraction-free current/up-next cues and mic assignment.

## MVP Scope
- Three persona views (Director, Stage Manager, Performer).
- Three primary workflows:
  1. Advance cue (Stage Manager → all views).
  2. Mic swap (Stage Manager → all views).
  3. Performer sees current/upcoming cues + mic info.

## Technology Stack (MVP)
- **Frontend:** React + TypeScript + Mantine UI
- **State:** Zustand + TanStack Query
- **Backend (stub):** Node/Express with WebSocket
- **Data:** JSON schema + WebSocket-delivered ShowEvent messages

---

## Status
This repo currently contains:
- Core documentation
- JSON schemas for ShowEvent and wire messages
- Example event flows

---

## License
TBD
