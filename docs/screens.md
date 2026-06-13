# Odoo Cafe POS — Screens

---

## Auth

### S1 — Login
**Route:** `/login`

**Components:**
- Logo
- Email input
- Password input
- Submit button ("Sign In")
- Link to Signup

**Enters from:** Any protected route redirect, Log-Out action
**Exits to:** `/pos` on success (both Admin and Employee)

---

### S2 — Signup
**Route:** `/signup`

**Components:**
- Logo
- Name input
- Email input
- Password input
- Submit button ("Sign Up")
- Link to Login

**Enters from:** Link on Login screen
**Exits to:** `/pos` on success

---

## Admin Backend

All admin pages share a common layout: top nav bar (Logo, page title, hamburger menu).

---

### S3 — Product Management
**Route:** `/admin/products`

**Components:**
- Product list table (Name, Category, Price, Tax, Description)
- "New" button → opens Product Form modal
- Row actions: Edit (opens Product Form modal), Delete, Archive
- Product Form modal:
  - Name input
  - Category dropdown + inline "Create category" option
  - Price input
  - Tax dropdown (5% / 18% / 28%)
  - Description textarea
  - Save / Cancel buttons

**Enters from:** Hamburger menu → Products
**Exits to:** Hamburger menu (any item)

---

### S4 — Category Management
**Route:** `/admin/categories`

**Components:**
- Inline-editable list table (Name, Color picker per row)
- "New" button → appends blank row at bottom
- Each row: Name text input, Color swatch picker, Save row / Delete row icons

**Enters from:** Hamburger menu → Category
**Exits to:** Hamburger menu (any item)

---

### S5 — Payment Method Setup
**Route:** `/admin/payment-methods`

**Components:**
- Fixed list of 3 rows: Cash, Card, UPI
- Each row: Method name, Activate toggle
- UPI row (when active): UPI ID text input + live QR code preview panel

**Enters from:** Hamburger menu → Payment Method
**Exits to:** Hamburger menu (any item)

---

### S6 — Coupon & Promotion Management
**Route:** `/admin/promotions`

**Components:**
- Promo list table (Name, Type, Discount, Active status)
- "New" button → opens Promo Form modal
- Promo Form modal:
  - Name input
  - Type selector: Coupon / Product-based / Order-based
  - Coupon fields: Code input, Discount Value, Discount Type (% / ₹)
  - Product-based fields: Product dropdown, Min Qty input, Discount Value, Discount Type
  - Order-based fields: Min Order Amount input, Discount Value, Discount Type
  - Active toggle
  - Save / Cancel buttons
- Row actions: Edit, Delete

**Enters from:** Hamburger menu → Coupon & Promotion
**Exits to:** Hamburger menu (any item)

---

### S7 — Floor Plan & Table Management
**Route:** `/admin/floors`

**Components:**
- Floor list (accordion or tabs per floor)
- "New Floor" button → name input inline
- Per floor: table list (Number, Seats, Active toggle)
- "New Table" button per floor → inline row: Number input, Seats input, Active toggle
- Row actions: Edit inline, Delete

**Enters from:** Hamburger menu → Floor/Table management
**Exits to:** Hamburger menu (any item)

---

### S8 — User / Employee Management
**Route:** `/admin/users`

**Components:**
- Staff list table (Name, Role, Status)
- "New" button → opens User Form modal
- User Form modal: Name, Email, Password, Role dropdown (Admin/Employee)
- Row select → action menu: Delete, Archive, Change Password
- Change Password modal: new password input, Confirm button

**Enters from:** Hamburger menu → User/Employee
**Exits to:** Hamburger menu (any item)

---

### S9 — Reports / Analytics Dashboard
**Route:** `/admin/reports`

