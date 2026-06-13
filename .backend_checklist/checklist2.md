# Backend Implementation — Module-wise Checklist

**Project:** Odoo Cafe POS
**Stack:** Next.js 14 + TypeScript + PostgreSQL + Prisma + Socket.io
**Last Updated:** 2026-06-13

---

## **Module 1: Authentication**

### Zod Schemas
- [x] `loginSchema` — email (string), password (string)
- [x] `signupSchema` — name (string), email (string), password (min 6)
- [x] `userSchema` — full user object structure

### Utilities (`/lib`)
- [x] `jwt.ts`: `sign(payload)` → JWT token string
- [x] `jwt.ts`: `verify(token)` → decoded payload or throw
- [x] `bcrypt.ts`: `hashPassword(plain)` → bcrypt hash
- [x] `bcrypt.ts`: `comparePassword(plain, hash)` → boolean

### Middleware
- [x] `middleware.ts`: read JWT from `token` cookie
- [x] `middleware.ts`: verify JWT signature with `JWT_SECRET`
- [x] `middleware.ts`: inject userId + role into request headers
- [x] `middleware.ts`: block non-Admin from `/admin/*` routes
- [x] `middleware.ts`: allow public routes: `/api/auth/*`, `/api/kds/*`, `/(auth)/*`

### Database Layer (`/lib/db/users.ts`)
- [x] `getAll()` → all users without passwordHash
- [x] `getById(id)` → user without passwordHash
- [x] `getByEmail(email)` → user (for login)
- [x] `create(data)` → new user with hashed password
- [x] `update(id, data)` → updated user
- [x] `delete(id)` → remove user
- [x] `updatePassword(id, newPassword)` → hash + save

### API Routes
- [x] `POST /api/auth/login` (Public) — validate + return JWT + role
- [x] `POST /api/auth/signup` (Public) — first user = Admin, rest = Employee
- [x] `POST /api/auth/logout` (Employee) — clear token cookie

### Test Coverage
- [x] First signup creates Admin
- [x] Subsequent signups create Employee
- [x] Login returns JWT in httpOnly cookie
- [x] Invalid credentials return 401
- [x] Middleware blocks unauthenticated access to `/admin/*`
- [x] Logout clears cookie

---

## **Module 2: User Management**

### Database Layer (`/lib/db/users.ts`)
- [x] `getAll()` → return all users with role/status/email (no password)
- [x] `getById(id)` → single user (no password)
- [x] `create(name, email, password, role)` → new user with hashed password
- [x] `update(id, name?, email?, role?, status?)` → update fields
- [x] `updatePassword(id, newPassword)` → hash password + save
- [x] `delete(id)` → remove user from database

### API Routes
- [x] `GET /api/users` (Admin) — list all users
- [x] `POST /api/users` (Admin) — create new user
- [x] `PUT /api/users/[id]` (Admin) — update user
- [x] `PUT /api/users/[id]/password` (Admin) — change password
- [x] `DELETE /api/users/[id]` (Admin) — delete user

### Validation
- [x] Email unique across system
- [x] Password min 6 characters
- [x] Role must be ADMIN or EMPLOYEE
- [x] Status must be ACTIVE or DISABLED
- [x] Cannot update own role/status as Employee

### Test Coverage
- [x] Admin can list all employees
- [x] Admin can create new employee
- [x] Admin can update user name/email/role/status
- [x] Admin can change password for any user
- [x] Admin can delete user
- [x] Cannot create user with duplicate email
- [x] Cannot create user with invalid role

---

## **Module 3: Categories**

### Zod Schemas
- [x] `categoryCreateSchema` — name (string, required), colorHex (hex string, required)
- [x] `categoryUpdateSchema` — name (optional), colorHex (optional)

### Database Layer (`/lib/db/categories.ts`)
- [x] `getAll()` → all categories sorted by name
- [x] `getById(id)` → single category
- [x] `create(name, colorHex)` → new category
- [x] `update(id, name?, colorHex?)` → update fields
- [x] `delete(id)` → remove category
- [x] `getWithProductCount(id)` → category + product count

