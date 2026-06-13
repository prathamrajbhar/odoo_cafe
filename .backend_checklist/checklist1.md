# Backend Implementation — Phase-wise Checklist

**Project:** Odoo Cafe POS
**Stack:** Next.js 14 + TypeScript + PostgreSQL + Prisma + Socket.io
**Last Updated:** 2026-06-13

---

## **Phase 1: Foundation & Infrastructure**
**Goal:** Set up database, core utilities, and custom server for Socket.io
**Status:** ☐ Not Started

### Tasks
- [ ] Set up Prisma schema with all 13 tables and enums
- [ ] Create initial migration and test connection
- [ ] Implement `/lib/prisma.ts` (Prisma client singleton)
- [ ] Implement `/lib/jwt.ts` (sign/verify JWT tokens)
- [ ] Implement `/lib/bcrypt.ts` (hash/compare passwords)
- [ ] Seed `payment_methods` table (CASH, CARD, UPI - inactive)
- [ ] Set up custom Node.js HTTP server in `server.ts` (wraps Next.js)
- [ ] Implement Socket.io server in `/lib/socket.ts` with `kds` room
- [ ] Create `.env` with `DATABASE_URL` and `JWT_SECRET`

### Deliverables
✓ Database ready with all tables and relationships
✓ Core utilities (JWT, bcrypt) working
✓ Custom server running with Socket.io initialized
✓ Prisma client ready for use

### Test Plan
```bash
npm run dev  # starts without errors
npx prisma studio  # can browse database
```

### Acceptance Criteria
- [ ] `npm run dev` runs without errors
- [ ] Prisma Studio accessible
- [ ] Socket.io server logs on startup
- [ ] Database connection verified

---

## **Phase 2: Authentication & User Management**
**Goal:** Complete login/signup/auth flow and user CRUD
**Depends on:** Phase 1
**Status:** ☐ Not Started

### Tasks
- [ ] Create Zod schemas: loginSchema, signupSchema, userSchema
- [ ] Implement `middleware.ts` for JWT verification on protected routes
- [ ] Create `/lib/db/users.ts` with all query functions
- [ ] `/api/auth/login` — POST validate credentials, return JWT + role
- [ ] `/api/auth/signup` — POST create first user as Admin, rest as Employee
- [ ] `/api/auth/logout` — POST clear token cookie
- [ ] `/api/users` — GET list all users (Admin only)
- [ ] `/api/users` — POST create new user (Admin only)
- [ ] `/api/users/[id]` — PUT update user (Admin only)
- [ ] `/api/users/[id]/password` — PUT change password (Admin only)
- [ ] `/api/users/[id]` — DELETE user (Admin only)

### Deliverables
✓ Auth system working with JWT in httpOnly cookies
✓ Role-based access control (Admin vs Employee)
✓ User management endpoints for Admin
✓ Password hashing with bcrypt

### Test Plan
```bash
# Signup first user (becomes Admin)
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@test.com","password":"pass123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"pass123"}'

# Create employee (as Admin)
curl -X POST http://localhost:3000/api/users \
  -H "Cookie: token=<jwt_token>" \
  -d '{"name":"Employee","email":"emp@test.com","password":"pass123","role":"EMPLOYEE"}'
```

### Acceptance Criteria
- [ ] First signup creates Admin user
- [ ] Subsequent signups create Employee users
- [ ] Login returns JWT in httpOnly cookie
- [ ] Middleware blocks unauthorized access
- [ ] Admin can create/update/delete employees
- [ ] Password changes hash correctly

---

## **Phase 3: Product Catalog Management**
**Goal:** Complete product and category CRUD for Admin backend
**Depends on:** Phase 2
**Status:** ☐ Not Started

### Tasks
- [ ] Create Zod schemas: categorySchema, productSchema
- [ ] Create `/lib/db/categories.ts` with query functions
- [ ] Create `/lib/db/products.ts` with query functions
- [ ] `/api/categories` — GET list (Employee)
- [ ] `/api/categories` — POST create (Admin)
- [ ] `/api/categories/[id]` — PUT update name/color (Admin)
- [ ] `/api/categories/[id]` — DELETE (Admin)
- [ ] `/api/products` — GET list non-archived (Employee)
- [ ] `/api/products` — POST create (Admin)
- [ ] `/api/products/[id]` — PUT update (Admin)
- [ ] `/api/products/[id]` — DELETE soft-delete via is_archived (Admin)

