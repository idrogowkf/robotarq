// app/robots.txt/route.js
export function GET() {
  return new Response(
`User-agent: *
Allow: /
Disallow: /administracion
Disallow: /api/
Disallow: /mi-cuenta
Disallow: /acceso
Disallow: /recuperar-clave
Disallow: /restablecer-clave
Disallow: /profesionales/acceso
Disallow: /profesionales/panel
Disallow: /profesionales/recuperar-clave
Disallow: /profesionales/restablecer-clave

Sitemap: https://robotarq.com/sitemap.xml
`, { headers: { "Content-Type": "text/plain" } }
  );
}
