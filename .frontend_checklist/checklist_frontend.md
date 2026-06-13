# Frontend Implementation — Complete Checklist

**Project:** Odoo Cafe POS
**Stack:** Next.js 14 (App Router) + React + TypeScript + Tailwind CSS + Socket.io
**Last Updated:** 2026-06-13

---

## **Phase 1: Foundation & Setup**
**Goal:** Set up project structure, global styles, and reusable components
**Status:** ☐ Not Started

### Project Setup
- [ ] Initialize Next.js 14 with TypeScript and Tailwind
- [ ] Set up folder structure: `/app`, `/components`, `/lib`, `/schemas`, `/styles`
- [ ] Configure `tailwind.config.ts` with color variables
- [ ] Set up CSS variables for colors (no hardcoded hex)
- [ ] Configure `tsconfig.json` for path aliases

### Global Styles
- [ ] Create `/styles/globals.css` with base reset + CSS variables
- [ ] Create `/styles/pos.css` for POS terminal layout
- [ ] Create `/styles/kds.css` for Kitchen Display System
- [ ] Mobile-first responsive design setup
- [ ] System font stack configuration (no Inter/Roboto unless specified)

### Shared Components (`/components/shared/`)
- [ ] `Button.tsx` — reusable button with variants
- [ ] `Modal.tsx` — modal dialog wrapper
- [ ] `SearchBar.tsx` — search input with debounce
- [ ] `Numpad.tsx` — numeric keypad for POS
- [ ] `Loading.tsx` — loading spinner/skeleton
- [ ] `Alert.tsx` — success/error/warning messages
- [ ] `Badge.tsx` — status badges
- [ ] `Input.tsx` — form input wrapper
- [ ] `Select.tsx` — dropdown select
- [ ] `Table.tsx` — data table component

### Utilities
- [ ] Create `/lib/api.ts` — fetch wrapper with error handling
- [ ] Create `/lib/toast.ts` — toast notification system
- [ ] Create `/lib/formatting.ts` — currency, date, number formatting
- [ ] Create `/lib/validation.ts` — client-side form validation

### Test Coverage
- [ ] All shared components render without errors
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] Tailwind utilities working correctly

---

## **Phase 2: Authentication Pages**
**Goal:** Login and signup pages with form validation
**Depends on:** Phase 1
**Status:** ☐ Not Started

### Pages (`/app/(auth)/`)
- [ ] `/app/(auth)/login/page.tsx` — login page with email + password
- [ ] `/app/(auth)/signup/page.tsx` — signup page with name + email + password

### Components (`/components/auth/`)
- [ ] `LoginForm.tsx` — email + password form with validation
- [ ] `SignupForm.tsx` — name + email + password form
- [ ] `AuthLayout.tsx` — centered layout for auth pages

### Features
- [ ] Form validation with Zod schemas
- [ ] Real-time field error messages
- [ ] Loading state on submit button
- [ ] Password toggle visibility
- [ ] Error toast on failed login
- [ ] Success redirect to `/pos` on login
- [ ] First signup logic (becomes Admin)
- [ ] Remember me checkbox (optional)
- [ ] Forgot password link (optional)

### Styling
- [ ] Mobile-first responsive layout
- [ ] Center card on larger screens
- [ ] Logo/branding at top
- [ ] Link to toggle between login/signup

### Test Coverage
- [ ] Form validates required fields
- [ ] Password min 6 characters enforced
- [ ] Email format validated
- [ ] Submit disabled while loading
- [ ] Error messages display correctly

---

## **Phase 3: Admin Backend — Product Management**
**Goal:** Product and category management pages
**Depends on:** Phase 2
**Status:** ☐ Not Started

### Pages (`/app/(admin)/`)
- [ ] `/app/(admin)/products/page.tsx` — product list + create/edit/delete
- [ ] `/app/(admin)/categories/page.tsx` — inline editable category list

### Components (`/components/admin/`)
- [ ] `ProductList.tsx` — table with products, actions
- [ ] `ProductForm.tsx` — create/edit product modal
- [ ] `ProductFilters.tsx` — filter by category, search
- [ ] `CategoryList.tsx` — inline editable rows
- [ ] `CategoryForm.tsx` — create category modal

### Features
- [ ] **Products:**
  - [ ] List all products with category, price, tax rate
  - [ ] Create product with category selector (with inline create)
  - [ ] Edit product details
  - [ ] Archive/soft-delete product
  - [ ] Search by name
  - [ ] Filter by category
  - [ ] Pagination if list is large

