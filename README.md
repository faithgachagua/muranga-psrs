# Murang'a County – Public Service Request System

Residents submit requests, track progress and rate the outcome. A single county admin role reviews and updates every request. There are no department accounts.

**Stack:** Next.js 14 (React, App Router) · Tailwind CSS · Recharts · lucide-react icons · Express.js · PostgreSQL

## Features
- Public landing page and a public **Track a request** page (reference number only, no personal details shown)
- Navy and green dashboard styling with photo banners (Poppins + Inter, lucide icons)
- Pictures are set in one place, `frontend/lib/images.js`; put replacement files in `frontend/public/images`
- Custom accessible `Select` component (`frontend/components/ui/Select.js`) used instead of native dropdowns
- Resident accounts, login with **email or national ID** + password (JWT)
- 17 sectors used for **sector-based routing**: every request is filed under a sector, and the county admin is notified and can sort, filter and report by sector
- Statuses: Submitted → Under Review → In Progress → Resolved / Rejected (rejection needs a reason)
- Evidence upload (JPG, PNG, WEBP, PDF, Word; up to 5 files, 5 MB each)
- Ward selection (7 sub-counties, seeded wards – edit `backend/src/seed.js`)
- Admin dashboard: filter by sector, ward, status and date; Recharts for status, trend, sector and ward
- The admin can move a request to another sector if the resident chose the wrong one
- Feedback and 1–5 star rating once a request is resolved
- In-app notifications on every status change (unread badge, polls every 30 s)

## Setup
Requirements: Node 18+, PostgreSQL 13+

```bash
# 1. database
createdb muranga_psrs

# 2. backend
cd backend
cp .env.example .env        # set DATABASE_URL and a long random JWT_SECRET
npm install
npm run db:init             # creates tables and seeds sectors, wards and demo users
npm run dev                 # http://localhost:5000

# 3. frontend (new terminal)
cd frontend
cp .env.local.example .env.local
npm install
npm run dev                 # http://localhost:3000
```

## Demo logins (created by `db:init`)
| Role | Login | Password |
|------|-------|----------|
| Admin | admin@muranga.go.ke | Admin@123 |
| Resident | faith@example.com or ID 12345678 | Citizen@123 |

**Change all of these before going live.**

## API overview
| Method | Path | Who |
|---|---|---|
| POST | /api/auth/register, /api/auth/login | public |
| GET | /api/sectors, /api/wards, /api/track/:reference | public |
| POST | /api/complaints (multipart, field `evidence`) | resident |
| GET | /api/complaints/mine, /api/complaints/:id | resident / staff |
| POST | /api/complaints/:id/feedback | resident |
| GET | /api/admin/stats, /api/admin/complaints | admin |
| PATCH | /api/admin/complaints/:id/status | admin |
| PATCH | /api/admin/complaints/:id/sector | admin |
| GET/PATCH | /api/notifications, /unread-count, /read-all, /:id/read | any logged-in user |

## Before production
- Uploaded files are served from `/uploads` with random filenames; move to private/signed storage (S3 etc.) for sensitive evidence.
- Add rate limiting on `/api/auth/login`, HTTPS, and a real SMS/email provider if you want notifications beyond the app.
- Confirm the ward list against the official IEBC list.
