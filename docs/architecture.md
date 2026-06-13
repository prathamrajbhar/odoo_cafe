# Odoo Cafe POS — Architecture

## 1. Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + custom CSS |
| Database | PostgreSQL |
| ORM | Prisma |
| IDs | UUID (`@default(uuid())`) |
| Auth | JWT (httpOnly cookie) |
| Password hashing | bcrypt |
| Validation | Zod |
| Real-time (KDS) | Socket.io |
| Custom server | Node.js HTTP server wrapping Next.js (required for Socket.io) |

---

## 2. Folder Structure

```
odoo_cafe/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── signup/
│   │   │       └── page.tsx
│   │   ├── (admin)/
│   │   │   ├── layout.tsx              # admin shell + nav guard
│   │   │   ├── products/page.tsx
│   │   │   ├── categories/page.tsx
│   │   │   ├── payment-methods/page.tsx
│   │   │   ├── promotions/page.tsx
│   │   │   ├── floors/page.tsx
│   │   │   ├── users/page.tsx
│   │   │   ├── reports/page.tsx
│   │   │   └── session/page.tsx
│   │   ├── pos/
│   │   │   └── page.tsx                # main 3-column POS terminal
│   │   ├── kds/
│   │   │   └── page.tsx                # standalone KDS — no auth
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── login/route.ts
│   │       │   └── signup/route.ts
│   │       ├── products/
│   │       │   ├── route.ts
│   │       │   └── [id]/route.ts
│   │       ├── categories/
│   │       │   ├── route.ts
│   │       │   └── [id]/route.ts
│   │       ├── payment-methods/
│   │       │   ├── route.ts
│   │       │   └── [id]/route.ts
│   │       ├── promotions/
│   │       │   ├── route.ts
│   │       │   ├── [id]/route.ts
│   │       │   └── validate/route.ts
│   │       ├── floors/
│   │       │   ├── route.ts
│   │       │   └── [id]/route.ts
│   │       ├── tables/
│   │       │   ├── route.ts
│   │       │   └── [id]/route.ts
│   │       ├── customers/
│   │       │   ├── route.ts
│   │       │   └── [id]/route.ts
│   │       ├── users/
│   │       │   ├── route.ts
│   │       │   └── [id]/route.ts
│   │       ├── session/
│   │       │   ├── open/route.ts
│   │       │   └── close/route.ts
│   │       ├── orders/
│   │       │   ├── route.ts
│   │       │   ├── [id]/route.ts
│   │       │   └── [id]/pay/route.ts
│   │       ├── kds/
│   │       │   ├── tickets/[id]/advance/route.ts
│   │       │   └── tickets/[id]/items/[itemId]/toggle/route.ts
│   │       └── reports/
│   │           ├── route.ts
│   │           └── export/route.ts
│   │
│   ├── components/
│   │   ├── pos/
│   │   │   ├── MainOrderView.tsx
│   │   │   ├── ProductPanel.tsx
│   │   │   ├── CartPanel.tsx
│   │   │   ├── PaymentPanel.tsx
│   │   │   ├── FloorPopup.tsx
│   │   │   ├── DiscountPopup.tsx
│   │   │   ├── PaymentScreen.tsx
│   │   │   ├── OrdersList.tsx
│   │   │   ├── OrderDetail.tsx
│   │   │   ├── CustomerPanel.tsx
│   │   │   └── TableView.tsx
│   │   ├── admin/
│   │   │   ├── ProductList.tsx
│   │   │   ├── CategoryList.tsx
│   │   │   ├── PaymentMethodList.tsx
│   │   │   ├── PromotionList.tsx
│   │   │   ├── FloorTableManager.tsx
│   │   │   ├── UserList.tsx
│   │   │   ├── SessionControl.tsx
│   │   │   └── Reports.tsx
│   │   ├── kds/
│   │   │   ├── TicketCard.tsx
│   │   │   └── KDSSidebar.tsx
│   │   └── shared/
│   │       ├── Numpad.tsx
│   │       ├── Modal.tsx
│   │       └── SearchBar.tsx
│   │
│   ├── lib/
│   │   ├── prisma.ts               # Prisma client singleton
│   │   ├── jwt.ts                  # sign / verify JWT
│   │   ├── bcrypt.ts               # hashPassword / comparePassword
│   │   ├── socket.ts               # Socket.io server instance (attached to global)
│   │   └── promo.ts                # promo auto-fire evaluation logic
│   │
│   ├── schemas/                    # Zod schemas (shared client + server)
│   │   ├── auth.ts
│   │   ├── product.ts
│   │   ├── category.ts
│   │   ├── promotion.ts
│   │   ├── order.ts
│   │   └── customer.ts
│   │
│   ├── middleware.ts                # JWT verification on protected routes
│   │
│   └── styles/
│       ├── globals.css
│       ├── pos.css
│       └── kds.css
│
├── server.ts                       # custom Node server — wraps Next.js + mounts Socket.io
├── tailwind.config.ts
├── next.config.ts
├── package.json
└── .env                            # DATABASE_URL, JWT_SECRET
```

