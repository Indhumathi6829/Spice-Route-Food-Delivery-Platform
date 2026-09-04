# 🌶️ SpiceRoute Kitchen — AI Revenue Recovery System

> **An AI-powered revenue recovery system built on top of a full-stack food delivery platform, designed for the Razorpay AI Buildathon — Track 3: AI Revenue Recovery.**

SpiceRoute Kitchen is a complete food delivery platform enhanced with an **AI Revenue Recovery System** that detects failed payments, analyzes the likelihood of recovery, chooses the most suitable recovery strategy, guides the customer through recovery, verifies the payment securely, and provides administrators with a complete recovery dashboard and audit trail.

The goal is simple:

> **A failed payment should not automatically become lost revenue.**


---

# 1. Project Concept

## 🌶️ What is SpiceRoute Kitchen?

SpiceRoute Kitchen is a **full-stack food delivery platform** where customers can:

- Register and log in
- Browse food categories
- Search food items
- Add items to cart
- Apply coupons
- Place orders
- Make online payments using Razorpay
- Track orders
- View order history
- Recover failed payments

The platform is enhanced with an **AI Revenue Recovery System**.

The AI system focuses on one important business problem:

> **How can a food delivery platform recover revenue that would otherwise be lost because of payment failures?**

Instead of treating a failed payment as the end of an order, SpiceRoute Kitchen creates a recovery case and intelligently determines what should happen next.

### Core Idea

```text
Customer Order
      ↓
Razorpay Payment
      ↓
Payment Success ─────────────→ Order Confirmed
      │
      ↓
Payment Failure
      ↓
Recovery Case Created
      ↓
AI Observes & Analyzes
      ↓
Recovery Probability
      ↓
Strategy Selection
      ↓
Recovery Attempt
      ↓
Payment Verification
      ↓
Recovered Revenue
```

---

# 2. Problem Statement

Payment failures are common in digital commerce.

A customer may genuinely want to purchase food but still experience a failed transaction because of:

- Temporary network problems
- Bank-side issues
- Payment gateway failures
- Incorrect payment details
- UPI/card issues
- Session expiration
- Abandoned checkout
- Temporary technical failures

For a food delivery platform, this creates several problems.

## Customer Problem

A customer:

1. Selects food.
2. Adds it to the cart.
3. Proceeds to checkout.
4. Attempts payment.
5. Payment fails.
6. The customer may leave the application.

The customer may never return to complete the order.

## Business Problem

The restaurant/platform loses a potential order and associated revenue.

The platform also loses:

- Customer conversion
- Customer experience
- Potential repeat business
- Recovery opportunities

## Traditional Approach

Most systems simply display:

```text
Payment Failed
Please try again.
```

This does not answer:

- Is this customer likely to recover?
- Why should the system retry?
- Which recovery strategy should be used?
- How many attempts are appropriate?
- When should recovery stop?
- How much revenue was recovered?

---

# 3. Solution

SpiceRoute Kitchen introduces an **AI Revenue Recovery Layer**.

When a payment fails, the system automatically:

1. Detects the payment failure.
2. Creates a recovery case.
3. Observes the order and customer context.
4. Calculates a recovery probability.
5. Explains the factors influencing the probability.
6. Selects a recovery strategy.
7. Creates a recovery attempt.
8. Notifies/guides the customer.
9. Attempts recovery.
10. Verifies the final payment securely.
11. Updates the recovery status.
12. Records important events.
13. Updates the admin dashboard.

### Instead of

```text
Payment Failed
      ↓
Customer Leaves
      ↓
Lost Revenue
```

### The proposed flow is

```text
Payment Failed
      ↓
Recovery Case
      ↓
AI Analysis
      ↓
Recovery Probability
      ↓
Strategy Decision
      ↓
Recovery Attempt
      ↓
Payment Verification
      ↓
Revenue Recovered
```

---

# 4. Features

## 🤖 AI Revenue Recovery

- Automatic failed-payment detection
- Recovery case creation
- Recovery probability scoring
- Explainable AI decisions
- Intelligent strategy selection
- Controlled retry system
- Recovery escalation
- Recovery attempt tracking
- Graceful stopping
- AI-generated recovery explanation
- Recovery audit trail
- Recovery metrics

## 👤 Customer Features

