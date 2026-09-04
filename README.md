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

## Strategy 1 — Payment Retry

Used when recovery probability is sufficiently high.

```text
Payment Failed
      ↓
AI recommends retry
      ↓
Customer retries
      ↓
Payment verified
      ↓
Order recovered
```

## Strategy 2 — Alternative Payment Method

If the first retry fails:

```text
PAYMENT_RETRY
      ↓
Failure
      ↓
ALTERNATIVE_PAYMENT_METHOD
      ↓
Customer chooses another method
```

## Strategy 3 — Abandoned Cart Recovery

For lower-probability situations, the system can focus on bringing the customer back to the failed/abandoned order instead of repeatedly attempting payment.

## Strategy 4 — Graceful Stop

If the probability is extremely low or the maximum recovery attempts are reached:

```text
Stop Recovery
      ↓
Preserve Order Data
      ↓
Mark Recovery Failed/Cancelled
      ↓
No More Automatic Attempts
```

---

# 10. Examples and Scenarios

The project includes eight predefined demo scenarios.

## Scenario 1 — High Recovery Potential

```text
Customer: Priya
Order Value: ₹485
Probability: 87%
Category: HIGH_RECOVERY_POTENTIAL
Strategy: PAYMENT_RETRY
Result: RECOVERED
```

## Scenario 2 — Medium Recovery

```text
Customer: Arjun
Order Value: ₹720
Probability: 62%
Category: MEDIUM
Strategy: PAYMENT_RETRY

First Retry: FAILED
Next Strategy: ALTERNATIVE_PAYMENT_METHOD
Result: RECOVERED
```

Flow:

```text
AI Analysis
     ↓
Retry Payment
     ↓
Failed
     ↓
Alternative Payment
     ↓
Success
     ↓
Recovered
```

## Scenario 3 — Low Recovery Potential

```text
Customer: Priya
Order Value: ₹340
Probability: 38%
Category: LOW
Strategy: ABANDONED_CART_RECOVERY
Status: IN_PROGRESS
```

## Scenario 4 — Controlled Failure

```text
Customer: Arjun
Order Value: ₹1250
Probability: 71%
Strategy: PAYMENT_RETRY
```

Recovery:

```text
Attempt #1 → Failed
Attempt #2 → Failed
Attempt #3 → Failed
        ↓
GRACEFUL_STOP
        ↓
FAILED
```

## Scenario 5 — Very Low Probability

```text
Customer: Priya
Order Value: ₹195
Probability: 12%
Strategy: GRACEFUL_STOP
Status: CANCELLED
```

The order record remains preserved.

## Scenario 6 — Instant Recovery

```text
Customer: Arjun
Order Value: ₹568
Probability: 91%
Strategy: PAYMENT_RETRY
Result: SUCCESS
```

## Scenario 7 — Customer Retry Pending

```text
Customer: Priya
Order Value: ₹899
Probability: 55%
Status: IN_PROGRESS
```

The system waits for the customer to complete the retry.

## Scenario 8 — Network Failure Then Success

```text
Customer: Arjun
Order Value: ₹312
Probability: 78%
```

Flow:

```text
Attempt #1
Network Failure
      ↓
Recovery Continues
      ↓
Attempt #2
Payment Success
      ↓
RECOVERED
```

---

# 11. Razorpay Payment Flow

SpiceRoute Kitchen integrates Razorpay for online payments.

## Normal Payment

```text
Customer
   ↓
Checkout
   ↓
Create Order
   ↓
Razorpay Checkout
   ↓
Payment
   ↓
Success
   ↓
Server-side Verification
   ↓
Order Confirmed
```

## Important Principle

The frontend does not decide whether a payment is successful.

The backend verifies the payment.

```text
Frontend
   ↓
Payment Response
   ↓
Backend
   ↓
Signature Verification
   ↓
Payment Confirmed
```

---

# 12. Failed Payment Flow

When Razorpay payment fails:

