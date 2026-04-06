# Finance Dashboard Api

A backend API for managing financial records with role-based access
control and dashboard analytics. Built with Node.js, Express, TypeScript,
and MongoDB.

The system is designed around three distinct user roles — each with a
clear and deliberate set of permissions — and a dashboard layer powered
entirely by MongoDB aggregation pipelines rather than application-level
computation.

This API demonstrates a well-structured backend system with clear separation of concerns, role-based access control, and efficient data aggregation for financial analytics.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [How Authentication Works](#how-authentication-works)
- [Role System](#role-system)
- [API Reference](#api-reference)
- [Error Handling](#error-handling)
- [Architecture Decisions](#architecture-decisions)
- [Assumptions](#assumptions)
- [Known Limitations and What I Would Add](#known-limitations-and-what-i-would-add)

---

## Tech Stack

| Concern | Choice |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Language | TypeScript |
| Database | MongoDB |
| ODM | Mongoose |
| Auth | JSON Web Tokens (JWT) |
| Validation | express-validator |
| Password hashing | bcryptjs |

No frameworks like NestJS were used deliberately. The goal was to show
how a clean layered architecture is built from scratch using Express —
not to rely on a framework to enforce structure.

---

## Project Structure

```bash
src/
├── config/
│   ├── database.ts ← MongoDB connection with lifecycle events
│   └── seed.ts ← creates the first admin account
│
├── controllers/    ← request and response handling only
│   ├── auth.controller.ts
│   ├── user.controller.ts
│   ├── record.controller.ts
│   └── dashboard.controller.ts
│
├── middleware/   ← auth, RBAC, validation, error handling
│   ├── auth.middleware.ts
│   ├── rbac.middleware.ts
│   ├── error.middleware.ts
│   └── validate.middleware.ts
│
├── models/
│   ├── user.model.ts
│   └── financial-record.model.ts
│
├── routes/
│   ├── auth.routes.ts
│   ├── user.routes.ts
│   ├── record.routes.ts
│   ├── dashboard.routes.ts
│   └── index.ts       
│
├── services/   ← all business logic and DB interaction
│   ├── auth.service.ts
│   ├── user.service.ts
│   ├── record.service.ts
│   └── dashboard.service.ts
│
├── types/
│   └── index.ts
│
├── utils/
│   ├── app-error.ts  ← custom error class       
│   ├── jwt.util.ts   ← token signing and verification       
│   └── response.util.ts  ← consistent API response helpers    
│
├── validators/  ← express-validator rule sets per module
│   ├── auth.validator.ts
│   ├── user.validator.ts
│   └── record.validator.ts
│
├── app.ts                   
└── index.ts ← server entry point, starts after DB connects               
```

## Getting Started

### Prerequisites

- Node.js v18 or higher
- MongoDB running locally or a MongoDB Atlas connection string

### 1. Clone the repository
```bash
git clone https://github.com/Harsith-Panda/finance-dashboard-api.git
cd finance-dashboard-api
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
```bash
cp .env.example .env
```
Open `.env` and fill in your values (Structured already filled just fill in the corresponding values):
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/finance-dashboard
JWT_SECRET=your_jwt_secret_key
ADMIN_EMAIL=admin_email
ADMIN_PASSWORD=admin_password
```
> **Important:** Use a strong random string for JWT_SECRET in any
> environment beyond local development.

### 4. Seed the first admin
```bash
npm run seed:db
```

This creates one admin account using the credentials in your `.env`.
If an admin already exists the script exits without making changes —
safe to run multiple times.

Admin accounts cannot be created through the public API. This is a
deliberate security decision explained further in
[Architecture Decisions](#architecture-decisions).

### 5. Start the server
```bash
# Development with hot reload
npm run dev

# Production
npm run build
npm start
```

### 6. Confirm everything is working
```
GET http://localhost:3000/health-check
```
```json
{
  "status": "ok",
  "db": "connected"
}
```

---

## How Authentication Works

All protected routes expect a Bearer token in the Authorization header:

```
Authorization: Bearer <your_token>
```

Tokens are issued on register and login. On every protected request
the auth middleware does the following in order:

1. Checks the Authorization header exists and starts with `Bearer`
2. Extracts and verifies the token signature
3. Confirms the user still exists in the database
4. Confirms the user's status is still active
5. Attaches the decoded user to the request for downstream use

Steps 3 and 4 matter because a token remains cryptographically valid
even after a user is deleted or deactivated. Checking the database on
every request ensures those changes take effect immediately.

---

## Role System

Three roles exist. Each one has a clear and distinct purpose:

**Viewer**
Read-only access. Can see records and basic dashboard data but cannot
create, modify, or delete anything. Intended for stakeholders who need
visibility into financial data without interacting with it.

**Analyst**
Can create and update financial records. Has access to deeper dashboard
analytics including the expense breakdown. Cannot delete records or
manage users. Intended for team members actively working with financial
data.

**Admin**
Full access. Can delete records, manage users, assign roles, and
deactivate accounts. There is one intentional restriction even for
admins — they cannot delete their own account, preventing accidental
lockout.

### Permission matrix

| Action | Viewer | Analyst | Admin |
|---|---|---|---|
| Register and login | ✅ | ✅ | ✅ |
| View own profile | ✅ | ✅ | ✅ |
| View records | ✅ | ✅ | ✅ |
| Create records | ❌ | ✅ | ✅ |
| Update records | ❌ | ✅ | ✅ |
| Delete records | ❌ | ❌ | ✅ |
| View dashboard summary | ✅ | ✅ | ✅ |
| View category totals | ✅ | ✅ | ✅ |
| View monthly trends | ✅ | ✅ | ✅ |
| View recent activity | ✅ | ✅ | ✅ |
| View expense breakdown | ❌ | ✅ | ✅ |
| Manage users | ❌ | ❌ | ✅ |

---

## API Reference

### Response format

Every response from this API follows the same structure:

**Success:**
```json
{
  "success": true,
  "message": "Human readable message",
  "data": {}
}
```

**Paginated:**
```json
{
  "success": true,
  "message": "Human readable message",
  "data": [],
  "pagination": {
    "total": 42,
    "page": 1,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Human readable error message"
}
```

**Validation error:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email",    "message": "Must be a valid email" },
    { "field": "password", "message": "Must be at least 6 characters" }
  ]
}
```

---

### Auth

#### POST /api/auth/register

Public. Creates a new account with the viewer role.

The role field is intentionally not accepted here. Self-registered
users always receive the viewer role regardless of what is sent in
the request body.

**Request:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "secret123"
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "user": {
      "_id": "64a1b2c3d4e5f6a7b8c9d0e1",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "viewer",
      "status": "active",
      "lastLogin": null,
      "createdAt": "2024-03-01T10:00:00.000Z",
      "updatedAt": "2024-03-01T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

#### POST /api/auth/login

Public.

Both wrong email and wrong password return the same `Invalid credentials`
message. Returning different messages for each would allow an attacker to
enumerate which emails are registered in the system.

**Request:**
```json
{
  "email": "jane@example.com",
  "password": "secret123"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Logged in successfully",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

#### GET /api/auth/me

Returns the currently authenticated user's profile.

**Headers:** `Authorization: Bearer <token>`

**Response 200:**
```json
{
  "success": true,
  "message": "User fetched successfully",
  "data": {
    "user": {
      "_id": "64a1b2c3d4e5f6a7b8c9d0e1",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "viewer",
      "status": "active",
      "lastLogin": "2024-03-01T10:30:00.000Z",
      "createdAt": "2024-03-01T10:00:00.000Z",
      "updatedAt": "2024-03-01T10:00:00.000Z"
    }
  }
}
```

---

### Users

All user routes require Admin role.

#### POST /api/users

Creates a new user with an explicitly assigned role. This is the only
way to create analyst or admin accounts.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "name": "John Analyst",
  "email": "john@example.com",
  "password": "secret123",
  "role": "analyst"
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": { ... }
  }
}
```

---

#### GET /api/users

Returns a paginated list of all users.

**Headers:** `Authorization: Bearer <token>`

**Query parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| role | string | — | Filter by role: viewer, analyst, admin |
| status | string | — | Filter by status: active, inactive |
| page | number | 1 | Page number |
| limit | number | 10 | Results per page |

**Response 200:**
```json
{
  "success": true,
  "message": "Users fetched successfully",
  "data": [
    {
      "_id": "64a1b2c3d4e5f6a7b8c9d0e1",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "viewer",
      "status": "active",
      "lastLogin": "2024-03-01T10:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 12,
    "page": 1,
    "totalPages": 2,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

#### GET /api/users/:id

**Headers:** `Authorization: Bearer <token>`

Returns a single user by ID. Returns `404` if the user does not exist.
Returns `400` if the ID format is not a valid MongoDB ObjectId.

---

#### PUT /api/users/:id

Updates a user's name, email, role, or status. All fields are optional —
only the fields provided will be updated.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "name": "Updated Name",
  "email": "updated@example.com",
  "role": "analyst",
  "status": "inactive"
}
```

---

#### PATCH /api/users/:id/password

Updates a user's password. Requires the current password for
verification before allowing the change.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "currentPassword": "secret123",
  "newPassword": "newsecret456"
}
```

The new password must be different from the current password.
Validation rejects identical values before the database is touched.

---

#### DELETE /api/users/:id

Deactivates a user account by setting their status to inactive.
The user record is retained in the database — this is a soft delete.

Admins cannot delete their own account. The endpoint returns
`400 You cannot delete your own account` if attempted.

**Headers:** `Authorization: Bearer <token>`

---

### Financial Records

#### POST /api/records

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Admin, Analyst

The `createdBy` field is set automatically from the authenticated
user's token — it cannot be set or overridden from the request body.

**Request:**
```json
{
  "amount": 50000,
  "type": "income",
  "category": "Salary",
  "date": "2024-03-01",
  "description": "March salary payment"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| amount | number | Yes | Must be greater than 0 |
| type | string | Yes | income or expense |
| category | string | Yes | Max 50 characters |
| date | ISO date | No | Defaults to current date |
| description | string | No | Max 500 characters |

**Response 201:**
```json
{
  "success": true,
  "message": "Record created successfully",
  "data": {
    "record": {
      "_id": "64a1b2c3d4e5f6a7b8c9d0e2",
      "amount": 50000,
      "type": "income",
      "category": "Salary",
      "date": "2024-03-01T00:00:00.000Z",
      "description": "March salary payment",
      "createdBy": {
        "_id": "64a1b2c3d4e5f6a7b8c9d0e1",
        "name": "Super Admin",
        "email": "admin@finance.com",
        "role": "admin"
      },
      "isDeleted": false,
      "deletedAt": null,
      "createdAt": "2024-03-01T10:00:00.000Z",
      "updatedAt": "2024-03-01T10:00:00.000Z"
    }
  }
}
```

---

#### GET /api/records

**Headers:** `Authorization: Bearer <token>`  
**Roles:** All

Returns a paginated list of active (non-deleted) records.

**Query parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| type | string | — | Filter by type: income, expense |
| category | string | — | Case insensitive partial match |
| startDate | ISO date | — | Records from this date onwards |
| endDate | ISO date | — | Records up to this date |
| page | number | 1 | Page number |
| limit | number | 10 | Results per page, max 100 |

If both `startDate` and `endDate` are provided, the validator ensures
`endDate` is not before `startDate`.

Category filtering uses a case insensitive regex match — searching
`rent` will match records categorized as `Rent`, `RENT`, or `rent`.

---

#### GET /api/records/:id

**Headers:** `Authorization: Bearer <token>`  
**Roles:** All

Returns a single record. Soft deleted records return `404` — from the
API's perspective they no longer exist.

---

#### PUT /api/records/:id

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Admin, Analyst

All fields are optional. Only the fields provided will be updated.

**Request:**
```json
{
  "amount": 55000,
  "description": "Updated description"
}
```

---

#### DELETE /api/records/:id

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Admin

Soft deletes the record by setting `isDeleted: true` and recording
a `deletedAt` timestamp. The record is excluded from all future
queries and dashboard calculations but is retained in the database
for audit purposes.

---

### Dashboard

All dashboard endpoints exclude soft deleted records from their
calculations.

#### GET /api/dashboard/summary

**Headers:** `Authorization: Bearer <token>`  
**Roles:** All

Returns headline financial figures across all records.

**Response 200:**
```json
{
  "success": true,
  "message": "Dashboard summary fetched successfully",
  "data": {
    "totalIncome": 85000,
    "totalExpenses": 52000,
    "netBalance": 33000,
    "totalRecords": 10,
    "incomeCount": 4,
    "expenseCount": 6
  }
}
```

---

#### GET /api/dashboard/category-totals

**Headers:** `Authorization: Bearer <token>`  
**Roles:** All

Returns total amount, record count, and average amount grouped by
category and type. Results are sorted by total descending.

**Response 200:**
```json
{
  "success": true,
  "message": "Category totals fetched successfully",
  "data": [
    {
      "category": "Salary",
      "type": "income",
      "total": 80000,
      "count": 4,
      "avgAmount": 20000
    },
    {
      "category": "Rent",
      "type": "expense",
      "total": 18000,
      "count": 3,
      "avgAmount": 6000
    }
  ]
}
```

---

#### GET /api/dashboard/monthly-trends

**Headers:** `Authorization: Bearer <token>`  
**Roles:** All

Returns income, expense, and net balance grouped by month for the
last 24 months. Results are sorted by most recent month first.

The aggregation merges income and expense into a single object per
month so the frontend receives one entry per month rather than two
separate entries.

**Response 200:**
```json
{
  "success": true,
  "message": "Monthly trends fetched successfully",
  "data": [
    {
      "year": 2024,
      "month": 3,
      "income": 28000,
      "expense": 17000,
      "netBalance": 11000
    },
    {
      "year": 2024,
      "month": 2,
      "income": 25000,
      "expense": 19000,
      "netBalance": 6000
    }
  ]
}
```

---

#### GET /api/dashboard/recent-activity

**Headers:** `Authorization: Bearer <token>`  
**Roles:** All

Returns the most recently created records sorted by creation date.

**Query parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| limit | number | 10 | Number of records to return |

Each record includes the `createdBy` user's name, email, and role
via a populate so the frontend can show who entered each transaction.

---

#### GET /api/dashboard/expense-breakdown

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Admin, Analyst

Returns a breakdown of expenses by category including what percentage
of total expenses each category accounts for. Useful for identifying
where money is being spent.

**Response 200:**
```json
{
  "success": true,
  "message": "Expense breakdown fetched successfully",
  "data": {
    "grandTotal": 52000,
    "categories": [
      {
        "category": "Rent",
        "total": 18000,
        "count": 3,
        "percentage": 34.62
      },
      {
        "category": "Food",
        "total": 12000,
        "count": 8,
        "percentage": 23.08
      },
      {
        "category": "Utilities",
        "total": 8000,
        "count": 4,
        "percentage": 15.38
      }
    ]
  }
}
```

Percentages are rounded to two decimal places and will sum to 100
across all categories. If no expense records exist the response
returns `{ "grandTotal": 0, "categories": [] }` rather than an error.

---

## Error Handling

The global error handler in `error.middleware.ts` catches everything
and transforms it into a consistent response. It handles several
Mongoose-specific errors that would otherwise expose raw database
messages to the client:

| Mongoose error | What it means | HTTP response |
|---|---|---|
| CastError | Invalid MongoDB ObjectId in URL | 400 |
| Code 11000 | Duplicate unique field (e.g. email) | 409 |
| ValidationError | Schema validation failed | 422 |
| JsonWebTokenError | Malformed token | 401 |
| TokenExpiredError | Token past its expiry | 401 |

### HTTP status codes

| Code | When it is used |
|---|---|
| 200 | Successful GET, PUT, PATCH, DELETE |
| 201 | Successful POST (resource created) |
| 400 | Bad request — invalid ID format, logical errors |
| 401 | Missing token, invalid token, expired token |
| 403 | Valid token but insufficient role permissions |
| 404 | Resource does not exist or has been soft deleted |
| 409 | Conflict — email already in use |
| 422 | Validation failed — field level errors returned |
| 500 | Unexpected server error |

---

## Architecture Decisions

### Layered architecture — controllers, services, routes separated

Controllers only do three things: extract data from the request, call
a service function, and send the response. All business logic, database
queries, and error throwing live in the service layer. This separation
means the core logic can be understood and tested without knowing
anything about Express.

### Password hashing in the model via pre-save hook

Hashing lives entirely inside the Mongoose pre-save hook. Every code
path that saves a user — registration, seed script, password update —
automatically hashes the password without anyone having to remember
to call bcrypt. The one caveat is that `findByIdAndUpdate` bypasses
this hook entirely, so password updates use `findById` followed by
`user.save()` explicitly. This is documented in a comment next to
the relevant service function.

### select: false on the password field

The password field is excluded from all queries by default. Even if
a developer forgets to exclude it manually, it will not appear in
responses. Login explicitly opts in with `.select('+password')` — the
only place in the codebase where the raw password hash is needed.

### Soft delete with deletedAt timestamp

Neither records nor users are ever hard deleted. Setting `isDeleted: true`
with a `deletedAt` timestamp means there is always an audit trail.
You know what was deleted and exactly when. A pre-find query middleware
on the FinancialRecord model automatically excludes soft deleted records
from every standard query without the caller needing to remember to
add the filter.

### Aggregation pipelines need explicit isDeleted filter

The pre-find middleware applies only to standard Mongoose queries.
It does not apply to aggregation pipelines. Every `$match` stage in
the dashboard service includes `{ isDeleted: false }` explicitly.
This is a non-obvious Mongoose behaviour and is documented with a
comment in the dashboard service.

### Public registration is always viewer

Allowing a role field on the public registration endpoint is a
security risk — anyone could register as admin. The register endpoint
hardcodes the role to viewer regardless of what is sent in the request
body. Privileged accounts are created by an existing admin through
`POST /api/users` or through the seed script.

### Generic credentials error on login

Both wrong email and wrong password return `Invalid credentials`.
Returning different messages for each case would allow an attacker to
discover which email addresses are registered in the system.

### Separate validators folder

Validation rule sets live in `src/validators/` and are completely
separate from the middleware that runs them. The validate middleware
is a single generic function that checks the result of whichever
rules ran before it. This means rule sets are reusable and can be
tested independently.

---

## Assumptions

**Category is a free form string**  
Categories are not a fixed enum. This makes the system flexible —
new categories appear automatically in dashboard groupings without
any schema change. The tradeoff is that `Salary` and `salary` would
be treated as different categories, which the case insensitive filter
on the records endpoint partially addresses.

**Soft deleted records are excluded from all analytics**  
Dashboard figures always reflect live data only. A deleted record does
not appear in totals, trends, or breakdowns.

**JWT tokens are stateless**  
There is no token blacklist or refresh token mechanism. Logging out is
handled client side by discarding the token. The auth middleware does
check that the user still exists and is active on every request, which
limits the blast radius of a compromised token to the period before
the next request.

**lastLogin is updated on every successful login**  
This gives admins some visibility into account activity without
requiring a separate audit log system.

**Pagination defaults to 10 results per page**  
The maximum limit for records is capped at 100 to prevent accidentally
returning the entire collection in a single request.

---

## Known Limitations and What I Would Add

**Refresh tokens**  
Access tokens currently live for 7 days. A better approach would be
short lived access tokens (15 minutes) paired with long lived refresh
tokens stored server side, so sessions can be revoked properly.

**Rate limiting**  
The login endpoint has no rate limiting. In production, repeated failed
login attempts should be throttled using something like express-rate-limit
to protect against brute force attacks.

**Tests**  
The service layer is structured to be testable — each function takes
plain inputs and either returns data or throws an AppError. Jest with
Supertest would be the natural next step for unit and integration tests.

**API documentation**  
A Swagger or OpenAPI spec would make this easier to explore without
reading the source code. Tooling like swagger-jsdoc can generate this
from JSDoc comments on route handlers with minimal extra effort.

**Token blacklist on logout**  
Currently there is no logout endpoint because stateless JWTs cannot
truly be invalidated. A Redis-backed blacklist would allow tokens to
be explicitly revoked when a user logs out or when an admin deactivates
an account mid-session.

**Search**  
Full text search across record descriptions and categories is not
implemented. MongoDB's `$text` index or Atlas Search would handle
this well.

**Audit log**  
A separate collection recording who changed what and when would be
valuable for a finance system where data integrity matters. Currently
`createdBy` and `deletedAt` provide minimal traceability but there
is no change history on updates.

**findByIdAndUpdate deprecation**
Mongoose has flagged `findByIdAndUpdate` and similar update methods as candidates for behavioural changes in future major versions. The current usage in `user.service.ts` and `record.service.ts` works correctly today but would ideally be migrated to the `findById` followed by `document.save()` pattern for consistency — the same approach already used for password updates throughout the codebase.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server with hot reload via nodemon |
| `npm run build` | Compile TypeScript to JavaScript in dist/ |
| `npm start` | Run the compiled production build |
| `npm run seed:db` | Create the first admin account from .env credentials |

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| PORT | No | Server port, defaults to 3000 |
| MONGODB_URI | Yes | MongoDB connection string |
| JWT_SECRET | Yes | Secret key for signing tokens |
| JWT_EXPIRES_IN | No | Token expiry, defaults to 7d |
| ADMIN_EMAIL | Yes (seed) | Email for the seeded admin account |
| ADMIN_PASSWORD | Yes (seed) | Password for the seeded admin account |
| NODE_ENV | No | development or production — affects error verbosity |