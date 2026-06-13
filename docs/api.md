# Odoo Cafe POS — API

## Conventions

**Base URL:** `/api`

**Auth:** JWT stored in `token` httpOnly cookie. Middleware verifies on all routes except `/api/auth/*` and `/api/kds/*`.

**Auth levels:**
- `Public` — no cookie required
- `Employee` — valid JWT, any role
- `Admin` — valid JWT, role = `ADMIN`

**Common error shape:**
```json
{ "error": "message describing what went wrong" }
```

**HTTP status codes used:** `200`, `201`, `400` (validation), `401` (no/invalid token), `403` (wrong role), `404`, `500`

---

## Auth

### POST `/api/auth/login`
**Auth:** Public

**Request:**
| Field | Type | Required |
|---|---|---|
| email | string | yes |
| password | string | yes |

**Response `200`:**
```json
{ "role": "ADMIN" | "EMPLOYEE", "name": "string" }
```
Sets `token` httpOnly cookie on success.

---

### POST `/api/auth/signup`
**Auth:** Public

**Request:**
| Field | Type | Required |
|---|---|---|
| name | string | yes |
| email | string | yes |
| password | string (min 6) | yes |

**Response `201`:**
```json
{ "role": "ADMIN", "name": "string" }
```
First signup creates an Admin. Sets `token` httpOnly cookie.

---

### POST `/api/auth/logout`
**Auth:** Employee

**Response `200`:**
```json
{ "success": true }
```
Clears `token` cookie.

---

## Products

### GET `/api/products`
**Auth:** Employee

**Response `200`:**
```json
{
  "products": [
    {
      "id": "uuid",
      "name": "string",
      "category": { "id": "uuid", "name": "string", "colorHex": "string" },
      "price": "number",
      "taxRate": 5 | 18 | 28,
      "description": "string | null",
      "isArchived": false
    }
  ]
}
```
Returns only non-archived products.

---

### POST `/api/products`
**Auth:** Admin

**Request:**
| Field | Type | Required |
|---|---|---|
| name | string | yes |
| categoryId | uuid | yes |
| price | number | yes |
| taxRate | 5 \| 18 \| 28 | yes |
| description | string | no |

**Response `201`:** `{ "product": Product }`

---

### PUT `/api/products/[id]`
**Auth:** Admin

**Request:** Same fields as POST, all optional.

**Response `200`:** `{ "product": Product }`

---

### DELETE `/api/products/[id]`
**Auth:** Admin

**Response `200`:** `{ "success": true }`

Sets `isArchived = true` (soft delete).

---

## Categories

### GET `/api/categories`
**Auth:** Employee

**Response `200`:**
```json
{ "categories": [{ "id": "uuid", "name": "string", "colorHex": "string" }] }
```

---

### POST `/api/categories`
**Auth:** Admin

**Request:**
| Field | Type | Required |
|---|---|---|
| name | string | yes |
| colorHex | string (hex) | yes |

**Response `201`:** `{ "category": Category }`

---

### PUT `/api/categories/[id]`
**Auth:** Admin

**Request:** `name?`, `colorHex?`

**Response `200`:** `{ "category": Category }`

---

### DELETE `/api/categories/[id]`
**Auth:** Admin

**Response `200`:** `{ "success": true }`

---

## Payment Methods

### GET `/api/payment-methods`
**Auth:** Admin

**Response `200`:**
```json
{
  "methods": [
    { "id": "uuid", "type": "CASH" | "CARD" | "UPI", "isActive": true, "upiId": "string | null" }
  ]
}
```

---

### PUT `/api/payment-methods/[id]`
**Auth:** Admin

**Request:**
| Field | Type | Required |
|---|---|---|
| isActive | boolean | no |
| upiId | string | no (UPI only) |

**Response `200`:** `{ "method": PaymentMethod }`

---

## Promotions

### GET `/api/promotions`
**Auth:** Employee