```text
Customer
   ↓
Checkout
   ↓
Razorpay
   ↓
Payment Failed
   ↓
Failed Order Preserved
   ↓
Recovery Case Created
   ↓
AI Recovery Agent
   ↓
Probability Calculation
   ↓
Strategy Selection
   ↓
Recovery Attempt
```

## Failed Payment UX

The customer immediately sees a recovery panel:

```text
Payment Failed

AI Recovery Probability: 87%

Recovery Potential:
HIGH

Recommended Strategy:
PAYMENT_RETRY

Why?
• Strong order history
• Fresh order
• First recovery attempt
• Suitable order value
• Payment context

[ Retry Payment ]
```

---

# 13. Architecture

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

# 14. System Architecture

## High-Level Flow

```text
                    ┌───────────────┐
                    │    Customer   │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │ React App     │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │ Spring Boot   │
                    │ Backend       │
                    └───────┬───────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
              ▼             ▼             ▼
        ┌──────────┐  ┌──────────┐  ┌──────────┐
        │ Orders   │  │ Payment  │  │ Recovery │
        │ Service  │  │ Service  │  │ Service  │
        └──────────┘  └────┬─────┘  └────┬─────┘
                           │             │
                           ▼             ▼
                     ┌──────────┐  ┌──────────┐
                     │ Razorpay │  │ AI Agent │
                     └──────────┘  └────┬─────┘
                                         │
                                         ▼
                                  ┌──────────────┐
                                  │ Probability  │
                                  │ Engine       │
                                  └──────┬───────┘
                                         │
                                         ▼
                                  ┌──────────────┐
                                  │ Recovery     │
                                  │ Strategy     │
                                  └──────┬───────┘
                                         │
                                         ▼
                                  ┌──────────────┐
                                  │ Recovery     │
                                  │ Attempt      │
                                  └──────┬───────┘
                                         │
                                         ▼
                                  ┌──────────────┐
                                  │ Audit Logs   │
                                  └──────────────┘
```

---

# 15. Backend Architecture

The backend is responsible for:

- Business logic
- Authentication
- Orders
- Payments
- Recovery
- AI decisions
- Database operations
- Payment verification
- Admin APIs

## Main Components

### `RecoveryAttempt`

Stores individual recovery attempts.

Typical information:

```text
RecoveryAttempt
-------------------------
id
recoveryCase
attemptNumber
strategy
status
createdAt
updatedAt
```

### `RecoveryAuditLog`

Stores the recovery timeline.

Examples:

```text
PAYMENT_FAILED
RECOVERY_CASE_CREATED
AI_ANALYSIS_STARTED
RECOVERY_PROBABILITY_CALCULATED
STRATEGY_SELECTED
CUSTOMER_NOTIFIED
RECOVERY_ATTEMPT_CREATED
PAYMENT_VERIFIED
RECOVERY_COMPLETED
```

### `RecoveryProbabilityEngine`

Responsible for:

- Collecting signals
- Calculating probability
- Categorizing recovery potential
- Generating reasons

### `AiRecoveryAgentService`

Responsible for:

```text
Observe
Analyze
Decide
Act
Observe Result
```

### `RecoveryPaymentService`

Responsible for:

- Payment retry workflow
- Razorpay interaction
- Server-side verification
- Duplicate protection
- Payment state validation

### `RecoveryDemoSeederService`

Creates predefined demo recovery scenarios.

### `RecoveryController`

Provides recovery-related REST endpoints.

---

# 16. Frontend Architecture

The frontend is built using React.

## Existing Customer Interface

```text
Home
 ├── Categories
 ├── Food Items
 ├── Search
 └── Recovery Banner

Menu
 └── Food Details

Cart
 ├── Items
 ├── Quantity
 ├── Coupon
 └── Total

Checkout
 └── Razorpay Payment

Orders
 ├── Active Orders
 ├── Completed Orders
 └── Failed Orders
```

## Recovery Components

### `PaymentFailedRecovery.jsx`

Displays:

- Probability
- Recovery category
- Strategy
- Reasons
- AI explanation
- Retry button
- Recovery timeline

