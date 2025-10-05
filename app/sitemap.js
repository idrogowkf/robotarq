// app/sitemap.js
export const dynamic = "force-static";

export default function sitemap() {
    const base = process.env.NEXT_PUBLIC_SITE_URL || "https://robotarq.com";
    const now = new Date();

    const cities = [
        "madrid",
        "barcelona",
        "valencia",
        "sevilla",
        "malaga",
        "zaragoza",
        "bilbao",
        "alicante",
    ];

    const urls = [
        { url: `${base}/reformas-bares`, changefreq: "weekly", priority: 1.0, lastModified: now },
        ...cities.map((c) => ({
            url: `${base}/reformas-bares/${c}`,
            changefreq: "weekly",
            priority: 0.9,
            lastModified: now,
        })),
        { url: `${base}/reformas-locales`, changefreq: "monthly", priority: 0.7, lastModified: now },
        { url: `${base}/reformas-oficinas`, changefreq: "monthly", priority: 0.7, lastModified: now },
    ];

    return urls;
}