- [ ] **Categories:**
  - [ ] List all categories in rows
  - [ ] Inline edit name + color
  - [ ] Add new category (blank row)
  - [ ] Delete category
  - [ ] Color picker for category

### Forms
- [ ] Product form: name, category, price, tax rate (5/18/28 dropdown), description
- [ ] Category form: name, color (hex input or color picker)
- [ ] Real-time validation feedback
- [ ] Submit + Cancel buttons

### Styling
- [ ] Table layout for product list
- [ ] Inline editable rows for categories
- [ ] Color swatch preview
- [ ] Action buttons (edit, delete)
- [ ] Responsive table scrolling on mobile

### Test Coverage
- [ ] Can create product with all fields
- [ ] Can edit product
- [ ] Can archive product
- [ ] Category color displays correctly
- [ ] Inline editing works smoothly
- [ ] Form validation prevents empty values

---

## **Phase 4: Admin Backend — Promotions**
**Goal:** Coupon and promotion management page
**Depends on:** Phase 3
**Status:** ☐ Not Started

### Pages (`/app/(admin)/`)
- [ ] `/app/(admin)/promotions/page.tsx` — promotion list + create/edit/delete

### Components (`/components/admin/`)
- [ ] `PromotionList.tsx` — table with promos, filters, actions
- [ ] `PromotionForm.tsx` — modal for create/edit promo
- [ ] `PromotionTypeSelector.tsx` — select coupon/product/order type

### Features
- [ ] **Promotion List:**
  - [ ] Display all promotions with type, discount, status
  - [ ] Show coupon code if COUPON type
  - [ ] Show product name if PRODUCT_BASED
  - [ ] Show min order amount if ORDER_BASED
  - [ ] Filter by type (Coupon / Product / Order)
  - [ ] Toggle isActive status
  - [ ] Search by name/code
  - [ ] Create, edit, delete buttons

- [ ] **Promotion Form (type-specific fields):**
  - [ ] **COUPON:** code, discount value, discount type (% or ₹), active toggle
  - [ ] **PRODUCT_BASED:** product select, min qty, discount value, discount type, active toggle
  - [ ] **ORDER_BASED:** min order amount, discount value, discount type, active toggle

### Forms
- [ ] Type selector (Coupon / Product-Based / Order-Based)
- [ ] Dynamic fields based on type
- [ ] Real-time validation
- [ ] Unique code validation for coupons
- [ ] Min values > 0 validation

### Styling
- [ ] Color-coded promotion types
- [ ] Badge showing promo type
- [ ] Discount badge showing amount + type
- [ ] Active/inactive toggle switch
- [ ] Modal for create/edit

### Test Coverage
- [ ] Can create all 3 promo types
- [ ] Fields validate based on type
- [ ] Can toggle active status
- [ ] Can edit and delete promotions
- [ ] Coupon code uniqueness enforced
- [ ] Product-based shows correct product

---

## **Phase 5: Admin Backend — Floors & Tables**
**Goal:** Floor plan and table management page
**Depends on:** Phase 2
**Status:** ☐ Not Started

### Pages (`/app/(admin)/`)
- [ ] `/app/(admin)/floors/page.tsx` — floor list with nested tables

### Components (`/components/admin/`)
- [ ] `FloorList.tsx` — accordion list of floors + tables
- [ ] `FloorForm.tsx` — create/edit floor modal
- [ ] `TableForm.tsx` — create/edit table modal
- [ ] `FloorTableManager.tsx` — combined floor + table management

### Features
- [ ] **Floors:**
  - [ ] List all floors with table count
  - [ ] Create floor
  - [ ] Edit floor name
  - [ ] Delete floor (cascade)
  - [ ] Expandable accordion for tables

- [ ] **Tables (under each floor):**
  - [ ] List all tables with number, seats, status
  - [ ] Create table
  - [ ] Edit table number/seats/active status
  - [ ] Delete table
  - [ ] Visual indicator for active/inactive

### Forms
- [ ] Floor form: name (required)
- [ ] Table form: number, seats, active toggle
- [ ] Form validation

### Styling
- [ ] Accordion for floor expansion
- [ ] Nested table list under each floor
- [ ] Action buttons per row
- [ ] Status indicators (active = green, inactive = gray)
- [ ] Responsive mobile layout

