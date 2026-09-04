# 🌶️ SpiceRoute Kitchen

A **production-grade, full-stack restaurant food delivery platform** — built as a portfolio project demonstrating modern full-stack engineering.

---

## ✨ Features

### Customer
- Register / Login (JWT)
- Browse full menu with categories, search, filters, sort
- View food details with ratings, calories, prep time
- Add to cart, manage quantities, apply coupons
- Multiple delivery addresses (Home / Work / Other)
- Checkout with Razorpay (online) or Cash on Delivery
- Real-time order tracking with WebSocket status updates
- Order history & reorder
- Rate & review delivered orders
- Save favourite items
- In-app notifications

### Restaurant Admin
- Live order management dashboard
- Confirm → Prepare → Ready → Assign delivery partner
- Full menu & category CRUD
- Coupon management (flat / percentage discounts)
- Customer management (activate / deactivate)
- Review moderation
- Analytics: revenue, orders, top items, charts

### Delivery Partner
- View orders ready for pickup
- Accept & update delivery status
- Delivery history & earnings

---

## 🏗 Architecture

```
Customer Web (React + Vite)  ──┐
Customer Mobile (Expo RN)    ──┤──► Spring Boot REST API ──► MySQL
Admin Dashboard (React)      ──┤         │
Delivery Interface (React)   ──┘    WebSocket (STOMP)
                                         │
                               Razorpay · Cloudinary · Google Maps
```

**Backend layering:** Controller → Service → Repository → Entity → MySQL  
**Auth:** JWT access + refresh tokens, BCrypt password hashing, RBAC

---

## 🛠 Tech Stack

| Layer      | Technology                                              |
|------------|---------------------------------------------------------|
| Web        | React 18, Vite, Tailwind CSS, React Router, Framer Motion, Recharts |
| Mobile     | React Native, Expo, React Navigation                    |
| Backend    | Java 21, Spring Boot 3.3, Spring Security, JPA/Hibernate|
| Database   | MySQL 8                                                 |
| Real-Time  | WebSocket / STOMP                                       |
| Payment    | Razorpay                                                |
| Storage    | Cloudinary                                              |
| Auth       | JWT (JJWT 0.12), BCrypt                                 |
| API Docs   | Swagger / OpenAPI 3 (Springdoc)                         |
| DevOps     | Docker, Docker Compose, GitHub Actions                  |

---

## 🚀 Quick Start

### Prerequisites
- Java 21+
- Node 20+
- MySQL 8 (or Docker)

### 1. Clone

```bash
git clone https://github.com/yourname/spiceroute-kitchen.git
cd spiceroute-kitchen
```

### 2. Environment variables

```bash
cp .env.example .env
# Edit .env — fill in DB password, JWT secret, Razorpay keys, Cloudinary
```

### 3. Run with Docker (recommended)

```bash
docker compose up --build
```

| Service  | URL                          |
|----------|------------------------------|
| Frontend | http://localhost             |
| Backend  | http://localhost:8080        |
| Swagger  | http://localhost:8080/swagger-ui.html |

### 4. Run locally (without Docker)

**Backend**
```bash
cd backend
# Make sure MySQL is running and database 'spiceroute' exists
mvn spring-boot:run
```

**Frontend**
```bash
cd frontend
npm install
npm run dev          # http://localhost:5173
```

**Mobile**
```bash
cd mobile
npm install
npx expo start       # scan QR with Expo Go app
```

---

## 🗄 Database

The app uses **Spring JPA `ddl-auto=update`** — tables are created automatically on first start.

On startup, the `DatabaseSeeder` creates:

| Account               | Email                      | Password      |
|-----------------------|----------------------------|---------------|
| Super Admin           | admin@spiceroute.com       | Admin@123     |
| Restaurant Admin      | rajan@spiceroute.com       | Admin@123     |
| Customer              | priya@example.com          | Test@123      |
| Customer 2            | arjun@example.com          | Test@123      |
| Delivery Partner      | vijay@spiceroute.com       | Delivery@123  |

Seed data includes **8 categories**, **25+ food items**, and **4 coupons**.

---

## 📡 API Documentation

Swagger UI: **http://localhost:8080/swagger-ui.html**

Key endpoints:

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh

GET    /api/categories
GET    /api/foods?q=biryani&categoryId=1&vegetarian=true&sortBy=rating
GET    /api/foods/bestsellers
GET    /api/foods/{id}

GET    /api/cart
POST   /api/cart/items
PATCH  /api/cart/items/{id}?quantity=2
DELETE /api/cart/items/{id}

GET    /api/coupons/validate?code=WELCOME50&orderAmount=499

