# Software Requirements Specification (SRS)
## QuickKart — Quick Commerce Web Application (MERN Stack) with Juspay Payment Integration

| | |
|---|---|
| **Document Version** | 1.0 |
| **Prepared For** | Summer Training Project |
| **Technology Stack** | MongoDB, Express.js, React.js, Node.js (MERN) |
| **Payment Gateway** | Juspay (ExpressCheckout) |
| **Document Type** | Software Requirements Specification (IEEE 830 style) |

---

## Table of Contents

1. Introduction
2. Overall Description
3. System Features / Functional Requirements
4. External Interface Requirements
5. Non-Functional Requirements
6. System Architecture
7. Database Design
8. Payment Gateway Integration (Juspay) — Detailed Guidance
9. Use Case Diagrams (Textual)
10. Data Flow Diagram (Textual)
11. Appendix

---

## 1. Introduction

### 1.1 Purpose
This document specifies the software requirements for **QuickKart**, a Quick Commerce web application that enables users to order groceries, essentials, and daily-use products for delivery within a short time window (typically 10–30 minutes), similar to Blinkit, Zepto, or Swiggy Instamart. The system is built using the **MERN stack** (MongoDB, Express.js, React.js, Node.js) and integrates **Juspay** as the payment gateway for handling online transactions (UPI, cards, net banking, wallets).

This SRS is intended to guide development, serve as a reference for the summer training report, and act as a contract of scope between the developer and evaluator/mentor.

### 1.2 Scope
The application will allow:
- Customers to browse products, add them to a cart, and place orders with online payment.
- Real-time order tracking and delivery status updates.
- Admin/seller-side management of inventory, orders, and dark-store (micro-warehouse) operations.
- Delivery partner assignment and status updates.
- Secure payment processing through Juspay's ExpressCheckout APIs (UPI intent/collect, cards, net banking, wallets).

Out of scope (for a training-level project, unless extended): multi-vendor marketplace, advanced logistics route optimization, native mobile apps (web-responsive only).

### 1.3 Intended Audience
- Developer (student) implementing the project.
- Project guide / mentor evaluating the summer training report.
- Future contributors extending the system.

### 1.4 Definitions, Acronyms, and Abbreviations

| Term | Meaning |
|---|---|
| MERN | MongoDB, Express.js, React.js, Node.js |
| SRS | Software Requirements Specification |
| API | Application Programming Interface |
| JWT | JSON Web Token |
| UPI | Unified Payments Interface |
| SDK | Software Development Kit |
| Dark Store | A micro-fulfilment warehouse not open to walk-in customers |
| Webhook | A server-to-server callback used by Juspay to notify payment status |
| OTP | One-Time Password |

### 1.5 References
- Juspay ExpressCheckout API Documentation (apidocs.juspay.in)
- Juspay Node.js SDK (`expresscheckout-nodejs`)
- MongoDB, Express.js, React.js, Node.js official documentation

---

## 2. Overall Description

### 2.1 Product Perspective
**QuickKart** is a **standalone, independently developed web application**. It consists of:
- A **React.js** frontend (customer-facing storefront + admin dashboard).
- A **Node.js/Express.js** backend exposing REST APIs.
- A **MongoDB** database for persistent storage.
- **Juspay** as an external payment service integrated via server-side SDK calls and client-side checkout widget/redirect.

### 2.2 Product Functions (Summary)
- User registration/login (OTP or email-password + JWT auth)
- Product catalog browsing, search, filter by category
- Cart management
- Address management with geolocation
- Order placement and checkout
- **Online payment via Juspay** (UPI, cards, net banking, wallets)
- Order status tracking (Placed → Packed → Out for Delivery → Delivered)
- Admin panel: product/inventory management, order management
- Delivery partner panel: accept/update delivery status
- Notifications (email/SMS/in-app) for order and payment events
- Refunds and cancellations handled through Juspay refund APIs

### 2.3 User Classes and Characteristics