- User registration
- User login
- Food browsing
- Category-based browsing
- Search
- Cart management
- Quantity management
- Coupon application
- Checkout
- Razorpay payment
- Order confirmation
- Order tracking
- Order history
- Failed payment recovery
- Recovery probability display
- AI recovery explanation
- Retry payment
- Recovery status
- Recovery timeline

## 👨‍💼 Admin Features

- Admin authentication
- Existing admin dashboard
- AI Recovery dashboard
- Recovery metrics
- Recovery case table
- Recovery filters
- Recovery detail page
- Recovery probability
- Recovery strategy
- Failure reason
- Customer information
- Audit timeline
- Flag for review
- Operational resolve
- Demo scenario seeding
- AI explanation

## 🚚 Delivery Partner Features

The existing platform also supports delivery partner functionality such as:

- Delivery partner login
- Assigned orders
- Order status updates
- Delivery tracking
- Delivery workflow

---

# 5. Complete User Flow

## Customer Flow

```text
1. Customer opens SpiceRoute Kitchen
              ↓
2. Customer logs in
              ↓
3. Customer browses food
              ↓
4. Customer selects food
              ↓
5. Food added to cart
              ↓
6. Customer proceeds to checkout
              ↓
7. Order is created
              ↓
8. Razorpay payment starts
              ↓
       ┌──────┴──────┐
       ↓             ↓
   SUCCESS         FAILURE
       ↓             ↓
Order Confirmed   Recovery Case
                     ↓
                 AI Analysis
                     ↓
             Recovery Probability
                     ↓
             Strategy Selection
                     ↓
              Recovery Attempt
                     ↓
              Payment Verification
                     ↓
              ┌──────┴──────┐
              ↓             ↓
          RECOVERED        FAILED
```

## Complete Recovery Flow

```text
Order Created
     ↓
Payment Initiated
     ↓
Payment Failed
     ↓
Failed Order Preserved
     ↓
Recovery Case Created
     ↓
AI Agent Triggered
     ↓
Observe Customer + Order + Payment Context
     ↓
Analyze Signals
     ↓
Calculate Recovery Probability
     ↓
Choose Recovery Strategy
     ↓
Create Recovery Attempt
     ↓
Notify/Guide Customer
     ↓
Customer Retry / Recovery Action
     ↓
Server-Side Payment Verification
     ↓
      ┌───────────────┐
      │               │
   SUCCESS          FAILURE
      │               │
      ↓               ↓
  RECOVERED       Escalate / Stop
      │               │
      └───────┬───────┘
              ↓
        Update Dashboard
              ↓
         Audit Everything
```

---

# 6. AI Revenue Recovery Concept

The AI Revenue Recovery System acts as an intelligent layer between a payment failure and the final outcome.

## Recovery Objective

> **Maximize recoverable revenue while minimizing unnecessary payment attempts and protecting financial integrity.**

The system does not blindly retry every failed payment.

Instead, it evaluates context.

### Context Used

The recovery engine considers signals such as:

- Successful order history
- Previous payment failures
- Order freshness
- Order value
- Previous recovery attempts
- Payment method
- Current recovery state

### Recovery Decision

```text
Recovery Context
      ↓
Recovery Probability
      ↓
Risk / Opportunity Assessment
      ↓
Recovery Strategy
      ↓
Recovery Attempt
      ↓
Outcome
```

This creates a **closed-loop recovery system**.

---

# 7. AI Agent Workflow

The recovery agent follows:

```text
OBSERVE → ANALYZE → DECIDE → ACT → OBSERVE RESULT
```

## Step 1 — Observe

The system collects relevant context:

```text
Customer History
Order Details
Payment Status
Previous Failures
Previous Recovery Attempts
Order Age
Payment Method
```

## Step 2 — Analyze

The Recovery Probability Engine evaluates the signals.

Example:

```text
Successful Orders     +25%
No Payment Failures   +15%
Fresh Order           +15%
Medium Order Value    +15%
First Attempt         +10%
Razorpay Payment      +10%
--------------------------------
Recovery Potential     High
```

## Step 3 — Decide

Example:

```text
Probability = 87%

Decision:
HIGH_RECOVERY_POTENTIAL

Strategy:
PAYMENT_RETRY
```

## Step 4 — Act

Possible actions:

- Show retry option
- Notify customer
- Create recovery attempt
- Offer alternative payment method
- Recover abandoned checkout
- Stop recovery

## Step 5 — Observe Result

