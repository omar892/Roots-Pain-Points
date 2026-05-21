# Roots Pain Point Studio

A facilitated workshop tool for a 1-hour AI working session — map team pain points, prioritize them on a 2x2, match each to an AI pattern, and capture takeaways. Pure client-side; deploys to Cloudflare Pages.

## Tech

Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui · `@cloudflare/next-on-pages`

## Develop

```bash
npm install
npm run dev          # http://localhost:3000
```

## Deploy to Cloudflare Pages

```bash
npx wrangler login           # one-time, opens a browser
npm run pages:build          # builds via @cloudflare/next-on-pages -> .vercel/output/static
npm run pages:deploy         # wrangler pages deploy .vercel/output/static
npm run pages:preview        # serve the built output locally on the edge runtime
```

> The build emits to `.vercel/output/static`. That path is correct even though
> the target is Cloudflare — the next-on-pages adapter reuses Vercel's build
> output format internally, then transforms it for Cloudflare's edge runtime.
> Do not rename it.

## Routes

- `/` — the workshop studio (Board, Prioritize, Patterns, Summary)
- `/admin` — paste a `PainPoint[]` JSON array to override the mock data set (local browser storage only)

## Local storage keys

- `roots-studio-placements-v1` — quadrant placements (survive refresh)
- `roots-studio-data-v1` — custom pain point data from `/admin`
