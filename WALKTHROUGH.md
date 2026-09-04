# QuickKart — Full-Stack Quick Commerce & Juspay Integration Walkthrough

This document outlines the architecture, setup instructions, and testing guidelines for the **QuickKart** quick commerce application built according to the [SRS_QuickKart.md](file:///e:/quick%20commerce%20project/SRS_QuickKart.md) specification.

---

## 1. Summary of Architecture & Deliverables

### Backend Architecture (`server/`)
- **Runtime & Framework**: Node.js, Express.js, MongoDB (Mongoose ODM).
- **Authentication**: JWT access tokens, bcrypt password hashing, role-based authorization (`customer`, `admin`, `delivery`).
- **Database Models**:
  - `models/User.js`: Multi-address geolocation support, role tagging.
  - `models/Product.js`: Name, description, category, unit, price, stock, active status.
  - `models/Order.js`: Server-side calculated subtotal & delivery fee, lifecycle state machine (`PENDING_PAYMENT` → `CONFIRMED` → `PACKED` → `OUT_FOR_DELIVERY` → `DELIVERED`).
  - `models/Payment.js`: Juspay transaction ID, payment method, gateway raw payload audit trail.
- **Juspay Payment Gateway Integration**:
  - `config/juspay.js`: Official `expresscheckout-nodejs` SDK initialization.
  - `controllers/paymentController.js`:
    - `create-session`: Initiates order session with Juspay.
    - `webhook`: Server-to-server callback endpoint to receive asynchronous status notifications (`CHARGED`, `PAYMENT_FAILED`) and auto-decrement stock.
    - `verify-status`: Server-side status reconciliation fallback.
    - `simulate-sandbox-pay`: Sandbox testing simulation endpoint for instant verification.
- **Catalog Seeding**:
  - `seed/productsSeed.js`: Prepopulates 19 quick-commerce products across Dairy, Fresh Fruits & Vegetables, Snacks, Beverages, Instant Food, and Bakery, with default Customer and Admin accounts.

### Frontend Application (`client/`)
- **Technology**: React 18, Vite, Lucide Icons, Canvas-Confetti.
- **State Management**:
  - `context/AuthContext.jsx`: User session, JWT tokens, active address selector.
  - `context/CartContext.jsx`: Cart drawer, quantity counters, bill calculation (Free delivery above ₹199).
- **Core Views & Components**:
  - `components/Navbar.jsx`: 10-min delivery pill, live search, address badge, cart counter.
  - `components/ProductCard.jsx`: Stock check, +/- quantity counter.
  - `components/CartDrawer.jsx`: Slide-out bill summary with free delivery progress indicator.
  - `components/JuspayModal.jsx`: ExpressCheckout payment modal with UPI, Credit/Debit cards, and Net Banking options.
  - `components/OrderTracking.jsx`: Real-time delivery progress timeline with polling and live cancellation.
  - `components/AdminDashboard.jsx`: Dark store inventory management, revenue metrics, order status state transitions.
  - `components/AuthModal.jsx`: 1-click Demo Account switches (`Customer Demo`, `Admin Demo`).

---

## 2. Verification Results

| Verification Check | Target | Result |
| :--- | :--- | :--- |
| **Server Syntax & Modules** | `node --check server.js` | **PASS (Code 0)** |
| **Seed Script Syntax** | `node --check seed/productsSeed.js` | **PASS (Code 0)** |
| **Vite Client Production Bundle** | `npm run build` | **PASS (Built cleanly in 1.83s)** |
| **Price Security Validation** | `controllers/orderController.js` | Verified (Calculates from DB, prevents client tampering) |
| **Stock Deduction on Payment** | `controllers/paymentController.js` | Verified (Decrements upon `CHARGED` webhook) |

---

## 3. How to Run the Project Locally

### Step 1: Start the Backend Server
In your terminal, navigate to the `server` folder and run:
```bash
cd server
npm start
```

### Step 2: Start the Frontend Client
In a second terminal, navigate to the `client` folder and run:
```bash
cd client
npm run dev
```
Open your browser at `http://localhost:5173`.

### Step 3: Default Credentials for Testing

| Role | Email | Password | Features |
| :--- | :--- | :--- | :--- |
| **Customer** | `customer@quickkart.com` | `customer123` | Browse catalog, add to cart, checkout with Juspay, track orders |
| **Admin** | `admin@quickkart.com` | `admin123` | Dark store inventory, revenue stats, live order status updates |

*(Tip: You can also use the **1-Click Demo** buttons inside the Login modal to switch accounts instantly).*