**Components:**
- Filter bar: Period (Today/Week/Month/Custom date picker), Employee dropdown, Session dropdown, Product dropdown
- KPI cards (3): Total Orders, Revenue, Average Order — each with % change vs previous period
- Sales trend line chart (x-axis: time of day)
- Top Selling Category pie chart
- Top Orders table (Order, Session, POS, Date, Customer, Employee, Total)
- Top Products table (Product name, Qty, Revenue)
- Top Categories table (Category name, Revenue)
- Export dropdown: PDF, XLS

**Enters from:** Hamburger menu → Reports
**Exits to:** Hamburger menu (any item)

---

### S10 — POS Session Control
**Route:** `/admin/session`

**Components:**
- Last open session date display
- Last closing sale amount display
- "Open Session" button
- Session summary panel (shown after close): total orders, total revenue, shift duration
- "Close Session" button (visible when session is open)

**Enters from:** Hamburger menu → Session
**Exits to:** `/pos` on Open Session

---

## POS Terminal

All POS screens share a top nav bar: Logo, Search bar, Register icon, Clock icon, New Order icon, Table indicator, Profile icon, Hamburger menu.

---

### S11 — Floor Popup (Table Selection)
**Route:** modal overlay on `/pos`

**Components:**
- Modal overlay on Main Order View
- Grid of table cards (table number per card)
- Occupied tables: pink/red highlight
- Free tables: default style
- Close button (×)

**Enters from:** Session start (auto-shown), Table icon in nav bar, Table View (S18) tap
**Exits to:** S12 Main Order View (for selected table)

---

### S12 — Main Order View
**Route:** `/pos`

**Layout:** 3 columns

**Left column — ProductPanel:**
- Category tab bar (color-coded, horizontal scroll)
- Product card grid: Name + Price per card
- Click card → adds to cart

**Middle column — CartPanel:**
- Cart line list:
  - Product name
  - Qty stepper (− / +)
  - Unit price
  - Line total
  - If product promo triggered: discount sub-line below item
- Order-level discount line (if order promo triggered)
- Bottom action bar: [Customer] [Discount] [Send] buttons
- Totals: Subtotal, Tax (GST 5%), Total

**Right column — PaymentPanel:**
- Payment method buttons: Cash, UPI, Card (active method highlighted)
- Amount display (total due)
- Numpad: 0–9, +/-, ×, Qty, Prices, Disc., Clear (×)
- "Send to Kitchen" button

**Enters from:** S10 Session Control (Open Session), S11 Floor Popup (table selected), S16 Order Detail (Edit Order), S18 Table View (tap occupied table)
**Exits to:**
- S11 Floor Popup → table icon in nav
- S13 Discount Popup → Discount button
- S14 Payment Screen → Cash/UPI/Card button
- S15 Orders List → orders icon in nav
- S17 Customer Panel → Customer button
- S18 Table View → table view icon in nav
- S3–S10 Admin pages → hamburger menu

---

### S13 — Discount Popup
**Route:** modal on `/pos`

**Components:**
- Modal overlay
- Top section:
  - "Coupon Code" label
  - Text input (Enter Coupon Code)
  - "Enter" button
- Divider
- Bottom section (read-only):
  - "Auto-applied promos" label
  - Radio-style list of promotions already triggered on this order
- Close button (×)

**Enters from:** S12 CartPanel → Discount button
**Exits to:** S12 Main Order View (close or after applying coupon)

---

### S14 — Payment & Receipt Screen
**Route:** modal/overlay on `/pos`

**Components (vary by selected method):**

Cash:
- Amount due display
- "Amount Received" input
- Change Due display (calculated)
- Confirm button

UPI:
- QR code (auto-generated from UPI ID + order total)
- Order total display
- "Confirmed" button, "Cancel" button

Card:
- Transaction Reference input
- Confirm button

Post-payment (all methods):
- "Print Receipt" button
- "Send to Email" button → Email Receipt Modal:
  - Email input (pre-filled if customer linked)
  - Send button

**Enters from:** S12 PaymentPanel → Cash / UPI / Card button
**Exits to:** S12 Main Order View (after receipt or cancel)

---

