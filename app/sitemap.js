// app/sitemap.js
export default function sitemap() {
    const base = "https://robotarq.com";
    return [
        { url: `${base}/`, priority: 1.0 },
        { url: `${base}/estimador`, priority: 0.9 },
        { url: `${base}/contacto`, priority: 0.6 },
    ];
}
