# Spain SEO Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish a coherent Spain-focused SEO architecture covering budgets, professional discovery and professional acquisition.

**Architecture:** A typed SEO registry owns all generated commercial pages and feeds metadata, rendering, internal linking and the sitemap. Static hubs connect the registry into three user journeys, while private routes remain excluded.

**Tech Stack:** Next.js 16 App Router, React 19, Node test runner, Vercel.

**Spec:** `docs/superpowers/specs/2026-10-20-spain-seo-architecture-design.md`

## Global Constraints

- All public search content targets Spain and uses EUR.
- Never fabricate providers, ratings, local prices, addresses or regulatory claims.
- Keep existing public URLs stable.
- City pages remain non-indexable until supported by unique evidence.

## Review Focus

- A sitemap URL that redirects, 404s or declares another canonical.
- A private account route entering the sitemap.
- Generated pages whose main sections are identical.
- A new page with no internal path from a hub.
- Structured data that claims an unverified local business or review.

---

### Task 1: Technical indexation contract

**Files:** Modify `app/sitemap.js`, `app/robots.txt/route.js`, `app/layout.jsx`; test `tests/seo.test.mjs`.

- [ ] Write failing assertions for private-route exclusion, unique sitemap URLs, Spain metadata and valid robots rules.
- [ ] Run the SEO tests and confirm failure.
- [ ] Implement the metadata, robots and sitemap contract.
- [ ] Run the SEO tests and commit.

### Task 2: Cluster registry and differentiated pages

**Files:** Modify `lib/seo-pages.mjs`, `components/seo/BudgetLanding.jsx`, `components/seo/ProfessionalLanding.jsx`, `components/seo/SeoJsonLd.jsx`; test `tests/seo.test.mjs`.

- [ ] Write failing assertions for cluster ownership, specific sections and minimum authored depth.
- [ ] Run the tests and confirm failure.
- [ ] Extend the registry and render project/trade-specific content.
- [ ] Run the tests and commit.

### Task 3: Search hubs and internal linking

**Files:** Create `app/presupuestos/page.jsx`, `app/guias/page.jsx`; modify `app/presupuesto-reforma/page.jsx`, `components/Header.jsx`, `components/Footer.jsx`, `app/page.jsx`; test `tests/seo.test.mjs`.

- [ ] Write failing assertions for all hubs and links.
- [ ] Run the tests and confirm failure.
- [ ] Implement the hubs and navigation.
- [ ] Run the tests and commit.

### Task 4: Priority search landings

**Files:** Modify `lib/seo-pages.mjs`; test `tests/seo.test.mjs`.

- [ ] Write failing assertions for the approved high-intent slugs and unique content fields.
- [ ] Run the tests and confirm failure.
- [ ] Add only pages with distinct, supportable content.
- [ ] Run the tests and commit.

### Task 5: Release and production crawl

**Files:** Modify defects found by verification; test all affected suites.

- [ ] Run SEO tests, full tests, lint and production build.
- [ ] Review the complete branch and repair important findings with a failing test first.
- [ ] Deploy to production.
- [ ] Crawl every production sitemap URL and verify 200, self-canonical, indexable metadata, one H1 and structured data.
