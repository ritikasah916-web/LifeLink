# LifeLink — Blood Donation Management System

LifeLink is a full-stack React + Express application connecting blood donors and hospitals. It includes role-based dashboards, blood request matching, donor responses, live donor notifications, and admin oversight.

## Project structure

- `client/` — React 19 + Vite frontend
- `server/` — Express 5 + MongoDB + Socket.IO backend

## Requirements

- Node.js 20.19+ (or a compatible current LTS)
- npm
- MongoDB local instance or MongoDB Atlas database

## 1. Configure the backend

Open a terminal:

```powershell
cd server
npm install
Copy-Item .env.example .env
```

Edit `server/.env` and set:
- `MONGO_URI` to your MongoDB connection string
- `JWT_SECRET` to a long random secret
- `CLIENT_URL=http://localhost:5173`

Do not upload `.env` to GitHub or share it.

Start the backend:

```powershell
npm run dev
```

API health check: `http://localhost:5000/api/health`

## 2. Configure the frontend

Open a second terminal:

```powershell
cd client
npm install
Copy-Item .env.example .env
npm run dev
```

Open the Vite URL shown in the terminal, usually `http://localhost:5173`.

## 3. Create an admin account

Public registration intentionally supports only donors and hospitals. Create the first admin from the server folder:

```powershell
npm run create-admin -- "LifeLink Admin" admin@example.com "Use-A-Strong-Password" 9876543210
```

Use your own email, strong password, and phone number. Do not put the password into source code or commit it.

## Main features

### Donor
- Register with blood group and city
- Manage availability and last donation date
- See matching open requests
- Accept or decline a request
- Receive real-time notifications while connected

### Hospital
- Publish blood requests with units, city, urgency, and deadline
- View and cancel own pending requests
- View donor responses
- See donor contact details for accepted responses

### Admin
- View platform statistics and blood-group chart
- View registered users and activate/deactivate accounts
- View all blood requests and update request status

## Matching and safety notes

The current MVP matches exact blood group and city. This is a software discovery filter, not a clinical compatibility or donor eligibility decision. Donation-date filtering uses a configurable preliminary interval (`MIN_DAYS_BETWEEN_DONATIONS`, default 90 days). Qualified medical staff must verify compatibility and eligibility before any donation. LifeLink does not replace blood-bank procedures or emergency medical care.

## API routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET/PATCH /api/donors/me`
- `POST /api/requests` (hospital)
- `GET /api/requests` (hospital)
- `GET /api/requests/matching` (donor)
- `PATCH /api/requests/:id/cancel` (hospital)
- `POST /api/responses/:requestId/respond` (donor)
- `GET /api/responses/hospital` (hospital)
- `GET /api/admin/stats`
- `GET /api/admin/users`
- `PATCH /api/admin/users/:id/status`
- `GET /api/admin/requests`
- `PATCH /api/admin/requests/:id/status`

## Notes

- The uploaded source archive contained a `.env`; it is deliberately excluded from this rebuilt ZIP. Create a fresh one from `.env.example`.
- `node_modules` is not included. Run `npm install` in both folders.
