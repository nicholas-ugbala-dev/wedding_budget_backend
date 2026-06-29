# Wedding Budget Tracker — API

Private REST API for tracking wedding expenses, payments, and vendors.

## Stack
Node.js · Express 4 · TypeScript · PostgreSQL · Raw SQL (`pg`) · JWT · Zod · Resend · db-migrate

## Architecture
Route → Controller → Service → Repository → Queries → PostgreSQL

## Setup

```bash
npm install
cp .env.example .env    # fill in your values
npm run dev             # runs migrations then starts server
```

## Scripts

```bash
npm run dev                       # start with hot reload
npm run build                     # compile TypeScript
npm run migrate:up                # run pending migrations
npm run migrate:down              # rollback last migration
npm run migrate:create -- name    # create new migration
```

## Key Decisions

- **Raw SQL** — no ORM, every query is explicit
- **BIGINT for money** — kobo/cents, divide by 100 for display
- **BIGINT for rates** — scaled by 1,000,000 for precision
- **Soft deletes on payments** — audit trail preserved
- **Per-transaction rates** — exact exchange rate locked per payment