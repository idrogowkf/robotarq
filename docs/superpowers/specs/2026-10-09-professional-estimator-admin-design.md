# robotARQ Professional Estimator and Administration Design

## Objective

Restore robotARQ as a natural-language construction budgeting product. A visitor describes any construction or renovation project in ordinary Spanish, receives a technically structured preliminary estimate, identifies themselves before downloading documents, and creates an administrative case that the owner can review securely.

## Natural-language interpretation

All non-empty requests up to 8,000 characters reach the configured language model. Regexes may normalize obvious units but cannot decide whether a project is supported. The interpreter accepts written units such as “metros cuadrados”, common abbreviations, spelling mistakes, colloquial phrasing and unusual projects.

The model returns a structured project brief: project type, location, measurements, scope, quality, assumptions, missing critical data and requested work. If critical information prevents a meaningful quantity or price, the result contains focused clarification questions. Otherwise it produces a preliminary budget. Server code validates units, limits and coverage and recalculates every amount.

## Budget result

The result contains a project narrative, assumptions, exclusions, confidence, three market scenarios (economical, expected and upper), chapters, detailed line items and totals. The three scenarios are price ranges, not fabricated named suppliers. Prices are dated, preliminary references unless a real source is attached.

The interface presents a professional preview. It does not expose PDF or XLSX download actions until the visitor submits name, email, telephone, privacy acceptance and their assistance preference.

## Case creation and delivery

Submitting the visitor form creates an immutable case snapshot with a UUID, timestamp, client data, request, normalized project brief and validated budget. The snapshot is saved in Vercel Blob under `cases/<year>/<month>/<uuid>.json`. PDF and XLSX are generated from the saved snapshot, stored beside it and returned through a signed case download endpoint.

The owner receives one administrative email containing the client, assistance preference, case reference, summary, total and admin link. The client receives a confirmation with case reference and download links. A client who selects “solo descargar” is recorded with that status; a client requesting help is recorded as a new technical lead.

## Professional documents

The PDF follows the information hierarchy of a professional measurement and budget report: branded cover, case/client/project identification, interpreted project narrative, market range, assumptions, chapter summaries, detailed measurements, unit prices, chapter subtotals, cost summary, taxes/exclusions, legal note and page numbering. The XLSX mirrors the same snapshot with Summary, Chapters, Measurements, Assumptions and Client sheets. Both documents use the exact same validated numbers.

## Administration center

The footer links to `/administracion`. Authentication uses `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET`; successful login creates a signed, HttpOnly, SameSite=Strict session cookie. Login is rate-limited. All admin pages and APIs verify the session server-side.

The dashboard lists Blob cases with filters for text, date, project type, city, assistance status and workflow state. A case detail shows client data, request, narrative, assumptions, line items, totals, stored files and event dates. The administrator can change workflow status and notes, download documents, export the current case list as CSV, and anonymize a case. Every mutation writes an updated snapshot with an audit event.

## Privacy and retention

The privacy page describes AI processing, owner notifications, Blob storage, document delivery and administrative access. Personal data is excluded from the AI prompt. Cases have a default 12-month retention statement. Anonymization removes client identifiers while preserving aggregate technical and financial data.

## Failure behavior

If AI is unavailable, the UI reports that interpretation is temporarily unavailable and preserves the entered text. It does not invent a successful budget. If persistence or email delivery fails, no download is unlocked and the user receives a recoverable error. Documents are created from the stored server snapshot, never from client-supplied totals.

## Acceptance

- “Necesito una vivienda unifamiliar aislada tipo chalet de 60 metros cuadrados” reaches AI and produces a structured result or focused project question without demanding `m2`.
- Unusual but intelligible scopes also reach AI.
- PDF/XLSX remain unavailable before valid client submission.
- A valid submission persists a retrievable case, notifies owner/client, and unlocks both files.
- Admin login rejects invalid credentials and protected APIs reject anonymous access.
- Admin can list, inspect, filter, update and anonymize cases.
- PDF and XLSX totals match the stored case exactly.

