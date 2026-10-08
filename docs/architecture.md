# Next Novas — platform architecture

The one map of every app, environment, host, database and sign-in provider
under nextnovas.com. **Keep it true:** any change to an app's stack (host, DB,
auth, domain, environments) updates this file in the same piece of work. Each
app repo's `CLAUDE.md` points here and carries the same rule.

_Last updated: 2026-10-07_

## Platform rules

1. **New apps go on Cloudflare.** Every app except the portfolio is expected to
   make money someday. Cloudflare Workers' free tier allows commercial use;
   Vercel Hobby does not, and Vercel Pro is a paid seat. Stay off Vercel for
   anything that could be monetised.
2. **The portfolio stays on Vercel Hobby.** It is non-commercial, so Hobby is
   within its terms, and it is not worth moving.
3. **Neon for Postgres and sign-in.** One Neon project per app, one Neon branch
   per environment (`uat`, `main`). Neon Auth (managed Better Auth) provides
   email/password and Google on each branch.
4. **Every app has UAT.** `develop` deploys UAT, `main` deploys production,
   through GitHub Actions. Schema changes land on the `uat` branch first.
5. **Free tiers until there are paying users or irreplaceable data.** Ask before
   turning on any paid tier, on any service.
6. **Supabase is not used.** Tolong Alih left it on 2026-09-27; nothing depends
   on it.
7. **No real users or data yet → edits need no confirmation.** Until an app has
   production users or data worth keeping, Claude proceeds with schema changes,
   data cleanup, branch creation and deploys without asking first. Anything
   that costs money, or deletes a whole project/account, still gets asked.
   Revisit this rule per app the day it gets its first real user.
   **Tolong Alih has passed that day (launching October 2026):** on its `main`
   branch Claude never deletes users, profiles, cars or blocks, and states any
   other destructive SQL and waits for a yes. Test-account cleanup is for `uat`.
8. **One brand, one Google consent screen.** Every app signs in with Google
   through the single GCP project **Next Novas** (one consent screen, name and
   logo "Next Novas"), with one OAuth client per app per environment. The
   privacy policy and terms the consent screen links to are the umbrella pages
   on www.nextnovas.com (`/privacy`, `/terms`), which carry one section per app.
   **A new app adds its own section there before it signs anyone in with
   Google.**
9. **Analytics is Google Analytics 4, one property per app.** Create the property
   and a web data stream for the app's production host, turn Google signals off,
   set event retention to 14 months, and put the `G-` id in that app's config
   (Tolong Alih: `GA_MEASUREMENT_ID` in `wrangler.jsonc`; UAT stays empty so test
   traffic never counts). Host-only cookie, no ad features, Do Not Track respected,
   no personal data in events. The umbrella `/privacy` covers every app; update it
   if an app sends anything new. Anonymous visitors are counted by GA, signed-in
   activity by the app's own database.

## Apps and environments

| App | Env | URL | Repo → branch | Hosting | Database | Sign-in | Status |
|---|---|---|---|---|---|---|---|
| Portfolio | prod | nextnovas.com | `weilies/nextnovas` → `master` | Vercel `next-novas` (Hobby) | — | — | live |
| ↳ `/bp` BP tracker | prod | nextnovas.com/bp | same app | same | Upstash Redis (via Vercel KV), Vercel Blob | own session cookie + Resend email | live, personal |
| Tolong Alih | UAT | uat.alih.nextnovas.com | `weilies/tolong-alih` → `develop` | Cloudflare Worker `tolong-alih-uat` | Neon `tolong-alih`, branch `uat` | Neon Auth (`uat`) | live |
| Tolong Alih | prod | alih.nextnovas.com | `weilies/tolong-alih` → `main` | Cloudflare Worker `tolong-alih` | Neon `tolong-alih`, branch `main` | Neon Auth (`main`) | live |
| Habit Hacker | UAT | uat.habit-hacker.nextnovas.com | `weilies/habit-hacker` → `develop` | Cloudflare Worker `habit-hacker-uat` | Neon `habit-hacker`, branch `uat` | Neon Auth (`uat`) | live |
| Habit Hacker | prod | habit-hacker.nextnovas.com | `weilies/habit-hacker` → `main` | Cloudflare Worker `habit-hacker` | Neon `habit-hacker`, branch `main` | Neon Auth (`main`) | live |
| Habit Hacker | legacy | habit-hacker-ivory.vercel.app | `weilies/habit-hacker` → `claude/sync-code-github-8v0z5c` | Vercel `habit-hacker` (Hobby) | Neon `habit-hacker`, branch `main` | Neon Auth (`main`) | superseded — delete the Vercel project |
| cikgu-bm | — | — | runs locally only | Vercel `cikgu-bm` (idle) | ? | ? | dormant — ignore, do not delete |

