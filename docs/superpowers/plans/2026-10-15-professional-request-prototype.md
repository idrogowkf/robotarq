# Professional Request Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an isolated, clickable HTML prototype for direct professional requests and administrative handling.

**Architecture:** A self-contained static HTML document owns presentation and local-only interaction state. Dedicated project assets provide unique trade photography. A source-level test fixes the required screens, copy, pricing and non-production warning.

**Tech Stack:** HTML, CSS, browser JavaScript, Node test runner.

**Spec:** `docs/superpowers/specs/2026-10-15-professional-request-prototype-design.md`

## Global Constraints

- Do not modify or deploy the production experience.
- Do not transmit, persist, email or charge any submitted data.
- Use one distinct photograph for each trade.
- Present specialties, not invented businesses.
- The managed-search activation price is 14.90 EUR after candidate availability is confirmed.

## Review Focus

- Mobile viewport must keep the wizard and admin tables usable.
- Back/next navigation must preserve entered values.
- Submission must visibly remain a simulation.
- The admin search must show why each candidate matched.
- No card may route to the budget estimator.

---

### Task 1: Prototype contract

**Files:**
- Create: `tests/professional-request-prototype.test.mjs`
- Create: `public/prototipos/solicitud-profesional/index.html`

**Interfaces:**
- Produces: a static route at `/prototipos/solicitud-profesional/index.html`.

- [ ] Write a failing source test asserting the wizard stages, unique assets, 14.90 EUR model, separated admin queues and simulation notice.
- [ ] Run the focused test and confirm it fails because the HTML does not exist.
- [ ] Implement the self-contained HTML, responsive CSS and local-only JavaScript.
- [ ] Run the focused test and full suite.
- [ ] Open the prototype and verify customer and administrator paths at desktop and mobile sizes.

### Task 2: Trade photography

**Files:**
- Create: `public/assets/prototype-professional/*.webp`

**Interfaces:**
- Produces: five unique visual assets referenced by the prototype.

- [ ] Generate natural Spain-context photography for each specialty.
- [ ] Optimize every image to WebP.
- [ ] Confirm every card references a different asset and every file loads.

### Task 3: Delivery

**Files:**
- Modify: none in production routes.

**Interfaces:**
- Produces: a preview-only deployment URL and browser deliverable.

- [ ] Build the application and run all tests.
- [ ] Deploy a Vercel preview without the production flag.
- [ ] Verify the entire click path in the preview.
- [ ] Leave the prototype open for review and report the preview URL.