### Deliverables
✓ Product catalog fully manageable
✓ Categories with color codes
✓ Products linked to categories
✓ Soft-delete support for products

### Test Plan
```bash
# Create category
curl -X POST http://localhost:3000/api/categories \
  -H "Cookie: token=<admin_jwt>" \
  -d '{"name":"Burgers","colorHex":"#FF5733"}'

# Create product
curl -X POST http://localhost:3000/api/products \
  -H "Cookie: token=<admin_jwt>" \
  -d '{"name":"Cheese Burger","categoryId":"<cat_id>","price":299,"taxRate":5,"description":"Delicious cheese burger"}'

# List products (as Employee)
curl http://localhost:3000/api/products \
  -H "Cookie: token=<employee_jwt>"
```

### Acceptance Criteria
- [ ] Admin can create categories with custom colors
- [ ] Admin can create products with price and tax rate (5/18/28)
- [ ] Employee can list all non-archived products
- [ ] Products grouped by category
- [ ] Archive product sets is_archived=true (not hard delete)
- [ ] Products return with category info

---

## **Phase 4: Promotions & Discounts**
**Goal:** Implement all 3 promotion types with validation and auto-fire logic
**Depends on:** Phase 3
**Status:** ☐ Not Started

### Tasks
- [ ] Create Zod schemas for coupon/product-based/order-based promos
- [ ] Implement `/lib/promo.ts` with evaluation logic:
  - [ ] `evaluateProductPromos()` — check qty thresholds
  - [ ] `evaluateOrderPromos()` — check subtotal thresholds
  - [ ] `validateCoupon()` — verify code exists + active
- [ ] Create `/lib/db/promotions.ts` with query functions
- [ ] `/api/promotions` — GET list active (Employee)
- [ ] `/api/promotions` — POST create (Admin) with type validation
- [ ] `/api/promotions/[id]` — PUT update (Admin)
- [ ] `/api/promotions/[id]` — DELETE (Admin)
- [ ] `/api/promotions/validate` — POST validate coupon + auto-fire promos (Employee)

### Deliverables
✓ All 3 promotion types working (Coupon, Product-based, Order-based)
✓ Coupon code validation
✓ Auto-fire logic on cart (server-side verified before order persists)
✓ Discount calculations accurate

### Test Plan
```bash
# Create coupon
curl -X POST http://localhost:3000/api/promotions \
  -H "Cookie: token=<admin_jwt>" \
  -d '{"name":"SUMMER10","promoType":"COUPON","code":"SUMMER10","discountValue":10,"discountType":"PERCENT","isActive":true}'

# Create product-based promo
curl -X POST http://localhost:3000/api/promotions \
  -H "Cookie: token=<admin_jwt>" \
  -d '{"name":"Buy 3 Burgers","promoType":"PRODUCT_BASED","productId":"<product_id>","minQty":3,"discountValue":50,"discountType":"FIXED","isActive":true}'

# Create order-based promo
curl -X POST http://localhost:3000/api/promotions \
  -H "Cookie: token=<admin_jwt>" \
  -d '{"name":"Order above 500","promoType":"ORDER_BASED","minOrderAmount":500,"discountValue":15,"discountType":"PERCENT"}'

# Validate cart with coupon + check auto-fire
curl -X POST http://localhost:3000/api/promotions/validate \
  -H "Cookie: token=<employee_jwt>" \
  -d '{"code":"SUMMER10","subtotal":1000,"lines":[{"productId":"<id>","qty":3}]}'
```

### Acceptance Criteria
- [ ] Create all 3 promo types without errors
- [ ] Coupon validation rejects invalid codes
- [ ] Product-based promo fires at correct qty threshold
- [ ] Order-based promo fires at correct subtotal threshold
- [ ] Discount calculations correct (PERCENT vs FIXED)
- [ ] Server validates promos before order persists
- [ ] Inactive promos don't fire

---

## **Phase 5: Floors, Tables & Layout Management**
**Goal:** Set up restaurant layout for POS terminal
**Depends on:** Phase 2
**Status:** ☐ Not Started