## Per app

### Portfolio — nextnovas.com
- Next.js 14 App Router + Tailwind, `app/page.tsx`, `/about`, `/projects`.
- `/privacy` ("Next Novas Privacy Policy") and `/terms` ("Next Novas Terms of
  Use"): the umbrella legal pages for every Next Novas app, server-rendered
  (`app/privacy`, `app/terms`, shared frame `app/legal/Shell.tsx`). Common part
  (who runs it, Google user data and Limited Use, sharing, storage, retention
  and deletion within 30 days, cookies, children) plus a section per app —
  today Tolong Alih only. The homepage has a "Next Novas" section linking them.
  These URLs are what the Google consent screen's Branding fields hold; do not
  move or rename them.
- `/bp` is a separate personal sub-app sharing the deployment: Upstash Redis
  through the Vercel KV integration (`KV_REST_API_*` / `UPSTASH_REDIS_REST_*`),
  Vercel Blob for uploads, Resend for email, `AUTH_SECRET` for its session.

### Tolong Alih — alih.nextnovas.com
- Front end: one static `public/index.html` (+ `admin.html`, `about.html`,
  `start.html`, `terms.html`, `privacy.html`), no build step, one shared
  header and bottom bar (`public/chrome.css`). Worker `src/worker.js` serves `/config.js` and proxies Neon Auth
  (`/api/auth/*`) and the Data API (`/api/rest/*`) from the app's own origin so
  the session cookie is first-party (iOS Safari drops third-party cookies).
- Data: Neon Data API (PostgREST) straight from the browser, guarded by RLS and
  column-scoped grants. The four verbs are `security definer` RPCs.
  Schema: `db/schema.sql`, applied per branch. Details: `db/README.md`.
- Neon project `tolong-alih` (`wispy-union-37910963`, Singapore):
  `main` = `br-snowy-dream-b3myqcc8`, `uat` = `br-flat-lake-b33jhfl5`.
- Deploy: `.github/workflows/deploy.yml`, `wrangler.jsonc` (prod) /
  `wrangler.uat.jsonc` (UAT). Repo secrets `CLOUDFLARE_API_TOKEN`,
  `CLOUDFLARE_ACCOUNT_ID`.

### Habit Hacker — habit-hacker.nextnovas.com
- Next.js 16 App Router, server actions, built for Workers by
  `@opennextjs/cloudflare`. Auth middleware is Edge `middleware.ts` (OpenNext
  supports Node `proxy.ts` only experimentally).
- Data: `@neondatabase/serverless` over HTTP from the server; authorization in
  query code (every query filters on the session's `user_id`).
- Neon project `habit-hacker` (`long-wind-65799621`, Singapore):
  `main` = `br-falling-cell-b3jjoy0t`, `uat` = `br-orange-heart-b3sioopa`.
- Deploy: `.github/workflows/deploy.yml`, one `wrangler.jsonc` with `env.uat`.
  GitHub Environments `production` / `uat` hold `DATABASE_URL` and
  `NEON_AUTH_COOKIE_SECRET`, synced to worker secrets on each deploy; repo
  secrets `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.

## Shared infrastructure

| Layer | Provider | Notes |
|---|---|---|
| Domain, DNS | Cloudflare (registrar + DNS) for `nextnovas.com` | Workers with `custom_domain: true` create their own DNS record and certificate on deploy. Vercel-hosted names need a manual CNAME to `cname.vercel-dns.com` (DNS only). |
| App hosting | Cloudflare Workers (apps), Vercel Hobby (portfolio) | See rules 1–2. |
| Postgres + auth | Neon, free plan, Singapore | Each branch's compute scales to zero after 5 min idle; the first request after that pays ~0.5 s to wake it. Changing that timeout needs a paid plan. |
| Google sign-in | Own OAuth clients in the GCP project **Next Novas**, one per app per environment (Tolong Alih UAT and Production are done) | One consent screen for the whole project: "Next Novas" name and logo, privacy and terms on www.nextnovas.com, authorized domain `nextnovas.com`, published In production with basic scopes only. The client's redirect URI is the callback Neon shows for that branch. Habit Hacker still on Neon's shared credentials until its client is added. |
| Email (auth) | Neon's shared sender `auth@mail.myneon.app` | Custom sender/SMTP is a Neon Auth setting per branch. Tolong Alih requires email verification (six-digit code) on `uat` and `main`; Neon Auth settings are per branch, so check both. |
| CI/CD | GitHub Actions per repo | Push to `develop`/`main` deploys; no manual steps. |

### About the Neon org

The Neon org (`org-patient-mountain-15556335`) is **Vercel-managed**: it was
created through the Vercel Marketplace, so billing and plan changes live in the
Vercel dashboard, and **new Neon projects can only be created from Vercel →
Storage**. Branches, schema, Neon Auth and the Data API are all managed from
Neon as normal, and the apps connect to Neon directly — hosting on Cloudflare
changes nothing.

Two things to know:
- **Never uninstall the Neon integration in Vercel.** That deletes the Vercel-
  managed Neon org and every project in it.
- The Vercel account has to stay anyway for the portfolio, so this costs
  nothing today. Before the first paid Neon plan, consider a Neon-native org
  (billed by Neon directly) for commercial apps.

Unused: Neon project `neon-pink-lamp` (`billowing-fog-57737827`, US East) — a
Payload CMS starter from 2025-11-28 (one default page, one untitled post, one
admin login; nothing since). No Vercel project uses it. Safe to delete from
Vercel → Storage; the Neon API refuses project deletes in this org.

## Outstanding

Owner approved all of these on 2026-09-29; they need the dashboard because the
tools available to Claude can't do them.

- **GitHub default branch → `main`** in `weilies/habit-hacker` (currently
  `claude/sync-code-github-8v0z5c`). New sessions start from the default branch.
  Settings → General → Default branch. (`weilies/tolong-alih` is done.)
- **Habit Hacker and Google sign-in:** add its section to `/privacy` and `/terms`
  here, then create "Habit Hacker UAT" and "Habit Hacker Production" OAuth
  clients in the Next Novas GCP project and switch its Neon Auth branches to them.
- **Domain ownership for the consent-screen logo:** done only if Search Console
  shows `nextnovas.com` verified; check if the logo is missing on the Google screen.
- **Delete Vercel project `habit-hacker`** (`prj_vB0nwLA3NVWRaQ979avtmRUSzrpc`):
  Settings → Advanced → Delete. It still lists `habit-hacker.nextnovas.com` and
  `habithacker.nextnovas.com` as domains, but DNS for the first points at the
  Cloudflare Worker; check `habithacker` (no hyphen) has no CNAME left to
  Vercel.
- **Delete Neon project `neon-pink-lamp`** from Vercel → Storage.
- **Delete merged branches** once the default branch is `main`:
  `claude/sync-code-github-8v0z5c` (habit-hacker, after the Vercel project is
  gone — it deploys from it), `claude/push-code-github-hpl0a7` and
  `claude/neon-migration` (tolong-alih).

## Changelog

- **2026-10-08** — Google Analytics adopted, one GA4 property per app (rule 9). Umbrella `/privacy` and `/terms` no longer say there are no analytics scripts and gained an Analytics section. Tolong Alih ships `public/analytics.js` behind an empty `GA_MEASUREMENT_ID` until its property exists.
- **2026-10-07** — Tolong Alih launched toward production: shared header and
  bottom bar, no phone number, bell for alerts, owner-only ads console, Contact
  topics, `privacy.html`, same two footer links on every page; email
  verification required on both Neon branches (it had been off on `uat`).
  Google sign-in moved off Neon's shared credentials to Next Novas OAuth clients
  in one GCP project, one consent screen. Added umbrella `/privacy` and `/terms`
  to the portfolio, platform rule 8, and the no-deletes-on-production rule for
  Tolong Alih. Branch protection is on for `main` and `develop` in
  `tolong-alih`, and the deploy applies the schema (the `NEON_DATABASE_URL`
  environment secrets are set).
- **2026-09-29** — Found `neon-pink-lamp` holds a Payload CMS starter, not
  nothing; corrected. Listed the dashboard-only cleanup under Outstanding.
- **2026-09-29** — Deleted the Cloudflare Access application "All Workers"
  (`all_workers` destination), which put an email-code login in front of every
  Worker on the account; all four app hostnames now load directly. Auth stays
  with each app (Neon Auth for Habit Hacker and Tolong Alih).
- **2026-09-28** — Habit Hacker live on Cloudflare Workers (UAT and prod);
  portfolio Projects card now points at habit-hacker.nextnovas.com. Vercel
  project left for deletion.
- **2026-09-27** — Tolong Alih production moved from Supabase to Neon `main`;
  Supabase fully retired. Habit Hacker ported to Cloudflare Workers with a new
  UAT environment (Neon branch `uat`); cutover from Vercel pending secrets.
- **2026-09-26** — Tolong Alih UAT moved from Supabase to Neon `uat`.
