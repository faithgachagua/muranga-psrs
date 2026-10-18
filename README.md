# Murang'a County Public Service Request System

A web platform that lets citizens of Murang'a County report problems and request services from the county government, follow each request until it is closed, and rate how it was handled. County administrators get a single dashboard to review, update and report on every request.

## What it does

**Citizens**
- Register and log in with an email address or national ID number and a password.
- Reset a forgotten password through a link sent by email (valid for one hour, single use).
- Send a request under one of 17 sectors (for example Roads & Transport, Water & Sewerage, Public Health & Sanitation), choose the ward where the issue happened, attach up to five photos, and optionally share the GPS location of the issue from the browser.
- Follow each request through its statuses: Submitted, Under Review, In Progress, Resolved or Rejected.
- Receive an in-app notification every time a status changes.
- Rate a request once it is resolved.
- Look up any request by its reference number on a public tracking page that shows the status only.

**County administrators**
- See all requests and filter them by sector, ward, status and date range.
- View charts of requests by status, sector, ward and over time, together with the resolution rate and average rating.
- See open versus resolved cases at a glance.
- Update a request's status with a note for the citizen (a reason is required when rejecting).
- Move a request to another sector if it was filed under the wrong one.
- Export the filtered list of requests as a CSV file.
- See where a request was reported on an embedded map when the citizen shared a location.

Requests are routed by sector: each one is filed under the sector the citizen picks, and the administrator is notified straight away.

## Tech stack

| Part | Technology |
|------|------------|
| Frontend | Next.js 14 (App Router), React 18, Tailwind CSS, Recharts, lucide-react |
| Backend | Node.js, Express |
| Database | PostgreSQL (Neon) |
| Photo storage | Cloudinary |
| Auth | JSON Web Tokens, bcrypt password hashing |

## Project structure

```
backend/
  src/
    index.js          server setup
    migrate.js        creates tables and loads sectors, wards and the admin account
    schema.sql        database schema
    seed.js           sector and ward data
    demo.js           optional sample citizens and requests
    cloudinary.js     photo upload helper
    mailer.js         email sending for password reset
    routes/           auth, complaints, admin, notifications, meta
    middleware/       authentication and file upload
frontend/
  app/                pages (public site, login, citizen and admin screens)
  components/         shared UI, including the Select component
  lib/                API client, auth context, constants
  public/images/      photographs used on the site
render.yaml           Render blueprint for the API
```

## Running locally

Requirements: Node.js 18 or newer, a PostgreSQL database (a local one or a free Neon project) and a Cloudinary account for photo uploads.

