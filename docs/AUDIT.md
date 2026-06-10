# UBC Platform — Production Audit Report

> Date: 2026-06-10 · Auditor: Principal Engineering review · Scope: entire monorepo (`apps/web`, `apps/api`, `packages/shared`, Prisma schema, deployment)

## 0. Executive summary

UBC has a **solid technical foundation** (clean NestJS modular API, typed Prisma schema, Next.js 15 App Router, working auth, live deployment on Vercel + Render). However, against the stated vision — *"the central ecosystem for basketball in Uzbekistan"* — it is currently a **content-display site with ~40% of the navigation leading to dead ends** and **none of the community / contribution / moderation mechanics that the vision requires**.

**Current production-readiness score: 4.5 / 10** (works, deploys, but is feature-incomplete, has dead routes, unoptimized assets, and no moderation/community layer).

---

## 1. Architecture (what exists & is good)

| Area | State | Notes |
|------|-------|-------|
| Monorepo | ✅ Good | Turborepo + pnpm workspaces, clean app/package split |
| API | ✅ Good | NestJS + Fastify, modular (`auth`, `courts`, `news`, `media`, `open-runs`, `users`), global prefix `/api/v1`, versioning |
| DB | ✅ Good | Postgres + Prisma, 9 models, sensible indexes, denormalized rating aggregates |
| Auth | ✅ Works | JWT access+refresh, Google OAuth, Telegram, role guard exists |
| Deploy | ✅ Live | Vercel (web) + Render (API+DB), health endpoint, migrations on boot |
| Shared types | ⚠️ Thin | `packages/shared` exists but underused; web re-declares types locally |

---

## 2. Critical findings (P0 — break the experience)

### 2.1 Broken navigation — 3 of 8 nav links are dead ends
`components/layout/navbar.tsx` links to `/players`, `/ranking`, `/events` — all three are **"Скоро" (coming soon) placeholder pages** (`app/players/page.tsx`, `app/ranking/page.tsx`, `app/events/page.tsx`, 28–29 lines each). A first-time visitor clicking the nav hits a wall **37% of the time**. These are core to the vision (player profiles, leaderboard, tournaments) — they must be **built, not removed**.

### 2.2 Duplicate routing — `/pickup-games` ≡ `/open-runs`
`app/pickup-games/page.tsx` and `app/open-runs/page.tsx` render the **same** `OpenRunsPageContent`. Same for `/pickup-games/create` ≡ `/open-runs/create`. Two URLs for one feature → diluted SEO, confusing UX, double maintenance. The homepage + navbar use `/pickup-games`; `/open-runs` should be a redirect (or removed) and the canonical naming unified.

### 2.3 No moderation / contribution layer (vision-critical, entirely absent)
The vision says *every authenticated user* can suggest news, courts, events, photos, report info, submit results — **all into a moderation queue**. Grep confirms **none of `moderation`, `submission`, `waitlist`, `reputation`, `team` exist** anywhere in the API or schema. Today only an ADMIN can create news; regular users have **zero contribution paths**. This is the single biggest gap between "what's built" and "the vision."

---

## 3. High-priority findings (P1)

### 3.1 RBAC is half-built
- Schema `UserRole` has only **3 roles** (`USER, MODERATOR, ADMIN`); vision requires **5** (`GUEST, USER, MODERATOR, ADMIN, SUPER_ADMIN`).
- `RolesGuard` works but is only applied to **News** endpoints. Courts/Media/OpenRuns have **no role gating** on mutations.
- No moderator/admin UI beyond a single News table. No user management, no court management, no media management, no moderation dashboard.

### 3.2 Pickup games missing core mechanics
`OpenRun` has no **waitlist**, no **skill level** field, and no auto-promotion when a spot frees. `OpenRunParticipant` has `PENDING/APPROVED/REJECTED/CANCELLED` but no `WAITLISTED`.

