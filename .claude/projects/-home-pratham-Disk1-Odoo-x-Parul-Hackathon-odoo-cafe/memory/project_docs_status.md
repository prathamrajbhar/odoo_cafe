---
name: project-docs-status
description: Planning docs written so far and what each covers
metadata:
  type: project
---

All planning docs are in docs/:

- docs/prd.md — features, user flows, data entities, open questions
- docs/architecture.md — stack, folder structure, layer diagram, auth flow, order lifecycle, KDS real-time flow, promo logic
- docs/screens.md — all 19 screens (S1–S19), components per screen, screen connection map
- docs/api.md — every endpoint, method, request/response shape, auth level, Socket.io events

Prisma schema was shown to user but NOT written to a file — user excluded it from architecture.md. Needs its own docs/schema.md if required.

**Why:** Tracking what is documented so future sessions don't re-derive or contradict it.
**How to apply:** Read these docs before starting implementation.