### Tasks
- [ ] Create Zod schemas: floorSchema, tableSchema
- [ ] Create `/lib/db/floors.ts` with query functions
- [ ] Create `/lib/db/tables.ts` with query functions (include hasActiveOrder check)
- [ ] `/api/floors` — GET list with tables (Admin)
- [ ] `/api/floors` — POST create (Admin)
- [ ] `/api/floors/[id]` — PUT update (Admin)
- [ ] `/api/floors/[id]` — DELETE (Admin)
- [ ] `/api/tables` — GET list with active order status (Employee)
- [ ] `/api/tables` — POST create (Admin)
- [ ] `/api/tables/[id]` — PUT update (Admin)
- [ ] `/api/tables/[id]` — DELETE (Admin)

### Deliverables
✓ Floor plan editable by Admin
✓ Tables can be marked occupied/free
✓ Active order shown per table
✓ Floor grid ready for POS display

### Test Plan
```bash
# Create floor
curl -X POST http://localhost:3000/api/floors \
  -H "Cookie: token=<admin_jwt>" \
  -d '{"name":"Ground Floor"}'

# Create tables
curl -X POST http://localhost:3000/api/tables \
  -H "Cookie: token=<admin_jwt>" \
  -d '{"floorId":"<floor_id>","number":1,"seats":4,"isActive":true}'

# Get tables with active order (Employee)
curl http://localhost:3000/api/tables \
  -H "Cookie: token=<employee_jwt>"
```

### Acceptance Criteria
- [ ] Admin can create multiple floors
- [ ] Admin can add tables to floors
- [ ] Tables show hasActiveOrder status
- [ ] Employee can fetch all tables with active order info
- [ ] Update/delete tables without errors
- [ ] Composite unique on (floor_id, number)

---

## **Phase 6: Customers Management**
**Goal:** Customer CRUD for POS terminal linking to orders
**Depends on:** Phase 2
**Status:** ☐ Not Started

### Tasks
- [ ] Create Zod schemas: customerCreateSchema, customerUpdateSchema
- [ ] Create `/lib/db/customers.ts` with search functionality
- [ ] `/api/customers` — GET list with search by name (Employee)
- [ ] `/api/customers` — POST create (Employee)
- [ ] `/api/customers/[id]` — PUT update (Employee)
- [ ] `/api/customers/[id]` — DELETE (Employee)

### Deliverables
✓ Customer database with search capability
✓ Can link customers to orders
✓ Customer email used for receipt delivery

### Test Plan
```bash
# Create customer
curl -X POST http://localhost:3000/api/customers \
  -H "Cookie: token=<employee_jwt>" \
  -d '{"name":"John Doe","email":"john@test.com","phone":"9876543210"}'

# Search customer
curl "http://localhost:3000/api/customers?search=John" \
  -H "Cookie: token=<employee_jwt>"
```

### Acceptance Criteria
- [ ] Employee can create customers
- [ ] Search by name works (case-insensitive)
- [ ] Email optional but used for receipts
- [ ] Phone optional
- [ ] Can update/delete customers

---

## **Phase 7: Sessions & Order Management (CORE)**
**Goal:** Complete order lifecycle from creation to payment
**Depends on:** Phase 4, Phase 5, Phase 6
**Status:** ☐ Not Started

### Tasks
- [ ] Create `/lib/db/sessions.ts` (open, close, get summary)
- [ ] Create Zod schemas: orderCreateSchema, orderLineSchema, paymentSchema
- [ ] Create `/lib/db/orders.ts` with all order queries
- [ ] Create `/lib/db/orderLines.ts` for line-item queries
- [ ] `/api/session/open` — POST create session (Employee)
- [ ] `/api/session/close` — POST close session + return summary (Employee)
- [ ] `/api/orders` — GET list by session (Employee)
- [ ] `/api/orders` — POST create order with:
  - [ ] Server-side promo re-validation
  - [ ] Generate order_number (ORD-0001 format)
  - [ ] Transaction: Order + OrderLines + KDSTicket + KDSTicketItems
  - [ ] **Emit `ticket:new` Socket.io event to `kds` room**
- [ ] `/api/orders/[id]` — GET fetch with lines (Employee)
- [ ] `/api/orders/[id]` — DELETE only if DRAFT (Employee)
- [ ] `/api/orders/[id]/pay` — POST mark PAID with method + return receipt (Employee)