POST   /api/orders
GET    /api/orders
GET    /api/orders/{id}
PATCH  /api/orders/{id}/status?status=CONFIRMED

POST   /api/payments/create
POST   /api/payments/verify

GET    /api/reviews/public
POST   /api/reviews

GET    /api/favorites
POST   /api/favorites/{foodItemId}

GET    /api/notifications
GET    /api/notifications/unread-count

GET    /api/admin/analytics          (admin only)
```

---

## 🧪 Testing

```bash
# Backend unit tests
cd backend
mvn test

# Frontend build check
cd frontend
npm run build
```

---

## 🔄 Order Status Flow

```
PLACED → CONFIRMED → PREPARING → READY_FOR_PICKUP → OUT_FOR_DELIVERY → DELIVERED
                                                                      ↘
PLACED / CONFIRMED → CANCELLED (customer or admin)
```

---

## 💳 Razorpay Integration

1. Create account at [razorpay.com](https://razorpay.com)
2. Get Test API keys from Dashboard → Settings → API Keys
3. Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `.env`

Payment flow:
1. Backend creates Razorpay order
2. Frontend opens Razorpay checkout
3. Customer pays
4. Backend **verifies HMAC signature** server-side before confirming

---

## 📁 Project Structure

```
spiceroute-kitchen/
├── backend/                    # Spring Boot API
│   ├── src/main/java/com/spiceroute/delivery/
│   │   ├── config/             # Security, CORS, WebSocket, Swagger
│   │   ├── controller/         # REST controllers (12 controllers)
│   │   ├── domain/             # OrderStateMachine
│   │   ├── dto/                # Request / Response DTOs
│   │   ├── entity/             # JPA entities (18 entities)
│   │   ├── exception/          # Global exception handler
│   │   ├── repository/         # Spring Data repositories
│   │   ├── security/           # JWT filter, UserDetailsService
│   │   └── service/            # Business logic (10 services)
│   └── src/test/               # Unit tests
│
├── frontend/                   # React web app
│   └── src/
│       ├── api/                # Axios API layer
│       ├── components/         # Reusable UI components
│       ├── context/            # Auth, Cart context
│       └── pages/
│           ├── customer/       # Home, Menu, Cart, Checkout, Orders...
│           ├── admin/          # Dashboard, Menu, Orders, Customers...
│           └── delivery/       # DeliveryHome, History
│
├── mobile/                     # React Native + Expo
│   └── src/
│       ├── api/                # Shared API layer
│       ├── context/            # AuthContext (AsyncStorage)
│       ├── navigation/         # Stack + Bottom Tab navigator
│       └── screens/            # 11 screens
│
├── docker-compose.yml
├── .env.example
└── .github/workflows/ci.yml
```

---

## 🎯 Role-Based Access

| Role             | Access                                     |
|------------------|--------------------------------------------|
| `CUSTOMER`       | Browse, cart, orders, reviews, favorites   |
| `RESTAURANT_ADMIN`| Menu CRUD, order management, analytics   |
| `DELIVERY_PARTNER`| View/accept/complete deliveries           |
| `SUPER_ADMIN`    | Full platform access                       |

---

## 📱 Mobile App (Expo)

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with **Expo Go** (iOS/Android).

For device testing, update `BASE_URL` in `mobile/src/api/index.js`:
```js
const BASE_URL = 'http://YOUR_LOCAL_IP:8080/api'
```

---

## 🌶️ Sample Coupons

| Code       | Type       | Value | Min Order |
|------------|------------|-------|-----------|
| WELCOME50  | Percentage | 50%   | ₹150      |
| FLAT100    | Flat       | ₹100  | ₹499      |
| WEEKEND20  | Percentage | 20%   | ₹200      |
| SPICE50    | Flat       | ₹50   | ₹149      |

---

## 🏆 Portfolio Highlights

This project demonstrates:

- **Full-stack development** — end-to-end from DB to mobile
- **REST API design** — 50+ endpoints, consistent response structure
- **Domain-driven design** — OrderStateMachine with role-based transitions
- **Security** — JWT, BCrypt, RBAC, CORS, payment signature verification
- **Real-time** — WebSocket/STOMP order status broadcasting
- **Payment integration** — Razorpay with server-side signature verification
- **Mobile development** — React Native + Expo with 11 screens
- **Modern UI/UX** — Tailwind CSS, skeleton loaders, toast notifications
- **Testing** — JUnit 5 unit tests for business logic
- **DevOps** — Docker Compose, GitHub Actions CI/CD

---

*Built with ❤️ — SpiceRoute Kitchen*