### `FailedOrders.jsx`

Displays:

- Failed orders
- Recovery status
- Probability
- Strategy
- Recovery action
- Updated recovery state

### `AdminRecoveryDashboard.jsx`

Displays:

- Recovery metrics
- Recovery cases
- Filters
- Probability
- Strategy
- Status

### `AdminRecoveryDetail.jsx`

Displays:

- Recovery probability
- Strategy
- Reasons
- AI explanation
- Complete audit timeline
- Recovery attempts

---

# 17. Database and Entities

The recovery system extends the existing food delivery database.

## Existing Core Entities

```text
User
FoodItem
Category
Cart
Order
OrderItem
Coupon
Payment
Review
DeliveryPartner
```

## Recovery Entities

### RecoveryAttempt

Represents an individual recovery attempt.

```text
RecoveryAttempt
-------------------------
id
recoveryCase
attemptNumber
strategy
status
createdAt
updatedAt
```

### RecoveryAuditLog

Represents an event in the recovery lifecycle.

```text
RecoveryAuditLog
-------------------------
id
recoveryCase
event
description
timestamp
```

### Recovery Case

The recovery case is associated with the failed order and contains recovery information such as:

```text
order
customer
probability
category
strategy
status
failureReason
attemptCount
createdAt
updatedAt
```

---

# 18. API Endpoints

## Customer Recovery APIs

```http
GET /api/recovery/my
```

Returns the current customer's recovery cases.

```http
GET /api/recovery/status/{orderId}
```

Returns recovery status for an order.

```http
POST /api/recovery/trigger/{orderId}
```

Triggers recovery processing.

```http
POST /api/recovery/retry-payment/{orderId}
```

Starts payment recovery.

```http
POST /api/recovery/verify-payment
```

Verifies a payment.

```http
GET /api/recovery/explain/{orderId}
```

Returns AI recovery explanation.

## Payment API

```http
POST /api/payments/failed
```

Handles failed payment processing and starts the recovery flow.

## Admin Recovery APIs

```http
GET /api/recovery/dashboard
```

Returns recovery metrics.

```http
GET /api/recovery/detail/{orderId}
```

Returns detailed recovery information.

```http
GET /api/recovery/admin/explain/{orderId}
```

Returns admin-facing AI explanation.

```http
PATCH /api/recovery/{id}/mark-review
```

Flags a recovery case for manual review.

```http
PATCH /api/recovery/{id}/resolve
```

Marks the recovery case as operationally resolved.

> Admin resolution does **not** falsely mark a payment as successful.

## Demo API

```http
POST /api/recovery/seed-demo
```

Creates predefined recovery scenarios.

---

# 19. Customer Side

The customer experience is designed to make recovery simple and transparent.

## Home Page

If the customer has failed payments:

```text
⚠️ You have payments that need recovery.

[ Recover Payments ]
```

## Orders Page

Failed Razorpay orders are clearly identified.

Example:

```text
Order #SR1024

Payment:
FAILED

Recovery:
IN PROGRESS

AI Probability:
87%

[ View Recovery ]
```

## Failed Orders Page

Route:

```text
/orders/failed
```

Customers can see:

- Failed order
- Amount
- Failure reason
- Recovery status
- Probability
- Strategy
- Recovery actions

---

# 20. Admin Side

The admin receives a dedicated AI Recovery interface.

## Navigation

The existing navbar contains:

```text
🤖 AI Recovery
```

Route:

```text
/admin/recovery
```

## Admin Recovery Detail

Route:

```text
/admin/recovery/:id
```

The admin can view:

- Order
- Customer
- Amount
- Failure reason
- Probability
- Recovery category
- Selected strategy
- Attempts
- Status
- AI explanation
- Audit timeline

---

# 21. Dashboard

The AI Recovery dashboard provides a business-level overview.

## Key Metrics

### Potential Lost Revenue

The amount associated with unresolved failed payments.

### Recovered Revenue

Revenue successfully recovered through the recovery system.