### S15 — Orders List
**Route:** `/pos/orders` or slide-in panel on `/pos`

**Components:**
- Search bar (by customer name, order#, date)
- Orders table: Date, Order#, Customer, Amount, Status (Draft/Paid/Cancelled)
- Click row → S16 Order Detail popup

**Enters from:** Orders icon in POS nav bar
**Exits to:** S16 Order Detail (row click), S12 Main Order View (back)

---

### S16 — Order Detail View
**Route:** modal on `/pos/orders`

**Components:**
- Order# display
- Date display
- Customer display
- Amount display
- Status badge (Draft / Paid / Cancelled)
- Product list (name + qty per line)
- Draft only: Delete button + Edit Order button
- Close button (×)

**Enters from:** S15 Orders List (row click)
**Exits to:**
- S12 Main Order View (Edit Order — loads order into cart)
- S15 Orders List (close / after delete)

---

### S17 — Customer Panel
**Route:** slide-in or modal on `/pos`

**Components:**
- Search input (by name)
- Customer list results
- "New Customer" button → Customer Form:
  - Name input
  - Email input
  - Phone input
  - Save button
- Customer row actions: Select (links to order), Edit (inline popup), Delete
- Close button

**Enters from:** S12 CartPanel → Customer button
**Exits to:** S12 Main Order View (after select / close)

---

### S18 — Table View
**Route:** `/pos/tables` or overlay on `/pos`

**Components:**
- Floor tabs (one per floor)
- Table grid per floor:
  - Table card: table number + seat count
  - Occupied: distinct color/style
  - Free: default style
- Tap table → opens that table's order

**Enters from:** Table view icon in POS nav bar
**Exits to:** S12 Main Order View (tap any table), S11 Floor Popup

---

## Kitchen Display System

### S19 — Kitchen Display System (KDS)
**Route:** `/kds`

**Components:**
- Top tab bar: All | To Cook (n) | Preparing (n) | Completed (n) — with live counts
- Ticket card grid:
  - Order# header
  - Item list: item name + quantity per row
  - Click entire card → advances order stage (To Cook → Preparing → Completed)
  - Click individual item row → toggles strikethrough on that item only
- Left sidebar:
  - Filter by Product (dropdown/checkboxes)
  - Filter by Category (dropdown/checkboxes)
  - Search bar

**Enters from:** Direct URL (`/kds`) — no auth, no navigation from POS
**Exits to:** Nowhere — standalone screen, no outbound navigation
**Real-time:** Socket.io — receives `ticket:new` and `ticket:updated` events

---

## Screen Connection Map

```
/login ──────────────────────────────► /pos
/signup ─────────────────────────────► /pos

/pos (Main Order View)
  ├── [table icon]      ──► Floor Popup (S11) ──► /pos (table loaded)
  ├── [Discount btn]    ──► Discount Popup (S13) ──► /pos
  ├── [Cash/UPI/Card]   ──► Payment Screen (S14) ──► /pos
  ├── [orders icon]     ──► Orders List (S15)
  │                           └── row click ──► Order Detail (S16)
  │                                 └── Edit Order ──► /pos (cart loaded)
  ├── [Customer btn]    ──► Customer Panel (S17) ──► /pos
  ├── [table view icon] ──► Table View (S18) ──► /pos (table loaded)
  └── [hamburger]
        ├── Products         ──► /admin/products (S3)
        ├── Category         ──► /admin/categories (S4)
        ├── Payment Method   ──► /admin/payment-methods (S5)
        ├── Coupon/Promo     ──► /admin/promotions (S6)
        ├── Floor/Tables     ──► /admin/floors (S7)
        ├── User/Employee    ──► /admin/users (S8)
        ├── Reports          ──► /admin/reports (S9)
        ├── KDS              ──► /kds (new tab)
        └── Log-Out          ──► /login

/admin/session (S10)
  └── Open Session ──► /pos

/kds (S19) — standalone, Socket.io only, no outbound links
```
