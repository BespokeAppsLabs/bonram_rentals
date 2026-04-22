# Bonram Rentals — Agent Reference

## Purpose
Bonram Rentals Digital Portal is a "Quote-First" event equipment hire platform targeting B2B (government/corporate) and B2C (luxury events) clients in South Africa. It transitions Bonram from a standard hire company to a digital-first "Institutional Luxury" service provider, enabling real-time inventory tracking, quote management, and a consultative client experience through a polished Next.js frontend backed by Convex.

## Stack
- Framework: Next.js 16 (App Router, React 19)
- Package manager: **npm** — use exclusively
- Database/Backend: Convex (real-time reactive database + serverless functions)
- Auth: WorkOS AuthKit (via `@workos-inc/authkit-nextjs` + `@convex-dev/workos`)
- Key libs: `convex`, `workos`, `resend`, `@react-pdf/renderer`, `@googlemaps/js-api-loader`, `recharts`
- Styling: Tailwind CSS v4

## Branch Flow
- `main` — production. Never push directly.
- `dev` — default agent branch. All PRs target `dev`.
- Feature branches: `feature/{slug}` from `dev`
- Agent job branches: `agent-job/{id}` auto-created by BespokeHQ

## Key Commands
```bash
npm install
npm run dev       # starts on port 8022
npm run build
npm run lint
npm run start     # production server
```

## Architecture
The app uses Next.js App Router with a `src/` layout. Convex handles all backend logic — schema, queries, mutations, and actions live in `convex/`. The frontend is split into public-facing pages (catalog, quote flow, home) and an auth-gated admin portal (`/admin`) with inventory and CRM tools. WorkOS AuthKit manages authentication with role-based access (Admin/Staff).

Key directories:
- `src/app/` — Next.js App Router pages and layouts
- `src/app/admin/` — Auth-protected admin portal (inventory, quotes, analytics)
- `src/app/catalog/` — Public equipment catalog (browse, filter, quick-add)
- `src/app/quote/` — Quote cart and checkout flow
- `src/components/` — Shared React components
- `src/hooks/` — Custom React hooks
- `src/lib/` — Utility functions and API helpers
- `src/types/` — TypeScript type definitions
- `convex/` — Backend: schema, products, quotations, users, invoices, analytics, auth

## Agent Rules
1. Always branch from `dev`.
2. Package manager: **npm** only — never use bun, yarn, or pnpm.
3. Run `npm run build` before opening a PR.
4. Conventional commits: feat/fix/chore/docs/refactor.
5. Dev server runs on port **8022** — do not change this.
6. Convex functions live in `convex/` — never put backend logic in `src/`.
7. Auth is WorkOS AuthKit — do not introduce a second auth provider.
8. All quote/inventory mutations must go through Convex mutations, not direct DB calls.
9. "Quote-First" UX principle — no "Buy Now" flows; always route to quote cart.

## Environment
See `.env.example` for required variables. Key vars:
- `NEXT_PUBLIC_CONVEX_URL` — Convex deployment URL
- `WORKOS_CLIENT_ID`, `WORKOS_API_KEY`, `WORKOS_COOKIE_PASSWORD` — WorkOS auth
- `NEXT_PUBLIC_WORKOS_REDIRECT_URI` — OAuth callback (default: `http://localhost:8022/callback`)
- `RESEND_API_KEY` — Transactional email
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` — Location autocomplete (optional)
- `NEXT_PUBLIC_APP_URL` — App base URL
