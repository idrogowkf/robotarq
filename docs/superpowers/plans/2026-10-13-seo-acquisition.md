# robotARQ SEO Acquisition Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the P0–P3 organic acquisition architecture defined in the approved SEO specification.

**Architecture:** A central server-safe SEO registry owns every indexable route, metadata, hierarchy, estimator preset and sitemap date. Reusable server components render unique budget, professional and evidence-gated local pages from authored registry entries; automated tests enforce publication gates and prevent private, legal or duplicate pages from entering the sitemap.

**Tech Stack:** Next.js App Router, React server components, Node test runner, JSON-LD, Vercel Analytics.

**Spec:** `docs/superpowers/specs/2026-10-13-seo-acquisition-architecture-design.md`

## Global Constraints

- No fabricated prices, reviews, provider counts, response times, success rates or regulatory claims.
- An indexable page requires unique metadata, original content/example, distinct estimator preset, useful internal links and a working CTA.
- Private, account, password, administration, legal-noindex and incomplete pages stay outside the sitemap.
- Local pages publish only when their registry entry contains distinct local evidence and authoritative public references.
- Analytics must not contain project descriptions or personal data.

## Review Focus

- Duplicate registry slugs or metadata must fail tests rather than emit competing canonicals.
- Empty professional categories must never render invented profiles or misleading availability.
- Missing local evidence must keep a candidate route noindex and out of the sitemap.
- Estimator presets must preserve ordinary Spanish text and URL encoding.
- Legal and private routes must remain excluded after registry expansion.

---

### Task 1: SEO registry and publication gates

**Files:**
- Create: `lib/seo-pages.mjs`
- Create: `tests/seo.test.mjs`
- Modify: `app/sitemap.js`

**Interfaces:**
- Produces: `SEO_PAGES`, `getSeoPage(slug)`, `getIndexableSeoPages()`, `buildSitemapEntries()`.

- [ ] Write failing tests for unique slug/title/description/canonical/H1, indexability gates, legal/private exclusion, distinct presets and owned last-modified dates.
- [ ] Run `node --test tests/seo.test.mjs`; expect missing-module failure.
- [ ] Implement the registry with all core, 15 budget, 8 professional and evidence-gated local candidates.
- [ ] Generate sitemap entries from the registry.
- [ ] Run the SEO tests; expect all pass.
- [ ] Commit `feat: centralize SEO publication registry`.

### Task 2: Reusable page renderers and structured data

**Files:**
- Create: `components/seo/Breadcrumbs.jsx`
- Create: `components/seo/BudgetLanding.jsx`
- Create: `components/seo/ProfessionalLanding.jsx`
- Create: `components/seo/SeoJsonLd.jsx`
- Modify: `tests/seo.test.mjs`

**Interfaces:**
- Consumes: `getSeoPage(slug)`.
- Produces: reusable server-rendered templates with Service, BreadcrumbList and visible FAQ schema parity.

- [ ] Add failing structural tests for breadcrumbs, visible FAQ/schema parity, minimum internal links and preset CTAs.
- [ ] Run tests and confirm expected failures.
- [ ] Implement focused reusable renderers without client-only content dependencies.
- [ ] Run tests and confirm pass.
- [ ] Commit `feat: add SEO landing renderers and schema`.

### Task 3: P0 foundation and existing hubs

**Files:**
- Modify: `app/estimador/layout.jsx`
- Modify: `app/estimador/page.jsx`
- Modify: `app/presupuesto-reforma/page.jsx`
- Modify: `app/reformas-viviendas/page.jsx`
- Modify: `app/reformas-locales/page.jsx`
- Modify: `app/reformas-hosteleria/page.jsx`
- Modify: `app/privacidad/page.jsx`
- Modify: `app/condiciones/page.jsx`
- Modify: `app/page.jsx`
- Modify: `tests/seo.test.mjs`

**Interfaces:**
- Consumes registry clusters and renderer links.
- Produces strengthened hubs, WebApplication schema and legal noindex.

- [ ] Add failing tests for estimator metadata/schema, hub child coverage and legal noindex.
- [ ] Run and verify failures.
- [ ] Expand estimator and hubs with indexable explanations, methodology and links; add legal noindex.
- [ ] Run tests and build.
- [ ] Commit `feat: strengthen SEO foundations and hubs`.

### Task 4: P1 budget and professional coverage

**Files:**
- Create: `app/[slug]/page.jsx`
- Modify: `lib/seo-pages.mjs`
- Modify: `tests/seo.test.mjs`

**Interfaces:**
- Consumes: budget/professional registry entries and renderers.
- Produces: 23 authored commercial routes with page-specific metadata and presets.

- [ ] Add failing tests that every approved budget/professional slug renders through the correct template and has unique substantive sections.
- [ ] Run and verify failures.
- [ ] Implement the dynamic public route with `generateStaticParams`, `generateMetadata`, strict registry lookup and `notFound()` for unknown/incomplete entries.
- [ ] Complete unique authored registry content for all 23 routes.
- [ ] Run tests, build and crawl every route.
- [ ] Commit `feat: publish budget and execution SEO clusters`.

### Task 5: P2 trust, conversion and measurement

**Files:**
- Create: `components/seo/Methodology.jsx`
- Modify: `components/Analytics.jsx`
- Modify: `components/HomeIntake.jsx`
- Modify: `components/CaseCaptureForm.jsx`
- Modify: `components/ProfessionalReviewAction.jsx`
- Modify: `tests/seo.test.mjs`

**Interfaces:**
- Produces: dated methodology blocks and privacy-safe funnel events.

- [ ] Add failing tests for methodology provenance labels and analytics payload allowlist.
- [ ] Run and verify failures.
- [ ] Implement visible methodology, limitations and event names without free text or personal fields.
- [ ] Run tests and build.
- [ ] Commit `feat: add SEO trust content and funnel measurement`.

### Task 6: P3 controlled local and long-tail expansion

**Files:**
- Modify: `lib/seo-pages.mjs`
- Modify: `app/[slug]/page.jsx`
- Modify: `tests/seo.test.mjs`

**Interfaces:**
- Consumes: registry publication gates.
- Produces: only evidence-complete local pages; long-tail candidates remain noindex until demand threshold data exists.

- [ ] Add failing tests proving incomplete candidates cannot enter static params or sitemap and evidence-complete candidates can.
- [ ] Run and verify failures.
- [ ] Author and publish only local candidates supported by authoritative municipal/public references and unique regional content.
- [ ] Register long-tail candidates as unpublished with explicit evidence requirements.
- [ ] Run tests, build and crawl.
- [ ] Commit `feat: add evidence-gated local SEO expansion`.

### Task 7: Full verification and production release

**Files:**
- Create: `scripts/audit-seo.mjs`
- Modify: `package.json`
- Update: `docs/superpowers/plans/2026-10-13-seo-acquisition.md` progress checkboxes.

**Interfaces:**
- Produces: repeatable production-style crawl and final deployment evidence.

- [ ] Add a crawl script that verifies status, canonical, title, description, H1, robots, schema and internal links for registry pages.
- [ ] Run `node --test tests/*.test.mjs`, `npm run lint`, `npm run build` and the SEO crawl against the production build.
- [ ] Perform a whole-branch code review and fix Critical/Important findings with RED→GREEN tests.
- [ ] Commit `test: add complete SEO acquisition verification`.
- [ ] Push, deploy production, fetch live robots/sitemap and crawl all published routes.
- [ ] Confirm no email, lead, account or paid API side effect was triggered by verification.
