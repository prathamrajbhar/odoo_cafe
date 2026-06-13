# Odoo Cafe POS — Database Schema

## Enums

```prisma
enum Role {
  ADMIN
  EMPLOYEE
}

enum Status {
  ACTIVE
  DISABLED
}

enum PaymentType {
  CASH
  CARD
  UPI
}

enum PromoType {
  COUPON
  PRODUCT_BASED
  ORDER_BASED
}

enum DiscountType {
  PERCENT
  FIXED
}

enum OrderStatus {
  DRAFT
  PAID
  CANCELLED
}

enum KDSStatus {
  TO_COOK
  PREPARING
  COMPLETED
}
```

---

## Tables

### `users`

| Column | Type | Constraints |
|---|---|---|
| id | `String` (UUID) | PK, `@default(uuid())` |
| name | `String` | NOT NULL |
| email | `String` | NOT NULL, UNIQUE |
| password_hash | `String` | NOT NULL |
| role | `Role` | NOT NULL |
| status | `Status` | NOT NULL, DEFAULT `ACTIVE` |
| created_at | `DateTime` | DEFAULT `now()` |
| updated_at | `DateTime` | `@updatedAt` |

**Indexes:** `email` (unique)
**Relations:** → `sessions`, → `orders` (as employee)

---

### `categories`

| Column | Type | Constraints |
|---|---|---|
| id | `String` (UUID) | PK |
| name | `String` | NOT NULL |
| color_hex | `String` | NOT NULL |
| created_at | `DateTime` | DEFAULT `now()` |
| updated_at | `DateTime` | `@updatedAt` |

**Relations:** → `products`

---

### `products`

| Column | Type | Constraints |
|---|---|---|
| id | `String` (UUID) | PK |
| name | `String` | NOT NULL |
| category_id | `String` (UUID) | FK → `categories.id`, NOT NULL |
| price | `Decimal(10,2)` | NOT NULL |
| tax_rate | `Int` | NOT NULL — values: `5`, `18`, `28` |
| description | `String?` | NULLABLE |
| is_archived | `Boolean` | DEFAULT `false` |
| created_at | `DateTime` | DEFAULT `now()` |
| updated_at | `DateTime` | `@updatedAt` |

**Indexes:** `category_id`, `is_archived`
**Relations:** ← `categories`, → `order_lines`, → `promotions`

---

### `payment_methods`

| Column | Type | Constraints |
|---|---|---|
| id | `String` (UUID) | PK |
| type | `PaymentType` | NOT NULL, UNIQUE |
| is_active | `Boolean` | DEFAULT `false` |
| upi_id | `String?` | NULLABLE — only relevant when `type = UPI` |
| created_at | `DateTime` | DEFAULT `now()` |
| updated_at | `DateTime` | `@updatedAt` |

**Indexes:** `type` (unique)
**Notes:** Seeded with 3 fixed rows (CASH, CARD, UPI). Not deletable — only toggled.

---

### `promotions`

| Column | Type | Constraints |
|---|---|---|
| id | `String` (UUID) | PK |
| name | `String` | NOT NULL |
| promo_type | `PromoType` | NOT NULL |
| code | `String?` | NULLABLE, UNIQUE — only for `COUPON` type |
| product_id | `String?` (UUID) | FK → `products.id`, NULLABLE — only for `PRODUCT_BASED` |
| min_qty | `Int?` | NULLABLE — only for `PRODUCT_BASED` |
| min_order_amount | `Decimal(10,2)?` | NULLABLE — only for `ORDER_BASED` |
| discount_value | `Decimal(10,2)` | NOT NULL |
| discount_type | `DiscountType` | NOT NULL |
| is_active | `Boolean` | DEFAULT `true` |
| created_at | `DateTime` | DEFAULT `now()` |
| updated_at | `DateTime` | `@updatedAt` |

**Indexes:** `code` (unique, sparse), `product_id`, `is_active`
**Relations:** ← `products` (optional), → `order_lines`

---

### `floors`

| Column | Type | Constraints |
|---|---|---|
| id | `String` (UUID) | PK |
| name | `String` | NOT NULL |
| created_at | `DateTime` | DEFAULT `now()` |
| updated_at | `DateTime` | `@updatedAt` |

**Relations:** → `tables`

---

### `tables`

| Column | Type | Constraints |
|---|---|---|
| id | `String` (UUID) | PK |
| floor_id | `String` (UUID) | FK → `floors.id`, NOT NULL |
| number | `Int` | NOT NULL |
| seats | `Int` | NOT NULL |
| is_active | `Boolean` | DEFAULT `true` |
| created_at | `DateTime` | DEFAULT `now()` |
| updated_at | `DateTime` | `@updatedAt` |

**Indexes:** `(floor_id, number)` — composite UNIQUE
**Relations:** ← `floors`, → `orders`

---

### `customers`

| Column | Type | Constraints |
|---|---|---|
| id | `String` (UUID) | PK |
| name | `String` | NOT NULL |
| email | `String?` | NULLABLE |
| phone | `String?` | NULLABLE |
| created_at | `DateTime` | DEFAULT `now()` |
| updated_at | `DateTime` | `@updatedAt` |

**Relations:** → `orders`

