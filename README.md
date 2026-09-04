# QuickKart — 10-Minute Grocery Delivery Web App (MERN Stack + Juspay)

> **College Project / Summer Training Project**  
> **Developer:** Rohit Pal ([@Rohit-pal01](https://github.com/Rohit-pal01))  
> **Domain:** Full-Stack Web Development / Quick Commerce  

---

## 📌 Project Overview

**QuickKart** is a full-stack quick-commerce web application inspired by platforms like Blinkit, Zepto, and Swiggy Instamart. I built this project as part of my college summer training / academic project to understand how modern high-speed delivery apps manage fast catalog browsing, secure payments, inventory locks, and order tracking.

The app provides a complete shopping flow: customers can browse grocery items, manage their cart, select delivery addresses, pay online using **Juspay ExpressCheckout (UPI / Cards / Net Banking)**, and track their order status in real time. It also includes an **Admin Dashboard** for store managers to manage dark-store inventory and update order stages.

---

## 🎯 Motivation & Objectives

Quick commerce is currently one of the fastest-growing sectors in India. The main technical challenges I wanted to solve in this project were:
1. **Zero Price Tampering:** Ensuring that cart item prices cannot be manipulated from browser dev tools by calculating all totals strictly on the server from MongoDB.
2. **Real Payment Gateway Integration:** Integrating **Juspay ExpressCheckout** using server-to-server sessions and asynchronous webhooks instead of just a dummy frontend alert.
3. **Atomic Stock Decrement:** Updating product quantities automatically once payment is confirmed (`CHARGED`) to prevent over-selling.
4. **Developer-Friendly Setup:** Adding an automatic fallback to an in-memory database (`mongodb-memory-server`) so evaluators and recruiters can run the project locally without needing to set up a cloud database.

---

## 💻 Tech Stack

- **Frontend:** React 19, Vite, Vanilla CSS (Design Tokens & Glassmorphism), Lucide React Icons, Canvas Confetti
- **Backend:** Node.js, Express.js (REST APIs)
- **Database:** MongoDB, Mongoose ODM (with automatic in-memory fallback for quick testing)
- **Authentication:** JWT (JSON Web Tokens), bcryptjs password hashing
- **Payment Gateway:** Juspay ExpressCheckout Node.js SDK (`expresscheckout-nodejs`)
- **Tools Used:** Git, GitHub, Postman, VS Code

---

## 🚀 Key Features

### 👤 Customer Module
- **Categorized Storefront:** Filter items by Dairy & Bread, Fresh Produce, Snacks, Cold Drinks, Instant Food, and Chocolates.
- **Instant Search:** Debounced real-time search across products.
- **Smart Cart Drawer:** Slide-out drawer with dynamic progress bar for free delivery (Free delivery above ₹199).
- **Address Book:** Add and switch between saved delivery addresses (Home, Work, Other).
- **Online Payment:** Integrated Juspay checkout supporting UPI, Credit/Debit cards, and Net Banking (with built-in sandbox simulator for testing).
- **Live Order Tracking:** Step-by-step timeline (`Placed` ➔ `Packed` ➔ `Out for Delivery` ➔ `Delivered`) with live polling and order cancellation.

### 🛡️ Admin / Dark-Store Module
- **Inventory Management:** View available stock, change prices, update stock count, and toggle active/inactive status.
- **Order Lifecycle Control:** Advance orders through different delivery stages.
- **Sales Overview:** Real-time statistics on total orders, revenue generated, and pending deliveries.

### 🔒 Security & Data Integrity
- **Server-Side Validation:** All prices and delivery charges are calculated on the backend.
- **Role-Based Access Control (RBAC):** Protected routes for `customer` and `admin` roles.
- **Webhook Idempotency:** Webhook listener updates payment status safely and avoids duplicate stock deductions.

---

## 📁 Project Architecture & Structure

```
quick-commerce-project/
├── client/                     # React + Vite Frontend
│   ├── src/
│   │   ├── components/         # Navbar, CartDrawer, JuspayModal, OrderTracking, AdminDashboard
│   │   ├── context/            # AuthContext (JWT auth), CartContext (State & totals)
│   │   ├── services/           # api.js (Axios/fetch API client)
│   │   ├── App.jsx             # Main router and view switcher
│   │   └── index.css           # Styling and responsive layout
│   └── package.json
│
├── server/                     # Node.js + Express Backend
│   ├── config/                 # db.js (MongoDB connection + in-memory fallback), juspay.js
│   ├── controllers/            # authController, productController, orderController, paymentController
│   ├── middleware/             # authMiddleware (JWT protect & admin verify), errorHandler
│   ├── models/                 # User.js, Product.js, Order.js, Payment.js
│   ├── routes/                 # Express API routes
│   ├── seed/                   # productsSeed.js (Catalog seeder with 35+ grocery items)
│   └── server.js               # Main server entry point
│
├── SRS_QuickKart.md            # IEEE 830 style specification document
├── WALKTHROUGH.md              # Testing and verification notes
└── README.md
```

---

## 💳 Juspay Payment Integration Flow

Here is how the online payment workflow is implemented:

```
[Customer clicks Checkout]
         │
         ▼
[POST /api/payments/create-session]
  ├── Server validates order in MongoDB
  └── Server calls Juspay SDK to initiate payment session
         │
         ▼
[Juspay ExpressCheckout Modal Opens]
  ├── Customer selects UPI / Card / NetBanking
  └── Completes test payment in sandbox
         │
         ▼
[Juspay Server-to-Server Webhook]
  ├── Receives 'CHARGED' status notification
  ├── Decrements product stock in MongoDB
  └── Transitions order status from PENDING_PAYMENT to CONFIRMED
         │
         ▼
[Client polls GET /api/orders/:id]
  └── Displays success celebration (confetti) and redirects to Live Tracking
```

*Note: For local testing without active merchant keys, the app also includes a Sandbox Simulator endpoint (`/api/payments/simulate-sandbox-pay`) so the payment flow can be verified seamlessly.*

---

## ⚙️ How to Run Locally

### 1. Clone the Repository
```bash
git clone https://github.com/Rohit-pal01/quick-commerce-project.git
cd quick-commerce-project
```

### 2. Setup Backend (`server`)
```bash
cd server
npm install
```

Create a `.env` file in the `server` folder (or copy from `.env.example`):
```env
PORT=5000
NODE_ENV=development
APP_BASE_URL=http://localhost:5173
JWT_SECRET=my_college_project_jwt_secret_key

# Optional: Add your MongoDB URI here.
# If left blank, the app will automatically start an in-memory MongoDB database!
MONGO_URI=
```

Start the backend server:
```bash
npm start
```
*(The server will start on `http://localhost:5000` and auto-seed sample products and demo users).*

### 3. Setup Frontend (`client`)
Open a new terminal:
```bash
cd client
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your web browser.

---

## 🔑 Demo Login Accounts

You can log in directly using the **1-Click Demo Buttons** on the login popup, or use these credentials:

| Role | Email | Password | What You Can Test |
| :--- | :--- | :--- | :--- |
| **Customer** | `customer@quickkart.com` | `customer123` | Add to cart, choose address, pay with Juspay, track order |
| **Admin** | `admin@quickkart.com` | `admin123` | Dark store inventory, change item stock, advance order stages |

---

## 💼 Placement & Resume Ready Section

If you want to include this project in your resume for campus placements, software developer internships, or off-campus drives, you can use the following descriptions:

### Option 1: Bullet Points for Software Engineer / Full-Stack Role (Recommended)
```text
QuickKart — Quick Commerce & Payment Processing Web App (MERN Stack)
• Engineered a full-stack 10-minute grocery delivery web platform using React 19, Node.js, Express, and MongoDB.
• Integrated Juspay ExpressCheckout SDK supporting UPI, Cards, and Net Banking; built asynchronous webhook listeners to achieve idempotent order confirmation and automated stock reservation.
• Designed server-side price calculation and tamper-proofing logic, preventing client-side cart manipulation.
• Built an interactive dark-store admin panel enabling store managers to update live inventory stock and advance order lifecycle states (Pending → Confirmed → Packed → Out for Delivery → Delivered).
• Implemented JWT authentication, role-based access control (RBAC), and zero-configuration in-memory database fallback for instant local evaluation.
```

### Option 2: Short 3-Line Summary (For Single-Page Resume)
```text
QuickKart | MERN Stack, Juspay Gateway, JWT, React 19 | GitHub: github.com/Rohit-pal01/quickkart
• Developed a responsive quick-commerce web application with real-time order tracking and dark-store inventory control.
• Implemented end-to-end payment processing with Juspay ExpressCheckout SDK, webhook handling, and atomic stock updates.
• Built secure RESTful APIs with JWT authentication, server-side cart validation, and zero-config in-memory database fallback.
```

---

## 🎯 Technical Questions Evaluators / Interviewers May Ask

<details>
<summary><b>1. How did you handle security and prevent users from changing product prices in the frontend?</b></summary>

> **Answer:** Cart items sent from the frontend only contain `productId` and `quantity`. The backend fetches the actual prices directly from MongoDB, recalculates the subtotal, delivery charges, and handling fee on the server, and creates the order. The user cannot manipulate the payable amount.
</details>

<details>
<summary><b>2. Why did you use Juspay instead of Razorpay or Stripe?</b></summary>

> **Answer:** Juspay is widely used by top Indian quick commerce and food delivery apps (like Swiggy and Zepto) for high-conversion UPI intent and checkout routing. Integrating Juspay ExpressCheckout gave me direct exposure to how enterprise payment aggregators handle server-to-server session tokens, SDK modals, and asynchronous webhooks.
</details>

<details>
<summary><b>3. What happens if the user makes a payment but closes the tab before returning to your site?</b></summary>

> **Answer:** The payment confirmation does not depend on the browser. Juspay triggers a server-to-server Webhook notification (`CHARGED`) to `/api/payments/webhook`. The backend validates this webhook, marks the order as `CONFIRMED`, and decrements inventory. Even if the browser was closed, when the customer logs back in, their order status is already updated.
</details>

<details>
<summary><b>4. How does the database fallback work?</b></summary>

> **Answer:** In `config/db.js`, the server attempts to connect to `process.env.MONGO_URI` with a 3-second timeout. If no cloud/local MongoDB is reachable, it automatically spins up `mongodb-memory-server` in the background and auto-seeds the catalog. This ensures the app can be evaluated anywhere without manual database installation.
</details>

---

## 📈 Future Enhancements / Next Steps

- [ ] Add real-time rider location tracking using WebSockets / Socket.io and Leaflet/Google Maps.
- [ ] Implement Redis caching for frequent product catalog queries.
- [ ] Add SMS / WhatsApp delivery updates via Twilio API.
- [ ] Mobile app client using React Native.

---

## 👨‍💻 Author

**Rohit Pal**  
- **GitHub:** [@Rohit-pal01](https://github.com/Rohit-pal01)  
- **Project Repo:** [quick-commerce-project](https://github.com/Rohit-pal01/quick-commerce-project)  

*Built with passion for learning full-stack system design, payment integrations, and web performance.*
