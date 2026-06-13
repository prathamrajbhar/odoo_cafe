# Odoo Cafe POS — Product Requirements Document

## 1. Overview

A restaurant Point-of-Sale system built on Odoo for the Parul University Hackathon. The system covers backend configuration, a POS terminal, a kitchen display, and basic analytics. 27 screens total across 3 active user roles.

---

## 2. Roles

| Role | Access | Auth |
|---|---|---|
| Admin (Owner) | Backend config + POS terminal | Email + Password |
| Employee (Cashier) | POS terminal only | Email + Password |
| Kitchen Staff | KDS screen only | No login — fixed URL |
| Customer | No screens — passive, managed by Employee | — |

---

## 3. Auth

**Login**
- Fields: Email, Password
- On success → POS session opens directly

**Signup**
- Fields: Name, Email, Password
- On success → POS session opens directly

---

## 4. Backend Pages (Admin only, 9 pages)

### 4.1 Product Management
- List all products
- Create / Edit / Delete a product
- Fields: Name, Category (dropdown, with on-the-fly create), Price, Tax (5% / 18% / 28% dropdown), Description
- Category created inline from the product form — no separate navigation required

### 4.2 Category Management
- Inline-editable list — no separate form
- Fields per row: Name, Color
- "New" appends a blank row at the bottom
- Color propagates to product cards in the POS terminal

### 4.3 Payment Method Setup
- Fixed list of 3 methods: Cash, Card, UPI
- Each has an Activate / Deactivate toggle
- UPI reveals two extra fields: UPI ID (text, e.g. `abc@upi.com`) + live QR code preview
- Cash and Card have no extra fields

### 4.4 Coupon & Promotion Management
Three promotion subtypes, all managed from one page:

| Subtype | Fields |
|---|---|
| Coupon | Code (text), Discount Value, Discount Type (% or ₹) |
| Promo — Product-based | Product (select), Min Qty (number), Discount Value, Discount Type |
| Promo — Order-based | Min Order Amount (₹), Discount Value, Discount Type |

- Product-based: auto-fires when qty of that product in cart reaches Min Qty
- Order-based: auto-fires when cart subtotal crosses Min Order Amount
- Coupon: employee manually enters code at POS — does not auto-fire

### 4.5 Floor Plan & Table Management
- Create / Edit / Delete floors
- Under each floor: add tables
- Table fields: Number, Seats, Active status
- Active tables appear in the POS floor grid

### 4.6 User / Employee Management
- List: Name, Role (User / Employee), Status (Active / Disabled)
- Select a record → action menu: Delete, Archive, Change Password
- Change Password: popup with a single new-password field

### 4.7 Reports / Analytics Dashboard
**Filters**: Period (Today / Week / Month / Custom date picker), Employee, Session, Product

**KPI cards**: Total Orders, Revenue, Average Order — each with % change vs previous period

**Charts**:
- Sales trend: line chart (x-axis = time of day)
- Top Selling Category: pie chart

**Tables**:
- Top Orders: Order, Session, POS, Date, Customer, Employee, Total
- Top Products: Product name, Qty, Revenue
- Top Categories: Category name, Revenue

**Export**: PDF, XLS

### 4.8 POS Terminal & Session Control
- Shows last open session date and last closing sale amount
- "Open Session" button → launches POS terminal
- Closing session shows a shift summary before closing

---

## 5. POS Terminal (Employee, 8 screens)

### 5.1 Floor Popup — Table Selection
- Triggered on session start and via the table icon in the nav bar
- Grid of all tables with table numbers
- Occupied tables: highlighted pink/red
- Tap any table → opens that table's Order View

### 5.2 Main Order View (3-column layout)
**Left — Products**
- Category tabs across the top, color-coded per category
- Product cards below: name + price
- Click a card → adds to cart

**Middle — Cart**
- Each line: Product name, quantity stepper (−/+), unit price, line total
- If a product promo is triggered: discount shown as sub-line under that item
- If an order promo is triggered: shown as a separate discount line at the bottom
- Bottom action bar: [Customer] [Discount] [Send] buttons
- Totals: Subtotal, Tax (GST 5%), Total

**Right — Payment**
- Payment method buttons: Cash, UPI, Card
- Selected method is highlighted
- Amount display showing total due
- Numpad: 0–9, +/-, ×, Qty, Prices, Disc. (Discount), Clear
- "Send to Kitchen" button → sends current cart to KDS

### 5.3 Discount Popup
Opened via the "Discount" button in the cart bottom bar.

**Top section — Coupon entry**
- Text field: "Enter Coupon Code"
- "Enter" button → validates code → applies if valid