**Response `200`:**
```json
{
  "promotions": [
    {
      "id": "uuid",
      "name": "string",
      "promoType": "COUPON" | "PRODUCT_BASED" | "ORDER_BASED",
      "code": "string | null",
      "productId": "uuid | null",
      "minQty": "number | null",
      "minOrderAmount": "number | null",
      "discountValue": "number",
      "discountType": "PERCENT" | "FIXED",
      "isActive": true
    }
  ]
}
```

---

### POST `/api/promotions`
**Auth:** Admin

**Request:**
| Field | Type | Required |
|---|---|---|
| name | string | yes |
| promoType | COUPON \| PRODUCT_BASED \| ORDER_BASED | yes |
| code | string | COUPON only |
| productId | uuid | PRODUCT_BASED only |
| minQty | number | PRODUCT_BASED only |
| minOrderAmount | number | ORDER_BASED only |
| discountValue | number | yes |
| discountType | PERCENT \| FIXED | yes |
| isActive | boolean | no (default true) |

**Response `201`:** `{ "promotion": Promotion }`

---

### PUT `/api/promotions/[id]`
**Auth:** Admin

**Request:** Same fields as POST, all optional.

**Response `200`:** `{ "promotion": Promotion }`

---

### DELETE `/api/promotions/[id]`
**Auth:** Admin

**Response `200`:** `{ "success": true }`

---

### POST `/api/promotions/validate`
**Auth:** Employee

**Request:**
```json
{
  "code": "string | null",
  "subtotal": "number",
  "lines": [{ "productId": "uuid", "qty": "number" }]
}
```

**Response `200`:**
```json
{
  "appliedPromos": [
    {
      "promoId": "uuid",
      "name": "string",
      "discountValue": "number",
      "discountType": "PERCENT" | "FIXED",
      "scope": "LINE" | "ORDER",
      "productId": "uuid | null"
    }
  ],
  "discountAmount": "number"
}
```

**Notes:**
- Validates coupon code if provided (returns `400` if invalid/inactive)
- Also evaluates all active `PRODUCT_BASED` and `ORDER_BASED` promos against the cart
- Server re-runs this same logic on `POST /api/orders` to prevent client tampering

---

## Floors

### GET `/api/floors`
**Auth:** Admin

**Response `200`:**
```json
{
  "floors": [
    {
      "id": "uuid",
      "name": "string",
      "tables": [{ "id": "uuid", "number": 1, "seats": 4, "isActive": true }]
    }
  ]
}
```

---

### POST `/api/floors`
**Auth:** Admin

**Request:** `{ "name": "string" }`

**Response `201`:** `{ "floor": Floor }`

---

### PUT `/api/floors/[id]`
**Auth:** Admin

**Request:** `{ "name": "string" }`

**Response `200`:** `{ "floor": Floor }`

---

### DELETE `/api/floors/[id]`
**Auth:** Admin

**Response `200`:** `{ "success": true }`

---

## Tables

### GET `/api/tables`
**Auth:** Employee

**Response `200`:**
```json
{
  "tables": [
    {
      "id": "uuid",
      "floorId": "uuid",
      "number": 1,
      "seats": 4,
      "isActive": true,
      "hasActiveOrder": true,
      "activeOrderId": "uuid | null"
    }
  ]
}
```

---

### POST `/api/tables`
**Auth:** Admin

**Request:**
| Field | Type | Required |
|---|---|---|
| floorId | uuid | yes |
| number | number | yes |
| seats | number | yes |
| isActive | boolean | no (default true) |

**Response `201`:** `{ "table": Table }`

---

### PUT `/api/tables/[id]`
**Auth:** Admin

**Request:** `number?`, `seats?`, `isActive?`

**Response `200`:** `{ "table": Table }`

---

### DELETE `/api/tables/[id]`
**Auth:** Admin

**Response `200`:** `{ "success": true }`

---

## Users

### GET `/api/users`
**Auth:** Admin