### Recovery Rate

Percentage of eligible recovery cases successfully recovered.

### Recovery Status

```text
PENDING
IN_PROGRESS
RECOVERED
FAILED
CANCELLED
EXPIRED
```

## Recovery Table

| Order | Customer | Amount | Failure Reason | Strategy | Probability | Status |
|---|---|---:|---|---|---:|---|
| SR1024 | Priya | ₹485 | Network | Retry | 87% | Recovered |
| SR1025 | Arjun | ₹720 | Payment Failure | Alternative | 62% | Recovered |
| SR1026 | Priya | ₹340 | Timeout | Abandoned Cart | 38% | In Progress |

## Filters

```text
All
In Progress
Pending
Recovered
Failed
Cancelled
```

---

# 22. Audit Trail

Every important recovery event is recorded.

Example:

```text
10:21:01
Order Created

10:21:08
Payment Initiated

10:21:15
Payment Failed

10:21:16
Recovery Case Created

10:21:17
AI Analysis Started

10:21:18
Recovery Probability Calculated: 87%

10:21:18
Strategy Selected: PAYMENT_RETRY

10:21:19
Customer Notified

10:21:45
Recovery Attempt #1

10:22:03
Payment Verified

10:22:03
Recovery Completed
```

The audit trail improves:

- Trust
- Debugging
- Traceability
- Explainability
- Accountability

---

# 23. State Machine

Recovery cases follow a controlled state machine.

```text
             ┌───────────┐
             │  PENDING  │
             └─────┬─────┘
                   │
                   ▼
          ┌────────────────┐
          │  IN_PROGRESS   │
          └───────┬────────┘
                  │
          ┌───────┼────────┐
          │       │        │
          ▼       ▼        ▼
     RECOVERED  FAILED  CANCELLED

No action for 24 hours
          │
          ▼
       EXPIRED
```

## Recovery Escalation

```text
PAYMENT_RETRY
      │
      │ Failure
      ▼
ALTERNATIVE_PAYMENT_METHOD
      │
      │ Failure
      ▼
GRACEFUL_STOP
```

Maximum:

```text
3 recovery attempts
```

This prevents infinite retries.

---

# 24. Security and Financial Safety

Financial systems require strict boundaries.

The AI system is designed so that **AI does not directly control money**.

## Trusted Backend Boundary

The payment amount comes from the trusted backend/database.

```text
Database Order Amount
        ↓
Trusted Backend
        ↓
Razorpay Payment
```

The frontend cannot decide the payment amount.

## AI Boundary

The AI can:

```text
Analyze
Explain
Score
Recommend
Choose Strategy
```

The AI cannot:

```text
Change payment amount
Directly move money
Mark payment as successful
Bypass verification
```

## Server-Side Verification

Razorpay payment signatures are verified server-side using secure cryptographic verification.

## Duplicate Payment Protection

Before processing recovery:

```text
Is order already paid?
        │
       YES
        ↓
Do not charge again
```

## Idempotency

Duplicate recovery operations are prevented.

## Maximum Attempts

```text
Maximum = 3
```

## Admin Resolve Safety

Admin resolve means:

```text
Operationally resolved
```

It does not mean:

```text
Payment successful
```

Payment success must come from verified payment data.

---

# 25. Tech Stack

## Frontend

- React.js
- JavaScript
- HTML5
- CSS3
- Axios
- React Router

## Backend

- Java
- Spring Boot
- Spring Data JPA
- REST APIs
- Hibernate

## Database

- MySQL

## Payment

- Razorpay

## AI Layer

- Recovery Probability Engine
- AI Recovery Agent
- Explainable recovery decisions
- Optional LLM-powered explanations

## Development Tools

- VS Code
- Git
- GitHub
- MySQL Workbench
- Postman
- Browser Developer Tools

---

# 26. Project Structure

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

# 27. Setup Instructions

## Prerequisites

Install:

- Java 17+
- Node.js
- npm
- MySQL
- Git
- Maven
- Razorpay test account