### Deliverables
✓ Complete order flow working (Draft → Paid)
✓ Session management (open/close)
✓ Order creation with transaction safety
✓ KDS integration via Socket.io
✓ Receipt generation

### Test Plan
```bash
# Open session
curl -X POST http://localhost:3000/api/session/open \
  -H "Cookie: token=<employee_jwt>"

# Create order
curl -X POST http://localhost:3000/api/orders \
  -H "Cookie: token=<employee_jwt>" \
  -d '{"sessionId":"<sid>","tableId":"<tid>","customerId":"<cid>","lines":[{"productId":"<pid>","qty":2,"unitPrice":299,"appliedPromoId":null}],"couponCode":null}'

# Pay order
curl -X POST http://localhost:3000/api/orders/\<oid\>/pay \
  -H "Cookie: token=<employee_jwt>" \
  -d '{"method":"CASH","amountTendered":1000}'

# Close session
curl -X POST http://localhost:3000/api/session/close \
  -H "Cookie: token=<employee_jwt>"
```

### Acceptance Criteria
- [ ] Open session creates Session record
- [ ] Order creation generates ORD-0001 format number
- [ ] Server re-validates all promos before persisting
- [ ] Transaction creates Order + Lines + KDSTicket + Items atomically
- [ ] `ticket:new` Socket.io event emitted on order creation
- [ ] Pay order calculates change (CASH), stores reference (CARD), handles UPI
- [ ] Receipt returned with all order details
- [ ] Can only delete DRAFT orders
- [ ] Close session returns summary with totalOrders, totalRevenue
- [ ] Order status: DRAFT → PAID (or CANCELLED)

---

## **Phase 8: Kitchen Display System (KDS) Real-time**
**Goal:** Real-time kitchen updates via Socket.io
**Depends on:** Phase 1, Phase 7
**Status:** ☐ Not Started

### Tasks
- [ ] Create `/lib/db/kdsTickets.ts` with queries
- [ ] Create `/lib/db/kdsTicketItems.ts` with toggle functionality
- [ ] `/api/kds/tickets/[id]/advance` — POST cycle stage (Public):
  - [ ] TO_COOK → PREPARING → COMPLETED
  - [ ] Return 400 if already COMPLETED
  - [ ] **Emit `ticket:updated` Socket.io event**
- [ ] `/api/kds/tickets/[id]/items/[itemId]/toggle` — POST strikethrough item (Public):
  - [ ] Flip `isStruckThrough` boolean
  - [ ] **Emit `ticket:updated` Socket.io event**
- [ ] Test Socket.io events fire on every mutation
- [ ] Verify Socket.io event payloads match schema

### Deliverables
✓ KDS receives real-time order updates
✓ Kitchen can advance order stages
✓ Kitchen can strikethrough individual items
✓ All clients see real-time updates via Socket.io

### Test Plan
```bash
# Advance ticket stage
curl -X POST http://localhost:3000/api/kds/tickets/\<tid\>/advance

# Toggle item strikethrough
curl -X POST http://localhost:3000/api/kds/tickets/\<tid\>/items/\<itemId\>/toggle

# Monitor Socket.io events in browser console (KDS page)
```

### Acceptance Criteria
- [ ] Advance endpoint cycles through 3 stages correctly
- [ ] Already COMPLETED stages return 400
- [ ] Toggle item updates isStruckThrough flag
- [ ] `ticket:updated` events emit with correct payload
- [ ] All KDS clients receive real-time updates
- [ ] Socket.io maintains `kds` room (public, no auth required)

---

## **Phase 9: Payment Methods**
**Goal:** Manage payment options (Cash, Card, UPI with QR)
**Depends on:** Phase 2
**Status:** ☐ Not Started

### Tasks
- [ ] Create `/lib/db/paymentMethods.ts` with update function
- [ ] `/api/payment-methods` — GET list all 3 methods (Admin)
- [ ] `/api/payment-methods/[id]` — PUT toggle isActive + set upiId (Admin)

### Deliverables
✓ Admin can activate/deactivate payment methods
✓ UPI ID configured for QR code generation
✓ Payment methods show in POS terminal