### API Routes
- [x] `GET /api/categories` (Employee) — list all
- [x] `POST /api/categories` (Admin) — create new
- [x] `PUT /api/categories/[id]` (Admin) — update
- [x] `DELETE /api/categories/[id]` (Admin) — delete

### Validation
- [x] colorHex valid hex format (#RRGGBB)
- [x] name not empty
- [x] Cannot delete category if products exist (or cascade soft-delete products)

### Test Coverage
- [x] Employee can fetch categories
- [x] Admin can create category with color
- [x] Admin can update category
- [x] Admin can delete category
- [x] Invalid hex color rejected
- [x] Duplicate names allowed (different IDs)

---

## **Module 4: Products**

### Zod Schemas
- [x] `productCreateSchema` — name, categoryId, price, taxRate (5/18/28), description (optional)
- [x] `productUpdateSchema` — all fields optional

### Database Layer (`/lib/db/products.ts`)
- [x] `getAll(archived=false)` → non-archived products with category
- [x] `getById(id)` → product with category
- [x] `getByCategory(categoryId)` → all products in category
- [x] `create(name, categoryId, price, taxRate, description)` → new product
- [x] `update(id, name?, categoryId?, price?, taxRate?, description?)` → update fields
- [x] `archive(id)` → set is_archived = true (soft delete)
- [x] `delete(id)` → hard delete (if needed)

### API Routes
- [x] `GET /api/products` (Employee) — list non-archived with category
- [x] `POST /api/products` (Admin) — create product
- [x] `PUT /api/products/[id]` (Admin) — update product
- [x] `DELETE /api/products/[id]` (Admin) — soft-delete (archive)

### Validation
- [x] price > 0 and max 2 decimals
- [x] taxRate must be 5, 18, or 28
- [x] categoryId must exist
- [x] name not empty

### Test Coverage
- [x] Employee can fetch all products
- [x] Products include category info
- [x] Archived products don't appear in list
- [x] Admin can create product with different tax rates
- [x] Admin can update product
- [x] Admin delete archives (not hard delete)
- [x] Cannot create product without category

---

## **Module 5: Payment Methods**

### Database Layer (`/lib/db/paymentMethods.ts`)
- [x] `getAll()` → all 3 payment methods
- [x] `getById(id)` → single method
- [x] `update(id, isActive?, upiId?)` → toggle/update UPI ID
- [x] `seedPaymentMethods()` → insert CASH, CARD, UPI (inactive, null upiId)

### API Routes
- [x] `GET /api/payment-methods` (Admin) — list all 3
- [x] `PUT /api/payment-methods/[id]` (Admin) — update isActive/upiId

### Validation
- [x] Only CASH, CARD, UPI allowed (enum)
- [x] upiId only settable on UPI record
- [x] Cannot create/delete payment methods (only seed + toggle)
- [x] Only one record per payment type (unique constraint)

### Test Coverage
- [x] Exactly 3 payment methods exist after seed
- [x] Admin can toggle isActive
- [x] Admin can set upiId for UPI
- [x] Cannot add upiId to CASH or CARD
- [x] Only active methods appear in POS terminal

---

## **Module 6: Promotions**

### Zod Schemas
- [x] `promotionBaseSchema` — name, discountValue, discountType (PERCENT/FIXED), isActive
- [x] `couponSchema` — extends base + code (unique, required)
- [x] `productPromoSchema` — extends base + productId, minQty (required)
- [x] `orderPromoSchema` — extends base + minOrderAmount (required)
- [x] `validatePromosSchema` — code (optional), subtotal, lines[]

### Promo Logic (`/lib/promo.ts`)
- [x] `evaluateProductPromos(cartLines, activePromos)` → matching product-based promos
- [x] `evaluateOrderPromos(subtotal, activePromos)` → matching order-based promos
- [x] `validateCoupon(code, activePromos)` → verify code exists + active or throw
- [x] `calculateDiscount(discountValue, discountType, amount)` → discount in rupees
- [x] `applyPromos(cartLines, subtotal, code, activePromos)` → all applicable promos

### Database Layer (`/lib/db/promotions.ts`)
- [x] `getAll(activeOnly=true)` → all promotions
- [x] `getById(id)` → single promotion
- [x] `getByCode(code)` → coupon by code
- [x] `create(type, data)` → validate type-specific fields + create
- [x] `update(id, data)` → update promo
- [x] `delete(id)` → remove promotion

### API Routes
- [x] `GET /api/promotions` (Employee) — list all active
- [x] `POST /api/promotions` (Admin) — create (coupon/product/order)
- [x] `PUT /api/promotions/[id]` (Admin) — update
- [x] `DELETE /api/promotions/[id]` (Admin) — delete
- [x] `POST /api/promotions/validate` (Employee) — validate code + auto-fire

### Validation
- [x] Coupon code unique (if creating COUPON)
- [x] productId exists (if PRODUCT_BASED)
- [x] minQty > 0 (if PRODUCT_BASED)
- [x] minOrderAmount > 0 (if ORDER_BASED)
- [x] discountValue > 0
- [x] discountType in [PERCENT, FIXED]
- [x] For PERCENT: max 100%
- [x] For FIXED: value in rupees

### Test Coverage
- [x] Create coupon, validate code, apply discount
- [x] Create product promo, fire at qty threshold
- [x] Create order promo, fire at subtotal threshold
- [x] Inactive promos don't fire
- [x] Client-side tampering prevented by server revalidation
- [x] Multiple promos can apply simultaneously
- [x] Discount calculations correct for PERCENT vs FIXED
- [x] Invalid coupon returns 400

---

## **Module 7: Floors**

### Zod Schemas
- [x] `floorCreateSchema` — name (string, required)
- [x] `floorUpdateSchema` — name (optional)

### Database Layer (`/lib/db/floors.ts`)
- [x] `getAll()` → all floors with tables included
- [x] `getById(id)` → floor with all its tables
- [x] `create(name)` → new floor
- [x] `update(id, name)` → update name
- [x] `delete(id)` → remove floor (cascade delete tables)

### API Routes
- [x] `GET /api/floors` (Admin) — list all with tables
- [x] `POST /api/floors` (Admin) — create new floor
- [x] `PUT /api/floors/[id]` (Admin) — update floor name
- [x] `DELETE /api/floors/[id]` (Admin) — delete floor

### Validation
- [x] floor name not empty
- [x] floor name not duplicate (optional)

### Test Coverage
- [x] Admin can create multiple floors
- [x] Admin can list floors with all tables
- [x] Admin can update floor name
- [x] Admin can delete floor (removes tables)
- [x] Floor order preserved (by creation)

---

## **Module 8: Tables**

### Zod Schemas
- [x] `tableCreateSchema` — floorId, number, seats, isActive (optional)
- [x] `tableUpdateSchema` — number, seats, isActive (all optional)

### Database Layer (`/lib/db/tables.ts`)
- [x] `getAll()` → all tables with floor + hasActiveOrder flag
- [x] `getById(id)` → table with floor + active order status
- [x] `getByFloor(floorId)` → tables in floor with active order
- [x] `create(floorId, number, seats, isActive)` → new table
- [x] `update(id, number?, seats?, isActive?)` → update fields
- [x] `delete(id)` → remove table
- [x] `hasActiveOrder(tableId)` → boolean check

### API Routes
- [x] `GET /api/tables` (Employee) — list with hasActiveOrder + activeOrderId
- [x] `POST /api/tables` (Admin) — create table
- [x] `PUT /api/tables/[id]` (Admin) — update table
- [x] `DELETE /api/tables/[id]` (Admin) — delete table

### Validation
- [x] floorId exists
- [x] number > 0
- [x] seats > 0
- [x] Composite unique on (floor_id, number)

### Test Coverage
- [x] Employee can fetch all tables with active order status
- [x] Admin can create tables under floor
- [x] Admin can update table number/seats/active
- [x] Admin can delete table
- [x] hasActiveOrder calculated correctly
- [x] activeOrderId returned when order exists
- [x] Duplicate table numbers in same floor rejected

---

## **Module 9: Customers**

### Zod Schemas
- [x] `customerCreateSchema` — name (required), email (optional), phone (optional)
- [x] `customerUpdateSchema` — name, email, phone (all optional)
- [x] `customerSearchSchema` — search (optional string)

### Database Layer (`/lib/db/customers.ts`)
- [x] `getAll(search?)` → all customers, filtered by name if search provided
- [x] `getById(id)` → single customer
- [x] `create(name, email?, phone?)` → new customer
- [x] `update(id, name?, email?, phone?)` → update fields
- [x] `delete(id)` → remove customer

### API Routes
- [x] `GET /api/customers` (Employee, query: search?) — list with optional search
- [x] `POST /api/customers` (Employee) — create customer
- [x] `PUT /api/customers/[id]` (Employee) — update customer
- [x] `DELETE /api/customers/[id]` (Employee) — delete customer

### Validation
- [x] name not empty
- [x] email valid format (if provided)
- [x] phone format (if provided)

### Test Coverage
- [x] Employee can create customer
- [x] Employee can search customer by name
- [x] Search is case-insensitive
- [x] Employee can update customer
- [x] Employee can delete customer
- [x] Email optional but used for receipts

---

## **Module 10: Sessions**

### Database Layer (`/lib/db/sessions.ts`)
- [x] `create(userId)` → new session (opened_at = now, closed_at = null)
- [x] `getActive(userId)` → active session for user (where closed_at is null)
- [x] `close(sessionId, closingSaleAmount)` → set closed_at + closing_sale_amount
- [x] `getSummary(sessionId)` → totalOrders, totalRevenue, openedAt, closedAt

### API Routes
- [x] `POST /api/session/open` (Employee) — create session, return sessionId
- [x] `POST /api/session/close` (Employee) — close session, return summary

### Validation
- [x] User can only have one active session at a time
- [x] Cannot close already-closed session
- [x] closingSaleAmount provided on close

### Test Coverage
- [x] Employee opens session, gets sessionId
- [x] Session records opened_at timestamp
- [x] Employee closes session, gets summary
- [x] Summary includes totalOrders, totalRevenue, dates
- [x] Cannot open 2 sessions simultaneously
- [x] Session persists across requests

---

## **Module 11: Orders (CORE)**

### Zod Schemas
- [x] `orderLineSchema` — productId, qty, unitPrice, appliedPromoId (optional)
- [x] `orderCreateSchema` — sessionId, tableId (optional), customerId (optional), lines[], couponCode (optional)
- [x] `orderPaySchema` — method (CASH/CARD/UPI), amountTendered (CASH only), reference (CARD only)

### Database Layer (`/lib/db/orders.ts`)
- [x] `getBySession(sessionId)` → all orders in session
- [x] `getById(id)` → order with all lines + customer + table
- [x] `generateOrderNumber()` → next ORD-0001 format
- [x] `create(data)` → new order (calls transaction with lines + KDS)
- [x] `updateStatus(id, status)` → set order status
- [x] `markPaid(id, method, reference?, changeDue?)` → set PAID + receipt
- [x] `delete(id)` → remove order (only if DRAFT)

### Database Layer (`/lib/db/orderLines.ts`)
- [x] `create(orderId, productId, qty, unitPrice, appliedPromoId?)` → new line (handled inside transaction)
- [x] `getByOrder(orderId)` → all lines with product + promo (handled inside getById)

### Promo Re-validation
- [x] Server re-validates all promos before persisting order
- [x] Revalidation prevents client-side discount tampering
- [x] Revalidation uses same logic as `/api/promotions/validate`

### Transaction
- [x] Create Order record
- [x] Create OrderLine records
- [x] Create KDSTicket record
- [x] Create KDSTicketItem records (one per line)
- [x] **Emit `ticket:new` Socket.io event**
- [x] All in single `prisma.$transaction()` for atomicity

### API Routes
- [x] `GET /api/orders` (Employee, query: sessionId) — list orders
- [x] `POST /api/orders` (Employee) — create order with transaction
- [x] `GET /api/orders/[id]` (Employee) — fetch order details
- [x] `DELETE /api/orders/[id]` (Employee) — delete DRAFT only
- [x] `POST /api/orders/[id]/pay` (Employee) — mark PAID + return receipt

### Order Calculations
- [x] Subtotal = sum of (qty × unitPrice) for all lines
- [x] Tax = sum of (qty × unitPrice × taxRate%) for each line
- [x] Discount = sum of all applied discounts
- [x] Total = Subtotal + Tax - Discount

### Payment Methods
- [x] **CASH**: calculate change = amountTendered - total
- [x] **CARD**: store reference number
- [x] **UPI**: no extra fields, just mark paid

### Receipt Data
- [x] orderNumber, date, customer, total
- [x] All line items with quantities + prices
- [x] Subtotal, tax, discount, total
- [x] Payment method + change/reference
- [x] Paid timestamp

### Test Coverage
- [x] Order created in DRAFT status
- [x] Order number generated (ORD-0001 sequence)
- [x] All lines created with correct calculations
- [x] KDSTicket + items created
- [x] `ticket:new` event emitted with correct payload
- [x] Can only delete DRAFT orders
- [x] Pay order transitions to PAID
- [x] Receipt returned with all fields
- [x] CASH: change calculated correctly
- [x] CARD: reference stored
- [x] Server revalidation prevents tampering
- [x] Transaction atomicity (all or nothing)

---

## **Module 12: KDS (Kitchen Display System)**

### Database Layer (`/lib/db/kdsTickets.ts`)
- [x] `getById(id)` → ticket with all items + order lines
- [x] `advance(id)` → cycle to next stage (TO_COOK → PREPARING → COMPLETED)
- [x] `getByStatus(status)` → all tickets in status

### Database Layer (`/lib/db/kdsTicketItems.ts`)
- [x] `toggle(itemId)` → flip isStruckThrough boolean
- [x] `getByTicket(ticketId)` → all items in ticket

### API Routes
- [x] `POST /api/kds/tickets/[id]/advance` (Public) — advance stage
  - [x] Validate ticket exists
  - [x] Prevent advance if already COMPLETED (return 400)
  - [x] Update status to next stage
  - [x] **Emit `ticket:updated` event**
- [x] `POST /api/kds/tickets/[id]/items/[itemId]/toggle` (Public) — toggle item
  - [x] Validate ticket + item exist
  - [x] Flip isStruckThrough
  - [x] **Emit `ticket:updated` event**

### Socket.io Events
- [x] `ticket:new` — emitted on order creation
  - [x] Payload: `{ id, orderNumber, status, items: [{ id, name, qty, isStruckThrough }] }`
- [x] `ticket:updated` — emitted on advance + toggle
  - [x] Payload: `{ id, status?, items?: [{ id, isStruckThrough }] }`
- [x] Both events emit to `kds` room (public, no auth)

### Test Coverage
- [x] Advance cycles through 3 stages correctly
- [x] Already COMPLETED cannot advance (400)
- [x] Toggle item updates isStruckThrough
- [x] Socket.io events fire on every mutation
- [x] All KDS clients receive real-time updates
- [x] Public access (no auth required)
- [x] Event payloads match schema

---

## **Module 13: Reports & Analytics**

### Zod Schemas
- [x] `reportFilterSchema` — period (today/week/month/custom), from?, to?, employeeId?, sessionId?, productId?

### Period Calculation (`/lib/reports.ts`)
- [x] `getPeriodRange(period, from?, to?)` → date range for query
- [x] `getPreviousPeriodRange(period)` → previous period for % change calculation

### Database Layer (`/lib/db/reports.ts`)
- [x] `getKPIs(filters)` → totalOrders, revenue, avgOrder + previous period values
- [x] `getSalesTrend(filters)` → hourly or daily revenue breakdown
- [x] `getTopCategories(filters)` → category revenue + percent
- [x] `getTopProducts(filters)` → product qty + revenue
- [x] `getTopOrders(filters)` → top 10 orders by value

### Calculations
- [x] % change = ((current - previous) / previous) × 100
- [x] Sales trend: group by hour/day, sum revenue
- [x] Top categories: sum revenue by category
- [x] Top products: sum qty + revenue by product
- [x] Top orders: sort by total descending, limit 10

### API Routes
- [x] `GET /api/reports` (Admin, query: period, from?, to?, employeeId?, sessionId?, productId?)
  - [x] Fetch KPIs + trends + tops
  - [x] Calculate % changes
  - [x] Apply all filters
- [x] `GET /api/reports/export` (Admin, query: same + format: pdf|xls)
  - [x] Generate PDF with all data
  - [x] Generate XLS with multiple sheets
  - [x] Return as file download

### Export Formats
- [x] **PDF**: formatted table with KPIs, charts, tops
- [x] **XLS**: multiple sheets (KPI, Sales, Categories, Products, Orders)

### Test Coverage
- [x] Fetch today's KPIs
- [x] Fetch week's KPIs with % change
- [x] Fetch custom date range
- [x] Apply employee filter
- [x] Apply product filter
- [x] Export to PDF
- [x] Export to XLS
- [x] All calculations accurate
- [x] Date range calculations correct

---

## **Module 14: Custom Server & Socket.io**

### Custom HTTP Server (`server.ts`)
- [x] Create Node.js HTTP server
- [x] Mount Next.js request handler
- [x] Attach Socket.io to same server
- [x] Export handler for production

### Socket.io Server (`/lib/socket.ts`)
- [x] Create Socket.io instance attached to HTTP server
- [x] Configure `kds` room (public, no auth)
- [x] On connection: auto-join to `kds` room
- [x] Implement `ticket:new` event emission
- [x] Implement `ticket:updated` event emission
- [x] Error handling + reconnection support

### Event Emissions
- [x] From `/api/orders` → POST create: emit `ticket:new`
- [x] From `/api/kds/tickets/[id]/advance`: emit `ticket:updated`
- [x] From `/api/kds/tickets/[id]/items/[itemId]/toggle`: emit `ticket:updated`
- [x] Emit to `io.to('kds')` room (all KDS clients)

### Test Coverage
- [x] Server starts with `npm run dev`
- [x] Socket.io connects on KDS page
- [x] Events received on client
- [x] Multiple clients receive same event
- [x] No auth required for KDS
- [x] Reconnection works

---

## **Module 15: Zod Validation Schemas**

### Location: `/schemas/`
- [x] `auth.ts` — loginSchema, signupSchema
- [x] `user.ts` — userCreateSchema, userUpdateSchema
- [x] `category.ts` — categoryCreateSchema, categoryUpdateSchema
- [x] `product.ts` — productCreateSchema, productUpdateSchema
- [x] `promotion.ts` — couponSchema, productPromoSchema, orderPromoSchema, validatePromosSchema
- [x] `table.ts` — floorSchema, tableCreateSchema, tableUpdateSchema
- [x] `customer.ts` — customerCreateSchema, customerUpdateSchema
- [x] `order.ts` — orderLineSchema, orderCreateSchema, orderPaySchema
- [x] `report.ts` — reportFilterSchema

### Each Schema Should
- [x] Use TypeScript `.ts` extension (not `.ts` with runtime validation only)
- [x] Export `z.object()` or `z.infer<>` for types
- [x] Include field descriptions (for error messages)
- [x] Be shared between client + server
- [x] Have proper error messages for validation failures

---

## **Notes**
- All database queries must live in `/lib/db/` — never inline in route handlers
- Use `prisma.$transaction()` for multi-step operations (Order + Lines + KDSTicket + Items)
- All API responses follow: `{ data: T }` on success or `{ error: string }` on failure
- Status codes: 200 (OK), 201 (Created), 400 (validation), 401 (auth), 403 (permission), 404, 500
- Middleware runs on all routes except `/api/auth/*`, `/api/kds/*`, public pages
- Socket.io `kds` room is public — no auth required
- Database IDs are UUIDs (`@default(uuid())`)
- Soft delete products via `is_archived` flag (not hard delete)
- Cannot delete payment methods — only toggle via seed + update
