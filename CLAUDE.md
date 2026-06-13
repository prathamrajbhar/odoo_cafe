# Odoo Cafe POS — Development Guide

## Project

Restaurant Point-of-Sale system for Parul University Hackathon. 3 user roles (Admin, Employee, Kitchen). 27 screens across POS terminal, backend admin, and Kitchen Display System. Real-time order updates via Socket.io.

## Ownership

**Frontend:** `/app/components/`, `/app/(auth)/`, `/app/pos/`, `/app/(admin)/`, `/app/kds/`
**Backend:** `/lib/`, `/prisma/`, `/app/api/`, `server.ts`, `middleware.ts`

## Stack

Next.js 14 (App Router) + TypeScript. Database: PostgreSQL + Prisma ORM (UUID IDs). Auth: JWT (httpOnly cookie) + bcrypt. Validation: Zod. Styling: Tailwind + custom CSS. Real-time: Socket.io. Password hashing: bcrypt.

## Commands

```bash
npm run dev              # Start dev server + Socket.io
npm run build           # Build for production
npm run lint            # ESLint
npm test                # Jest (if added)
npx prisma migrate dev  # Create & apply migration
npx prisma studio      # Visual DB browser
```

## Docs

- **docs/prd.md** — Features, flows, all 27 screens, open questions
- **docs/architecture.md** — Stack, folder structure, auth/order/KDS flows
- **docs/screens.md** — All 19 screens, components, navigation map
- **docs/api.md** — Every endpoint, request/response, Socket.io events
- **docs/schema.md** — 13 tables, enums, relations, indexes, seed data

## Code Rules

Clean code that works. No abstraction until 3 repetitions. Never try/catch without real recovery path. One function = one job, max 20 lines. Comments explain WHY only, not WHAT. No `any` type. No nested ternaries. No wrapper functions for single calls.

## Next.js Rules

Server Components by default. Client only when needed (interactivity, hooks, real-time). Never useEffect for fetching — use Server Components or Route Handlers. Layouts handle shared UI + nav guards.

## Prisma Rules

All DB queries live in `/lib/db/`. Never inline queries in route handlers. Use `prisma.$transaction()` for multi-step operations (Order + OrderLines + KDSTicket in one go).

## API Rules

Every route returns `{ data: T }` on success or `{ error: string }` on failure. Status codes: 200 (OK), 201 (Created), 400 (validation/bad request), 401 (no auth), 403 (wrong role), 404, 500.

## Never Add Unprompted

`console.log`, skeletons, optimistic updates, barrel files, `any` type, nested ternaries, wrapper functions, `useEffect` for data fetching, hardcoded hex colors, generic names.

## Git

Branches: `feat/`, `fix/`, `chore/`. Conventional commits. PR before merge to main. No force push.

## Design

Mobile-first. No Inter/Roboto/Arial — use system fonts or specify in Tailwind. All colors in CSS variables. No hardcoded hex. No animation unless wireframe shows it. Consistent spacing scale.

# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.