| User Class | Description |
|---|---|
| Customer | Browses products, places orders, makes payments, tracks delivery |
| Admin/Seller | Manages products, stock, orders, views sales reports |
| Delivery Partner | Views assigned orders, updates delivery status |
| System (Automated) | Handles payment webhooks, order status transitions, notifications |

### 2.4 Operating Environment
- **Frontend:** React.js (deployed via Vercel/Netlify), responsive design (mobile-first)
- **Backend:** Node.js + Express.js (deployed on Render/Railway/AWS EC2)
- **Database:** MongoDB Atlas (cloud-hosted)
- **Payment Gateway:** Juspay Sandbox (testing) → Juspay Production (live)
- **Browser support:** Chrome, Firefox, Edge, Safari (latest 2 versions)

### 2.5 Design and Implementation Constraints
- Payment processing must never store raw card details on the application server (PCI-DSS compliance is handled by Juspay's hosted checkout/SDK).
- All payment-sensitive endpoints must use HTTPS.
- Juspay API keys and secrets must be stored in environment variables, never committed to source control.
- The system must handle Juspay sandbox vs. production environment switching via config.

### 2.6 Assumptions and Dependencies
- Juspay merchant account (sandbox credentials) is available for development/testing.
- Delivery logistics (actual riders) are simulated for the training project; only status updates are tracked digitally.
- Third-party services (SMS/email for OTP) may use free-tier providers (e.g., Twilio, Nodemailer).

---

## 3. System Features / Functional Requirements

### FR-1: User Authentication & Authorization
- FR-1.1: Users shall register using name, email/phone, and password (or OTP-based login).
- FR-1.2: Passwords shall be hashed using bcrypt before storage.
- FR-1.3: On successful login, the system shall issue a JWT access token (and refresh token).
- FR-1.4: Role-based access control shall distinguish Customer, Admin, and Delivery Partner roles.

### FR-2: Product Catalog Management
- FR-2.1: Admin shall be able to add, edit, delete, and categorize products.
- FR-2.2: Each product shall have name, description, price, stock quantity, category, images, and unit (e.g., 500g, 1L).
- FR-2.3: Customers shall be able to search products by name/category and filter by price/availability.

### FR-3: Cart Management
- FR-3.1: Customers shall be able to add/remove/update product quantities in the cart.
- FR-3.2: Cart shall persist across sessions (stored in DB for logged-in users, or local storage for guests).
- FR-3.3: System shall auto-calculate subtotal, delivery fee, taxes, and grand total.

### FR-4: Address & Delivery Slot Management
- FR-4.1: Customers shall be able to add/edit/delete multiple delivery addresses with geolocation (lat/long via map picker).
- FR-4.2: System shall estimate delivery time based on dark-store proximity (can be simulated with a fixed radius check).

### FR-5: Order Placement & Checkout
- FR-5.1: On checkout, the system shall display an order summary and available payment options.
- FR-5.2: The system shall create an order record in the database with status `PENDING_PAYMENT` before invoking Juspay.
- FR-5.3: The system shall initiate a payment session with Juspay using the order amount, order ID, and customer details.
- FR-5.4: On payment success (confirmed via Juspay webhook/callback), the order status shall change to `CONFIRMED`.
- FR-5.5: On payment failure, the order status shall change to `PAYMENT_FAILED`, and the customer shall be allowed to retry.

### FR-6: Payment Processing (Juspay Integration) — see Section 8 for full detail
- FR-6.1: The backend shall create a Juspay order session using the ExpressCheckout Node.js SDK.
- FR-6.2: The frontend shall redirect/open the Juspay hosted checkout page (or embedded widget) using the session token.
- FR-6.3: The backend shall expose a webhook endpoint to receive asynchronous payment status updates from Juspay.
- FR-6.4: The backend shall verify webhook signatures before trusting payment status.
- FR-6.5: The system shall support refunds via Juspay's Refund API for cancelled orders.

### FR-7: Order Tracking
- FR-7.1: Customers shall be able to view real-time order status: Placed → Packed → Out for Delivery → Delivered.
- FR-7.2: Admin/Delivery Partner shall be able to update order status, which reflects instantly (via polling or WebSocket/Socket.IO) on the customer's tracking page.

### FR-8: Admin Dashboard
- FR-8.1: Admin shall view all orders with filters (status, date range).
- FR-8.2: Admin shall view sales analytics (total revenue, orders per day, top-selling products).
- FR-8.3: Admin shall manage inventory stock levels, with low-stock alerts.

### FR-9: Notifications
- FR-9.1: System shall send order confirmation and payment status via email/SMS.
- FR-9.2: System shall show in-app toast/notification for order status changes.

### FR-10: Cancellations & Refunds
- FR-10.1: Customers shall be able to cancel an order before it is "Out for Delivery."
- FR-10.2: On cancellation of a paid order, the system shall trigger a Juspay refund and update order status to `REFUND_INITIATED` / `REFUNDED`.

---

## 4. External Interface Requirements

### 4.1 User Interfaces
- Responsive React.js SPA with pages: Home/Catalog, Product Detail, Cart, Checkout, Order Tracking, Profile, Admin Dashboard, Delivery Partner Panel.
- Checkout page shall embed/redirect to Juspay's hosted payment page or SDK-driven widget.

### 4.2 Hardware Interfaces
- None specific; standard web-capable devices (desktop/mobile browsers).

### 4.3 Software Interfaces

| Interface | Purpose |
|---|---|
| MongoDB Atlas | Persistent data storage |
| Juspay ExpressCheckout API/SDK | Payment order creation, status check, refund |
| Juspay Webhooks | Asynchronous payment status notification |
| Nodemailer / Twilio (optional) | Email/SMS notifications |
| Socket.IO (optional) | Real-time order status push |
| Cloudinary / AWS S3 (optional) | Product image storage |

### 4.4 Communication Interfaces
- REST APIs over HTTPS between frontend and backend.
- HTTPS calls from backend to Juspay APIs (sandbox: `https://sandbox.juspay.in`, production: `https://api.juspay.in`).
- Webhook (HTTPS POST) from Juspay to backend `/api/payments/webhook`.

---

## 5. Non-Functional Requirements

| Category | Requirement |
|---|---|
| **Performance** | Product catalog pages shall load within 2 seconds under normal load. |
| **Scalability** | Backend APIs shall be stateless (JWT-based) to allow horizontal scaling. |
| **Security** | All sensitive data (passwords, tokens) shall be encrypted/hashed. Juspay API keys stored via environment variables (`.env`, never committed). HTTPS enforced in production. |
| **Reliability** | Payment status must be reconciled via webhook + a fallback status-check API call, to avoid inconsistent order states. |
| **Availability** | Target uptime of 99% for demonstration/training deployment. |
| **Usability** | Mobile-first, intuitive UI comparable to standard quick-commerce apps. |
| **Maintainability** | Modular MVC-style backend (routes/controllers/models/services), reusable React components. |
| **Auditability** | All payment transactions logged with Juspay order ID, status, and timestamp for traceability. |

---

## 6. System Architecture

### 6.1 High-Level Architecture (Textual Diagram)

```
[React.js Frontend] <---- HTTPS/REST ----> [Node.js + Express Backend] <----> [MongoDB Atlas]
        |                                          |
        |  (Redirect/Widget for Checkout)          |  (Server-to-Server API calls)
        v                                          v
   [Juspay Hosted Checkout Page]  <-----------> [Juspay ExpressCheckout API]
        |
        v (Webhook callback on payment completion)
   [Backend Webhook Endpoint: /api/payments/webhook]
```

### 6.2 Suggested Folder Structure (Backend)

```
server/
├── config/
│   ├── db.js
│   └── juspay.js
├── controllers/
│   ├── authController.js
│   ├── productController.js
│   ├── orderController.js
│   └── paymentController.js
├── models/
│   ├── User.js
│   ├── Product.js
│   ├── Order.js
│   └── Payment.js
├── routes/
│   ├── authRoutes.js
│   ├── productRoutes.js
│   ├── orderRoutes.js
│   └── paymentRoutes.js
├── middleware/
│   ├── authMiddleware.js
│   └── errorHandler.js
├── services/
│   └── juspayService.js
├── .env
├── server.js
└── package.json
```

### 6.3 Suggested Folder Structure (Frontend)

```
client/
├── src/
│   ├── components/
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── ProductDetail.jsx
│   │   ├── Cart.jsx
│   │   ├── Checkout.jsx
│   │   ├── OrderTracking.jsx
│   │   └── AdminDashboard.jsx
│   ├── context/ (Auth, Cart context via useContext/useReducer)
│   ├── services/
│   │   └── api.js (Axios instance)
│   ├── App.jsx
│   └── main.jsx
└── package.json
```

---

## 7. Database Design (MongoDB Collections)

### 7.1 User
```json
{
  "_id": "ObjectId",
  "name": "String",
  "email": "String",
  "phone": "String",
  "passwordHash": "String",
  "role": "customer | admin | delivery",
  "addresses": [
    { "label": "Home", "line1": "String", "lat": "Number", "lng": "Number" }
  ],
  "createdAt": "Date"
}
```

### 7.2 Product
```json
{
  "_id": "ObjectId",
  "name": "String",
  "description": "String",
  "category": "String",
  "price": "Number",
  "unit": "String",
  "stock": "Number",
  "imageUrl": "String",
  "isActive": "Boolean"
}
```

### 7.3 Order
```json
{
  "_id": "ObjectId",
  "orderId": "String (unique, sent to Juspay)",
  "userId": "ObjectId (ref: User)",
  "items": [
    { "productId": "ObjectId", "name": "String", "qty": "Number", "price": "Number" }
  ],
  "deliveryAddress": { "line1": "String", "lat": "Number", "lng": "Number" },
  "subtotal": "Number",
  "deliveryFee": "Number",
  "totalAmount": "Number",
  "status": "PENDING_PAYMENT | CONFIRMED | PACKED | OUT_FOR_DELIVERY | DELIVERED | CANCELLED | PAYMENT_FAILED | REFUND_INITIATED | REFUNDED",
  "paymentId": "ObjectId (ref: Payment)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### 7.4 Payment (Juspay Transaction Record)
```json
{
  "_id": "ObjectId",
  "orderId": "String (matches Order.orderId, sent to Juspay as order_id)",
  "juspayTxnId": "String",
  "amount": "Number",
  "currency": "INR",
  "paymentMethod": "UPI | CARD | NB | WALLET",
  "status": "CREATED | PENDING | CHARGED | AUTHENTICATION_FAILED | AUTHORIZATION_FAILED | JUSPAY_DECLINED | REFUNDED",
  "gatewayResponse": "Object (raw response for audit)",
  "createdAt": "Date"
}
```

---

## 8. Payment Gateway Integration (Juspay) — Detailed Guidance

This section gives step-by-step technical guidance for integrating **Juspay ExpressCheckout** into the MERN backend, since this is the core differentiating feature of the project.

### 8.1 Prerequisites
1. Create a Juspay **sandbox merchant account** at the Juspay dashboard/portal.
2. Obtain the following credentials from **Payments → Settings → Security → API Keys**:
   - `merchantId`
   - `apiKey` (Basic auth) — sufficient for most sandbox testing
   - (Optional, for production-grade security) JWE/JWS key pair for JWT-based authentication
3. Note the environment base URLs:
   | Environment | Endpoint |
   |---|---|
   | Sandbox | `https://sandbox.juspay.in` |
   | Production | `https://api.juspay.in` |
4. Install the official Node.js SDK in the backend:
   ```bash
   npm install expresscheckout-nodejs
   ```

### 8.2 Backend Setup (`config/juspay.js`)
```javascript
const { Juspay } = require('expresscheckout-nodejs');

const juspay = new Juspay({
  merchantId: process.env.JUSPAY_MERCHANT_ID,
  apiKey: process.env.JUSPAY_API_KEY,
  baseUrl: process.env.JUSPAY_BASE_URL, // sandbox or production
});

module.exports = juspay;
```

Store secrets in `.env` (never commit this file):
```
JUSPAY_MERCHANT_ID=your_merchant_id
JUSPAY_API_KEY=your_sandbox_api_key
JUSPAY_BASE_URL=https://sandbox.juspay.in
```

### 8.3 Order Session Creation Flow
1. **Customer clicks "Pay Now"** on the Checkout page (React).
2. **Frontend** calls your backend: `POST /api/payments/create-session` with `{ orderId, amount }`.
3. **Backend**:
   - Validates the order exists and is in `PENDING_PAYMENT` state.
   - Calls Juspay's order/session creation API via the SDK, passing `order_id`, `amount`, `customer_id`, `customer_email`, `customer_phone`, and a `return_url` (where Juspay redirects after payment).
   - Receives a **payment session token / payment links** from Juspay in response.
   - Returns this token/URL to the frontend.
4. **Frontend** uses the token to either:
   - Redirect the browser to Juspay's hosted payment page, **or**
   - Open Juspay's checkout widget (iframe/popup) using the returned payment link.
5. **Customer completes payment** (UPI/Card/NetBanking/Wallet) on Juspay's secure page.
6. **Juspay redirects** the browser back to your `return_url` (e.g., `/order-status/:orderId`) with basic status query params.
7. **Juspay also sends a server-to-server Webhook** (more reliable than the redirect) to your backend endpoint, e.g. `POST /api/payments/webhook`, containing the final transaction status.

> **Important:** Never mark an order as paid solely based on the frontend redirect — always confirm via (a) the webhook, and/or (b) an explicit server-side "order status" API call to Juspay. This prevents a user from spoofing a "success" redirect.

### 8.4 Example: Creating a Payment Session (Simplified)
```javascript
// controllers/paymentController.js
const juspay = require('../config/juspay');
const Order = require('../models/Order');

exports.createPaymentSession = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findOne({ orderId });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const sessionResponse = await juspay.orderSession.create({
      order_id: order.orderId,
      amount: order.totalAmount,
      customer_id: req.user.id,
      customer_email: req.user.email,
      customer_phone: req.user.phone,
      payment_page_client_id: process.env.JUSPAY_CLIENT_ID,
      return_url: `${process.env.APP_BASE_URL}/order-status/${order.orderId}`,
    });

    res.status(200).json({ paymentLink: sessionResponse.payment_links });
  } catch (err) {
    res.status(500).json({ message: 'Payment session creation failed', error: err.message });
  }
};
```
*(Exact method/field names depend on the SDK version — always cross-check against the current Juspay Node.js SDK reference before finalizing, since payment SDKs update frequently.)*

### 8.5 Webhook Handling
```javascript
// controllers/paymentController.js
exports.handleWebhook = async (req, res) => {
  try {
    // 1. Verify the webhook signature/authenticity as per Juspay's docs
    // 2. Extract order_id and status from the payload
    const { order_id, status, txn_id, amount } = req.body;

    const order = await Order.findOne({ orderId: order_id });
    if (!order) return res.status(404).send('Order not found');

    if (status === 'CHARGED') {
      order.status = 'CONFIRMED';
    } else if (['AUTHENTICATION_FAILED', 'AUTHORIZATION_FAILED', 'JUSPAY_DECLINED'].includes(status)) {
      order.status = 'PAYMENT_FAILED';
    }
    await order.save();

    await Payment.create({ orderId: order_id, juspayTxnId: txn_id, amount, status, gatewayResponse: req.body });

    res.status(200).send('OK'); // Always acknowledge receipt
  } catch (err) {
    res.status(500).send('Webhook processing error');
  }
};
```

**Key points:**
- Always respond `200 OK` quickly to acknowledge the webhook, even if internal processing is queued asynchronously — Juspay retries if it doesn't get a timely acknowledgment.
- Configure the webhook URL and authentication (username/password or signature secret) in the Juspay dashboard under **Webhooks settings**.
- Use HTTPS in production for the webhook endpoint (use a tool like ngrok for local development testing).

### 8.6 Refunds
- Expose an admin/customer-triggered `POST /api/payments/refund` endpoint.
- Call Juspay's refund API via the SDK with the original `order_id`/`txn_id` and refund `amount`.
- On success, update `Order.status = 'REFUND_INITIATED'`, then `REFUNDED` once Juspay confirms via webhook.

### 8.7 Testing Guidance
- Use Juspay's **sandbox test cards/UPI IDs** (provided in their sandbox documentation) to simulate success and failure flows.
- Test scenarios to cover in your report/demo:
  - Successful payment → order confirmed.
  - Failed/declined payment → order marked failed, retry allowed.
  - User abandons checkout (closes tab) → reconciled later via a status-check cron job or manual "Check Status" button.
  - Refund flow on order cancellation.

### 8.8 Security Checklist
- [ ] API keys/secrets in `.env`, excluded via `.gitignore`.
- [ ] All payment-related routes behind authentication middleware.
- [ ] Webhook signature/authenticity verified before trusting payload.
- [ ] HTTPS enforced for all payment-related traffic.
- [ ] No raw card data ever touches your own server (handled entirely by Juspay's hosted page/SDK).
- [ ] Amount is always recalculated/validated server-side (never trust an amount sent from the frontend alone).

---

## 9. Use Case Summary (Textual)

| Use Case | Actor | Description |
|---|---|---|
| Register/Login | Customer | Create account or log in via credentials/OTP |
| Browse & Search Products | Customer | View catalog, search, filter |
| Manage Cart | Customer | Add/remove/update items |
| Checkout & Pay | Customer | Place order, pay via Juspay |
| Track Order | Customer | View live order status |
| Manage Inventory | Admin | Add/edit/delete products, update stock |
| Manage Orders | Admin | View, update order status |
| View Sales Reports | Admin | Analytics dashboard |
| Update Delivery Status | Delivery Partner | Mark orders as picked up/delivered |
| Process Payment | System/Juspay | Handle transaction and webhook |
| Process Refund | System/Juspay | Handle cancellations and refunds |

---

## 10. Data Flow (Textual — Checkout & Payment)

```
Customer → [Add to Cart] → [Checkout Page] → [Place Order API]
   → Backend creates Order (status: PENDING_PAYMENT)
   → Backend calls Juspay Create Session API
   → Juspay returns payment link/session token
   → Frontend redirects to Juspay Checkout
   → Customer pays (UPI/Card/NB/Wallet)
   → Juspay processes payment
        ├── Redirects browser to return_url (informational only)
        └── Sends Webhook to backend (authoritative)
   → Backend updates Order + Payment collections
   → Customer sees final status on Order Tracking page
```

---

## 11. Appendix

### 11.1 Suggested Tech Stack Summary

| Layer | Technology |
|---|---|
| Frontend | React.js, React Router, Axios, Tailwind CSS / Material UI |
| State Management | Context API / Redux Toolkit |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose ODM) |
| Authentication | JWT, bcrypt |
| Payment Gateway | Juspay ExpressCheckout (`expresscheckout-nodejs`) |
| Real-time Updates (optional) | Socket.IO |
| Deployment | Vercel/Netlify (frontend), Render/Railway (backend), MongoDB Atlas (DB) |
| Version Control | Git & GitHub |

### 11.2 Milestones (Suggested for Training Timeline)

| Week | Deliverable |
|---|---|
| 1–2 | Requirement analysis, SRS finalization, DB schema design |
| 3–4 | Backend APIs (auth, product, cart, order) |
| 5 | Juspay sandbox integration (order session + webhook) |
| 6 | Frontend storefront + checkout flow |
| 7 | Admin dashboard + order tracking |
| 8 | Testing (including payment success/failure/refund scenarios), deployment, documentation |

### 11.3 Notes for the Summer Training Report
This SRS for **QuickKart** can be directly referenced in **Chapter 3: Technical Details & Implementation** of your training report (per the provided report format), specifically under *Problem Statement*, *Architecture*, and *Implementation & Testing*. The **Payment Gateway Integration** section (Section 8 above) is well suited for the *Modules* and *Implementation* sub-sections, and the **Database Design** (Section 7) fits under *Tools/Requirements* or a dedicated *Database Design* sub-section.

---

*End of Document*
