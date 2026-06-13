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
- [ ] `categoryCreateSchema` — name (string, required), colorHex (hex string, required)
- [ ] `categoryUpdateSchema` — name (optional), colorHex (optional)

### Database Layer (`/lib/db/categories.ts`)
- [ ] `getAll()` → all categories sorted by name
- [ ] `getById(id)` → single category
- [ ] `create(name, colorHex)` → new category
- [ ] `update(id, name?, colorHex?)` → update fields
- [ ] `delete(id)` → remove category
- [ ] `getWithProductCount(id)` → category + product count

### API Routes
- [ ] `GET /api/categories` (Employee) — list all
- [ ] `POST /api/categories` (Admin) — create new
- [ ] `PUT /api/categories/[id]` (Admin) — update
- [ ] `DELETE /api/categories/[id]` (Admin) — delete

### Validation
- [ ] colorHex valid hex format (#RRGGBB)
- [ ] name not empty
- [ ] Cannot delete category if products exist (or cascade soft-delete products)

### Test Coverage
- [ ] Employee can fetch categories
- [ ] Admin can create category with color
- [ ] Admin can update category
- [ ] Admin can delete category
- [ ] Invalid hex color rejected
- [ ] Duplicate names allowed (different IDs)

---

## **Module 4: Products**

### Zod Schemas
- [ ] `productCreateSchema` — name, categoryId, price, taxRate (5/18/28), description (optional)
- [ ] `productUpdateSchema` — all fields optional

### Database Layer (`/lib/db/products.ts`)
- [ ] `getAll(archived=false)` → non-archived products with category
- [ ] `getById(id)` → product with category
- [ ] `getByCategory(categoryId)` → all products in category
- [ ] `create(name, categoryId, price, taxRate, description)` → new product
- [ ] `update(id, name?, categoryId?, price?, taxRate?, description?)` → update fields
- [ ] `archive(id)` → set is_archived = true (soft delete)
- [ ] `delete(id)` → hard delete (if needed)

### API Routes
- [ ] `GET /api/products` (Employee) — list non-archived with category
- [ ] `POST /api/products` (Admin) — create product
- [ ] `PUT /api/products/[id]` (Admin) — update product
- [ ] `DELETE /api/products/[id]` (Admin) — soft-delete (archive)

### Validation
- [ ] price > 0 and max 2 decimals
- [ ] taxRate must be 5, 18, or 28
- [ ] categoryId must exist
- [ ] name not empty

### Test Coverage
- [ ] Employee can fetch all products
- [ ] Products include category info
- [ ] Archived products don't appear in list
- [ ] Admin can create product with different tax rates
- [ ] Admin can update product
- [ ] Admin delete archives (not hard delete)
- [ ] Cannot create product without category

---

## **Module 5: Payment Methods**

### Database Layer (`/lib/db/paymentMethods.ts`)
- [ ] `getAll()` → all 3 payment methods
- [ ] `getById(id)` → single method
- [ ] `update(id, isActive?, upiId?)` → toggle/update UPI ID
- [ ] Seed function: insert CASH, CARD, UPI (inactive, null upiId)

### API Routes
- [ ] `GET /api/payment-methods` (Admin) — list all 3
- [ ] `PUT /api/payment-methods/[id]` (Admin) — update isActive/upiId

### Validation
- [ ] Only CASH, CARD, UPI allowed (enum)
- [ ] upiId only settable on UPI record
- [ ] Cannot create/delete payment methods (only seed + toggle)
- [ ] Only one record per payment type (unique constraint)

### Test Coverage
- [ ] Exactly 3 payment methods exist after seed
- [ ] Admin can toggle isActive
- [ ] Admin can set upiId for UPI
- [ ] Cannot add upiId to CASH or CARD
- [ ] Only active methods appear in POS terminal

---

## **Module 6: Promotions**

### Zod Schemas
- [ ] `promotionBaseSchema` — name, discountValue, discountType (PERCENT/FIXED), isActive
- [ ] `couponSchema` — extends base + code (unique, required)
- [ ] `productPromoSchema` — extends base + productId, minQty (required)
- [ ] `orderPromoSchema` — extends base + minOrderAmount (required)
- [ ] `validatePromosSchema` — code (optional), subtotal, lines[]

### Promo Logic (`/lib/promo.ts`)
- [ ] `evaluateProductPromos(cartLines, activePromos)` → matching product-based promos
- [ ] `evaluateOrderPromos(subtotal, activePromos)` → matching order-based promos
- [ ] `validateCoupon(code, activePromos)` → verify code exists + active or throw
- [ ] `calculateDiscount(discountValue, discountType, amount)` → discount in rupees
- [ ] `applyPromos(cartLines, subtotal, code, activePromos)` → all applicable promos

### Database Layer (`/lib/db/promotions.ts`)
- [ ] `getAll(activeOnly=true)` → all promotions
- [ ] `getById(id)` → single promotion
- [ ] `getByCode(code)` → coupon by code
- [ ] `create(type, data)` → validate type-specific fields + create
- [ ] `update(id, data)` → update promo
- [ ] `delete(id)` → remove promotion

### API Routes
- [ ] `GET /api/promotions` (Employee) — list all active
- [ ] `POST /api/promotions` (Admin) — create (coupon/product/order)
- [ ] `PUT /api/promotions/[id]` (Admin) — update
- [ ] `DELETE /api/promotions/[id]` (Admin) — delete
- [ ] `POST /api/promotions/validate` (Employee) — validate code + auto-fire

### Validation
- [ ] Coupon code unique (if creating COUPON)
- [ ] productId exists (if PRODUCT_BASED)
- [ ] minQty > 0 (if PRODUCT_BASED)
- [ ] minOrderAmount > 0 (if ORDER_BASED)
- [ ] discountValue > 0
- [ ] discountType in [PERCENT, FIXED]
- [ ] For PERCENT: max 100%
- [ ] For FIXED: value in rupees

### Test Coverage
- [ ] Create coupon, validate code, apply discount
- [ ] Create product promo, fire at qty threshold
- [ ] Create order promo, fire at subtotal threshold
- [ ] Inactive promos don't fire
- [ ] Client-side tampering prevented by server revalidation
- [ ] Multiple promos can apply simultaneously
- [ ] Discount calculations correct for PERCENT vs FIXED
- [ ] Invalid coupon returns 400

---

## **Module 7: Floors**

### Zod Schemas
- [ ] `floorCreateSchema` — name (string, required)
- [ ] `floorUpdateSchema` — name (optional)

### Database Layer (`/lib/db/floors.ts`)
- [ ] `getAll()` → all floors with tables included
- [ ] `getById(id)` → floor with all its tables
- [ ] `create(name)` → new floor
- [ ] `update(id, name)` → update name
- [ ] `delete(id)` → remove floor (cascade delete tables)

### API Routes
- [ ] `GET /api/floors` (Admin) — list all with tables
- [ ] `POST /api/floors` (Admin) — create new floor
- [ ] `PUT /api/floors/[id]` (Admin) — update floor name
- [ ] `DELETE /api/floors/[id]` (Admin) — delete floor

### Validation
- [ ] floor name not empty
- [ ] floor name not duplicate (optional)

### Test Coverage
- [ ] Admin can create multiple floors
- [ ] Admin can list floors with all tables
- [ ] Admin can update floor name
- [ ] Admin can delete floor (removes tables)
- [ ] Floor order preserved (by creation)

---

## **Module 8: Tables**

### Zod Schemas
- [ ] `tableCreateSchema` — floorId, number, seats, isActive (optional)
- [ ] `tableUpdateSchema` — number, seats, isActive (all optional)

### Database Layer (`/lib/db/tables.ts`)
- [ ] `getAll()` → all tables with floor + hasActiveOrder flag
- [ ] `getById(id)` → table with floor + active order status
- [ ] `getByFloor(floorId)` → tables in floor with active order
- [ ] `create(floorId, number, seats, isActive)` → new table
- [ ] `update(id, number?, seats?, isActive?)` → update fields
- [ ] `delete(id)` → remove table
- [ ] `hasActiveOrder(tableId)` → boolean check

### API Routes
- [ ] `GET /api/tables` (Employee) — list with hasActiveOrder + activeOrderId
- [ ] `POST /api/tables` (Admin) — create table
- [ ] `PUT /api/tables/[id]` (Admin) — update table
- [ ] `DELETE /api/tables/[id]` (Admin) — delete table

### Validation
- [ ] floorId exists
- [ ] number > 0
- [ ] seats > 0
- [ ] Composite unique on (floor_id, number)

### Test Coverage
- [ ] Employee can fetch all tables with active order status
- [ ] Admin can create tables under floor
- [ ] Admin can update table number/seats/active
- [ ] Admin can delete table
- [ ] hasActiveOrder calculated correctly
- [ ] activeOrderId returned when order exists
- [ ] Duplicate table numbers in same floor rejected

---

## **Module 9: Customers**

### Zod Schemas
- [ ] `customerCreateSchema` — name (required), email (optional), phone (optional)
- [ ] `customerUpdateSchema` — name, email, phone (all optional)
- [ ] `customerSearchSchema` — search (optional string)

### Database Layer (`/lib/db/customers.ts`)
- [ ] `getAll(search?)` → all customers, filtered by name if search provided
- [ ] `getById(id)` → single customer
- [ ] `create(name, email?, phone?)` → new customer
- [ ] `update(id, name?, email?, phone?)` → update fields
- [ ] `delete(id)` → remove customer

### API Routes
- [ ] `GET /api/customers` (Employee, query: search?) — list with optional search
- [ ] `POST /api/customers` (Employee) — create customer
- [ ] `PUT /api/customers/[id]` (Employee) — update customer
- [ ] `DELETE /api/customers/[id]` (Employee) — delete customer

### Validation
- [ ] name not empty
- [ ] email valid format (if provided)
- [ ] phone format (if provided)

### Test Coverage
- [ ] Employee can create customer
- [ ] Employee can search customer by name
- [ ] Search is case-insensitive
- [ ] Employee can update customer
- [ ] Employee can delete customer
- [ ] Email optional but used for receipts

---

## **Module 10: Sessions**

### Database Layer (`/lib/db/sessions.ts`)
- [ ] `create(userId)` → new session (opened_at = now, closed_at = null)
- [ ] `getActive(userId)` → active session for user (where closed_at is null)
- [ ] `close(sessionId, closingSaleAmount)` → set closed_at + closing_sale_amount
- [ ] `getSummary(sessionId)` → totalOrders, totalRevenue, openedAt, closedAt

### API Routes
- [ ] `POST /api/session/open` (Employee) — create session, return sessionId
- [ ] `POST /api/session/close` (Employee) — close session, return summary

### Validation
- [ ] User can only have one active session at a time
- [ ] Cannot close already-closed session
- [ ] closingSaleAmount provided on close

### Test Coverage
- [ ] Employee opens session, gets sessionId
- [ ] Session records opened_at timestamp
- [ ] Employee closes session, gets summary
- [ ] Summary includes totalOrders, totalRevenue, dates
- [ ] Cannot open 2 sessions simultaneously
- [ ] Session persists across requests

---

## **Module 11: Orders (CORE)**

### Zod Schemas
- [ ] `orderLineSchema` — productId, qty, unitPrice, appliedPromoId (optional)
- [ ] `orderCreateSchema` — sessionId, tableId (optional), customerId (optional), lines[], couponCode (optional)
- [ ] `orderPaySchema` — method (CASH/CARD/UPI), amountTendered (CASH only), reference (CARD only)

### Database Layer (`/lib/db/orders.ts`)
- [ ] `getBySession(sessionId)` → all orders in session
- [ ] `getById(id)` → order with all lines + customer + table
- [ ] `generateOrderNumber()` → next ORD-0001 format
- [ ] `create(data)` → new order (calls transaction with lines + KDS)
- [ ] `updateStatus(id, status)` → set order status
- [ ] `markPaid(id, method, reference?, changeDue?)` → set PAID + receipt
- [ ] `delete(id)` → remove order (only if DRAFT)

### Database Layer (`/lib/db/orderLines.ts`)
- [ ] `create(orderId, productId, qty, unitPrice, appliedPromoId?)` → new line
- [ ] `getByOrder(orderId)` → all lines with product + promo

### Promo Re-validation
- [ ] Server re-validates all promos before persisting order
- [ ] Revalidation prevents client-side discount tampering
- [ ] Revalidation uses same logic as `/api/promotions/validate`

### Transaction
- [ ] Create Order record
- [ ] Create OrderLine records
- [ ] Create KDSTicket record
- [ ] Create KDSTicketItem records (one per line)
- [ ] **Emit `ticket:new` Socket.io event**
- [ ] All in single `prisma.$transaction()` for atomicity

### API Routes
- [ ] `GET /api/orders` (Employee, query: sessionId) — list orders
- [ ] `POST /api/orders` (Employee) — create order with transaction
- [ ] `GET /api/orders/[id]` (Employee) — fetch order details
- [ ] `DELETE /api/orders/[id]` (Employee) — delete DRAFT only
- [ ] `POST /api/orders/[id]/pay` (Employee) — mark PAID + return receipt

### Order Calculations
- [ ] Subtotal = sum of (qty × unitPrice) for all lines
- [ ] Tax = sum of (qty × unitPrice × taxRate%) for each line
- [ ] Discount = sum of all applied discounts
- [ ] Total = Subtotal + Tax - Discount

### Payment Methods
- [ ] **CASH**: calculate change = amountTendered - total
- [ ] **CARD**: store reference number
- [ ] **UPI**: no extra fields, just mark paid

### Receipt Data
- [ ] orderNumber, date, customer, total
- [ ] All line items with quantities + prices
- [ ] Subtotal, tax, discount, total
- [ ] Payment method + change/reference
- [ ] Paid timestamp

### Test Coverage
- [ ] Order created in DRAFT status
- [ ] Order number generated (ORD-0001 sequence)
- [ ] All lines created with correct calculations
- [ ] KDSTicket + items created
- [ ] `ticket:new` event emitted with correct payload
- [ ] Can only delete DRAFT orders
- [ ] Pay order transitions to PAID
- [ ] Receipt returned with all fields
- [ ] CASH: change calculated correctly
- [ ] CARD: reference stored
- [ ] Server revalidation prevents tampering
- [ ] Transaction atomicity (all or nothing)

---

## **Module 12: KDS (Kitchen Display System)**

### Database Layer (`/lib/db/kdsTickets.ts`)
- [ ] `getById(id)` → ticket with all items + order lines
- [ ] `advance(id)` → cycle to next stage (TO_COOK → PREPARING → COMPLETED)
- [ ] `getByStatus(status)` → all tickets in status

### Database Layer (`/lib/db/kdsTicketItems.ts`)
- [ ] `toggle(itemId)` → flip isStruckThrough boolean
- [ ] `getByTicket(ticketId)` → all items in ticket

### API Routes
- [ ] `POST /api/kds/tickets/[id]/advance` (Public) — advance stage
  - [ ] Validate ticket exists
  - [ ] Prevent advance if already COMPLETED (return 400)
  - [ ] Update status to next stage
  - [ ] **Emit `ticket:updated` event**
- [ ] `POST /api/kds/tickets/[id]/items/[itemId]/toggle` (Public) — toggle item
  - [ ] Validate ticket + item exist
  - [ ] Flip isStruckThrough
  - [ ] **Emit `ticket:updated` event**

### Socket.io Events
- [ ] `ticket:new` — emitted on order creation
  - [ ] Payload: `{ id, orderNumber, status, items: [{ id, name, qty, isStruckThrough }] }`
- [ ] `ticket:updated` — emitted on advance + toggle
  - [ ] Payload: `{ id, status?, items?: [{ id, isStruckThrough }] }`
- [ ] Both events emit to `kds` room (public, no auth)

### Test Coverage
- [ ] Advance cycles through 3 stages correctly
- [ ] Already COMPLETED cannot advance (400)
- [ ] Toggle item updates isStruckThrough
- [ ] Socket.io events fire on every mutation
- [ ] All KDS clients receive real-time updates
- [ ] Public access (no auth required)
- [ ] Event payloads match schema

---

## **Module 13: Reports & Analytics**

### Zod Schemas
- [ ] `reportFilterSchema` — period (today/week/month/custom), from?, to?, employeeId?, sessionId?, productId?

### Period Calculation (`/lib/reports.ts`)
- [ ] `getPeriodRange(period, from?, to?)` → date range for query
- [ ] `getPreviousPeriodRange(period)` → previous period for % change calculation

### Database Layer (`/lib/db/reports.ts`)
- [ ] `getKPIs(filters)` → totalOrders, revenue, avgOrder + previous period values
- [ ] `getSalesTrend(filters)` → hourly or daily revenue breakdown
- [ ] `getTopCategories(filters)` → category revenue + percent
- [ ] `getTopProducts(filters)` → product qty + revenue
- [ ] `getTopOrders(filters)` → top 10 orders by value

### Calculations
- [ ] % change = ((current - previous) / previous) × 100
- [ ] Sales trend: group by hour/day, sum revenue
- [ ] Top categories: sum revenue by category
- [ ] Top products: sum qty + revenue by product
- [ ] Top orders: sort by total descending, limit 10

### API Routes
- [ ] `GET /api/reports` (Admin, query: period, from?, to?, employeeId?, sessionId?, productId?)
  - [ ] Fetch KPIs + trends + tops
  - [ ] Calculate % changes
  - [ ] Apply all filters
- [ ] `GET /api/reports/export` (Admin, query: same + format: pdf|xls)
  - [ ] Generate PDF with all data
  - [ ] Generate XLS with multiple sheets
  - [ ] Return as file download

### Export Formats
- [ ] **PDF**: formatted table with KPIs, charts, tops
- [ ] **XLS**: multiple sheets (KPI, Sales, Categories, Products, Orders)

### Test Coverage
- [ ] Fetch today's KPIs
- [ ] Fetch week's KPIs with % change
- [ ] Fetch custom date range
- [ ] Apply employee filter
- [ ] Apply product filter
- [ ] Export to PDF
- [ ] Export to XLS
- [ ] All calculations accurate
- [ ] Date range calculations correct

---

## **Module 14: Custom Server & Socket.io**

### Custom HTTP Server (`server.ts`)
- [ ] Create Node.js HTTP server
- [ ] Mount Next.js request handler
- [ ] Attach Socket.io to same server
- [ ] Export handler for production

### Socket.io Server (`/lib/socket.ts`)
- [ ] Create Socket.io instance attached to HTTP server
- [ ] Configure `kds` room (public, no auth)
- [ ] On connection: auto-join to `kds` room
- [ ] Implement `ticket:new` event emission
- [ ] Implement `ticket:updated` event emission
- [ ] Error handling + reconnection support

### Event Emissions
- [ ] From `/api/orders` → POST create: emit `ticket:new`
- [ ] From `/api/kds/tickets/[id]/advance`: emit `ticket:updated`
- [ ] From `/api/kds/tickets/[id]/items/[itemId]/toggle`: emit `ticket:updated`
- [ ] Emit to `io.to('kds')` room (all KDS clients)

### Test Coverage
- [ ] Server starts with `npm run dev`
- [ ] Socket.io connects on KDS page
- [ ] Events received on client
- [ ] Multiple clients receive same event
- [ ] No auth required for KDS
- [ ] Reconnection works

---

## **Module 15: Zod Validation Schemas**

### Location: `/schemas/`
- [ ] `auth.ts` — loginSchema, signupSchema
- [ ] `user.ts` — userCreateSchema, userUpdateSchema
- [ ] `category.ts` — categoryCreateSchema, categoryUpdateSchema
- [ ] `product.ts` — productCreateSchema, productUpdateSchema
- [ ] `promotion.ts` — couponSchema, productPromoSchema, orderPromoSchema, validatePromosSchema
- [ ] `table.ts` — floorSchema, tableCreateSchema, tableUpdateSchema
- [ ] `customer.ts` — customerCreateSchema, customerUpdateSchema
- [ ] `order.ts` — orderLineSchema, orderCreateSchema, orderPaySchema
- [ ] `report.ts` — reportFilterSchema

### Each Schema Should
- [ ] Use TypeScript `.ts` extension (not `.ts` with runtime validation only)
- [ ] Export `z.object()` or `z.infer<>` for types
- [ ] Include field descriptions (for error messages)
- [ ] Be shared between client + server
- [ ] Have proper error messages for validation failures

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
