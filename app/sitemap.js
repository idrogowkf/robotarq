// app/sitemap.js
const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://robotarq.com";

/** @type {import('next').MetadataRoute.Sitemap} */
export default function sitemap() {
    return [
        { url: `${SITE}/`, changefreq: "daily", priority: 1.0 },
        { url: `${SITE}/estimador`, changefreq: "daily", priority: 0.9 },
        { url: `${SITE}/contacto`, changefreq: "monthly", priority: 0.6 },
    ];
}
