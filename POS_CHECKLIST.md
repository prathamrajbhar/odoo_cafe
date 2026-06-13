# POS Terminal — Implementation Checklist

All APIs are ready. All POS component files exist but are empty. Build in order — each section depends on the one above it.

---

## Phase 1 — Foundation

- [x] Create `src/app/pos/layout.tsx` — wraps all POS routes, renders top nav bar, provides cart context
- [x] Create `src/context/POSContext.tsx` — shared state: `sessionId`, `activeTable`, `cartLines`, `currentOrderId`, `activeModal`
- [x] Add session guard in layout — fetch `GET /api/session/status`, redirect to `/admin/session` if no open session
- [x] Build top nav bar component — Logo, Search, Register icon, Clock, New Order icon, Table indicator, Profile icon, Hamburger menu
- [x] Hamburger menu links — Products, Category, Payment Method, Coupon & Promotion, Floor/Tables, User/Employee, Reports, KDS, Log-Out

---

## Phase 2 — Main Order View (S12)

- [x] Update `src/app/pos/page.tsx` — render 3-column layout: `<ProductPanel>` | `<CartPanel>` | `<PaymentPanel>`
- [x] **ProductPanel** (`src/components/pos/ProductPanel.tsx`)
  - [x] Fetch `GET /api/products` and `GET /api/categories` on mount
  - [x] Render color-coded category tab bar (horizontal scroll, color from `category.colorHex`)
  - [x] Render product card grid filtered by selected category (name + price per card)
  - [x] Click product card → add to cart (update POSContext cartLines)
- [x] **CartPanel** (`src/components/pos/CartPanel.tsx`)
  - [x] Render cart line list — product name, qty stepper (−/+), unit price, line total
  - [x] Qty stepper: decrement to 0 removes the line
  - [x] Show product-promo discount as sub-line under triggered item
  - [x] Show order-level discount as a separate bottom line
  - [x] Footer: Subtotal, Tax (per product taxRate), Total
  - [x] `[Customer]` button → opens CustomerPanel modal
  - [x] `[Discount]` button → opens DiscountPopup modal
  - [x] `[Send]` button — spec unclear; treat as alias for Send to Kitchen for now
- [x] **PaymentPanel** (`src/components/pos/PaymentPanel.tsx`)
  - [x] Render Cash / UPI / Card method buttons (active method highlighted)
  - [x] Amount due display
  - [x] Numpad: 0–9, +/−, ×, Qty, Prices, Disc., Clear
  - [x] Numpad modes: Qty mode adjusts selected line qty; Disc. mode applies manual discount
  - [x] "Send to Kitchen" button → `POST /api/orders` (creates DRAFT order + KDS ticket) → then open PaymentScreen

---

## Phase 3 — Floor Popup (S11)

- [x] **FloorPopup** (`src/components/pos/FloorPopup.tsx`)
  - [x] Fetch `GET /api/tables` (includes `hasActiveOrder`, `activeOrderId`)
  - [x] Render table card grid — table number per card
  - [x] Occupied tables (hasActiveOrder = true) → pink/red highlight
  - [x] Free tables → default style
  - [x] Click table → set `activeTable` in POSContext, close modal
  - [x] Auto-open on session start (no table selected yet)
  - [x] Open via Table icon in nav bar
  - [x] Close (×) button

---

## Phase 4 — Discount Popup (S13)

- [x] **DiscountPopup** (`src/components/pos/DiscountPopup.tsx`)
  - [x] Coupon code text input + "Enter" button
  - [x] On Enter → `POST /api/promotions/validate` with `{ code, subtotal, lines }`
  - [x] Show error toast on invalid/inactive code (API returns 400)
  - [x] On success → apply discount to cart, update POSContext
  - [x] Bottom read-only section: list auto-applied promos already fired on the cart
  - [x] Auto-applied promos evaluated client-side from active promotions vs current cart state
  - [x] Close (×) button

---

## Phase 5 — Payment & Receipt Screen (S14)

- [x] **PaymentScreen** (`src/components/pos/PaymentScreen.tsx`)
  - [x] Modal overlay triggered by selecting a payment method in PaymentPanel
  - [x] **Cash flow**
    - [x] Amount due display
    - [x] "Amount Received" number input
    - [x] Change Due = received − total (live calculated, shown in green)
    - [x] Confirm button → `POST /api/orders/[id]/pay` with `{ method: "CASH", amountTendered }`
  - [x] **UPI flow**
    - [x] Fetch active UPI ID from `GET /api/payment-methods`
    - [x] Render QR code (upiId + order total encoded)
    - [x] Order total display
    - [x] "Confirmed" button → `POST /api/orders/[id]/pay` with `{ method: "UPI" }`
    - [x] "Cancel" button → close modal, return to Main Order View
  - [x] **Card flow**
    - [x] Transaction Reference text input
    - [x] Confirm button → `POST /api/orders/[id]/pay` with `{ method: "CARD", reference }`
  - [x] **Post-payment (all methods)**
    - [x] Receipt summary: Order#, items, subtotal, tax, discount, total, method, change due
    - [x] "Print Receipt" button → `window.print()` on receipt element
    - [x] "Send to Email" button → opens email modal
      - [x] Email input (pre-filled with customer email if linked)
      - [x] Send button (integrate email service or stub)
    - [x] "New Order" button → clear cart, reset POSContext, return to Main Order View