## Step 1 — Clone Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd SpiceRoute-Kitchen
```

## Step 2 — Configure Database

Create a MySQL database:

```sql
CREATE DATABASE spiceroute;
```

Update the backend database configuration.

## Step 3 — Configure Backend

Navigate to backend:

```bash
cd backend
```

Build:

```bash
mvn clean install
```

Run:

```bash
mvn spring-boot:run
```

## Step 4 — Configure Frontend

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start:

```bash
npm run dev
```

## Step 5 — Open Application

Open the frontend URL displayed by the development server.

Make sure the Spring Boot backend is also running.

---

# 28. Environment Variables

Never commit real secrets to GitHub.

## Backend Example

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/spiceroute
spring.datasource.username=YOUR_DB_USERNAME
spring.datasource.password=YOUR_DB_PASSWORD

razorpay.key.id=YOUR_RAZORPAY_KEY_ID
razorpay.key.secret=YOUR_RAZORPAY_KEY_SECRET
```

If an AI provider is configured:

```properties
ai.api.key=YOUR_AI_API_KEY
```

## Frontend Example

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_RAZORPAY_KEY_ID=YOUR_RAZORPAY_KEY_ID
```

Use environment variables or secure secret management in production.

---

# 29. Demo Accounts

## Customer

```text
Email:
priya@example.com

Password:
Test@123
```

## Admin

```text
Email:
admin@spiceroute.com

Password:
Admin@123
```

> These credentials are intended for the project/demo environment. Do not use demo credentials in a production deployment.

---

# 30. Demo Scenarios

The project includes predefined scenarios for demonstrating AI Revenue Recovery.

## Seed Demo Data

From the admin dashboard:

```text
Admin Login
    ↓
AI Recovery
    ↓
Seed Demo
    ↓
8 Recovery Scenarios
```

## Demo Data

```text
Scenario 1
Priya
₹485
87%
Payment Retry
Recovered

Scenario 2
Arjun
₹720
62%
Retry → Alternative Payment
Recovered

Scenario 3
Priya
₹340
38%
Abandoned Cart Recovery
In Progress

Scenario 4
Arjun
₹1250
71%
Retry → Alternative → Stop
Failed

Scenario 5
Priya
₹195
12%
Graceful Stop
Cancelled

Scenario 6
Arjun
₹568
91%
Payment Retry
Recovered

Scenario 7
Priya
₹899
55%
Payment Retry
In Progress

Scenario 8
Arjun
₹312
78%
Retry
Recovered
```

---

# 31. Testing

Testing should cover both the existing food delivery functionality and the AI recovery layer.

## Customer Testing

Test:

- Registration
- Login
- Food browsing
- Search
- Cart
- Quantity updates
- Coupons
- Checkout
- Successful payment
- Failed payment
- Recovery page
- Retry payment
- Order history
- Failed orders

## Recovery Testing

```text
Payment Failure
      ↓
Recovery Case Creation
      ↓
Probability Calculation
      ↓
Strategy Selection
      ↓
Recovery Attempt
      ↓
Payment Verification
      ↓
Recovery Status
```

## Edge Cases

Test:

- Already paid order
- Duplicate recovery request
- Multiple retry attempts
- Expired recovery
- Missing payment response
- Invalid Razorpay signature
- Backend failure
- AI service failure
- Network failure
- Customer abandoning recovery

---

# 32. Buildathon Demo Flow

The project is designed for a concise demonstration.

## 🎬 Part 1 — Introduction

Display:

```text
AI REVENUE RECOVERY SYSTEM

Razorpay AI Buildathon
Track 3 — AI Revenue Recovery

Turning Failed Payments
into Recovered Revenue
```

Problem:

```text
Payment Failure
      ↓
Lost Order
      ↓
Lost Revenue
```

## 🎬 Part 2 — Show Solution

```text
Payment Failure
      ↓
Recovery Case
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
Recovered Revenue
```

## 🎬 Part 3 — Live Customer Demo

```text
Login
 ↓