### Test Coverage
- [ ] Can create floor + tables
- [ ] Can edit floor/table
- [ ] Can delete floor (removes tables)
- [ ] Can toggle table active status
- [ ] Table numbers unique per floor

---

## **Phase 6: Admin Backend — Users & Payment Methods**
**Goal:** Employee management and payment method configuration
**Depends on:** Phase 2
**Status:** ☐ Not Started

### Pages (`/app/(admin)/`)
- [ ] `/app/(admin)/users/page.tsx` — employee list + create/edit/delete
- [ ] `/app/(admin)/payment-methods/page.tsx` — payment method toggles

### Components (`/components/admin/`)
- [ ] `UserList.tsx` — table with employees
- [ ] `UserForm.tsx` — create/edit user modal
- [ ] `UserPasswordModal.tsx` — change password modal
- [ ] `PaymentMethodList.tsx` — list with toggles + UPI settings

### Features
- [ ] **Users:**
  - [ ] List employees: name, email, role, status
  - [ ] Create user: name, email, password, role dropdown
  - [ ] Edit user: name, email, role, status (active/disabled)
  - [ ] Change password: modal with new password field
  - [ ] Delete user: confirm dialog
  - [ ] Filter by role/status

- [ ] **Payment Methods:**
  - [ ] List 3 methods (CASH, CARD, UPI)
  - [ ] Toggle isActive for each
  - [ ] UPI: input field for UPI ID + live QR preview
  - [ ] CASH/CARD: read-only (no extra fields)

### Forms
- [ ] User form: name, email, password (new user only), role dropdown, status toggle
- [ ] Change password: password field with confirmation
- [ ] UPI ID input: text field with validation

### Styling
- [ ] Status badge (Active/Disabled)
- [ ] Role badge (Admin/Employee)
- [ ] Toggle switches for isActive
- [ ] QR code preview for UPI (if image can be generated)
- [ ] Action buttons (edit, delete, change password)

### Test Coverage
- [ ] Can create employee with role
- [ ] Can update employee details
- [ ] Can change password
- [ ] Can delete employee
- [ ] Payment methods toggle works
- [ ] UPI ID persists on update

---

## **Phase 7: Admin Backend — Session Control & Reports**
**Goal:** Session management and analytics dashboard
**Depends on:** Phase 6
**Status:** ☐ Not Started

### Pages (`/app/(admin)/`)
- [ ] `/app/(admin)/session/page.tsx` — session control + open/close buttons
- [ ] `/app/(admin)/reports/page.tsx` — analytics dashboard

### Components (`/components/admin/`)
- [ ] `SessionControl.tsx` — open session button, last session info
- [ ] `SessionClosing.tsx` — closing summary modal
- [ ] `Reports.tsx` — dashboard with KPIs + charts
- [ ] `ReportFilters.tsx` — period, employee, product filters
- [ ] `KPICard.tsx` — KPI display with % change
- [ ] `SalesTrendChart.tsx` — line chart
- [ ] `TopCategoriesChart.tsx` — pie chart
- [ ] `DataTable.tsx` — top orders/products/categories

### Features
- [ ] **Session Control:**
  - [ ] Show last opened session date + closing amount
  - [ ] "Open Session" button → redirects to `/pos`
  - [ ] Closing session shows summary popup
  - [ ] Summary: total orders, total revenue, dates