---

## Phase 6 — Orders List & Order Detail (S15, S16)

- [x] Create `src/app/pos/orders/page.tsx` — route `/pos/orders`
- [x] **OrdersList** (`src/components/pos/OrdersList.tsx`)
  - [x] Fetch `GET /api/orders?sessionId=...` using sessionId from POSContext
  - [x] Render table: Date, Order#, Customer, Amount, Status badge (Draft/Paid/Cancelled)
  - [x] Search bar — filter by customer name, order number, date (client-side filter)
  - [x] Click row → open OrderDetail modal
- [x] **OrderDetail** (`src/components/pos/OrderDetail.tsx`)
  - [x] Fetch `GET /api/orders/[id]` for full detail
  - [x] Display: Order#, Date, Customer, Amount, Status badge, product lines (name + qty)
  - [x] DRAFT only: "Delete" button → `DELETE /api/orders/[id]` → remove from list
  - [x] DRAFT only: "Edit Order" button → load order lines back into POSContext cart → navigate to `/pos`
  - [x] PAID: view-only, no action buttons
  - [x] Close (×) button

---

## Phase 7 — Customer Panel (S17)

- [x] **CustomerPanel** (`src/components/pos/CustomerPanel.tsx`)
  - [x] Search input → `GET /api/customers?search=...` (debounced)
  - [x] Render customer list results (name, email, phone)
  - [x] "New Customer" button → inline form: Name, Email, Phone → `POST /api/customers`
  - [x] Select customer row → link customerId to current order in POSContext
  - [x] Edit row → inline popup form → `PUT /api/customers/[id]`
  - [x] Delete row → `DELETE /api/customers/[id]`
  - [x] Close button

---

## Phase 8 — Table View (S18)

- [x] Create `src/app/pos/tables/page.tsx` — route `/pos/tables`
- [x] **TableView** (`src/components/pos/TableView.tsx`)
  - [x] Fetch `GET /api/floors` (floors with nested tables) + `GET /api/tables` (for occupancy)
  - [x] Render floor tabs (one tab per floor)
  - [x] Per floor: table card grid — table number + seat count
  - [x] Occupied tables → distinct color/style
  - [x] Free tables → default style
  - [x] Tap occupied table → load `activeOrderId` into POSContext, navigate to `/pos`
  - [x] Tap free table → set `activeTable` in POSContext, navigate to `/pos`

---

## Phase 9 — Promo Engine (client-side)

- [ ] Implement client-side auto-promo evaluation in POSContext
  - [ ] Fetch `GET /api/promotions` once on session load (active promos only)
  - [ ] On every cart change: evaluate `PRODUCT_BASED` promos (check min qty per product)
  - [ ] On every cart change: evaluate `ORDER_BASED` promos (check subtotal vs minOrderAmount)
  - [ ] Push triggered promos into cart state so CartPanel can render sub-lines
  - [ ] Pass triggered promos + coupon code to `POST /api/orders` payload (server re-validates)

---

## Phase 10 — Edge Cases & Guards

- [ ] Empty cart guard — disable "Send to Kitchen" if cartLines is empty
- [ ] No session guard — redirect `/pos` → `/admin/session` if session is closed
- [ ] Payment method availability — hide Cash/UPI/Card buttons for inactive methods (check `GET /api/payment-methods`)
- [ ] Cancelled order — add "Cancel Order" action on DRAFT orders in OrderDetail (set status to CANCELLED, or use Delete)
- [ ] Table already occupied — show warning if selected table has an active order from a different session

---

## Done (backend — no action needed)

- [x] `POST /api/auth/login` + `POST /api/auth/signup`
- [x] `GET /api/products`, `GET /api/categories`
- [x] `GET /api/tables`, `GET /api/floors`
- [x] `GET /api/promotions`, `POST /api/promotions/validate`
- [x] `GET /api/customers`, `POST /api/customers`, `PUT`, `DELETE`
- [x] `GET /api/payment-methods`
- [x] `POST /api/orders`, `GET /api/orders`, `GET /api/orders/[id]`, `DELETE /api/orders/[id]`
- [x] `POST /api/orders/[id]/pay`
- [x] `GET /api/session/status`, `POST /api/session/open`, `POST /api/session/close`
- [x] KDS Socket.io events (`ticket:new`, `ticket:updated`)
- [x] Shared UI primitives: `Modal`, `Button`, `Input`, `Numpad`, `SearchBar`, `Badge`, `Table`
