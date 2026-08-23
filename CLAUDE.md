# nextnovas — repo guide for Claude Code

## What this repo is
Next.js 14 (App Router) + Tailwind, deployed on Vercel. Pushing to the
production branch auto-deploys to **nextnovas.com** — there is no separate
deploy step.

## Golden rule: the homepage is a professional portfolio
`nextnovas.com` (the root route, `app/page.tsx`) is Weilies Chok's product /
integration PM portfolio. Keep it focused on that. Do **not** reintroduce the
old "indie game builder / Nexus Arcade" framing, and do not add game content to
the homepage.

## Do NOT touch these — they are separate, working apps
- `app/bp/**` — a separate sub-app (BP tracker). Leave it entirely alone.
- `app/api/**` — API routes (auth, upload, db, blob, report-file). Leave alone.
- `lib/**` — shared server helpers (redis, session). Leave alone.
- `next.config.mjs`, `tsconfig.json`, `postcss.config.mjs`, `tailwind.config.ts`
  — do not change unless a task explicitly requires it, and flag it first.

If a change seems to require editing anything above, stop and ask before doing it.

## Files that ARE the portfolio (safe to edit for portfolio work)
- `app/page.tsx` — the portfolio page (client component).
- `app/layout.tsx` — site metadata (title/description/OG). Root `<body>` here is
  shared with `/bp`, so only edit the `metadata` export, not the body markup,
  unless intentional.
- `app/portfolio.css` — all portfolio styles. **Every selector is namespaced
  under `.pf-root`** so it cannot leak into `/bp` or globals. Keep it that way:
  new portfolio styles go here, prefixed with `.pf-root`.
- `public/resume.pdf` — the résumé linked from the nav and footer.

## Styling conventions
- Portfolio CSS is scoped: `.pf-root .thing { ... }`. Never add unscoped global
  rules for the portfolio. `app/globals.css` is shared — don't put
  portfolio-only styles there.
- Fonts load via `next/font/google` in `page.tsx` (Space Grotesk / Inter /
  JetBrains Mono), exposed as CSS vars `--pf-font-display / -body / -mono`.

## Before you commit
1. `npx tsc --noEmit` must pass.
2. `npm run build` should succeed (Vercel runs this — it needs network for
   Google Fonts, which is fine on Vercel).
3. `git status` — confirm ONLY intended files are staged. Nothing under
   `app/bp`, `app/api`, or `lib` should appear.

## Deploy
Commit and push to the production branch. Vercel deploys automatically. Use a
clear commit message, e.g. `Rework homepage into PM/integration portfolio`.
Do not force-push. Do not deploy from a dirty tree.
