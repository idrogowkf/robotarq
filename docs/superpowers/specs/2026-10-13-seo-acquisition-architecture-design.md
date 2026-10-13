# robotARQ SEO and organic acquisition architecture

**Date:** 2026-10-13
**Status:** Proposed for implementation

## Objective

Build an indexable acquisition system for Spain that connects three user intents: estimate project cost, understand technical scope, and find suitable professionals to execute it. Increase qualified non-brand impressions and leads without duplicated, thin, or doorway pages.

## Verified baseline

- Production robots.txt allows crawling and declares the sitemap.
- The sitemap contains 13 public URLs; audited URLs return 200 with self-referencing canonical and one H1.
- HTTP, www, trailing slash and the retired /reformas-bares route redirect correctly.
- The attached six-month Search Console export ending 2026-10-08 contains 7 clicks and 61 impressions for the home page; visible queries are branded or brand-confusion queries. Spain contributed 1 click and 9 impressions.
- Current commercial pages contain roughly 100–513 rendered words. Estimator metadata understates the current product scope.
- Live Search Console inspection is unavailable because the connected GSC Wizard subscription has expired. Current indexing remains unverified.

## Information architecture

### Core pages

Retain and strengthen /, /estimador, /presupuesto-reforma, /profesionales and /profesionales/alta.

### Budget intent cluster

Create authored pages with distinct scope, pricing factors, example chapters, technical questions, exclusions, FAQs and estimator presets:

1. /presupuesto-reforma-integral
2. /presupuesto-reforma-cocina
3. /presupuesto-reforma-bano
4. /presupuesto-reforma-local-comercial
5. /presupuesto-reforma-bar-restaurante
6. /presupuesto-reforma-oficina
7. /presupuesto-construccion-casa
8. /presupuesto-casa-prefabricada
9. /presupuesto-nave-industrial
10. /presupuesto-piscina
11. /presupuesto-fachada
12. /presupuesto-instalacion-electrica
13. /presupuesto-fontaneria
14. /presupuesto-pintura
15. /presupuesto-suelo-alicatado

Existing /reformas-viviendas, /reformas-locales and /reformas-hosteleria become category hubs. Existing URLs remain canonical to themselves unless content becomes equivalent.

### Execution and professional cluster

Create /empresas-reformas, /constructoras, /arquitectos-tecnicos, /contratistas-obra, /instaladores-electricistas, /fontaneros, /empresas-reformas-locales and /empresas-construccion-industrial.

Pages may show only real approved profiles. Empty categories explain the qualification workflow and link to the estimator; they never invent professionals or testimonials.

### Local cluster

Prepare a controlled set for Madrid, Barcelona, Valencia, Sevilla, Málaga, Zaragoza, Alicante and Bilbao. Each page requires original local copy, cost drivers, authoritative permitting links, real providers when present and a preconfigured estimator CTA. Pages with no original local evidence remain unpublished and excluded from sitemap.

Candidate combinations are empresas-reformas-en-{city}, presupuesto-reforma-integral-en-{city} and constructoras-en-{city}, with a maximum of 24 candidates gated individually.

### Long-tail expansion

P3 is data-driven. Add pages only when Search Console shows a recurring non-brand query family or estimator logs contain at least five valid projects of the same scope. Candidate families include roof, terrace, accessibility, energy refurbishment, demolition, retaining walls, tanks, cabins, warehouses and modular construction. No generic combinatorial route generator will be indexable.

## Page design

Every transactional page contains a specific H1, immediate preset CTA, dated orientative range and variables, internally consistent chapter example, technical decisions robotARQ will ask, inclusions and exclusions, execution workflow, visible FAQs, useful internal links and final estimator CTA.

No fabricated market prices, reviews, provider counts, response times, success rates or regulatory claims are permitted.

## Technical SEO

- Centralize pages in one SEO registry with owned last-modified dates.
- Sitemap contains canonical, indexable, 200-status pages only.
- Remove privacy and terms from sitemap and set both noindex, follow.
- Keep account, password, administration and private professional routes noindex and outside sitemap.
- Add page-specific title, description, canonical, Open Graph and social metadata.
- Add WebApplication schema to /estimador, Service to transactional/execution pages, BreadcrumbList to cluster pages, FAQPage only for visibly rendered FAQs, and ItemList only for real approved profiles.
- Add automated checks for sitemap membership, canonical and metadata uniqueness, one H1, internal links, schema structure and private-route exclusion.

## Internal linking

Home links to the five highest-value budget pages and directory hubs. /presupuesto-reforma links to all budget pages. Category hubs link to transactional children and relevant professional pages. Every child links to its parent, related scopes, estimator and professional workflow. Professional pages link back to matching budget pages. Breadcrumbs mirror the hierarchy.

## Content publication gates

A page is indexable only with unique metadata/H1/canonical, an original example or evidence-backed explanation, a distinct estimator preset, no unsupported claim, at least three useful internal links, server-rendered content, working CTA, no substantial duplication and passing SEO tests. Otherwise it remains noindex and outside sitemap.

## Measurement

Track landing view, estimator start, intake completion, estimate produced, registration, download, professional-review request and qualified lead without sending descriptions or personal data to analytics.

Primary metrics: non-brand impressions/clicks in Spain, indexable pages receiving impressions, landing-to-estimator conversion, completion rate, professional-review rate and qualified leads by landing/project type.

After restoring Search Console, inspect and track new URLs, resubmit sitemap once, and review after 7, 21 and 45 days. Submission is not indexing.

## Delivery phases

- **P0 Foundation:** estimator metadata/content, registry, sitemap membership/dates, legal noindex, schema and tests.
- **P1 Commercial coverage:** 15 budget pages, 8 execution pages, hubs, presets and internal links.
- **P2 Trust and conversion:** price methodology, dated examples, professional workflow, trust blocks, FAQs and measurement.
- **P3 Controlled expansion:** local pages passing evidence gates and long-tail pages supported by Search Console or estimator demand.

## Acceptance criteria

All public URLs return 200 with unique metadata, canonical and H1. No private, legal-noindex or incomplete page appears in sitemap. Every page passes content/link gates. CTAs reach a working preset or professional flow. Schema matches visible content. Builds, lint, SEO tests and link checks pass. Production robots/sitemap are verified after deployment. Search Console limitations and lack of immediate indexing guarantees remain explicit.