1. Create a database. For a local PostgreSQL install:

   ```bash
   createdb muranga_psrs
   ```

   Or create a project on [Neon](https://neon.tech) and copy its connection string.

2. Start the API.

   ```bash
   cd backend
   cp .env.example .env
   npm install
   npm run dev
   ```

   Edit `.env` first: set `DATABASE_URL` (the Neon connection string already includes `sslmode=require`) and `CLOUDINARY_URL` (shown on the Cloudinary dashboard as the API environment variable). `npm run dev` applies the database schema, loads the sector and ward data, creates the administrator account, adds sample data when `SEED_DEMO=true` and starts the server on http://localhost:5000.

   Without `CLOUDINARY_URL` everything works except attaching photos. Without `SMTP_HOST`, password reset emails are printed in the API terminal instead of being sent, which is enough for local use.

3. Start the web app in a second terminal.

   ```bash
   cd frontend
   cp .env.example .env.local
   npm install
   npm run dev
   ```

   Open http://localhost:3000.

### Accounts created locally

With the values in `.env.example`:

| Role | Login | Password |
|------|-------|----------|
| Administrator | admin@muranga.go.ke | Admin@123 |
| Citizen | jane@example.com (or ID number 12345678) | Citizen@123 |

With `SEED_DEMO=true` two more citizens (peter@example.com and mary@example.com) and about twenty sample requests in different statuses are also created, so the dashboards and charts have data. To wipe the database and start again, run `npm run db:reset` in `backend` (it refuses to run when `NODE_ENV=production`).

## Environment variables

**Backend (`backend/.env`)**

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `DATABASE_SSL` | Set to `true` if the database needs SSL and the connection string does not already include `sslmode` |
| `JWT_SECRET` | Secret used to sign login tokens |
| `CLIENT_URL` | Allowed web origin for CORS; separate several with commas |
| `CLOUDINARY_URL` | Cloudinary credentials in the form `cloudinary://api_key:api_secret@cloud_name` |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` | SMTP server used to send password reset emails (optional locally) |
| `MAIL_FROM` | Sender address for those emails, for example `Murang'a County <no-reply@example.com>` |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Administrator account created on start if it does not exist |
| `SEED_DEMO` | `true` also creates sample citizens and requests (only when there are no requests yet) |
| `PORT` | Port to listen on (default 5000) |

**Frontend (`frontend/.env.local`)**

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | Base URL of the API, without a trailing slash |

## Deployment

The database runs on Neon, the API on Render and the web app on Vercel, with photos on Cloudinary. Push the repository to GitHub first.

**Database (Neon)**

Create a project and copy the connection string. It is used as `DATABASE_URL` on Render. The API creates the tables itself on first start.

**API (Render)**

1. In Render choose New, then Blueprint, and select the repository. `render.yaml` defines the Node web service.
2. When prompted, enter `DATABASE_URL`, `CLOUDINARY_URL`, the `SMTP_*` values and `MAIL_FROM`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` and `CLIENT_URL`. Any SMTP provider works (for example Brevo, Resend or a Gmail account with an app password). Without SMTP settings the hosted site cannot send reset emails. Use a placeholder for `CLIENT_URL` now and update it after the Vercel deploy. Add `SEED_DEMO=true` as well if you want sample data on the hosted site.
3. After the first deploy, note the service URL, for example `https://muranga-psrs-api.onrender.com`. `/api/health` should return `{"ok":true}`.

The schema is applied on every start, so deploying new versions needs no manual migration. Free Render services sleep when idle and the first request after a pause is slow, as is the first query after Neon suspends an idle database.

**Web app (Vercel)**

1. Import the repository in Vercel and set the Root Directory to `frontend`.
2. Add the environment variable `NEXT_PUBLIC_API_URL` with the Render service URL.
3. Deploy, then set `CLIENT_URL` on the Render service to the Vercel URL (for example `https://muranga-psrs.vercel.app`) and redeploy the API so CORS allows it.

## API overview

| Method | Path | Access |
|--------|------|--------|
| POST | `/api/auth/register`, `/api/auth/login` | public |
| POST | `/api/auth/forgot-password`, `/api/auth/reset-password` | public |
| GET | `/api/auth/me` | logged in |
| GET | `/api/sectors`, `/api/wards` | public |
| GET | `/api/track/:reference` | public, status only |
| POST | `/api/complaints` (multipart, field `photos`) | citizen |
| GET | `/api/complaints/mine` | citizen |
| GET | `/api/complaints/:id` | owner or administrator |
| POST | `/api/complaints/:id/feedback` | citizen |
| GET | `/api/admin/stats`, `/api/admin/complaints`, `/api/admin/export` | administrator |
| PATCH | `/api/admin/complaints/:id/status`, `/api/admin/complaints/:id/sector` | administrator |
| GET, PATCH | `/api/notifications`, `/unread-count`, `/read-all`, `/:id/read` | logged in |

## Data model

`users` (citizens and administrators), `sectors`, `wards`, `complaints` (a request, its current status and optional GPS coordinates), `complaint_updates` (status history), `complaint_photos` (Cloudinary URLs for the attached photos), `feedback` (one rating per request) `notifications` and `password_resets` (hashed, expiring reset tokens).
