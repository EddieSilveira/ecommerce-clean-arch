# Ecommerce Clean Arch

A full-stack e-commerce monorepo built with **Clean Architecture** on the backend and **Next.js 15** on the frontend.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [API](#api)
  - [Running the API](#running-the-api)
  - [Endpoints](#endpoints)
  - [Swagger Docs](#swagger-docs)
- [Web](#web)
  - [Running the Web](#running-the-web)
  - [Pages](#pages)
- [Testing](#testing)
  - [Unit Tests](#unit-tests)
  - [Integration Tests](#integration-tests)
- [Database](#database)
- [Architecture](#architecture)

---

## Overview

A complete e-commerce application covering user authentication, cursor-paginated product catalog, shopping cart, order checkout, order tracking, and an admin panel.

The backend follows Clean Architecture (Ports & Adapters), keeping domain logic entirely decoupled from frameworks and infrastructure. The frontend uses Next.js 15 App Router with selective SSR for public pages and client-side rendering for authenticated flows.

---

## Tech Stack

### API (`apps/api`)

| Layer | Technology |
|---|---|
| Runtime | Node.js 22 |
| HTTP Framework | Fastify 5 |
| ORM | Prisma 7 |
| Database | PostgreSQL |
| Authentication | JWT (`@fastify/jwt`) |
| Password Hashing | bcryptjs |
| Validation | Zod |
| Email | Nodemailer |
| API Docs | Swagger / OpenAPI |
| Language | TypeScript 5 |

### Web (`apps/web`)

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui + Base UI |
| Global State | Zustand 5 |
| Data Fetching | TanStack Query v5 |
| Forms | React Hook Form + Zod |
| Icons | Lucide React |
| Language | TypeScript 5 |

### Testing

| Type | Technology |
|---|---|
| Unit | Jest 29 + in-memory fakes |
| Integration | Jest 29 + real PostgreSQL |

---

## Project Structure

```
ecommerce-clean-arch/
├── apps/
│   ├── api/                        # Fastify backend
│   │   └── src/
│   │       ├── domain/             # Entities, value objects, domain events
│   │       ├── application/        # Use cases and port interfaces
│   │       ├── infrastructure/     # Prisma repositories, external services
│   │       └── http/               # Fastify routes and middleware
│   └── web/                        # Next.js 15 frontend
│       └── src/
│           ├── app/                # App Router (pages and layouts)
│           ├── components/         # Reusable React components
│           ├── hooks/              # React Query hooks
│           ├── store/              # Zustand (cart)
│           ├── lib/                # API client, auth helpers, shared types
│           └── middleware.ts       # Route protection
├── tests/
│   ├── unit/                       # Unit tests (use cases, entities)
│   ├── integration/                # Repository tests against a real database
│   └── helpers/                    # Shared fakes and factories
└── prisma/
    ├── schema.prisma
    └── migrations/
```

---

## Prerequisites

- **Node.js 22** (recommended via [nvm](https://github.com/nvm-sh/nvm))
- **PostgreSQL** (local or via Docker)
- **npm**

```bash
# Install Node 22 via nvm
nvm install 22
nvm use 22
```

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Create a `.env` file at the project root:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/ecommerce
DATABASE_URL_TEST=postgresql://user:password@localhost:5432/ecommerce_test

# Server
PORT=3333
NODE_ENV=development

# JWT
JWT_SECRET=a_secret_key_with_at_least_32_characters
JWT_EXPIRES_IN=7d

# CORS
ALLOWED_ORIGINS=http://localhost:3000

# Bootstrap admin (optional — creates an admin user on startup)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=StrongPassword123

# Email (for password reset)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
SMTP_FROM=noreply@ecommerce.com
```

Create `apps/web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3333
```

### 3. Apply database migrations

```bash
npx prisma migrate dev
```

---

## API

### Running the API

```bash
# Development (with hot reload)
npm run dev

# Production build
npm run build
node dist/main.js
```

The API runs at `http://localhost:3333` (or the port set in `PORT`).

---

### Endpoints

#### Authentication

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/auth/sign-in` | — | Sign in and receive a JWT |
| `POST` | `/auth/forgot-password` | — | Request a password reset email |
| `POST` | `/auth/reset-password` | — | Reset password using the emailed token |

**POST /auth/sign-in**
```json
// Request
{ "email": "user@example.com", "password": "password123" }

// Response 200
{ "token": "eyJ..." }
```

**POST /auth/forgot-password**
```json
// Request
{ "email": "user@example.com" }

// Response 204 No Content
```

**POST /auth/reset-password**
```json
// Request
{ "token": "token_from_email", "newPassword": "newPassword123" }

// Response 204 No Content
```

---

#### Users

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/users` | — | Create a new account |
| `GET` | `/users/:id` | ✓ | Get user by ID |
| `PUT` | `/users/:id` | ✓ | Update name, email, or password |
| `DELETE` | `/users/:id` | ✓ | Delete account |

**POST /users**
```json
// Request
{ "name": "John Doe", "email": "john@example.com", "password": "minimum8chars" }

// Response 201
{ "id": "uuid", "name": "John Doe", "email": "john@example.com" }
```

**GET /users/:id** — `Authorization: Bearer <token>`
```json
// Response 200
{ "id": "uuid", "name": "John Doe", "email": "john@example.com" }
```

---

#### Products

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/products` | — | List products (cursor pagination) |
| `GET` | `/products/:id` | — | Get a single product |
| `POST` | `/products` | ✓ ADMIN | Create a product |
| `PUT` | `/products/:id` | ✓ ADMIN | Update a product |
| `DELETE` | `/products/:id` | ✓ ADMIN | Delete a product |

**GET /products**
```
Query params:
  cursor  string   — ID of the last item from the previous page
  limit   integer  — Items per page (default: 20, max: 100)
```
```json
// Response 200
{
  "products": [
    { "id": "uuid", "name": "T-Shirt", "price": 4990, "stock": 100 }
  ],
  "nextCursor": "uuid-of-last-item"
}
```

> **Prices** are stored and returned in cents (e.g. `4990` = $49.90).

**POST /products** — `Authorization: Bearer <admin_token>`
```json
// Request
{ "name": "T-Shirt", "price": 4990, "stock": 100 }

// Response 201
{ "id": "uuid", "name": "T-Shirt", "price": 4990, "stock": 100 }
```

---

#### Orders

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/orders` | ✓ | Place a new order |
| `GET` | `/orders` | ✓ | List orders for the authenticated user |
| `GET` | `/orders/:id` | ✓ | Get order details |
| `DELETE` | `/orders/:id` | ✓ | Cancel an order (only if `PENDING`) |

**POST /orders** — `Authorization: Bearer <token>`
```json
// Request
{
  "items": [
    { "productId": "uuid", "quantity": 2 }
  ]
}

// Response 201
{
  "id": "uuid",
  "userId": "uuid",
  "status": "PENDING",
  "total": 9980,
  "items": [
    {
      "id": "uuid",
      "productId": "uuid",
      "productName": "T-Shirt",
      "unitPrice": 4990,
      "quantity": 2,
      "subtotal": 9980
    }
  ]
}
```

**Order statuses:**

| Status | Description |
|--------|-------------|
| `PENDING` | Waiting for payment |
| `CONFIRMED` | Payment approved |
| `CANCELLED` | Order cancelled |

---

#### Payments

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/payments` | ✓ | Initiate payment for an order |
| `POST` | `/webhook/payments/:id/approve` | — | Webhook: approve a payment |
| `POST` | `/webhook/payments/:id/fail` | — | Webhook: fail a payment |

**POST /payments** — `Authorization: Bearer <token>`
```json
// Request
{ "orderId": "uuid", "amount": 9980 }

// Response 201
{ "id": "uuid", "orderId": "uuid", "amount": 9980, "status": "PENDING" }
```

---

#### Misc

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/health` | — | Health check |

---

### Swagger Docs

With the API running, open:

```
http://localhost:3333/docs
```

---

## Web

### Running the Web

```bash
cd apps/web

# Development
npm run dev

# Production build
npm run build
npm run start
```

The web app runs at `http://localhost:3000`.

---

### Pages

| Route | Description | Auth |
|-------|-------------|------|
| `/` | Home — hero + featured products (SSR) | — |
| `/products` | Full catalog with load-more pagination | — |
| `/products/[id]` | Product detail (SSR) | — |
| `/cart` | Shopping cart | — |
| `/checkout` | Order confirmation and placement | ✓ |
| `/orders` | Order history | ✓ |
| `/orders/[id]` | Order detail with cancel option | ✓ |
| `/profile` | Edit profile and password | ✓ |
| `/auth/sign-in` | Sign in | — |
| `/auth/sign-up` | Register | — |
| `/auth/forgot-password` | Request password reset | — |
| `/auth/reset-password` | Set new password | — |
| `/admin/products` | Product management (CRUD) | ✓ ADMIN |

Protected routes (`/checkout`, `/orders`, `/profile`, `/admin/*`) redirect to `/auth/sign-in` when unauthenticated.

---

## Testing

### Unit Tests

Cover use cases, domain entities, value objects, and the error handler. Use **in-memory fake repositories** — no database required.

```bash
# Run all unit tests
npm test

# Run a specific file
npm test -- --testPathPattern="create-product"

# Watch mode
npm test -- --watch
```

**Structure:**

```
tests/
├── unit/
│   ├── entities/          # User, Product, Order, OrderItem, Payment
│   ├── value-objects/     # UUID, Money, Password
│   ├── middleware/        # ErrorHandler
│   └── use-cases/
│       ├── auth/          # SignIn, ForgotPassword, ResetPassword
│       ├── user/          # CreateUser, GetUser, UpdateUser, DeleteUser
│       ├── product/       # CreateProduct, GetProduct, ListProducts, UpdateProduct, DeleteProduct
│       ├── order/         # PlaceOrder, GetOrder, ListOrders, CancelOrder
│       └── payment/       # ProcessPayment, ApprovePayment, FailPayment
└── helpers/
    └── fakes.ts           # Reusable in-memory repositories and factories
```

---

### Integration Tests

Test Prisma repositories against a real PostgreSQL database. Require `DATABASE_URL_TEST` to be set.

```bash
# Apply schema to the test database (first time only)
DATABASE_URL=$DATABASE_URL_TEST npx prisma migrate deploy

# Run integration tests
npm run test:integration
```

**Structure:**

```
tests/integration/
├── repositories/
│   ├── user.repository.spec.ts
│   ├── product.repository.spec.ts
│   ├── order.repository.spec.ts
│   └── payment.repository.spec.ts
└── setup/
    └── prisma.ts          # Prisma client setup/teardown
```

---

## Database

**ORM:** Prisma 7 with PostgreSQL.

```bash
# Create and apply a migration
npx prisma migrate dev --name migration_name

# Apply migrations in production
npx prisma migrate deploy

# Open Prisma Studio (GUI)
npx prisma studio

# Regenerate Prisma Client after schema changes
npx prisma generate
```

**Entities:**

| Table | Description |
|-------|-------------|
| `User` | Users with `CUSTOMER` and `ADMIN` roles, password reset support |
| `Product` | Products with name, price (cents), and stock |
| `Order` | Orders with `PENDING`, `CONFIRMED`, or `CANCELLED` status |
| `OrderItem` | Line items with a price snapshot at the time of purchase |
| `Payment` | Payments with `PENDING`, `PAID`, or `FAILED` status |

---

## Architecture

The backend follows **Clean Architecture** with four layers:

```
domain/          ← No external dependencies
   └── entities, value objects, domain events

application/     ← Depends only on domain
   └── use cases, port interfaces (contracts)

infrastructure/  ← Depends on application + domain
   └── Prisma repositories, JWT, bcrypt, Nodemailer

http/            ← Depends on application
   └── Fastify routes, middleware
```

### Key principles

- **Dependency inversion** — use cases depend on repository interfaces, not concrete implementations
- **Constructor injection** — all dependencies are injected (no IoC containers)
- **Repository pattern** — data access is abstracted; Prisma can be replaced without touching use cases
- **Domain events** — `Order` emits `OrderPlacedEvent` and `OrderCancelledEvent`
- **Value objects** — `Email`, `Password`, `Money`, and `UUID` encapsulate validation and domain rules
- **Single-purpose use cases** — each business operation has its own class with an `execute()` method

### Request lifecycle

```
HTTP Request
  → Fastify Route
    → Auth Middleware (JWT verification)
      → Use Case (execute)
        → Repository Interface
          → Prisma Implementation
        ← Result
      ← Output DTO
    ← HTTP Response
```