**Response `200`:**
```json
{
  "users": [
    { "id": "uuid", "name": "string", "email": "string", "role": "ADMIN" | "EMPLOYEE", "status": "ACTIVE" | "DISABLED" }
  ]
}
```
`passwordHash` never returned.

---

### POST `/api/users`
**Auth:** Admin

**Request:**
| Field | Type | Required |
|---|---|---|
| name | string | yes |
| email | string | yes |
| password | string (min 6) | yes |
| role | ADMIN \| EMPLOYEE | yes |

**Response `201`:** `{ "user": User }`

---

### PUT `/api/users/[id]`
**Auth:** Admin

**Request:** `name?`, `email?`, `role?`, `status?`

**Response `200`:** `{ "user": User }`

---

### DELETE `/api/users/[id]`
**Auth:** Admin

**Response `200`:** `{ "success": true }`

---

### PUT `/api/users/[id]/password`
**Auth:** Admin

**Request:** `{ "password": "string (min 6)" }`

**Response `200`:** `{ "success": true }`

---

## Customers

### GET `/api/customers`
**Auth:** Employee

**Query params:** `search` (optional — matches name)

**Response `200`:**
```json
{ "customers": [{ "id": "uuid", "name": "string", "email": "string | null", "phone": "string | null" }] }
```

---

### POST `/api/customers`
**Auth:** Employee

**Request:**
| Field | Type | Required |
|---|---|---|
| name | string | yes |
| email | string | no |
| phone | string | no |

**Response `201`:** `{ "customer": Customer }`

---

### PUT `/api/customers/[id]`
**Auth:** Employee

**Request:** `name?`, `email?`, `phone?`

**Response `200`:** `{ "customer": Customer }`

---

### DELETE `/api/customers/[id]`
**Auth:** Employee

**Response `200`:** `{ "success": true }`

---

## Session

### POST `/api/session/open`
**Auth:** Employee

**Response `201`:**
```json
{ "session": { "id": "uuid", "openedAt": "ISO string" } }
```

---

### POST `/api/session/close`
**Auth:** Employee

**Response `200`:**
```json
{
  "summary": {
    "totalOrders": "number",
    "totalRevenue": "number",
    "openedAt": "ISO string",
    "closedAt": "ISO string"
  }
}
```

---

## Orders

### GET `/api/orders`
**Auth:** Employee

**Query params:** `sessionId` (required)

**Response `200`:**
```json
{
  "orders": [
    {
      "id": "uuid",
      "orderNumber": "string",
      "status": "DRAFT" | "PAID" | "CANCELLED",
      "total": "number",
      "createdAt": "ISO string",
      "customer": { "id": "uuid", "name": "string" } | null,
      "table": { "id": "uuid", "number": 1 } | null
    }
  ]
}
```

---

### POST `/api/orders`
**Auth:** Employee

**Request:**
```json
{
  "sessionId": "uuid",
  "tableId": "uuid | null",
  "customerId": "uuid | null",
  "lines": [
    {
      "productId": "uuid",
      "qty": "number",
      "unitPrice": "number",
      "appliedPromoId": "uuid | null"
    }
  ],
  "couponCode": "string | null"
}
```

**Response `201`:**
```json
{
  "order": {
    "id": "uuid",
    "orderNumber": "string",
    "status": "DRAFT",
    "subtotal": "number",
    "taxAmount": "number",
    "discountAmount": "number",
    "total": "number",
    "lines": [],
    "kdsTicketId": "uuid"
  }
}
```

**Notes:**
- Server re-validates all promos before persisting
- Creates `Order` + `OrderLine[]` + `KDSTicket` + `KDSTicketItem[]` in a single `prisma.$transaction`
- Emits `ticket:new` Socket.io event to `kds` room

---

### GET `/api/orders/[id]`
**Auth:** Employee

