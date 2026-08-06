# Finance OS

Personal finance operating system — salary, expenses, loans, investments, emergency fund, goals, net worth, reports, and insights.

## Quick start (demo mode)

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Demo mode uses in-memory seeded data.

## Production (Neon + Google)

1. Copy `.env.example` → `.env.local`
2. Set `DATABASE_URL`, `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `ALLOWED_EMAIL`
3. Set `DEMO_MODE=false`
4. `npm run db:push` then `npm run db:seed`
5. `npm run dev`

## Scripts

| Script            | Purpose                     |
| ----------------- | --------------------------- |
| `npm run dev`     | Dev server                  |
| `npm run build`   | Production build            |
| `npm test`        | Finance engine unit tests   |
| `npm run db:push` | Push Drizzle schema to Neon |
| `npm run db:seed` | Seed expense categories     |

## Stack

Next.js 15 · React 19 · Tailwind · shadcn-style UI · Drizzle · Neon · Auth.js · Recharts · Zustand · TanStack Table · Framer Motion · Zod

## Future scope

- Bank / UPI account sync (Open Banking / aggregator APIs)
- Live mutual fund NAV and crypto price updates
- Broker / demat portfolio import (Zerodha, Groww, etc.)
- Multi-currency support with FX conversion
- Shared household / family access (multi-user)
- Push and email reminders (EMI, SIP, salary day)
- Tax helpers (80C, capital gains summaries)
- WhatsApp or Telegram notification bots
- Recurring expense auto-generation from rules
- Debt payoff strategies (avalanche vs snowball simulator)
- Scenario planning (“what if I invest ₹X more?”)
- Receipt OCR / photo expense capture
- Native iOS / Android wrappers beyond PWA
- Offline write queue with sync when back online
- Automated monthly report emails + richer PDF layouts
- Budget caps per category with overspend alerts

Thanks for visiting this repo