**Bottom section — Auto-applied promos (read-only)**
- Lists automated promotions that have already fired on this order
- Displayed as radio-style list (e.g. "30% Discount — order above ₹500", "25% Discount — 3+ burgers")
- Informational only — promos applied automatically, employee cannot toggle them here

### 5.4 Payment & Receipt
Three flows depending on method selected:

**Cash**
- Enter amount received → change due calculated and shown

**UPI**
- QR code auto-generated from stored UPI ID + order total
- Two actions: "Confirmed" (marks paid) or "Cancel"

**Card**
- Enter transaction reference number

**Post-payment (all methods)**
- Two options: Print receipt OR Send to email
- Send to email: popup with email field (pre-filled if customer email is on file)

### 5.5 Orders List
- Full-width table: Date, Order#, Customer, Amount, Status (Draft / Paid / Cancelled)
- Search by: customer name, order number, date
- Click any row → Order Detail popup

### 5.6 Order Detail View
- Displays: Order#, Date, Customer, Amount, Status, product list
- **Draft orders**: Delete button + Edit Order button
  - Edit Order → loads the order back into the cart (Main Order View with that order's items)
- **Paid orders**: view-only, no action buttons

### 5.7 Customer Management
- Search customers by name
- Create new customer: Name, Email, Phone
- Edit customer: popup form
- Delete customer
- Select a customer → links them to the current order; their email is used for the receipt

### 5.8 Table View
- Shows all floors and all tables
- Visual distinction: occupied vs free
- Tap any table → opens its active order in the Main Order View

---

## 6. Kitchen Display System (KDS)

- URL: `localhost:PORT/KDS`
- No authentication required
- Real-time updates (WebSocket or polling)

**Tabs**: All | To Cook | Preparing | Completed — each with a live count

**Order card**:
- Shows: Order# (matches POS order number), list of items with quantities
- Click entire card → advances whole order to next stage (To Cook → Preparing → Completed)
- Click individual item within a card → toggles strikethrough on that item (partial completion, does not advance the card stage)

**Left sidebar**:
- Filter by Product
- Filter by Category
- Search bar

---

## 7. Navigation

**Nav bar (POS terminal, top)**
- Logo
- Search bar
- POS / Register icon
- Clock icon
- New Order icon
- Table indicator (e.g. "Table 12 V")
- Profile icon
- Hamburger menu

**Hamburger menu items**:
- Products
- Category
- Payment Method
- Coupon & Promotion
- Booking *(appears in nav — behavior not specified in wireframes or PDF)*
- User/Employee
- KDS
- Reports
- Log-Out

---

## 8. Data Entities

| Entity | Fields |
|---|---|
| User | id, name, email, password_hash, role (Admin/Employee), status (Active/Disabled) |
| Product | id, name, category_id, price, tax_rate (5/18/28), description, is_archived |
| Category | id, name, color_hex |
| PaymentMethod | id, type (Cash/Card/UPI), is_active, upi_id? |
| Promotion | id, name, promo_type (Coupon/ProductBased/OrderBased), code?, product_id?, min_qty?, min_order_amount?, discount_value, discount_type (%/₹), is_active |
| Floor | id, name |
| Table | id, floor_id, number, seats, is_active |
| Customer | id, name, email, phone |
| Session | id, opened_by_user_id, opened_at, closed_at, closing_sale_amount |
| Order | id, session_id, table_id?, customer_id?, employee_id, order_number, status (Draft/Paid/Cancelled), subtotal, tax_amount, discount_amount, total, created_at |
| OrderLine | id, order_id, product_id, qty, unit_price, line_total, applied_promo_id? |
| KDSTicket | id, order_id, status (ToCook/Preparing/Completed) |
| KDSTicketItem | id, ticket_id, order_line_id, is_struck_through |

---

## 9. Open Questions

| # | Item | Source |
|---|---|---|
| 1 | **Booking** — menu item visible in every wireframe, zero wireframes or spec for it | Hamburger menu, all screens |
| 2 | **Employee login** — unclear if employees use the same login form as Admin or have a PIN-based entry | No separate employee login wireframe shown |
| 3 | **Tax rate** — cart shows "GST 5%" as a fixed line but products can be set to 5/18/28%. Which rate applies at the cart level? Per-line or a single order-level rate? | Pg 2 (product fields) vs POS 2 (cart totals) |
| 4 | **"Send" button** in cart bottom bar — distinct from "Send to Kitchen". Target and behavior not specified | POS 2 wireframe |
| 5 | **Cancelled order** — status exists in Orders List but no flow shows how an order gets cancelled | POS 5 |
