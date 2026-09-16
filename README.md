# CleanSpaces

Community-powered cleanup subscription platform for the Cape Flats. Street committees pool household contributions through the platform to fund professional weekly cleanup crews for their zones, with live activation tracking, photo proof of work, and transparent payment records.

## Team

| Member | Role |
|---|---|
| Ihtishaam Johnson | Project Manager — Payments, pricing, checkout, resident dashboard, deployment, integration |
| Krishendree Kistensamy | Research & Feasibility — Homepage, authentication tooling, visual design |
| Sibongile Mpeta | Marketing & Content — Reviews, Contact, About, visual design |
| Mubaarik Davids | Customer Experience — Admin panel, zone registration, How It Works, logo & media |

## Tech Stack

- **Frontend:** Vue 3 (Vite), Vue Router, Leaflet.js maps, SweetAlert2
- **Backend:** Node.js, Express
- **Database:** MySQL (Railway)
- **Payments:** PayFast sandbox integration (card + Instant EFT)
- **Email:** Nodemailer via Brevo SMTP
- **Hosting:** Railway (backend + database), Render (frontend)

## Live Deployment

- **Frontend:** https://cleanspaces.onrender.com
- **Backend:** https://cleanspaces-production.up.railway.app/api/health

## Setup

Requires Node.js 18+ and MySQL 8.

### 1. Clone and install

```bash
git clone https://github.com/ihtishaamj63-web/CleanSpaces.git
cd CleanSpaces

# Backend
cd backend
npm install

# Frontend (new terminal)
cd frontend
npm install
```

### 2. Database

Run `schema.sql` against a fresh MySQL instance (Workbench, CLI, or your preferred client):

```bash
mysql -u root -p < schema.sql
```

This creates the database, all tables, and seed data including test accounts and demo zones. For Railway/remote databases, run the queries through the provider's SQL interface against the existing database (skip the `CREATE DATABASE` / `USE` lines).

### 3. Environment variables

Create a file named `.env` inside the `backend/` folder with the following content, filling in your own values:

```
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=cleanspaces
JWT_SECRET=replace_with_a_long_random_string
JWT_EXPIRES=24h
DEV_BYPASS=true
FRONTEND_URL=http://localhost:5173

# PayFast (sandbox) — only needed when DEV_BYPASS=false
PAYFAST_MODE=sandbox
PAYFAST_MERCHANT_ID=your_sandbox_merchant_id
PAYFAST_MERCHANT_KEY=your_sandbox_merchant_key
PAYFAST_PASSPHRASE=your_sandbox_passphrase

# Email (Brevo SMTP) — used by the contact form
MAIL_HOST=smtp-relay.brevo.co
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=your_smtp_user
MAIL_PASSWORD=your_smtp_password
MAIL_FROM=your_from_address
MAIL_TO=your_inbox
```

Notes:

- `DB_PORT` is `3306` by default — change it if your MySQL runs on another port.
- `DEV_BYPASS=true` completes payments instantly without contacting PayFast — use this for local development. Set to `false` to use the PayFast sandbox (requires the `PAYFAST_*` variables).
- The `PAYFAST_*` and `MAIL_*` variables can be left as placeholders if you're only running locally with `DEV_BYPASS=true`.

### 4. Run

```bash
# Backend (from backend/)
npm run dev
# Runs on http://localhost:5000

# Frontend (from frontend/)
npm run dev
# Runs on http://localhost:5173 (proxies /api to the backend)
```

## Test Accounts

| Account | Email | Password | Purpose |
|---|---|---|---|
| Admin | admin@cleanspaces.co.za | Admin@2026 | Admin panel: zone approvals, crew, payroll, reports |
| Thandiwe | thandiwe@gmail.com | Resident@2026 | Resident with paid subscription (NY108 Block) |
| Nomvula | secondresident@gmail.com | Resident@2026 | Resident with payment due — use for the payment flow |
| Andile | andile@gmail.com | Resident@2026 | Resident in a different zone (Site B Cluster, large plan) |

## Key Features

- **Zone subscriptions** — tiered plans (small/medium/large), per-household share calculated so the zone is fully funded at the 60% activation threshold
- **PayFast payments** — card and Instant EFT through the sandbox gateway, with MD5 signature generation, ITN webhook handling, and redirect-based completion
- **Activation tracking** — live progress toward the 60% household participation threshold on every resident dashboard
- **Proof of work** — before/after photos per cleanup, drag-to-compare slider
- **Cleanup requests** — residents report neglected spots with photo evidence; admins review, schedule, and complete them
- **Admin operations** — zone approvals, crew management with WhatsApp contact, payroll matched to role-based wages, cleanup report capture
- **Moderated reviews** — testimonials submitted publicly, approved by admins before display
- **Role-based access** — JWT authentication with resident/admin guards on both frontend routes and backend endpoints

## Project Structure

```
backend/
  config/plans.js           # Single source of truth for pricing
  controllers/              # Route handlers (payments, zones, auth, etc.)
  middleware/               # JWT auth, role guards, file upload
  routes/                   # Express route definitions
  services/emailService.js  # Contact + notification emails (Brevo SMTP)
  scripts/                  # One-off utilities (schema, password reset)
frontend/
  src/
    api.js                  # Axios instance (proxy in dev, Railway in prod)
    components/             # Shared components (map, stats, testimonials)
    views/
      resident/Dashboard.vue
      admin/                # Admin panel pages
      ...                   # Public pages
schema.sql                  # Full database schema + seed data
```

## Branches

- `main` — stable release
- `develop` — integration branch (currently deployed)
- `feature/*` — personal working branches, merged to develop