- [ ] **Reports:**
  - [ ] **Filters:** period (Today/Week/Month/Custom), employee, product
  - [ ] **KPIs:** total orders, revenue, avg order + % change
  - [ ] **Charts:** sales trend (line), top categories (pie)
  - [ ] **Tables:** top orders (order#, date, employee, total), top products, top categories
  - [ ] **Export:** PDF + XLS buttons

### Styling
- [ ] KPI cards in grid (4 columns on desktop, 1 on mobile)
- [ ] Charts responsive (Chart.js or Recharts)
- [ ] Filter bar at top (horizontal layout)
- [ ] Tables scrollable on mobile
- [ ] Loading states for charts

### Test Coverage
- [ ] Can open session
- [ ] Session closing shows summary
- [ ] Reports load with data
- [ ] Filters update data
- [ ] Charts render correctly
- [ ] Export buttons work

---

## **Phase 8: POS Terminal — Main Order View**
**Goal:** Core 3-column POS interface (products, cart, payment)
**Depends on:** Phase 7
**Status:** ☐ Not Started

### Pages (`/app/pos/`)
- [ ] `/app/pos/page.tsx` — main POS terminal

### Components (`/components/pos/`)
- [ ] `MainOrderView.tsx` — 3-column layout wrapper
- [ ] `ProductPanel.tsx` — left column (categories + products)
- [ ] `CartPanel.tsx` — middle column (cart items)
- [ ] `PaymentPanel.tsx` — right column (payment methods + numpad)
- [ ] `CategoryTabs.tsx` — color-coded category navigation
- [ ] `ProductCard.tsx` — product name + price card

### Features
- [ ] **Product Panel (Left):**
  - [ ] Category tabs (color-coded per category)
  - [ ] Product cards: name + price
  - [ ] Click card → add to cart
  - [ ] Search products
  - [ ] Scroll-able list

- [ ] **Cart Panel (Middle):**
  - [ ] List of items: product name, qty (−/+), unit price, line total
  - [ ] Product promo discount shown under item
  - [ ] Order promo discount as separate line at bottom
  - [ ] Subtotal, Tax (GST 5%), Total display
  - [ ] Bottom action bar: [Customer] [Discount] [Send to Kitchen]
  - [ ] Item removal button (×)
  - [ ] Clear cart button

- [ ] **Payment Panel (Right):**
  - [ ] Payment method buttons: [Cash] [Card] [UPI]
  - [ ] Selected method highlighted
  - [ ] Amount due display
  - [ ] Numpad: 0–9, +/−, ×, Qty, Price, Disc, Clear
  - [ ] "Send to Kitchen" button (primary)

### State Management
- [ ] Client-side cart state (useState or Context)
- [ ] Track selected payment method
- [ ] Track applied promos
- [ ] Track table/customer selection

### Styling
- [ ] 3-column layout (responsive: stack on mobile)
- [ ] Color-coded category tabs
- [ ] Product cards with hover effect
- [ ] Cart items with clear visual hierarchy
- [ ] Numpad buttons sized for touch (POS terminal)
- [ ] Amount display large + readable

### Test Coverage
- [ ] Can add/remove items from cart
- [ ] Qty increment/decrement works
- [ ] Totals calculate correctly
- [ ] Payment method selection works
- [ ] Numpad input works

---

## **Phase 9: POS Terminal — Cart & Payment Features**
**Goal:** Discount/coupon validation and payment processing
**Depends on:** Phase 8
**Status:** ☐ Not Started

### Components (`/components/pos/`)
- [ ] `DiscountPopup.tsx` — coupon entry + auto-promos display
- [ ] `PaymentScreen.tsx` — cash/card/UPI payment flow
- [ ] `ReceiptScreen.tsx` — receipt display + print/email options

### Features
- [ ] **Discount Popup:**
  - [ ] Top: coupon code input + "Enter" button
  - [ ] Validates code via `/api/promotions/validate`
  - [ ] Bottom: read-only list of auto-applied promos
  - [ ] Shows promo description + discount amount
  - [ ] Can't toggle auto-promos (informational only)

- [ ] **Payment Flow:**
  - [ ] **CASH:** enter amount received → show change due
  - [ ] **CARD:** enter transaction reference
  - [ ] **UPI:** show QR code → "Confirmed" / "Cancel" buttons
  - [ ] All methods: POST `/api/orders/:id/pay`

- [ ] **Receipt:**
  - [ ] Display order summary: items, totals, payment method
  - [ ] "Print Receipt" button
  - [ ] "Send to Email" button (email popup)
  - [ ] Order number, date, employee name
  - [ ] All line items with qty + prices

### Modals
- [ ] Discount popup (modal)
- [ ] Payment confirmation (modal)
- [ ] Email input popup (if send to email)
- [ ] Receipt preview/print

### Styling
- [ ] Modal overlays (dark background)
- [ ] Coupon entry input focused by default
- [ ] QR code centered + readable
- [ ] Receipt formatted for printing
- [ ] Color-coded success/error messages

### Test Coverage
- [ ] Valid coupon applies discount
- [ ] Invalid coupon shows error
- [ ] Auto-promos display correctly
- [ ] CASH payment calculates change
- [ ] CARD accepts reference
- [ ] Receipt displays all data correctly

---

## **Phase 10: POS Terminal — Orders, Customers, Tables**
**Goal:** Order history, customer management, and table selection
**Depends on:** Phase 9
**Status:** ☐ Not Started

### Components (`/components/pos/`)
- [ ] `FloorPopup.tsx` — table selection grid
- [ ] `OrdersList.tsx` — past orders table
- [ ] `OrderDetail.tsx` — order detail popup
- [ ] `CustomerPanel.tsx` — customer search/create
- [ ] `TableView.tsx` — floor grid with table status

### Features
- [ ] **Floor/Table Selection:**
  - [ ] Grid of all tables with numbers
  - [ ] Occupied tables: pink/red highlight
  - [ ] Free tables: normal
  - [ ] Click table → open that order
  - [ ] Triggered on session start + table icon in nav

- [ ] **Orders List:**
  - [ ] Table: date, order#, customer, amount, status
  - [ ] Status badges: Draft, Paid, Cancelled
  - [ ] Search by: customer name, order number, date
  - [ ] Click row → Order Detail popup
  - [ ] Pagination if many orders

- [ ] **Order Detail:**
  - [ ] Show: order#, date, customer, amount, status
  - [ ] Product list with quantities
  - [ ] **If DRAFT:** delete + edit buttons
  - [ ] **If PAID:** view-only
  - [ ] Edit → load order back into cart

- [ ] **Customer Management:**
  - [ ] Search customer by name
  - [ ] List results
  - [ ] "Create New Customer" button
  - [ ] Create form: name, email, phone
  - [ ] Link customer to current order
  - [ ] Email used for receipt delivery

### Modals
- [ ] Floor/table selection popup
- [ ] Order detail popup
- [ ] Create customer popup
- [ ] Edit customer popup

### Styling
- [ ] Grid layout for tables
- [ ] Occupied vs free visual distinction
- [ ] Table numbers clear + readable
- [ ] Status badges with colors
- [ ] Responsive table scrolling

### Test Coverage
- [ ] Can select table from grid
- [ ] Can search orders
- [ ] Can view order details
- [ ] Can edit draft order (reload to cart)
- [ ] Can delete draft order
- [ ] Can create + link customer

---

## **Phase 11: POS Terminal — Navigation & Session**
**Goal:** Top navigation bar and session management
**Depends on:** Phase 10
**Status:** ☐ Not Started

### Components (`/components/pos/`)
- [ ] `NavBar.tsx` — top navigation bar (POS only)
- [ ] `HamburgerMenu.tsx` — menu for navigation

### Features
- [ ] **Nav Bar (Top):**
  - [ ] Logo (left)
  - [ ] Search bar (center)
  - [ ] POS/Register icon
  - [ ] Clock icon (session time)
  - [ ] New Order icon
  - [ ] Table indicator (e.g. "Table 12 V")
  - [ ] Profile icon (logout)
  - [ ] Hamburger menu icon

- [ ] **Hamburger Menu Items:**
  - [ ] Products (→ admin if Admin role)
  - [ ] Category
  - [ ] Payment Method
  - [ ] Coupon & Promotion
  - [ ] User/Employee
  - [ ] KDS
  - [ ] Reports (Admin only)
  - [ ] Log-Out

### Features
- [ ] Click logo → go to POS main
- [ ] Search → products + customers
- [ ] Table indicator shows current table
- [ ] Profile icon → logout confirmation
- [ ] Menu links navigate to admin pages (if Admin)
- [ ] Menu items conditional on role

### Styling
- [ ] Fixed nav bar at top
- [ ] Icons + text readable
- [ ] Menu dropdown/modal
- [ ] Responsive hamburger on mobile
- [ ] Dark/light contrast for readability

### Test Coverage
- [ ] Navigation links work
- [ ] Menu items conditional on role
- [ ] Logout clears session
- [ ] Table indicator updates

---

## **Phase 12: Kitchen Display System (KDS)**
**Goal:** Real-time order tracking for kitchen staff
**Depends on:** Phase 1, Phase 11
**Status:** ☐ Not Started

### Pages (`/app/kds/`)
- [ ] `/app/kds/page.tsx` — main KDS screen (no auth)

### Components (`/components/kds/`)
- [ ] `KDSMain.tsx` — tab navigation + ticket display
- [ ] `TicketCard.tsx` — individual order card
- [ ] `KDSSidebar.tsx` — filters (product, category, search)
- [ ] `TicketItem.tsx` — item with strikethrough toggle

### Features
- [ ] **Tabs:** All | To Cook | Preparing | Completed
  - [ ] Each tab shows live count
  - [ ] Click tab → filter tickets by stage
  - [ ] Real-time updates via Socket.io

- [ ] **Ticket Card:**
  - [ ] Order# (matches POS)
  - [ ] List of items with quantities
  - [ ] Click card → advance stage
  - [ ] Click item → toggle strikethrough
  - [ ] Stage progression: TO_COOK → PREPARING → COMPLETED

- [ ] **Sidebar Filters:**
  - [ ] Filter by product (dropdown)
  - [ ] Filter by category (dropdown)
  - [ ] Search bar (order# or product name)
  - [ ] Filters apply to current tab

### Real-time Updates
- [ ] Socket.io connection on page load
- [ ] Listen for `ticket:new` event (new order from POS)
- [ ] Listen for `ticket:updated` event (stage advance, strikethrough)
- [ ] Auto-refresh ticket list when events fire
- [ ] Reconnect on connection loss

### Styling
- [ ] Tab buttons with active highlight
- [ ] Live count badges on tabs
- [ ] Ticket cards in grid (responsive columns)
- [ ] Order# bold + readable
- [ ] Item list clear
- [ ] Strikethrough animation
- [ ] Color-coded stages (TO_COOK=red, PREPARING=yellow, COMPLETED=green)
- [ ] Sidebar on left (collapsible on mobile)

### Test Coverage
- [ ] Can view tickets in all tabs
- [ ] Can advance ticket stage
- [ ] Can toggle item strikethrough
- [ ] Socket.io events update UI
- [ ] Filters work correctly
- [ ] No auth required

---

## **Phase 13: Shared Layouts & Guards**
**Goal:** Layout wrappers and role-based access control
**Depends on:** All previous phases
**Status:** ☐ Not Started

### Layouts
- [ ] `/app/layout.tsx` — root layout (providers setup)
- [ ] `/app/(auth)/layout.tsx` — auth pages layout
- [ ] `/app/(admin)/layout.tsx` — admin pages layout + nav guard
- [ ] `/app/pos/layout.tsx` — POS terminal layout
- [ ] `/app/kds/layout.tsx` — KDS layout (no auth)

### Components
- [ ] `AuthGuard.tsx` — redirect to login if no token
- [ ] `RoleGuard.tsx` — redirect if wrong role (Admin-only routes)
- [ ] `AdminShell.tsx` — sidebar nav + admin layout
- [ ] `POSShell.tsx` — POS nav bar + layout

### Features
- [ ] **Auth Guard:**
  - [ ] Check JWT cookie on load
  - [ ] Redirect to login if missing/invalid
  - [ ] Inject user info into context

- [ ] **Role Guard:**
  - [ ] Check user role from JWT
  - [ ] Allow only Admin to access `/admin/*`
  - [ ] Redirect Employee to `/pos`

- [ ] **Admin Shell:**
  - [ ] Sidebar with menu items
  - [ ] Main content area
  - [ ] User profile dropdown

- [ ] **POS Shell:**
  - [ ] Top nav bar
  - [ ] Main content area (3-column layout)
  - [ ] Responsive layout

### Context/Providers
- [ ] `UserContext.tsx` — global user state (name, role, userId)
- [ ] `SessionContext.tsx` — current session info (sessionId, table, customer)
- [ ] Wrap providers in root layout

### Test Coverage
- [ ] Unauthenticated users redirected to login
- [ ] Employees can't access `/admin/*`
- [ ] Admins can access both `/admin/*` and `/pos`
- [ ] User info accessible from context

---

## **Phase 14: Forms, Validation & Error Handling**
**Goal:** Form management and user feedback
**Depends on:** All form-using phases
**Status:** ☐ Not Started

### Form Handling
- [ ] React Hook Form integration (or use native state)
- [ ] Zod schema validation on client side
- [ ] Real-time field error display
- [ ] Form reset after success
- [ ] Disabled submit while loading

### Error Handling
- [ ] API error handling in fetch wrapper
- [ ] Toast notifications for errors/success
- [ ] Validation error messages under fields
- [ ] 401 errors → redirect to login
- [ ] 403 errors → show "access denied"
- [ ] 500 errors → show generic error message
- [ ] Network error handling (retry option)

### User Feedback
- [ ] Loading spinners on buttons
- [ ] Loading skeletons on data pages
- [ ] Success toast after create/update/delete
- [ ] Error toast with error message
- [ ] Confirm dialogs for destructive actions (delete)
- [ ] Empty states (no data found)

### Test Coverage
- [ ] Form validates before submit
- [ ] Success messages show
- [ ] Error messages show
- [ ] Loading states visible
- [ ] Confirm dialogs work

---

## **Phase 15: Responsive Design & Mobile Optimization**
**Goal:** Ensure POS works on mobile/tablet
**Depends on:** All phases
**Status:** ☐ Not Started

### Responsive Breakpoints
- [ ] Mobile (< 640px): single column, stacked layout
- [ ] Tablet (640px - 1024px): 2 columns where applicable
- [ ] Desktop (> 1024px): full 3-column POS layout

### Mobile-Specific Features
- [ ] POS: stack 3 columns vertically
- [ ] Numpad: larger touch targets (min 44px)
- [ ] Tables: horizontal scroll for wide tables
- [ ] Modals: full-screen on mobile
- [ ] Nav: hamburger menu on mobile
- [ ] KDS: grid adjusts to screen width

### Performance
- [ ] Lazy load images
- [ ] Code splitting for admin pages
- [ ] Minimal JS bundle
- [ ] CSS minification
- [ ] No unnecessary re-renders

### Accessibility
- [ ] Keyboard navigation for forms
- [ ] ARIA labels on buttons/inputs
- [ ] Color contrast (WCAG AA minimum)
- [ ] Focus indicators visible
- [ ] Alt text for images (if any)

### Test Coverage
- [ ] Test on mobile (viewport 375px)
- [ ] Test on tablet (viewport 768px)
- [ ] Test on desktop (viewport 1920px)
- [ ] Touch targets min 44px
- [ ] No horizontal scroll on mobile
- [ ] All features accessible via keyboard

---

## **Phase 16: Socket.io Integration & Real-time Features**
**Goal:** Real-time updates for KDS and POS
**Depends on:** Phase 12
**Status:** ☐ Not Started

### Socket.io Setup
- [ ] Create Socket.io client wrapper in `/lib/socket.ts`
- [ ] Handle connection/disconnection
- [ ] Reconnection logic
- [ ] Error handling

### KDS Real-time
- [ ] Listen for `ticket:new` event (new order)
  - [ ] Parse payload: id, orderNumber, status, items
  - [ ] Add card to appropriate tab
  - [ ] Show toast notification
  - [ ] Play sound (optional)

- [ ] Listen for `ticket:updated` event (stage change or strikethrough)
  - [ ] Update existing card
  - [ ] Refresh only affected tab
  - [ ] Animate changes

### POS Real-time (Optional)
- [ ] Listen for table status updates (if another employee updates table)
- [ ] Listen for promo changes (if admin updates promo while POS open)

### Testing
- [ ] Test Socket.io connection on KDS page load
- [ ] Test new ticket appears when POS sends order
- [ ] Test stage advance updates all KDS clients
- [ ] Test item strikethrough updates all KDS clients
- [ ] Test reconnection after disconnect

### Styling
- [ ] Toast notifications for new orders
- [ ] Sound notification (optional)
- [ ] Animation when new card arrives
- [ ] Animation when strikethrough applied

### Test Coverage
- [ ] Socket connection works
- [ ] New tickets appear in real-time
- [ ] Stage updates broadcast to all clients
- [ ] Handles reconnection gracefully
- [ ] No memory leaks on page unmount

---

## **Phase 17: Export & Reporting Features**
**Goal:** PDF/XLS export functionality
**Depends on:** Phase 7
**Status:** ☐ Not Started

### Libraries
- [ ] Install `jsPDF` or similar for PDF export
- [ ] Install `xlsx` or `exceljs` for XLS export

### Export Functions (`/lib/export.ts`)
- [ ] `exportReportPDF(data, filename)` — generate PDF
- [ ] `exportReportXLS(data, filename)` — generate XLS
- [ ] Format data for export (clean dates, numbers)

### Export UI
- [ ] Report page: [Export PDF] [Export XLS] buttons
- [ ] Show loading state while generating
- [ ] Auto-download on completion
- [ ] Error handling if generation fails

### PDF Layout
- [ ] Header: company name, report period
- [ ] KPI cards
- [ ] Charts (as images if needed)
- [ ] Data tables
- [ ] Footer: generated date

### XLS Layout
- [ ] Sheet 1: KPIs
- [ ] Sheet 2: Sales Trend
- [ ] Sheet 3: Top Categories
- [ ] Sheet 4: Top Products
- [ ] Sheet 5: Top Orders
- [ ] Formatting: bold headers, number formatting

### Test Coverage
- [ ] PDF exports with all data
- [ ] XLS exports with all sheets
- [ ] Downloads with correct filename
- [ ] Error handling for failures

---

## **Phase 18: Testing & Quality Assurance**
**Goal:** Ensure code quality and functionality
**Status:** ☐ Not Started

### Unit Tests (Optional but recommended)
- [ ] Setup Jest + React Testing Library
- [ ] Test shared components (Button, Modal, etc.)
- [ ] Test form components (LoginForm, ProductForm)
- [ ] Test utility functions (formatting, validation)

### Integration Tests
- [ ] Test login flow (signup → login → redirect)
- [ ] Test creating product (form → API → list)
- [ ] Test creating order (POS flow → API → KDS)
- [ ] Test payment flow

### E2E Tests (Optional)
- [ ] Setup Cypress or Playwright
- [ ] Test complete user workflows
- [ ] Admin creates product + employee orders it
- [ ] Kitchen receives order in real-time

### Manual Testing
- [ ] Test all pages load without errors
- [ ] Test all forms validate correctly
- [ ] Test all API calls work
- [ ] Test Socket.io events fire
- [ ] Test responsive design on multiple screens
- [ ] Test accessibility (keyboard nav, screen reader)

### Performance Testing
- [ ] Lighthouse audit (desktop + mobile)
- [ ] Check bundle size
- [ ] Check Core Web Vitals

### Test Coverage
- [ ] Unit tests for utilities: >80% coverage
- [ ] Integration tests for main flows
- [ ] Manual smoke testing before release

---

## **Summary Progress**

| Phase | Title | Status | Dependencies |
|-------|-------|--------|--------------|
| 1 | Foundation & Setup | ☐ | — |
| 2 | Authentication Pages | ☐ | P1 |
| 3 | Admin — Products | ☐ | P2 |
| 4 | Admin — Promotions | ☐ | P3 |
| 5 | Admin — Floors & Tables | ☐ | P2 |
| 6 | Admin — Users & Payment | ☐ | P2 |
| 7 | Admin — Session & Reports | ☐ | P6 |
| 8 | POS — Main Order View | ☐ | P7 |
| 9 | POS — Cart & Payment | ☐ | P8 |
| 10 | POS — Orders & Customers | ☐ | P9 |
| 11 | POS — Navigation | ☐ | P10 |
| 12 | Kitchen Display System | ☐ | P1, P11 |
| 13 | Layouts & Guards | ☐ | All previous |
| 14 | Forms & Error Handling | ☐ | All previous |
| 15 | Responsive Design | ☐ | All previous |
| 16 | Socket.io & Real-time | ☐ | P12 |
| 17 | Export & Reporting | ☐ | P7 |
| 18 | Testing & QA | ☐ | All previous |

---

## **Key Guidelines**

### Code Standards
- Use TypeScript (no `any` type)
- No nested ternaries
- No hardcoded hex colors (use CSS variables)
- No `console.log` in production code
- Functions max 20 lines
- Comments explain WHY, not WHAT
- No wrapper functions for single calls

### Component Patterns
- Server Components by default (unless hooks needed)
- Client-only when: interactivity, hooks, real-time
- Use `use client` pragma in component files
- Props typed with interfaces/types

### Styling
- Mobile-first approach
- System fonts (no Inter/Roboto unless specified)
- CSS variables for colors
- Tailwind for utilities
- Custom CSS for animations/special layouts

### API Integration
- Use `/lib/api.ts` fetch wrapper
- Handle all error cases (401, 403, 500)
- Toast notifications for feedback
- Loading states on buttons/forms

### Form Handling
- Zod schemas for validation
- Real-time error feedback
- Disabled submit while loading
- Confirm dialogs for destructive actions

### Responsive Design
- Test on 375px, 768px, 1920px viewports
- Touch targets min 44px
- No horizontal scroll on mobile
- Readable fonts on all sizes

### Accessibility
- Semantic HTML
- ARIA labels where needed
- Keyboard navigation
- Color contrast (WCAG AA)

---

## **Notes**
- Each phase builds on previous phases
- Frontend should launch after backend Phase 7 (Orders)
- KDS can start earlier (Phase 12, after Orders backend)
- Test continuously during development
- Deploy to staging before production
