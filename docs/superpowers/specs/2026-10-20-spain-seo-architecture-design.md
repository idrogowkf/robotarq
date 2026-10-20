# Spain SEO Architecture Design

## Objective

Make robotARQ a Spain-only search product with three unambiguous journeys: estimating a project, finding a professional, and joining as a professional. Every indexable URL must be useful on its own, internally connected, self-canonical, present in the sitemap, and aligned with the service actually offered.

## Technical contract

- Production host is `https://robotarq.com`; `www` and obsolete routes permanently redirect to it.
- The sitemap contains only public, indexable, self-canonical 200 URLs and uses honest modification dates.
- Private, authentication, recovery, API and administration surfaces stay out of the sitemap and carry `noindex` where rendered.
- `robots.txt` permits public content, blocks private route families, and declares the production sitemap.
- The site communicates Spain through visible Spanish content, EUR, `+34`, Spanish construction context and `areaServed: ES`. It does not use ignored geo meta tags or fabricate regional variants.
- A single Spain version does not publish artificial `hreflang` alternates. Add `hreflang` only when genuine regional or language variants exist.

## Information architecture

1. `/presupuestos` is the estimation hub and links to project-specific budget pages.
2. `/profesionales` is the customer-facing professional hub and links to trade pages and `/solicitar-profesional`.
3. `/profesionales/portal` is the acquisition page for professionals; access, panel and password flows remain private.
4. `/guias` is the editorial hub for comparison, inclusions, exclusions and pricing concepts.

Existing commercial pages remain stable to preserve their URLs. Their content becomes specific to the project or trade instead of reusing a common body. New pages are published only when they contain distinct scope, cost factors, Spanish requirements, common omissions, FAQs and conversion intent.

## Structured data

- Home: `Organization` and `WebSite` with verified contact information and `areaServed: ES`.
- Commercial landing: `Service` plus `BreadcrumbList` and visible FAQs.
- Approved professional profiles: `ProfilePage` with a real `Organization`, `LocalBusiness` or `Person` entity as supported by stored data.
- Provisional or unavailable profiles must never expose invented ratings, reviews or business claims.

## Delivery scope

The first delivery publishes the current product, fixes robots/sitemap/canonicals/titles, introduces the four-cluster architecture, rewrites the 23 generated commercial pages with differentiated sections, and adds the high-intent pages that can be supported without fabricated local evidence. City pages remain gated until unique local content and Search Console evidence exist.

## Verification

Automated tests validate URL uniqueness, page depth, cluster membership, sitemap eligibility, private-route exclusion and Spain signals. A production crawl then checks status, title, canonical, robots, H1 and structured data for every sitemap URL.
