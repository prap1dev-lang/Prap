# PRAP — Property Referral Award Platform

> India's first reward-driven real-estate referral platform.
> Earn PRAP Coins (1 Coin = ₹1) on every site visit, milestone & referral.
> RERA-verified inventory in Noida, Greater Noida & beyond.

## Tech stack

| Layer       | Choice                                                    |
| ----------- | --------------------------------------------------------- |
| Framework   | **Next.js 14** (App Router) + TypeScript                  |
| Styling     | **Tailwind CSS** v3 + custom design tokens                |
| Backend     | Next.js Route Handlers (Node.js / Edge-ready)             |
| DB          | **PostgreSQL via Supabase** (with RLS)                    |
| Storage     | Supabase Storage (KYC docs)                               |
| Auth/OTP    | Firebase Phone Auth (free tier) — swappable for MSG91     |
| Payments    | **Razorpay** Orders + Webhooks + Payouts                  |
| Emails      | Resend / Brevo                                            |
| Hosting     | Vercel (frontend) · Render/Railway (jobs) — all free tier |

## Quick start

```bash
cp .env.local.example .env.local   # fill in keys (you can run UI without them)
npm install
npm run dev
# → http://localhost:3000
```

`npm run typecheck` runs the TS compiler. `npm run build` produces a production
bundle. All public routes are statically rendered or ISR-friendly.

## Project layout

```
src/
├── app/                       Next.js routes (App Router)
│   ├── (marketing)/           Public SEO pages (Navbar + Footer)
│   ├── auth/                  Signup / Login (split layout)
│   ├── dashboard/             Authenticated dashboards (3 roles)
│   ├── admin/                 Internal admin panel
│   ├── api/                   REST API route handlers
│   ├── sitemap.ts             Dynamic sitemap.xml
│   ├── robots.ts              robots.txt
│   ├── layout.tsx             Root layout + JSON-LD
│   └── page.tsx               Landing page
├── components/                Reusable React components
│   ├── site/                  Marketing components (Hero, Features…)
│   └── auth/                  Auth-specific components
└── lib/                       Shared TS modules
    ├── coins.ts               Single source of truth for coin math
    ├── projects.ts            Project domain types + mock data
    ├── seo.ts                 Metadata helpers + JSON-LD generators
    └── utils.ts               Misc helpers
```

## Documentation

- [docs/DATABASE_SCHEMA.sql](docs/DATABASE_SCHEMA.sql) — Production-grade
  PostgreSQL schema, ready to run on Supabase. Includes RLS, triggers,
  Aadhaar lock-in and append-only coin ledger.
- [docs/API_ROUTES.md](docs/API_ROUTES.md) — Every REST route with auth
  scope + transaction-level pseudo-code for visit & redemption flows.
- [docs/COIN_LOGIC.md](docs/COIN_LOGIC.md) — Earn/spend/redeem rules,
  concurrency, holds & reversals.

## SEO playbook (out-of-the-box)

We compete with 99acres, Magicbricks, Housing.com on SEO from day one:

- **Per-page metadata** via `buildMetadata()` (canonical, OG, Twitter, robots).
- **Dynamic** `sitemap.xml` and `robots.txt`.
- **JSON-LD** for `Organization`, `WebSite`, `RealEstateAgent`, `Residence`,
  `FAQPage` — embedded site-wide and on every project page.
- **City landing pages** (`/city/noida`, `/city/greater-noida`,
  `/city/yamuna-expressway`) with hyper-local copy & keywords.
- **Per-project pages** with breadcrumbs, structured data and `lowPrice` /
  `highPrice` `AggregateOffer` markup.
- **Static rendering** for marketing pages → CWV-friendly LCP.

## Implementation status

| Area                 | Status                              |
| -------------------- | ----------------------------------- |
| Marketing site (SEO) | ✅ Done                              |
| Auth UI (OTP)        | ✅ UI ready, wire to Firebase/Supabase |
| Dashboards (3 roles) | ✅ Done (mock data)                  |
| Admin panel          | ✅ Done (mock data)                  |
| API route handlers   | ✅ Logic + Zod validation in place; wire DB |
| DB schema            | ✅ SQL file ready to run             |
| Payments             | 🟡 Razorpay stubs only — needs keys |
| KYC verification     | 🟡 Manual admin flow ready          |
| RERA verification    | 🟡 Manual MVP; API in Phase 2       |

## Going to production

1. Spin up a Supabase project; run `docs/DATABASE_SCHEMA.sql`.
2. Fill `.env.local` with keys.
3. Replace the demo data sources in:
   - `src/app/api/**` (TODO comments mark the DB calls)
   - `src/app/dashboard/**`
4. Wire Firebase phone-auth in `SignupForm` / `LoginPage`.
5. Add Razorpay key & enable webhook on `/api/payments/webhook`.
6. Deploy to Vercel (auto). Point your domain.
7. Submit `sitemap.xml` to Google Search Console + Bing Webmaster.