```text
Recovery Attempt
       ↓
Payment Result
       ↓
   ┌───┴────┐
   ↓        ↓
Success   Failure
   ↓        ↓
Recovered  Escalate
```

The result becomes part of the recovery history.

---

# 8. Recovery Probability Logic

The system calculates a recovery score between:

```text
0.0 → 1.0
```

and displays it as:

```text
0% → 100%
```

The score is based on multiple contextual signals.

## Recovery Signals

| Signal | Impact |
|---|---:|
| 5+ successful delivered orders | +25% |
| 1–4 successful delivered orders | +10% |
| No previous payment failures | +15% |
| 2+ previous payment failures | -10% |
| Order ≤ 30 minutes old | +15% |
| Order ≤ 2 hours old | +10% |
| Order older than 6 hours | -20% |
| Order ₹500–₹1500 | +15% |
| Order below ₹500 | +10% |
| Order above ₹2000 | -5% |
| First recovery attempt | +10% |
| One previous attempt | -15% |
| 2+ previous attempts | -30% |
| Razorpay payment | +10% |

The implementation normalizes the calculated score into a valid probability range.

## Example

A customer has:

```text
5+ successful orders       +25
No payment failures        +15
Fresh order                +15
₹720 order                 +15
First recovery attempt     +10
Razorpay payment           +10
```

The system identifies this as a strong recovery opportunity.

Example result:

```text
Recovery Probability: 90%

Category:
HIGH_RECOVERY_POTENTIAL

Recommended Strategy:
PAYMENT_RETRY
```

---

# 9. Recovery Strategies

Different probability levels lead to different recovery strategies.

| Probability | Category | Strategy |
|---:|---|---|
| ≥ 70% | HIGH_RECOVERY_POTENTIAL | PAYMENT_RETRY |
| 45% – <70% | MEDIUM_RECOVERY_POTENTIAL | PAYMENT_RETRY |
| 20% – <45% | LOW_RECOVERY_POTENTIAL | ABANDONED_CART_RECOVERY |
| <20% | NO_RECOVERY | GRACEFUL_STOP |


# 10. Architecture

SpiceRoute Kitchen follows a full-stack architecture.

```text
┌─────────────────────────────────────────────┐
│                  CUSTOMER                   │
└──────────────────────┬──────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│                React Frontend               │
│                                             │
│ Home | Menu | Cart | Checkout | Orders      │
│ Recovery UI | Admin UI                      │
└──────────────────────┬──────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│                Backend API                  │
│                                             │
│ Authentication | Orders | Payments          │
│ Recovery | Admin | Notifications            │
└───────────────┬───────────────┬─────────────┘
                │               │
                ▼               ▼
       ┌────────────────┐  ┌────────────────┐
       │ Recovery AI    │  │ Razorpay       │
       │ Agent          │  │ Payment        │
       └───────┬────────┘  └────────────────┘
               │
               ▼
       ┌────────────────┐
       │ Probability    │
       │ Engine         │
       └───────┬────────┘
               │
               ▼
       ┌────────────────┐
       │ Recovery       │
       │ Strategy       │
       └───────┬────────┘
               │
               ▼
       ┌────────────────┐
       │ Recovery       │
       │ Attempt        │
       └───────┬────────┘
               │
               ▼
       ┌────────────────┐
       │ Audit Logs     │
       └────────────────┘
```

---


# 11. Project Structure

A simplified project structure:

```text
SpiceRoute-Kitchen/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── PaymentFailedRecovery.jsx
│   │   │   ├── FailedOrders.jsx
│   │   │   └── ...
│   │   │
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── Orders.jsx
│   │   │   ├── AdminRecoveryDashboard.jsx
│   │   │   └── AdminRecoveryDetail.jsx
│   │   │
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── src/
│   │   └── main/
│   │       └── java/
│   │           └── ...
│   │               ├── controller/
│   │               ├── service/
│   │               ├── repository/
│   │               ├── entity/
│   │               ├── dto/
│   │               ├── security/
│   │               └── config/
│   │
│   ├── src/main/resources/
│   │   └── application.properties
│   │
│   └── pom.xml
│
├── README.md
└── .gitignore
```

---

# 12. Setup Instructions

## Prerequisites

Install:

- Java 17+
- Node.js
- npm
- MySQL
- Git
- Maven
- Razorpay test account



### Final Principle

> **Don't just detect payment failures. Recover the revenue behind them.**

---
