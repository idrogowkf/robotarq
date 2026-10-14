# Professional Marketplace Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Publish a non-indexable standalone HTML prototype of the approved hybrid robotARQ landing, professional marketplace and onboarding experience for mobile review.

**Architecture:** One self-contained static HTML document owns prototype markup, styles and reversible client interactions. It reuses existing robotARQ demonstration images, contains no network-writing actions and lives at a separate preview path so it cannot replace the current product.

**Tech Stack:** Semantic HTML5, CSS, vanilla JavaScript, existing JPEG demonstration assets, Node test runner.

**Spec:** `docs/superpowers/specs/2026-10-14-hybrid-marketplace-professionals-design.md`

## Global Constraints

- The budget intake remains the visually dominant first action.
- Mobile navigation always displays the complete text `Alta profesional`.
- All people, businesses, metrics and projects are labelled as demonstration content.
- The page uses `noindex, nofollow` and is excluded from the sitemap.
- No form submission, upload, account, email, AI or analytics side effect is allowed.
- Automated assessment is described as assistance for human review, never automatic certification.

## Review Focus

- A 360-pixel viewport must not truncate the professional CTA or create horizontal page overflow.
- Carousel controls must retain keyboard and touch scrolling.
- Prototype buttons must not submit or navigate into production account creation accidentally.
- Demo cards must not look like approved real professionals.
- Wizard state must remain local to the page and contain no uploaded files.

---

### Task 1: Prototype contract tests

**Files:**
- Create: `tests/professional-prototype.test.mjs`

**Interfaces:**
- Consumes: `public/prototipo-marketplace-profesionales/index.html` as UTF-8 text.
- Produces: assertions for mobile CTA copy, noindex, section coverage, demo labelling and no write-capable form actions.

- [x] Write tests and run them to confirm the missing prototype fails.
- [x] Commit together with Task 2 after the implementation turns them green.

### Task 2: Standalone responsive HTML prototype

**Files:**
- Create: `public/prototipo-marketplace-profesionales/index.html`

**Interfaces:**
- Produces: public preview path `/prototipo-marketplace-profesionales/`.

- [x] Build sticky responsive navigation, budget-first hero and professional strip.
- [x] Build marketplace category controls, horizontal card carousel and trust explanation.
- [x] Build interactive eight-stage signup wizard, portfolio gallery, profile preview and administrative review preview.
- [x] Use local demonstration images and accessible labels, focus states and controls.
- [x] Run contract tests, lint-compatible build and responsive browser checks at 360, 390, 768, 1024 and 1440 pixels.
- [x] Commit `feat: add professional marketplace HTML prototype`.

### Task 3: Publish and verify

**Files:**
- Modify: this plan to mark completed tasks.

**Interfaces:**
- Produces: a production preview URL that remains noindex and isolated from live workflows.

- [x] Push the exact commit and deploy production.
- [x] Confirm HTTP 200, noindex, full mobile CTA and zero console errors.
- [x] Verify mobile screenshot and interaction without submitting data.
- [x] Return the direct URL to the user.


