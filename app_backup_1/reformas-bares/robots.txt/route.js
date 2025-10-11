// app/robots.txt/route.js
export function GET() {
    const body = `User-agent: *
Allow: /

Sitemap: https://www.robotarq.es/sitemap.xml
`;
    return new Response(body, {
        headers: { "Content-Type": "text/plain" },
    });
}