Select Food
 ↓
Add to Cart
 ↓
Checkout
 ↓
Razorpay
 ↓
Trigger Payment Failure
```

Show:

```text
Payment Failed

Recovery Case Automatically Created

Recovery Probability: 87%

Category:
HIGH_RECOVERY_POTENTIAL

Strategy:
PAYMENT_RETRY
```

## 🎬 Part 4 — Recovery

Click:

```text
Retry Payment
```

Complete a successful test payment.

Display:

```text
Recovery Strategy: PAYMENT_RETRY

Recovery Attempt #1

Payment Verified

Recovery Successful
```

## 🎬 Part 5 — Audit Trail

Show:

```text
Order Created
      ↓
Payment Initiated
      ↓
Payment Failed
      ↓
Recovery Case Created
      ↓
AI Analysis
      ↓
Probability Calculated
      ↓
Strategy Selected
      ↓
Customer Notified
      ↓
Recovery Attempt
      ↓
Payment Verified
      ↓
Recovery Completed
```

## 🎬 Part 6 — Admin Dashboard

Navigate to:

```text
AI Recovery
```

Show:

- Potential Lost Revenue
- Recovered Revenue
- Recovery Rate
- Recovery cases
- Filters
- Probability
- Strategy
- Status

Open one recovery case and show the complete audit trail.

## 🎬 Part 7 — Multiple Scenarios

```text
High Probability
→ Payment Retry

Medium Probability
→ Retry → Alternative Payment

Low Probability
→ Abandoned Cart Recovery

Very Low Probability
→ Graceful Stop

Repeated Failure
→ Controlled Escalation
```

## 🎬 Part 8 — Safety

Display:

```text
AI does NOT control money.

Trusted backend controls amount.

Server verifies payment.

Duplicate charges are prevented.

Maximum recovery attempts are limited.

AI failures do not break the application.
```

## 🎬 Final Screen

```text
DON'T LET FAILED PAYMENTS
BECOME LOST REVENUE

DETECT
   ↓
ANALYZE
   ↓
DECIDE
   ↓
RECOVER
   ↓
VERIFY
   ↓
MEASURE
```

---

# 33. Business Impact

The system directly targets revenue leakage caused by failed payments.

## Traditional System

```text
Payment Failed
      ↓
Customer Leaves
      ↓
Potential Revenue Lost
```

## SpiceRoute Recovery System

```text
Payment Failed
      ↓
AI Identifies Recovery Opportunity
      ↓
Recovery Strategy
      ↓
Customer Recovery
      ↓
Verified Payment
      ↓
Revenue Recovered
```

## Key Business Benefits

### 💰 Revenue Recovery

Converts eligible failed transactions into recovery opportunities.

### 📈 Higher Conversion

Customers receive a guided recovery experience instead of a generic failure message.

### 🤖 Intelligent Automation

Recovery decisions are automated using contextual signals.

### 🧠 Explainability

The system shows why a recovery strategy was selected.

### 🛡️ Financial Safety

AI recommendations remain separated from direct money movement.

### 📊 Business Visibility

Administrators can monitor:

- Lost revenue
- Recovered revenue
- Recovery rate
- Recovery cases
- Recovery strategies
- Recovery outcomes

---

# 34. Innovation

## 1. Recovery Probability Before Action

The system does not blindly retry payments.

It first evaluates:

```text
How likely is this payment to be recovered?
```

## 2. Context-Aware Strategy

Different customers receive different recovery strategies based on their recovery context.

## 3. Closed-Loop AI Agent

The system does not stop after making a prediction.

```text
Observe
 ↓
Analyze
 ↓
Decide
 ↓
Act
 ↓
Observe Result
 ↓
Next Decision
```

## 4. Controlled Escalation

```text
Retry
 ↓
Alternative
 ↓
