# Director OS Backend

Express + MongoDB API for SUH Director OS.

## Setup

```bash
npm install
cp .env.example .env
npm run seed
npm run dev
```

Default: `http://localhost:5010`

## Demo accounts

| Role | Email | Password | OTP (demo) |
|------|-------|----------|------------|
| Director | director@suhtech.top | director123 | 123456 |
| Manager | manager@suhtech.top | manager123 | 123456 |

## Auth flow

1. `POST /api/auth/login` `{ email, password, role? }` → `{ otpToken, demoOtp? }`
2. `POST /api/auth/verify-otp` `{ otpToken, otp }` → `{ user, accessToken, refreshToken }`
3. Use `Authorization: Bearer <accessToken>` on module routes

## Key routes

- `GET /api/bootstrap` — all module data for the app shell
- CRUD for leads, campaigns, projects, tasks, tickets, approvals
- `POST /api/assistant/chat` — rule-based executive summary
- Director-only mutations use role `director`
