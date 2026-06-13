# ☕ Odoo Cafe POS

> A high-performance, real-time Restaurant Point-of-Sale (POS) system built for the Parul University Hackathon.

Odoo Cafe POS is designed to streamline restaurant operations across three core roles (Admin, Employee, and Kitchen) through a unified real-time architecture. It consists of **27 total screens** spanning the POS terminal, backend admin dashboard, and Kitchen Display System (KDS).

---

## 🚀 Key Features at a Glance

*   **Real-time KDS Synchronization:** Live order updates via WebSockets (Socket.io) without page refreshes.
*   **3 Distinct User Roles:** Tailored access permissions and interfaces for Admins, Cashiers (Employees), and Kitchen Staff.
*   **Offline-Capable State:** Local POS state management for seamless order taking during short network cuts.
*   **Flexible Promotions Engine:** Supports manually applied coupon codes, automatic product-quantity discounts, and order-subtotal thresholds.

---

## 👥 User Roles & Capabilities

| Role | Access Level | Primary Interface | Main Actions |
|---|---|---|---|
| **Admin** | Full Backend | Admin Dashboard | Menu settings, User/Employee management, Promotion setup, Table layout, Reports |
| **Employee (Cashier)** | Restricted (POS) | POS Terminal | Customer search/add, Table status view, Cart compilation, Payment processing |
| **Kitchen Staff** | No Login Required | Kitchen Display System | Real-time ticket queue, status cycles, line item strikethroughs |
| **Customer** | Passive | No Direct Interface | Searchable database profile, invoice receipt emails |

---

## 📂 System Breakdown & Screen Map

The application consists of **9 Backend Admin Pages**, **8 POS Terminal Screens**, and a standalone **Kitchen Display System (KDS)**.

### 🛡️ 1. Backend Admin Pages (9 Pages)

The admin backend is accessible only to users with the `ADMIN` role. It contains the following pages:

1.  **Pg 1: Login & Signup (`/login` & `/signup`)**
    *   Secure Email/Password authentication.
    *   First signed-up user automatically gains `ADMIN` status; subsequent registrations default to `EMPLOYEE`.
2.  **Pg 2: Product Management (`/admin/products`)**
    *   Full menu item list with inline actions.
    *   Add, edit, or archive products with Fields: Name, Category, Price, Tax rate (5% / 18% / 28%), and Description.
3.  **Pg 3: Product Category Management (`/admin/categories`)**
    *   Manage menu categories (e.g., Hot Drinks, Desserts).
    *   Inline grid editing with customizable category color hexes that visually group items on the POS grid.
4.  **Pg 4: Payment Method Setup (`/admin/payment-methods`)**
    *   Toggle Cash, Card, and UPI payments.
    *   Configure UPI ID with auto-rendering QR code preview.
5.  **Pg 5: Coupon & Promotion Management (`/admin/promotions`)**
    *   Configure discount schemes:
        *   **Coupons:** Manual code entry (e.g. `HACKATHON10`) with fixed ₹ discount or % discount.
        *   **Product-Based Promos:** Select item + target minimum quantity to fire discount auto-evaluation.
        *   **Order-Based Promos:** Subtotal thresholds triggering order-level discounts.
6.  **Pg 6: Floor Plan & Table Management (`/admin/floors`)**
    *   Set up multiple floors and assign tables with table numbers and seat capacities.
7.  **Pg 7: User / Employee Management (`/admin/users`)**
    *   List, create, or disable staff accounts. Toggle role, reset passwords, or archive profiles.
8.  **Pg 8: Reports / Analytics Dashboard (`/admin/reports`)**
    *   Filter reports by Period (Today/Week/Month/Custom), Employee, Session, or Product.
    *   Features key KPIs (Orders, Revenue, Average Order value) and top categories/products tables. Exportable to PDF and Excel format.
9.  **Pg 9: POS Terminal & Session Control (`/admin/session`)**
    *   Start and end cashier shifts. Displays opening status, shift cash flow, and summary metrics on close.

---

### 💻 2. POS Terminal Pages (8 Screens)

The cashier terminal is optimized for touch and fast operations, locking employees out of admin settings:

1.  **POS 1: Floor Pop-up (Table Selection)**
    *   Appears on POS launch. Shows a grid layout of all tables per floor. Occupied tables are highlighted in red/pink.
2.  **POS 2: Order View (Main POS Screen)**
    *   A high-efficiency 3-column layout:
        *   **Left (Menu):** Color-coded category tabs and tap-to-add product cards.
        *   **Middle (Cart):** Lists order lines, quantity steppers, applied discounts, and live GST calculations.
        *   **Right (Numpad & Action Panel):** Quick value entries, "Send to Kitchen" trigger, and payment method selector.
3.  **POS 3: Discount Popup**
    *   Apply coupon codes manually, or select/preview active automated discount promotions.
4.  **POS 4: Payment & Receipt Screen**
    *   Processes payments:
        *   **Cash:** Calculates change due dynamically based on tendered cash amount.
        *   **UPI:** Generates a real-time QR code with the total due.
        *   **Card:** Stores card transaction reference number.
    *   Enables receipt printing or emailing on completion.
5.  **POS 5: Orders List**
    *   View all historical and draft orders created during the current shift. Filterable by Order#, Customer Name, or date.
6.  **POS 6: Order Detail View**
    *   View specific order details. Allows editing/deleting draft orders or loading them back into the active cart.
7.  **POS 7: Customer Management**
    *   Allows cashiers to search, register, or edit customers (Name, Email, Phone) to link them to orders for invoice receipts.
8.  **POS 8: Table View**
    *   Visual floor status grid indicating active orders, timers, and bill totals per table.

---

### 🍳 3. Kitchen Display System (1 Screen)

A dedicated, high-performance interface for kitchen staff:

1.  **KDS 1: Kitchen Board (`/kds`)**
    *   No authentication required for standalone tablet mounting in the kitchen.
    *   Tabs filter tickets by status: All, To Cook, Preparing, or Completed.
    *   **Interactive Controls:** Tap individual line items to cross them out (completed preparation) or tap the ticket header to move the order to the next KDS stage.
    *   Supports category and product-level ticket filtering.

---

## 🛠️ Tech Stack & Architecture

- **Frontend Framework:** Next.js 14 (App Router) + TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** Custom JWT stored in HttpOnly cookies + password encryption via `bcrypt`
- **Real-Time Engine:** Socket.io WebSockets
- **Input Validation:** Zod schema constraints
- **Styling:** Tailwind CSS

---

## 🚦 Getting Started

### 1. Installation
Install dependencies in the root folder:
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory and add the following keys:
```env
DATABASE_URL="postgresql://postgres:123@localhost:5432/odoo_cafe"
JWT_SECRET="your-super-secret-key-change-this"
PORT="3000"
```

### 3. Database Migration & Seed
Initialize the database tables and default lookup values:
```bash
npx prisma migrate dev
```

### 4. Running the App
Start the custom Node HTTP server which mounts both Next.js and Socket.io:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) for the main application, and [http://localhost:3000/kds](http://localhost:3000/kds) for the Kitchen Display System.
