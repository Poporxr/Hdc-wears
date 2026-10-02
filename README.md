# HDC Wears

A Next.js (App Router) replica of the HDC Wears storefront — mobile-first,
built from reference screenshots.

## Status

**Mockup only.** All product data lives in `lib/products.ts`. There is no
database, no checkout, and no real auth — login/signup are UI only. Product
images are public placeholders from picsum.photos (see `img()` in
`lib/products.ts`); swap them for real product shots when ready.

## Pages

- `/` — home: header, rotating hero, product grid, footer
- `/product/[slug]` — product detail with front/back view toggle, size/qty
  selectors, stock states, wishlist, and "You might like" rail
- `/login`, `/signup` — auth UI (mock, no backend)

## Run it

```bash
npm install
npm run dev
```

## Deploy

Import this repo in Vercel — it deploys as-is (no env vars needed for the
mockup).

## Wiring up for real (later)

- Replace `lib/products.ts` with API/DB reads (e.g. Prisma + Postgres).
- Point `img()` at a real image host/CDN.
- Implement cart state, checkout, and auth.
