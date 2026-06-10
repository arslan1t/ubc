# UBC — Implementation Plan (audit → MVP)

Goal: take UBC from a content-display site (4.5/10) to a **production-ready community MVP** that matches the vision: find/organize pickup games, find/suggest courts, follow/suggest news, build profiles, and *feel alive*.

Principles: **performance first**, additive DB migrations (safe on live prod), ship vertical slices (each phase is independently shippable), reuse the existing modular structure, no heavy new libraries.

---

## Phase 0 — Cleanup & foundation fixes (fast, zero-risk) ✅ low effort
1. Delete dead code (`components/ui/ubc-logo.tsx`).
2. Resolve `/open-runs` ↔ `/pickup-games` duplication → one canonical route (`/pickup-games`), other redirects.
3. Compress assets: `background.mp4` → poster + encoded ≤1.5 MB (or static hero), news PNGs → WebP, `logo.png` → ~5 KB.
4. Centralize shared types in `@ubc/shared`, stop re-declaring in web.

## Phase 1 — RBAC + Moderation backbone (foundational) 🔑
*Everything in the vision depends on this.*
1. Schema: expand `UserRole` → `GUEST, USER, MODERATOR, ADMIN, SUPER_ADMIN`.
2. New `Submission` model (polymorphic: NEWS | COURT | EVENT | PHOTO | REPORT | RESULT) with `status` (PENDING/APPROVED/REJECTED/CHANGES_REQUESTED), payload JSON, `submittedById`, `reviewedById`, `reviewNote`.
3. API: `moderation` module — list pending by type, approve/reject/request-changes, status tracking.
4. Apply `RolesGuard` consistently; default-deny on publish-level writes.
5. Web: `/admin/moderation` dashboard (queue, filters, actions) — MODERATOR+.

## Phase 2 — User contribution flows
*Turns "read-only users" into contributors.*
1. Suggest a Court (form → Submission → moderation → publish as Court).
2. Suggest News (form → Submission → admin approves → News draft).
3. Report incorrect info (on courts/news → Submission type REPORT).
4. Submit game photos (needs R2 storage wired) → moderation → Photo feed.
5. "My submissions" view in profile with status tracking.

## Phase 3 — Pickup games, complete
1. Add `skillLevel` to `OpenRun`; add `WAITLISTED` to participant status.
2. Waitlist + auto-promotion when a spot frees.
3. Unify the page as a true "Pickup Games" hub (filters: date, court, skill, free/paid).
4. Better game card (skill chip, spots-left ring, waitlist count).

## Phase 4 — Community engine (lightweight, DB-driven) ✨
*Makes the platform feel alive with few users.*
1. `Activity` model + feed (joined game, new court approved, photo posted, news published).
2. Reputation score (points for approved contributions, hosting games) + `Badge` model.
3. Weekly features (cron/manual): Player of the Week, Court of the Week.
4. Leaderboard (top active players), Featured Community Member.
5. Homepage rebuild: hero + live stats ("N games this week") + activity feed + upcoming games/tournaments + featured player + trending courts + intelligent fallbacks so it's **never empty**.

## Phase 5 — Events / Tournaments
1. `Tournament` model (format, dates, location, bracket-lite, registration).
2. Join + organize (→ moderation), submit results.
3. `/events` real page + tournament detail.

## Phase 6 — Design system & mobile polish
1. Consistent card system, spacing scale, typography pass, basketball-culture identity (meaningful motion only).
2. Mobile-first nav (consider bottom tab bar), refined empty/loading/onboarding states.
3. Public player & team profiles.

## Phase 7 — News pro features
Scheduled publication, featured flag, category management UI, lightweight rich-text editor, image upload (R2).

---

## Cross-cutting: storage
Wire Cloudflare R2 (or Vercel Blob as a free alt) early in Phase 2 — photo submission, avatars, and court/news images all depend on it.

## Sequencing rationale
Phase 0 (quick wins) → Phase 1 (unblocks all contribution) → Phase 2 (user value) → Phase 3/4 (engagement) → Phase 5 (tournaments) → Phase 6/7 (polish). Each phase ships independently; the live app keeps working throughout.
