# Ledger — Bank Admin Console (frontend)

A React + TypeScript admin console for the `banking-system` microservices
backend. Every screen in this app is for **bank staff** — there is no
customer-facing sign-up; account holders only exist as records an admin
manages.

**Live demo:**
- Frontend: **https://nts1500bank.netlify.app/**
- Backend: **https://api-gateway-service-erz3.onrender.com/**

## What changed vs. a normal "user-facing" bank frontend

Per the brief, this console is built around these rules:

- **No public registration.** The only public auth routes are `/login`,
  `/refresh`, and `/logout`. Every user (whether a further ADMIN or a
  plain account-holder USER) is created by an already-logged-in admin,
  from the **Admin access** page.
- **One root admin, seeded by the backend.** The first admin comes from
  `ADMIN_BOOTSTRAP_EMAIL` / `ADMIN_BOOTSTRAP_PASSWORD` on `auth-service`
  (see `auth-service/.env.example` in the backend repo). Log in with
  that account first.
- **New admins get full access.** There's no separate "root" flag — any
  admin created via **Admin access → Create user → role: Admin** has
  identical privileges to the bootstrap admin: they can open accounts,
  view any account's balance/contact info by account number, and move
  money between accounts.
- **Accounts are admin-managed.** Only an admin can open an account
  (`POST /accounts`), list every account, look one up by account number,
  or block it. Account holders don't sign into this app at all.
- **Transfers are admin-initiated.** The **New transfer** screen lets an
  admin move money from any account to any other account.
- **Stateless, cookie-based sessions.** See below.

## Session model

- On login, the backend returns a short-lived **access token** in the
  JSON response body and sets a long-lived **refresh token** as an
  `HttpOnly` cookie (scoped to `/api/v1/auth`, so it's never sent to
  account/transaction endpoints).
- The access token is kept **only in memory** (a module-level variable in
  `src/api/client.ts`) — never in `localStorage`/`sessionStorage` — so it
  can't be read by injected scripts and disappears on a hard reload.
- On reload, the app silently calls `POST /auth/refresh` (the browser
  attaches the `HttpOnly` cookie automatically) to mint a new access
  token and restore the session — see `AuthProvider` in
  `src/context/AuthContext.tsx`.
- If any API call gets a `401`, the axios response interceptor
  (`src/api/client.ts`) transparently refreshes once and retries; if the
  refresh itself fails (cookie missing/expired), the admin is signed out.
- **Nothing is stored server-side.** Both tokens are self-contained,
  signed JWTs verified purely by signature + expiry — there's no session
  table, no revocation list. "Session management" here means "is there
  still a valid refresh cookie", which is what makes this stateless.

This app expects the paired backend changes (already applied to the
uploaded `banking-system` project):

- `auth-service`: removed the public `/register` endpoint; `/login` now
  sets the refresh cookie; added `/refresh` and `/logout`.
- `api-gateway-service`: `/register` removed from its public-route list,
  `/refresh` and `/logout` added (they authenticate via cookie, not a
  Bearer token); a CORS filter now allows credentialed requests from the
  frontend's origin (`CORS_ALLOWED_ORIGINS`, comma-separated).

See the backend repo's own `.env.example` files for the new
`JWT_REFRESH_SECRET`, `JWT_REFRESH_TTL_SECONDS`, `COOKIE_*`, and
`CORS_ALLOWED_ORIGINS` variables.

## Getting started

```bash
npm install
cp .env.example .env   # point VITE_API_BASE_URL at your gateway
npm run dev
```

`VITE_API_BASE_URL` should point at the **API Gateway**, not any
individual service — the frontend never talks to `auth-service` /
`account-service` / `transaction-service` directly:

```
VITE_API_BASE_URL=http://localhost:8090/api/v1
```

Build for production:

```bash
npm run build   # outputs to dist/
```

Sign in with the bootstrap admin credentials configured on `auth-service`
(default in local dev: `admin@bank.com` / `ChangeMe123!` — change these
via `ADMIN_BOOTSTRAP_EMAIL` / `ADMIN_BOOTSTRAP_PASSWORD` before deploying
anywhere real).

## Project structure

```
src/
  api/          axios client (token memory + refresh flow) + one module per service
  components/   Layout (sidebar shell), ProtectedRoute, shared UI primitives
  context/      AuthContext (session), ToastContext (notifications)
  lib/          formatting + error-message helpers
  pages/        one file per screen
  types/        TypeScript types mirroring the backend DTOs
```

## Pages

| Route                  | Purpose                                                        |
| ----------------------- | ---------------------------------------------------------------|
| `/login`                | Admin-only sign-in                                             |
| `/`                     | Overview: totals, recent transactions                          |
| `/accounts`             | Every account, search by account number                        |
| `/accounts/new`         | Open a new account for a user                                  |
| `/accounts/:number`     | Balance, contact info, block action, that account's history    |
| `/transactions`         | Every transaction in the system                                |
| `/transactions/new`     | Transfer money between two accounts                            |
| `/admins`               | Every user/admin; create further admins or account-holder users|

## Design

Ink navy sidebar, warm paper content canvas, a single restrained brass
accent for actions and status. Fraunces for display type, Inter for UI
text, IBM Plex Mono for account numbers and monetary figures (tabular
data reads as data, not prose).
