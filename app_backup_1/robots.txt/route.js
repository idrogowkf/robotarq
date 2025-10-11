// app/robots.txt/route.js
export const dynamic = "force-static";

export function GET() {
    const base = process.env.NEXT_PUBLIC_SITE_URL || "https://robotarq.com";
    const body = [
        "User-agent: *",
        "Allow: /",
        "",
        `Sitemap: ${base}/sitemap.xml`,
    ].join("\n");

    return new Response(body, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
}