**Response `200`:**
```json
{
  "order": {
    "id": "uuid",
    "orderNumber": "string",
    "status": "DRAFT" | "PAID" | "CANCELLED",
    "subtotal": "number",
    "taxAmount": "number",
    "discountAmount": "number",
    "total": "number",
    "createdAt": "ISO string",
    "customer": null,
    "table": { "id": "uuid", "number": 1 } | null,
    "lines": [
      {
        "id": "uuid",
        "product": { "id": "uuid", "name": "string" },
        "qty": "number",
        "unitPrice": "number",
        "lineTotal": "number",
        "appliedPromo": null
      }
    ]
  }
}
```

---

### DELETE `/api/orders/[id]`
**Auth:** Employee

**Response `200`:** `{ "success": true }`

Only allowed when `order.status = DRAFT`. Returns `400` otherwise.

---

### POST `/api/orders/[id]/pay`
**Auth:** Employee

**Request:**
| Field | Type | Required |
|---|---|---|
| method | CASH \| CARD \| UPI | yes |
| amountTendered | number | CASH only |
| reference | string | CARD only |

**Response `200`:**
```json
{
  "order": { "status": "PAID" },
  "receipt": {
    "orderNumber": "string",
    "items": [],
    "subtotal": "number",
    "taxAmount": "number",
    "discountAmount": "number",
    "total": "number",
    "method": "CASH" | "CARD" | "UPI",
    "changeDue": "number | null",
    "paidAt": "ISO string"
  }
}
```

---

## KDS

Both KDS endpoints are `Public` — no auth required.

### POST `/api/kds/tickets/[id]/advance`
**Auth:** Public

**Response `200`:**
```json
{ "ticket": { "id": "uuid", "status": "TO_COOK" | "PREPARING" | "COMPLETED" } }
```

Stage progression: `TO_COOK → PREPARING → COMPLETED`. Returns `400` if already `COMPLETED`.

Emits `ticket:updated` Socket.io event to `kds` room.

---

### POST `/api/kds/tickets/[id]/items/[itemId]/toggle`
**Auth:** Public

**Response `200`:**
```json
{ "item": { "id": "uuid", "isStruckThrough": true } }
```

Emits `ticket:updated` Socket.io event to `kds` room.

---

## Reports

### GET `/api/reports`
**Auth:** Admin

**Query params:**
| Param | Type | Required |
|---|---|---|
| period | today \| week \| month \| custom | yes |
| from | ISO date string | custom only |
| to | ISO date string | custom only |
| employeeId | uuid | no |
| sessionId | uuid | no |
| productId | uuid | no |

**Response `200`:**
```json
{
  "kpis": {
    "totalOrders": "number",
    "totalOrdersChange": "number (% vs prev period)",
    "revenue": "number",
    "revenueChange": "number",
    "avgOrder": "number",
    "avgOrderChange": "number"
  },
  "salesTrend": [{ "time": "string", "revenue": "number" }],
  "topCategories": [{ "name": "string", "revenue": "number", "percent": "number" }],
  "topProducts": [{ "name": "string", "qty": "number", "revenue": "number" }],
  "topOrders": [
    {
      "orderNumber": "string",
      "sessionId": "uuid",
      "date": "ISO string",
      "customer": "string | null",
      "employee": "string",
      "total": "number"
    }
  ]
}
```

---

### GET `/api/reports/export`
**Auth:** Admin

**Query params:** Same as `/api/reports` plus `format: pdf | xls`

**Response:** Binary file download.
- PDF: `Content-Type: application/pdf`
- XLS: `Content-Type: application/vnd.ms-excel`

---

## Socket.io Events (KDS)

The Socket.io server runs on the same port as Next.js via `server.ts`. KDS clients join the `kds` room on connect.

### Server → KDS

| Event | Payload | Triggered by |
|---|---|---|
| `ticket:new` | `{ id, orderNumber, status, items: [{ id, name, qty, isStruckThrough }] }` | `POST /api/orders` |
| `ticket:updated` | `{ id, status?, items?: [{ id, isStruckThrough }] }` | `POST /api/kds/tickets/:id/advance` or `.../toggle` |

No client → server socket events. All mutations go through HTTP endpoints.
