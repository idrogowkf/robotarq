# Professional Estimator and Administration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build unrestricted Spanish project interpretation, professional gated documents, persisted client cases and a protected administration center.

**Architecture:** A structured AI interpreter feeds a server-owned validation and calculation layer. Validated snapshots are persisted in Vercel Blob, documents and email are derived from those snapshots, and signed-cookie admin routes expose case management.

**Tech Stack:** Next.js 16, React 19, OpenAI HTTP API, Vercel Blob, Resend, pdf-lib, ExcelJS, Node crypto.

**Spec:** `docs/superpowers/specs/2026-10-09-professional-estimator-admin-design.md`

## Global Constraints

- All non-empty requests up to 8,000 characters reach AI; regex cannot reject project intent.
- Server recalculates all amounts and never trusts client totals.
- Downloads require a persisted client case.
- Personal client data is never placed in the AI prompt.
- Admin session is signed, HttpOnly and SameSite=Strict.
- Failure cannot masquerade as a successful budget.

## Review Focus

- Written and misspelled units must reach interpretation and retain the intended area.
- Unusual scopes must reach AI instead of a residential fallback.
- Forged budgets and case IDs must not unlock documents.
- Blob or email failure must not produce a success state.
- Anonymous requests must not expose admin data or case documents.

---

### Task 1: Structured interpretation and validation

**Files:**
- Create: `lib/project-schema.mjs`
- Create: `lib/ai-estimator.mjs`
- Modify: `app/api/estimate/route.js`
- Modify: `tests/unit.test.mjs`
- Modify: `tests/flow.test.mjs`

**Interfaces:**
- Produces: `interpretProject(input, { generate, timeoutMs })`, `validateEstimate(raw, input)` and an API response containing `project`, `budget`, `market`, `warnings`.

- [ ] Add failing tests for written units, unusual projects, missing critical data, provider failure and recalculated totals.
- [ ] Run the focused tests and confirm failure.
- [ ] Implement model-first interpretation, strict schema normalization and server calculations.
- [ ] Update the estimate route and remove intent gating from the request path.
- [ ] Run unit and HTTP flow tests and commit.

### Task 2: Persistent case store and secure case creation

**Files:**
- Create: `lib/cases.mjs`
- Create: `app/api/cases/route.js`
- Create: `app/api/cases/[id]/download/[format]/route.js`
- Modify: `lib/contact.mjs`
- Modify: `tests/unit.test.mjs`
- Modify: `tests/flow.test.mjs`

**Interfaces:**
- Consumes: validated estimate response from Task 1.
- Produces: `createCase`, `getCase`, `listCases`, `updateCase`, `anonymizeCase`; POST `/api/cases`; authenticated case download URLs.

- [ ] Add failing tests for immutable server snapshots, forged totals, persistence failure and download authorization.
- [ ] Run focused tests and confirm failure.
- [ ] Implement Blob adapter with injectable in-memory test adapter.
- [ ] Implement case creation, client/owner delivery and signed download grants.
- [ ] Run tests and commit.

### Task 3: Presto-style PDF and workbook

**Files:**
- Modify: `lib/documents.mjs`
- Modify: `app/api/export/pdf/route.js`
- Modify: `app/api/export/xlsx/route.js`
- Modify: `tests/flow.test.mjs`

**Interfaces:**
- Consumes: stored case snapshot from Task 2.
- Produces: `professionalPdf(caseData)` and `professionalWorkbook(caseData)`.

- [ ] Add failing tests for cover, narrative, scenarios, chapter summary, measurements, client section, pagination and matching totals.
- [ ] Run focused tests and confirm failure.
- [ ] Implement professional layouts from the case snapshot.
- [ ] Verify PDF text and workbook sheets/cells, then commit.

### Task 4: Customer preview and gated download journey

**Files:**
- Modify: `app/estimador/EstimadorClient.jsx`
- Create: `components/BudgetPreview.jsx`
- Create: `components/CaseCaptureForm.jsx`
- Modify: `app/globals.css`
- Modify: `tests/flow.test.mjs`

**Interfaces:**
- Consumes: estimate response and POST `/api/cases`.
- Produces: professional preview and download buttons only after case creation.

- [ ] Add failing API journey checks for pre-submission denial and post-submission availability.
- [ ] Implement narrative, scenarios, summaries, details and the gated form.
- [ ] Add “solo descargar” and “solicitar asistencia” modes.
- [ ] Verify keyboard, mobile layout and error recovery, then commit.

### Task 5: Administration authentication and dashboard

**Files:**
- Create: `lib/admin-auth.mjs`
- Create: `app/administracion/page.jsx`
- Create: `app/administracion/login/page.jsx`
- Create: `app/administracion/[id]/page.jsx`
- Create: `app/api/admin/login/route.js`
- Create: `app/api/admin/logout/route.js`
- Create: `app/api/admin/cases/route.js`
- Create: `app/api/admin/cases/[id]/route.js`
- Create: `components/AdminDashboard.jsx`
- Modify: `components/Footer.jsx`
- Modify: `tests/flow.test.mjs`

**Interfaces:**
- Consumes: case store from Task 2.
- Produces: signed session verification, list/filter/detail/update/anonymize/CSV administration operations.

- [ ] Add failing tests for login, rate limiting, anonymous denial, filtering, update and anonymization.
- [ ] Implement constant-time password verification and signed session cookies.
- [ ] Implement dashboard and case detail UI.
- [ ] Add footer entry and noindex metadata.
- [ ] Run tests and commit.

### Task 6: Privacy, production configuration and end-to-end verification

**Files:**
- Modify: `app/privacidad/page.jsx`
- Modify: `README.md`
- Modify: `tests/flow.test.mjs`

**Interfaces:**
- Consumes: all prior tasks.
- Produces: documented environment and verified production journey.

- [ ] Add privacy and route smoke assertions.
- [ ] Update retention, AI, storage, email and admin disclosures.
- [ ] Generate and set production admin secrets without printing secret values.
- [ ] Run build, lint, audit and the complete suite locally.
- [ ] Perform adversarial review, fix findings, deploy and rerun the complete journey on production.