---

### `sessions`

| Column | Type | Constraints |
|---|---|---|
| id | `String` (UUID) | PK |
| opened_by_user_id | `String` (UUID) | FK → `users.id`, NOT NULL |
| opened_at | `DateTime` | DEFAULT `now()` |
| closed_at | `DateTime?` | NULLABLE — null while session is open |
| closing_sale_amount | `Decimal(10,2)?` | NULLABLE — null while session is open |

**Indexes:** `opened_by_user_id`
**Relations:** ← `users`, → `orders`

---

### `orders`

| Column | Type | Constraints |
|---|---|---|
| id | `String` (UUID) | PK |
| order_number | `String` | NOT NULL, UNIQUE — e.g. `ORD-0001` |
| session_id | `String` (UUID) | FK → `sessions.id`, NOT NULL |
| table_id | `String?` (UUID) | FK → `tables.id`, NULLABLE |
| customer_id | `String?` (UUID) | FK → `customers.id`, NULLABLE |
| employee_id | `String` (UUID) | FK → `users.id`, NOT NULL |
| status | `OrderStatus` | DEFAULT `DRAFT` |
| subtotal | `Decimal(10,2)` | NOT NULL |
| tax_amount | `Decimal(10,2)` | NOT NULL |
| discount_amount | `Decimal(10,2)` | DEFAULT `0` |
| total | `Decimal(10,2)` | NOT NULL |
| created_at | `DateTime` | DEFAULT `now()` |
| updated_at | `DateTime` | `@updatedAt` |

**Indexes:** `order_number` (unique), `session_id`, `table_id`, `status`
**Relations:** ← `sessions`, ← `tables`, ← `customers`, ← `users`, → `order_lines`, → `kds_tickets` (1-to-1)

---

### `order_lines`

| Column | Type | Constraints |
|---|---|---|
| id | `String` (UUID) | PK |
| order_id | `String` (UUID) | FK → `orders.id`, NOT NULL |
| product_id | `String` (UUID) | FK → `products.id`, NOT NULL |
| qty | `Int` | NOT NULL |
| unit_price | `Decimal(10,2)` | NOT NULL — snapshot at time of order |
| line_total | `Decimal(10,2)` | NOT NULL — `qty × unit_price` |
| applied_promo_id | `String?` (UUID) | FK → `promotions.id`, NULLABLE |
| created_at | `DateTime` | DEFAULT `now()` |

**Indexes:** `order_id`, `product_id`
**Relations:** ← `orders`, ← `products`, ← `promotions` (optional), → `kds_ticket_items`

---

### `kds_tickets`

| Column | Type | Constraints |
|---|---|---|
| id | `String` (UUID) | PK |
| order_id | `String` (UUID) | FK → `orders.id`, NOT NULL, UNIQUE |
| status | `KDSStatus` | DEFAULT `TO_COOK` |
| created_at | `DateTime` | DEFAULT `now()` |
| updated_at | `DateTime` | `@updatedAt` |

**Indexes:** `order_id` (unique — enforces 1-to-1 with `orders`)
**Relations:** ← `orders`, → `kds_ticket_items`

---

### `kds_ticket_items`

| Column | Type | Constraints |
|---|---|---|
| id | `String` (UUID) | PK |
| ticket_id | `String` (UUID) | FK → `kds_tickets.id`, NOT NULL |
| order_line_id | `String` (UUID) | FK → `order_lines.id`, NOT NULL |
| is_struck_through | `Boolean` | DEFAULT `false` |

**Indexes:** `ticket_id`, `order_line_id`
**Relations:** ← `kds_tickets`, ← `order_lines`

---

## Relation Map

```
users
  ├── sessions        (1 user → many sessions)
  └── orders          (1 user → many orders, as employee)

categories
  └── products        (1 category → many products)

products
  ├── order_lines     (1 product → many order lines)
  └── promotions      (1 product → many promotions, optional FK)

payment_methods       (standalone — 3 seeded rows, no FK to orders)

promotions
  └── order_lines     (1 promo → many order lines, optional FK)

floors
  └── tables          (1 floor → many tables)

tables
  └── orders          (1 table → many orders, optional FK)

customers
  └── orders          (1 customer → many orders, optional FK)

sessions
  └── orders          (1 session → many orders)

orders
  ├── order_lines     (1 order → many lines)
  └── kds_tickets     (1 order → 1 ticket, @unique on order_id)

kds_tickets
  └── kds_ticket_items (1 ticket → many items)

order_lines
  └── kds_ticket_items (1 line → 1 item)
```

---

## Seed Data

`payment_methods` must be seeded before any POS session can be opened:

| type | is_active | upi_id |
|---|---|---|
| CASH | false | null |
| CARD | false | null |
| UPI | false | null |

---

## Notes

- `unit_price` on `order_lines` is a snapshot — it does not update if the product price changes later.
- `tax_rate` is stored per product. The cart currently shows a flat "GST 5%" — if per-line tax is needed, `tax_amount` on `order_lines` should be added.
- `order_number` is application-generated before insert (not a DB sequence) to allow predictable display values like `ORD-0001`.
- `payment_methods.type` is unique — there is exactly one row per payment type, toggled rather than created/deleted.