### Test Plan
```bash
# Get payment methods
curl http://localhost:3000/api/payment-methods \
  -H "Cookie: token=<admin_jwt>"

# Activate UPI and set ID
curl -X PUT http://localhost:3000/api/payment-methods/\<upi_id\> \
  -H "Cookie: token=<admin_jwt>" \
  -d '{"isActive":true,"upiId":"merchant@upi.com"}'
```

### Acceptance Criteria
- [ ] 3 payment methods seeded on first run (CASH, CARD, UPI)
- [ ] Admin can toggle isActive for each
- [ ] UPI ID stored and retrievable
- [ ] Only CASH/CARD/UPI allowed (enum validation)
- [ ] Cannot delete payment methods (only toggle)

---

## **Phase 10: Reports & Analytics**
**Goal:** Admin reporting dashboard with KPIs, trends, exports
**Depends on:** Phase 7
**Status:** ☐ Not Started

### Tasks
- [ ] Create Zod schemas: reportFilterSchema
- [ ] Create `/lib/db/reports.ts` with all aggregation queries:
  - [ ] `getKPIs()` — totalOrders, revenue, avgOrder + % change vs prev period
  - [ ] `getSalesTrend()` — hourly/daily breakdown
  - [ ] `getTopCategories()` — by revenue
  - [ ] `getTopProducts()` — qty sold + revenue
  - [ ] `getTopOrders()` — top 10 orders by value
- [ ] Create `/lib/reports.ts` with period calculation helper
- [ ] `/api/reports` — GET fetch KPIs + charts + tables (Admin):
  - [ ] Support filters: period (today/week/month/custom), employeeId, sessionId, productId
  - [ ] Calculate % change vs previous same period
- [ ] `/api/reports/export` — GET export PDF format (Admin)
- [ ] `/api/reports/export` — GET export XLS format (Admin)

### Deliverables
✓ Complete analytics dashboard
✓ KPI cards with period-over-period comparison
✓ Sales trend chart
✓ Top products/categories breakdown
✓ Exportable reports (PDF/XLS)

### Test Plan
```bash
# Fetch today's report
curl "http://localhost:3000/api/reports?period=today" \
  -H "Cookie: token=<admin_jwt>"

# Fetch with filters
curl "http://localhost:3000/api/reports?period=month&employeeId=<id>&productId=<id>" \
  -H "Cookie: token=<admin_jwt>"

# Export to PDF
curl "http://localhost:3000/api/reports/export?period=week&format=pdf" \
  -H "Cookie: token=<admin_jwt>" > report.pdf

# Export to XLS
curl "http://localhost:3000/api/reports/export?period=month&format=xls" \
  -H "Cookie: token=<admin_jwt>" > report.xls
```

### Acceptance Criteria
- [ ] KPIs calculated correctly (totalOrders, revenue, avgOrder)
- [ ] % change vs previous period accurate
- [ ] All 4 period filters work (today/week/month/custom)
- [ ] Optional filters (employee/session/product) work
- [ ] Sales trend breaks down by hour or day
- [ ] Top categories/products sorted by revenue
- [ ] PDF export works and contains all data
- [ ] XLS export works and is parseable
- [ ] Date range calculations correct

---

## **Summary Progress**

| Phase | Title | Status | Dependencies |
|-------|-------|--------|--------------|
| 1 | Foundation & Infrastructure | ☐ | — |
| 2 | Authentication & User Management | ☐ | P1 |
| 3 | Product Catalog Management | ☐ | P2 |
| 4 | Promotions & Discounts | ☐ | P3 |
| 5 | Floors & Tables | ☐ | P2 |
| 6 | Customers Management | ☐ | P2 |
| 7 | Sessions & Orders (CORE) | ☐ | P4, P5, P6 |
| 8 | Kitchen Display System | ☐ | P1, P7 |
| 9 | Payment Methods | ☐ | P2 |
| 10 | Reports & Analytics | ☐ | P7 |

---

## **Notes**
- Each phase builds on previous phases
- Phase 7 (Sessions & Orders) is the critical path
- Phase 8 (KDS) requires Socket.io from Phase 1
- All endpoints follow `/api/` convention with standard response format: `{ data: T }` or `{ error: string }`
- Database queries must live in `/lib/db/` — never inline in route handlers
- Use `prisma.$transaction()` for multi-step operations to ensure atomicity
