# Finance OS

Personal finance operating system — salary, expenses, loans, investments, emergency fund, goals, net worth, reports, and insights.

Multi-user ready: each allowlisted Google account gets a **private empty workspace** on first login.

## Quick start

```bash
npm install
cp .env.example .env.local
# Fill DATABASE_URL, AUTH_*, ALLOWED_EMAILS
npm run db:push
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with Google.

## Multi-user allowlist

```env
ALLOWED_EMAILS=you@gmail.com,friend1@gmail.com,friend2@gmail.com
DEMO_MODE=false
```

Only emails in this list can sign in. Each user starts with zero balances and fills their own data.

## Production (Vercel + Neon + Google)

1. Set env vars on Vercel (`DATABASE_URL`, `AUTH_SECRET`, `AUTH_GOOGLE_*`, `ALLOWED_EMAILS`, `AUTH_URL`, `NEXT_PUBLIC_APP_URL`)
2. Add Google redirect URI: `https://your-app.vercel.app/api/auth/callback/google`
3. Run `npm run db:push` and `npm run db:seed` against Neon
4. Deploy

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm test` | Finance engine unit tests |
| `npm run db:push` | Push Drizzle schema to Neon |
| `npm run db:seed` | Seed shared expense categories |

## Stack

Next.js 15 · React 19 · Tailwind · Drizzle · Neon · Auth.js · Recharts · Zustand · TanStack Table · Framer Motion · Zod

## Future scope

- Bank / UPI sync via Account Aggregator
- Live mutual fund NAV and crypto prices
- Push / email reminders
- Debt payoff simulators
- Offline write queue
