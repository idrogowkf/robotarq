# robotARQ Hybrid Marketplace and Professional Onboarding Design

**Date:** 14 October 2026  
**Status:** Design approved in conversation; written specification awaiting review  
**Product:** robotARQ Spain

## Purpose

robotARQ will operate as a two-sided construction platform. Its primary entry point remains the project description and budget engine. Its second, clearly visible function is a professional marketplace where companies, trades and technicians can create reviewed public profiles and receive opportunities backed by a defined scope and preliminary budget.

The redesign must make professional participation discoverable without competing with the main conversion: generating a budget. The public experience must feel warmer, more visual and more credible than the current text-heavy landing.

## Reference Pattern

The product synthesises, without copying, four public marketplace patterns:

- Thumbtack: clear separation between customers hiring and professionals growing their business.
- Houzz: visual project galleries and rich professional profiles.
- Checkatrade: staged vetting before a profile becomes public.
- Bark: lead preferences, geographic coverage and profile completion guidance.

The result must use robotARQ's existing visual language and its distinctive advantage: each opportunity can originate from a structured budget with chapters, quantities, assumptions and exclusions.

## Delivery Sequence

The first deliverable is an isolated responsive HTML prototype. It will be published at a separate non-indexable preview URL and will not replace the current production landing. It must use fictional content explicitly labelled as a demonstration and must not submit forms, create accounts, send email or store files.

After prototype approval, implementation will be divided into separately testable releases:

1. Public hybrid landing and marketplace discovery.
2. Professional onboarding and media upload.
3. Automated assessment and administrative review.
4. Public profile pages, project galleries and lead preferences.

## Information Architecture

### Global navigation

Desktop navigation contains:

- robotARQ logo.
- Generate budget, visually primary.
- Find professionals.
- My budgets.
- Professional signup, rendered as an outlined secondary CTA.

Mobile navigation must always display the complete label **“Alta profesional”**. It must never collapse to the ambiguous text “Dar de alta”. The budget CTA remains visually stronger through position and colour. Less frequent destinations move into a compact menu.

### Hybrid home page

The home page follows this order:

1. Hero and full budget intake.
2. Compact professional acquisition strip within the first viewport or immediately after the intake.
3. Scrollable example of the robotARQ budget output.
4. Explanation of the customer flow.
5. Visual professional marketplace with category filters and horizontally scrollable profile cards on mobile.
6. Professional value proposition and verification process.
7. Budget category pages and final customer CTA.

The hero preserves at least two thirds of the initial visual weight for customer budgeting. Professional acquisition is present but does not split the hero into equal competing panels.

### Marketplace discovery

The prototype demonstrates:

- Search by service, province or postcode.
- Category chips for renovations, construction, technical architecture, electricity, plumbing, hospitality and industrial work.
- Professional cards with cover image, logo or portrait, business name, specialties, location, verification state and project count.
- Clear empty, loading and unavailable states.
- A prominent route to professional signup.

No profile may display fabricated ratings, reviews, response times, project counts or verification badges. Prototype cards use an explicit “Demonstration profile” label. Production cards display only stored, reviewed facts.

## Professional Profile

A public profile contains these sections when the corresponding reviewed information exists:

- Cover image, logo or portrait and business identity.
- Verification badges with a visible explanation of what each badge means.
- Description and differentiating proposition.
- Services and specialties.
- Geographic coverage and travel radius.
- Availability and preferred project types.
- Project gallery with cover, captions, location at province level, year, scope and services performed.
- Qualifications, professional registrations, accreditations and insurance status.
- Website and approved external references.
- Reviews tied to a completed robotARQ interaction when that subsystem exists.
- CTA to request contact using a robotARQ project file.

Private contact, tax and identity information never appears in the public profile.

## Staged Professional Onboarding

The signup experience is a resumable wizard with progress, save state and a profile preview. A professional account remains private until review.

### Stage 1: Account and representative

- Email, phone and password confirmation.
- Representative name and role.
- Email and phone verification state.
- Privacy acceptance and marketplace conditions.

### Stage 2: Business identity

- Trading name and legal name.
- Self-employed professional or company classification.
- NIF/CIF stored privately.
- Registered or trading address stored privately.
- Website and public social links.
- Year established, team size and languages.

### Stage 3: Services and coverage

- Structured categories and subcategories rather than free-text-only specialties.
- Provinces, postcodes and optional travel radius.
- Residential, commercial, hospitality, industrial or public-work preferences.
- Minimum and maximum project size as optional lead preferences, never presented as a guarantee.

### Stage 4: Experience and availability

- Years of experience.
- Team and subcontracting description.
- Typical availability.
- Services not offered.
- Short public introduction with guidance and character limit.

### Stage 5: Portfolio

- Logo or representative image.
- Cover image.
- At least one project album recommended before publication.
- Multiple images per project, sortable by the professional.
- Project title, year, province, scope, services and caption.
- Optional before/after pairing clearly labelled by the uploader.
- Rights declaration confirming permission to publish the media.

### Stage 6: Trust documentation

- Identity document for the representative, private.
- Proof of trading address, private.
- Insurance document and expiry date when applicable.
- Professional registrations, qualifications and certificates when applicable.
- Company or self-employment evidence.
- The interface must distinguish required, category-dependent and optional documents.