Stop
```

## 5. Explainable Recovery

The system shows the signals contributing to the decision.

## 6. Human-in-the-Loop

Administrators can flag cases for review.

## 7. Financial Trust Boundary

The AI system is deliberately separated from direct financial authority.

---

# 35. Future Enhancements

## Advanced ML Prediction

Train a machine learning model using historical payment and recovery data.

## Personalized Recovery

Learn customer-specific recovery patterns.

Example:

```text
Customer A → UPI recovery works best
Customer B → Card retry works best
Customer C → Reminder works best
```

## Smart Payment Method Recommendation

Predict the most likely successful payment method.

## Intelligent Timing

Predict the best time to send recovery reminders.

## Multi-Channel Recovery

Support:

- Email
- SMS
- Push notifications
- WhatsApp

## Adaptive Strategy Learning

```text
Strategy
 ↓
Attempt
 ↓
Outcome
 ↓
Success/Failure
 ↓
Future Decision
```

## Advanced Revenue Forecasting

Predict:

```text
Potential Lost Revenue
Expected Recovery Revenue
Expected Recovery Rate
```

## Real-Time Analytics

Provide live recovery analytics to administrators.

---

# 36. Reliability and Failure Handling

AI systems should never become a single point of failure for the food delivery application.

The recovery layer is designed so that:

```text
AI Failure
    ↓
Recovery Gracefully Continues
    ↓
Existing Food Delivery System Remains Available
```

## AI Failure Isolation

If the AI service is unavailable:

```text
AI unavailable
      ↓
Log failure
      ↓
Preserve failed order
      ↓
Do not crash application
```

## Existing Features Remain Independent

The following should continue working even if AI recovery fails:

- Login
- Food browsing
- Cart
- Checkout
- Order history
- Normal payments
- Order tracking
- Admin functions

---

# 37. Explainable AI

AI decisions should not simply display:

```text
Probability = 87%
```

The system also provides reasons.

Example:

```text
Recovery Probability: 87%

Reasons:

✓ Strong successful order history
✓ Fresh order
✓ First recovery attempt
✓ Suitable order value
✓ Razorpay payment context
```

This improves:

- Trust
- Debugging
- Admin understanding
- Customer transparency
- Demonstrability

---

# 38. Role-Based Access

The system separates user responsibilities.

## Customer

Can:

- View own orders
- View own failed payments
- Recover own payments
- View own recovery status

## Admin

Can:

- View recovery dashboard
- View recovery cases
- View customer/order context
- Flag cases
- Resolve cases operationally
- View recovery metrics
- View audit trails
- Seed demo data

## Delivery Partner

Can:

- View assigned orders
- Update delivery status
- Complete delivery workflow

---

# 39. Mobile Application

The existing food delivery platform can support mobile functionality.

```text
Mobile Customer
      ↓
Browse Food
      ↓
Cart
      ↓
Checkout
      ↓
Razorpay
      ↓
Payment Failure
      ↓
Mobile Recovery Experience
```

Future recovery notifications can be delivered through push notifications.

---

# 40. Coupons and Promotions

The existing food delivery platform supports coupon-based ordering.

```text
Food Total
   ↓
Coupon
   ↓
Discount
   ↓
Final Order Amount
   ↓
Razorpay Payment
```

The recovery system continues to use the trusted backend order amount rather than trusting an amount supplied by the frontend or AI.

---

# 41. API and Integration Design

The system uses REST APIs to connect:

```text
React
  ↕
Spring Boot
  ↕
Database
  ↕
Razorpay
```

Recovery APIs are isolated under:

```text
/api/recovery
```

This keeps recovery functionality modular and easier to maintain.

## Integration Principle

The recovery system is implemented as a layer on top of the existing food delivery platform rather than replacing the existing ordering system.

```text
Existing Food Delivery Platform
              +
      AI Recovery Layer
              =
