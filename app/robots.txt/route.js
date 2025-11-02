// app/robots.txt/route.js
export function GET() {
  return new Response(
`User-agent: *
Allow: /

Sitemap: https://robotarq.com/sitemap.xml
`, { headers: { "Content-Type": "text/plain" } }
  );
}
