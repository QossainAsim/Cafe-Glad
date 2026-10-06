# Café GLAD Website

A Danish, mobile-first website for Café GLAD in Aarhus, built around takeaway orders, menu discovery, catering enquiries, and visiting the café.

## Run & Operate

- `pnpm --filter @workspace/cafe-glad run dev` — run the Café GLAD website
- `pnpm --filter @workspace/cafe-glad run typecheck` — typecheck the website
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Café GLAD website: React + Vite

## Where things live

- `artifacts/cafe-glad/src/App.tsx` — website routes, customer pages, opening status, menu interactions, and local editor
- `artifacts/cafe-glad/src/index.css` — website theme and responsive styles
- `artifacts/cafe-glad/public/images/` — optimized WebP versions of the supplied café photos
- `artifacts/cafe-glad/public/robots.txt` and `sitemap.xml` — crawler files; verify the production domain before launch
- `artifacts/api-server/` — shared API scaffold; the café website does not currently use it

## Architecture decisions

- Takeaway buttons use the verified phone number until GLAD supplies its online-ordering URL.
- The catering form opens a prepared email; the visitor must send it from their mail app. It is not a server submission.
- `/admin` edits only the current browser's local content; it is not a shared CMS and changes do not reach the published site.
- Do not guess menu prices, add-ons, dietary tags, dish photos, reviews, or ratings; leave them blank or clearly marked until verified.
- Use supplied café photography. Do not present generated or stock food imagery as real Café GLAD food.

## Product

Public routes: `/`, `/menu`, `/takeaway-aarhus`, `/catering-aarhus`, `/firmafrokost-aarhus`, `/om-glad`, and `/kontakt`. The site includes opening status, phone ordering, menu filters, a lunch picker, catering enquiries, directions, and mobile quick actions. `/admin` provides browser-local content editing.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Replace the sitemap/domain placeholder when the production domain is known.
- No ordering provider, verified price list, or shared content-management connection has been supplied yet.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