---

## 3. Layer Architecture

```
Browser
  │
  ├── POS / Admin (Next.js App Router, React)
  │     └── fetch() → /api/* route handlers
  │
  └── KDS (/kds page, no auth)
        └── Socket.io client → server.ts Socket.io instance

server.ts (custom Node HTTP server)
  ├── Next.js request handler  (all page + API routes)
  └── Socket.io server         (attached to same HTTP server)
        └── emits on 'kds' room when orders are sent to kitchen

API Route Handlers (/api/*)
  └── Prisma Client
        └── PostgreSQL
```

---

## 4. Auth Flow

```
POST /api/auth/login  { email, password }
  → Zod validate input
  → prisma.user.findUnique({ where: { email } })
  → bcrypt.compare(password, user.passwordHash)
  → sign JWT { sub: user.id, role: user.role }
  → Set-Cookie: token=<jwt>; HttpOnly; SameSite=Strict
  → return { role }

middleware.ts
  → runs on /pos/*, /admin/*, /api/* (except /api/auth/*, /kds/*)
  → reads JWT from cookie, verifies with JWT_SECRET
  → injects userId + role into request headers
  → role=EMPLOYEE blocked from /admin/* and admin-only API routes
```

---

## 5. Data Flow

### Order lifecycle

```
1. Open session
   POST /api/session/open
   → creates Session record, returns sessionId

2. Select table
   GET /api/tables → floors + tables + active order status

3. Build cart (client state only — no DB writes)

4. Validate coupon / check promos
   POST /api/promotions/validate { code?, cartLines[], subtotal }
   → validates code, evaluates ORDER_BASED / PRODUCT_BASED thresholds
   → returns { appliedPromos[], discountAmount }

5. Send to Kitchen
   POST /api/orders { sessionId, tableId, customerId?, lines[] }
   → prisma.$transaction: create Order + OrderLines + KDSTicket + KDSTicketItems
   → io.to('kds').emit('ticket:new', ticketPayload)

6. Collect payment
   POST /api/orders/:id/pay { method, amountTendered?, reference? }
   → update Order.status = PAID
   → return receipt data

7. Close session
   POST /api/session/close
   → set Session.closedAt + closingSaleAmount
   → return shift summary
```

### KDS real-time flow

```
KDS page (/kds) — no auth, public route
  → Socket.io client connects
  → socket.on('ticket:new', addCard)
  → socket.on('ticket:updated', updateCard)

On Send to Kitchen (step 5):
  → io.to('kds').emit('ticket:new', ticketPayload)

Kitchen clicks card (advance stage):
  POST /api/kds/tickets/:id/advance
  → TO_COOK → PREPARING → COMPLETED
  → io.to('kds').emit('ticket:updated', { id, status })

Kitchen clicks item (strikethrough):
  POST /api/kds/tickets/:id/items/:itemId/toggle
  → flip isStruckThrough on KDSTicketItem
  → io.to('kds').emit('ticket:updated', { id, items })
```

### Promo auto-fire logic

```
Client — on every cart change:
  lib/promo.ts: evaluatePromos(cartLines, subtotal, activePromos)
    PRODUCT_BASED: cartLines[productId].qty >= promo.minQty → apply
    ORDER_BASED:   subtotal >= promo.minOrderAmount → apply
    → returns appliedPromos[]

Server — re-runs same logic on POST /api/orders
  prevents client-side discount tampering before order is persisted
```