SpiceRoute Kitchen
```

---

# 42. Security

Security considerations include:

- Authentication
- Role-based authorization
- Password protection
- Backend validation
- Input validation
- Secure environment variables
- Razorpay signature verification
- Duplicate payment protection
- Trusted server-side order amount
- AI financial boundary
- Audit logging
- No secret keys committed to GitHub

## Never Commit Secrets

Never commit:

```text
RAZORPAY_KEY_SECRET
DATABASE_PASSWORD
AI_API_KEY
JWT_SECRET
```

Use:

```text
.env
```

or secure server-side configuration.

---

# 43. Business Metrics

The recovery dashboard can measure:

## Potential Lost Revenue

```text
Total unresolved failed payment value
```

## Recovered Revenue

```text
Total successfully recovered payment value
```

## Recovery Rate

```text
Recovered Cases
-------------------------- × 100
Eligible Recovery Cases
```

## Recovery Attempts

Track:

```text
Attempt #1
Attempt #2
Attempt #3
```

## Strategy Performance

Compare:

```text
Payment Retry
Alternative Payment
Abandoned Cart Recovery
Graceful Stop
```

to understand which strategies perform best.

---

# 44. Why This Fits AI Revenue Recovery

The project directly addresses the AI Revenue Recovery problem.

### Problem

Failed payments create revenue leakage.

### AI

The system uses contextual signals to estimate recovery probability.

### Decision

The system chooses a recovery strategy.

### Action

The system guides/initiates recovery.

### Verification

The backend verifies the final payment.

### Measurement

The admin dashboard measures recovered revenue.

Therefore:

```text
FAILURE
   ↓
DETECTION
   ↓
AI ANALYSIS
   ↓
RECOVERY DECISION
   ↓
RECOVERY ACTION
   ↓
PAYMENT VERIFICATION
   ↓
REVENUE RECOVERY
   ↓
BUSINESS MEASUREMENT
```

This creates a complete **closed-loop AI revenue recovery system**.

---

# 45. Portfolio Highlights

This project demonstrates practical experience with:

- Full-stack development
- React
- Spring Boot
- REST APIs
- MySQL
- JPA/Hibernate
- Payment gateway integration
- Razorpay
- AI-assisted decision systems
- Explainable AI
- State machines
- Event/audit logging
- Role-based access
- Financial safety
- Admin dashboards
- Failure handling
- Git/GitHub
- Production-oriented architecture

---

# 46. Buildathon Submission

## Razorpay AI Buildathon

### Track

```text
Track 3 — AI Revenue Recovery
```

### Project

```text
SpiceRoute Kitchen
AI Revenue Recovery System
```

## Submission Components

```text
✓ Public GitHub Repository
✓ Working Project
✓ AI Revenue Recovery Feature
✓ System Architecture
✓ Recovery Flow
✓ Demo Scenarios
✓ Pitch/Demo Video
```

---

# 47. Final Vision

SpiceRoute Kitchen is more than a food delivery application.

It demonstrates how AI can be applied to a real business problem:

> **Recovering revenue that would otherwise be lost because of failed payments.**

The system connects:

```text
Customer Experience
        +
Payment Infrastructure
        +
AI Decision Making
        +
Financial Safety
        +
Business Analytics
```

The ultimate vision is:

```text
Every Failed Payment
        ↓
Becomes an Opportunity
        ↓
To Understand
        ↓
To Recover
        ↓
To Verify
        ↓
To Measure
```

### Final Principle

> **Don't just detect payment failures. Recover the revenue behind them.**

---

# 48. Author

## 🌶️ SpiceRoute Kitchen

**AI Revenue Recovery System**

Built for the **Razorpay AI Buildathon — Track 3: AI Revenue Recovery**.

---

## ⭐ Project Summary

```text
SpiceRoute Kitchen
        ↓
Full-Stack Food Delivery Platform
        +
AI Revenue Recovery System
        ↓
Detect Failed Payments
        ↓
Analyze Customer Context
        ↓
Calculate Recovery Probability
        ↓
Select Recovery Strategy
        ↓
Attempt Recovery
        ↓
Verify Payment
        ↓
Recover Revenue
        ↓
Measure Business Impact
```

---

## 🌶️ SpiceRoute Kitchen

**Turning failed payments into recovered revenue through AI-powered, explainable, and financially safe recovery.**