### Stage 7: Lead preferences

- Services and territories for notifications.
- Desired project types and value bands.
- Notification channels.
- Temporary pause without deleting the profile.

### Stage 8: Preview and submission

- Public-profile preview.
- Completion checklist.
- Missing or contradictory field warnings.
- Submission places the application in `pending_assessment`.

## Media Pipeline

Uploads go directly to private object storage through signed upload grants. The application server records ownership and metadata but does not proxy large files.

For each image the pipeline must:

1. Check allowed MIME type and actual file signature.
2. Enforce per-file and per-profile limits.
3. Strip EXIF and location metadata.
4. Normalise orientation and colour space.
5. Generate responsive WebP or AVIF display variants and thumbnails.
6. Calculate a content hash for duplicate detection.
7. Run automated safety, relevance and quality assessment.
8. Keep originals and derivatives private until profile approval.

The automated assessment may flag low resolution, screenshots, watermarks, contact details embedded in images, unrelated content, duplicate images or potentially unsafe content. It must not claim that an image proves authorship or professional quality.

Documents use a separate private pipeline and are never passed into public image galleries.

## Hybrid Verification

Automated analysis assists a human administrator and never grants the public “verified” state by itself.

### Automated assessment

The system produces a structured report containing:

- Profile completeness.
- Missing required or category-dependent fields.
- Inconsistencies between business fields and uploaded documents.
- Duplicate email, telephone, tax identifier, website or media signals.
- Document expiry warnings.
- Image relevance and moderation flags.
- Public-source references that an administrator may inspect.
- Risk flags with evidence and confidence, without definitive accusations.

### Administrative decision

An administrator can:

- Approve the profile.
- Request corrections with field-specific comments.
- Reject the application with an internal reason and an applicant-facing explanation.
- Suspend an active profile.
- Reopen assessment when documents expire or material information changes.

Approval is granular. Identity, business, insurance, qualification and portfolio checks have separate states and timestamps. Public badges describe exactly the completed check and its date.

### Notifications

On submission:

- The applicant receives an acknowledgement and can see the application state.
- The administrator receives a branded email with the applicant name, main specialty, location, completeness result, risk flags and a secure link to the review record.
- The email contains no identity-document images or passwords.

Correction requests and final decisions produce applicant notifications and remain in the audit history.

## Administrative Centre

The professional review area contains:

- Queue counters for new, flagged, awaiting correction, approved, suspended and expiring applications.
- Search and filters by status, specialty, province, completeness and risk.
- Application detail with public preview, private fields, media, documents and automated report.
- Side-by-side document and claimed-data comparison.
- Field-specific comments and correction requests.
- Decision history with actor, date and reason.
- Expiry reminders for insurance and time-limited credentials.

Only authenticated administrators can access private application material. Sensitive files use short-lived authorised downloads and are excluded from analytics and search indexing.

## Data and Status Model

The professional profile lifecycle is:

`draft → pending_assessment → pending_review → changes_requested → approved → suspended`

Rejected applications use `rejected`; withdrawn applications use `withdrawn`. An approved profile can return to `pending_review` after material edits or credential expiry.

Media lifecycle is:

`uploaded_private → processing → ready_for_review → approved_public` or `rejected`.

Each assessment result is versioned against the exact profile and files reviewed. Later edits create a new version rather than silently changing approved evidence.

## Privacy and Spanish Market Constraints

- Apply data minimisation and separate public profile data from private vetting data.
- Explain purposes, retention and deletion for identity and business documents.
- Do not expose NIF/CIF, private address, identity documents, insurance documents, personal email or telephone by default.
- A format-valid NIF/CIF is not presented as verified identity.
- Regulated qualifications are checked only against an appropriate source or by documented manual review.
- Automated findings remain recommendations for the administrator and must be explainable to the applicant when they affect a decision.

## Prototype Requirements

The standalone HTML prototype must demonstrate:

- Desktop and mobile navigation, including the full “Alta profesional” label.
- Budget-first hero and non-competing professional CTA.
- Marketplace categories, professional carousel and profile cards.
- Professional value proposition and verification explanation.
- A complete visual onboarding wizard, including portfolio and document stages.
- Public profile preview with gallery.
- Administrative assessment preview showing completeness and review flags.
- Responsive layouts at 360, 390, 768, 1024 and 1440 CSS pixels.
- Keyboard-visible focus, semantic headings, labelled fields and sufficient contrast.

The prototype contains no working submission, account creation, AI call, upload, email or analytics event. All sample names, projects and images are explicitly fictional or generic demonstration assets.

## Acceptance Criteria

- A mobile user can read “Alta profesional” in the global navigation without opening a menu.
- The budget prompt and CTA remain the dominant first action.
- A professional can understand the benefit, verification process and required materials before starting signup.
- The mock onboarding covers identity, business, services, coverage, portfolio, credentials, preferences and preview.
- The profile design provides visual proof through project galleries without fabricated social proof.
- Automated assessment is presented as administrative assistance, not automatic certification.
- No private or unreviewed content is shown as public.
- The prototype is accessible through a separate `noindex` URL and can be reviewed on a phone.