### 3.3 News system incomplete vs spec
Missing: **scheduled publication**, **featured** flag, **category management UI**, **rich text editor** (currently a raw Markdown `<textarea>`), and **user submission flow**. `News` model has no `isFeatured`, no `scheduledAt`.

### 3.4 No Events / Tournaments domain
`/events` is a placeholder; there is **no `Tournament`/`Event` model or module** at all. Vision requires join + organize tournaments + submit results.

### 3.5 No community engine
None of the 10 requested community features exist (Player/Court of the Week, leaderboards, activity feed, badges, reputation, featured member). No `Activity`, `Badge`, `Reputation`, `WeeklyFeature` models.

---

## 4. Medium-priority findings (P2)

| # | Finding | Evidence |
|---|---------|----------|
| 4.1 | **Dead code** | `components/ui/ubc-logo.tsx` is never imported anywhere |
| 4.2 | **Unoptimized assets** | `background.mp4` = **6.1 MB**, `namangan-1/2/3.png` = **3.2–3.6 MB each**, `logo.png` = **663 KB** for a 40×40 render. ~20 MB of avoidable payload |
| 4.3 | **No real storage** | R2 not configured; all images are local `/public` paths. User photo submission impossible until storage is wired |
| 4.4 | **Type duplication** | Web components re-declare `Court`, `News`, etc. inline instead of importing from `@ubc/shared` |
| 4.5 | **Homepage doesn't feel "alive"** | Shows content lists but no activity signals, stats, or "X games this week" — vision explicitly wants the opposite |
| 4.6 | **Generic empty states** | Loading = skeletons; empty = single grey line of text. No onboarding/CTA when data is sparse |
| 4.7 | **No profile depth** | `profile-content.tsx` exists but there's no public player profile, no stats, no history surfaced to others |

---

## 5. Performance & mobile

- **LCP risk:** 6.1 MB autoplay hero video blocks a fast first paint on mobile/3G. Needs a poster image + smaller/encoded video or a static hero.
- **Image weight:** PNG news images should be WebP/AVIF + sized; `logo.png` should be ~5 KB.
- **Dependencies:** lean (36 web deps, no framer-motion/lodash/moment bloat). ✅ Good — keep it this way.
- **Mobile:** navbar has a working mobile menu and grids are responsive, but the 8-item nav is cramped and there's no bottom-nav pattern for a mobile-first community app.

---

## 6. Security / correctness notes

- CORS now allows any `*.vercel.app` (fine for now; tighten to the canonical domain before public launch).
- `RolesGuard` returns `true` when no roles are set — correct, but means **every non-decorated mutation is open to any logged-in user**; with the contribution model this must flip to "default-deny on writes that publish."
- JWT secrets are Render-generated ✅. Google/Telegram/R2 are optional and now boot-tolerant ✅.

---

## 7. What's genuinely good (keep / build on)

- Clean modular API — easy to extend with `moderation`, `tournaments`, `community` modules.
- Prisma schema is well-indexed and denormalizes rating aggregates correctly.
- Auth + role guard scaffolding is the right shape; just needs more roles + broader application.
- Design tokens (HSL CSS vars, gold `42 72% 47%` on near-black) are a strong, on-brand starting palette.
- Lean dependency footprint and good Lighthouse headroom.

---

## 8. Scorecard (current state)

| Dimension | Score | |
|-----------|:----:|--|
| Architecture & code quality | 7/10 | clean, modular, typed |
| Feature completeness vs vision | 3/10 | content site; no community/moderation |
| Navigation & IA | 4/10 | dead links, duplicate routes |
| Design identity | 5/10 | good tokens, generic execution |
| Performance | 5/10 | heavy hero/images, lean deps |
| Mobile UX | 5/10 | responsive but not mobile-first |
| Security/RBAC | 5/10 | guard exists, narrowly applied |
| **Overall** | **4.5/10** | solid base, far from MVP of the vision |

See `IMPLEMENTATION_PLAN.md` for the phased path to a production-ready MVP.
