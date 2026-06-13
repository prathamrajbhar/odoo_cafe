---
name: project-tech-stack
description: Confirmed tech stack — Next.js 14, Prisma, PostgreSQL, JWT, bcrypt, Zod, Socket.io
metadata:
  type: project
---

Tech stack confirmed by user:

- Framework: Next.js 14 (App Router), TypeScript
- Styling: Tailwind CSS + custom CSS
- Database: PostgreSQL
- ORM: Prisma (IDs are UUID via @default(uuid()))
- Auth: JWT stored in httpOnly cookie
- Password hashing: bcrypt
- Validation: Zod (shared client + server via src/schemas/)
- Real-time (KDS): Socket.io via custom Node.js server wrapping Next.js (server.ts)

**Why:** User explicitly specified this stack.
**How to apply:** Use this stack exclusively. Do not suggest alternatives (NextAuth, tRPC, Drizzle, etc.).
