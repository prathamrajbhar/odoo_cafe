Odoo Cafe POS — Full Breakdown
Odoo Hackathon · Restaurant Point-of-Sale System · 27 Screens

3
User roles
27
Total screens
9
Backend pages
8
POS terminal pages
Users & Pages
Workflow
Stand Out 🚀
User 1
Admin (User/Owner)
Logs into the backend. Configures everything before the POS opens — products, tables, payments, promotions, staff.

Pg 1
Login & Signup
→ "Sign In / Sign Up"
Email + Password login. Signup: Name, Email, Password. On success → POS session opens directly.
Pg 2
Product Management
→ "Manage Menu Items"
List all products. Create/Edit/Delete. Fields: Name, Category, Price, Tax (5/18/28% dropdown), Description. Category can be created on-the-fly from the same form.
Pg 3
Product Category Management
→ "Menu Categories with Colors"
List of categories (e.g. Food, Drink). Each has a Name + Color. Color shows on product cards in POS automatically. Inline row editing — "New" button adds a row at bottom.
Pg 4
Payment Method Setup
→ "Turn On/Off Payment Options"
3 methods: Cash, Card, UPI. Each has Activate toggle. UPI type shows extra field: UPI ID (e.g. abc@upi.com) + live QR preview. Cash and Card have no extra fields.
Pg 5
Coupon & Promotion Management
→ "Discount Rules Setup"
Coupon type: Code (e.g. "Summer20") + Discount % or ₹ amount. Employee enters manually at POS.
Automated Promo — Product based: Select product, set Min Qty, set discount. Auto-fires when qty reached.
Automated Promo — Order based: Set Min Order amount (e.g. ₹500), set discount %. Auto-fires when cart crosses amount.
Pg 6
Floor Plan & Table Management
→ "Set Up Tables"
Create floors. Add tables under each floor. Table fields: Number, Seats, Active status. These appear in the POS floor grid.
Pg 7
User / Employee Management
→ "Manage Staff Accounts"
List all accounts with Name, Role (User/Employee), Status (Active/Disabled). Select any record → action menu: Delete / Archive / Change Password. Change Password shows popup with new password field.
Pg 8
Reports / Analytics Dashboard
→ "Sales Reports"
Filters: Period (Today/Week/Month/Custom), Employee, Session, Product. Metrics: Total Orders, Revenue, Avg Order. Charts: Sales trend line, Top Category pie chart. Tables: Top Orders, Top Products (name, qty, revenue), Top Categories. Export as PDF or XLS.
Pg 9
POS Terminal & Session Control
→ "Open/Close POS Shift"
Shows last open session date + last closing sale amount. "Open Session" button launches POS. Closing session shows summary of the shift.
User 2
Employee (Cashier)
Uses the POS terminal. Takes orders, manages tables, processes payments. Does NOT access the backend config pages.

POS 1
Floor Pop-up (Table Selection)
→ "Pick a Table"
Appears on session start or when tapping Table View. Grid of all tables with numbers. Tables with active orders are highlighted (pink/red in wireframe). Tap a table → opens that table's Order View.
POS 2
Order View (Main POS Screen)
→ "Take Order Screen" — the BIG one, 3 columns
Left — Product section: Category tabs (color-coded). Product cards with price. Click = add to cart.
Middle — Cart section: Each line: Product name, qty (adjustable), unit price, line total. Product promo shows discount under the item. Order discount shows as separate line.
Bottom: Customer | Discount | Send buttons. Subtotal, GST 5%, Total.
Right — Payment section: Cash, UPI, Card buttons. Amount display. Numpad (0-9, +/-, ×, Qty). "Send to Kitchen" button.
POS 3
Discount Popup
→ "Enter Coupon Code"
Opened via "Discount" button. Text field to enter coupon code. Also shows list of available automated promotions as radio buttons (e.g. "30% Discount", "25% Discount"). Select one → applies to order.
POS 4
Payment & Receipt Screen
→ "Collect Payment"
Cash: Enter amount received → shows change due.
UPI: Auto-generated QR code from UPI ID + total amount shown. "Confirmed" or "Cancel".
Card: Enter transaction reference.
After payment: Print receipt OR Send to email popup.
POS 5
Orders List
→ "All Orders This Session"
Table: Date, Order#, Customer, Amount, Status (Draft/Paid/Cancelled). Search by customer name, order number, or date. Click order → Order Detail popup.
POS 6
Order Detail View
→ "View/Edit a Specific Order"
Shows Order#, Date, Customer, Amount, Status, Products. Draft order: shows Delete + Edit Order buttons. Edit Order → loads order back into cart. Paid order: view only.
POS 7
Customer Management
→ "Search or Add Customer"
Search customers by name. Create new customer (Name, Email, Phone). Edit via popup. Delete. Select customer → linked to current order, email used for receipt.
POS 8
Table View
→ "See All Tables Status"
Shows all floors and tables. Occupied tables visually different from free ones. Tap any table → opens its order.
User 3
Kitchen Staff (KDS Screen)
Opens a fixed URL (localhost:0000/KDS) on a separate screen/tab. Receives orders in real-time. No login required.

KDS 1
Kitchen Display System (KDS)
→ "Kitchen Order Board"
Tabs at top: All | To Cook (7) | Preparing (3) | Completed (2).
Each order = a ticket card showing Order# (same as POS order#), items + quantities.
Click entire card → moves whole order to next stage (To Cook → Preparing → Completed).
Click individual item inside card → strikethrough that item only (partial completion).
Left sidebar: Filter by Product and Category. Search bar available.
⚡ KDS is a separate URL, no login. Real-time updates via WebSocket or polling. This is the most technically impressive screen — nail this and judges will notice.
User 4*
Customer (Passive role)
Not a login user. Managed by the Employee from within the POS. No separate pages for customer to access.

—
Customer comes in → Employee searches/creates them in Customer screen → links to order → receives receipt via email or print. That's it. Customer has zero screens of their own.