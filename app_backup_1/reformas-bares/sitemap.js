// app/sitemap.js
export default function sitemap() {
  const base = "https://www.robotarq.es";
  const now = new Date();
  const pages = [
    { url: "/reformas-bares", priority: 0.9 },
    { url: "/reformas-locales", priority: 0.7 },
    { url: "/reformas-oficinas", priority: 0.7 },
    // ciudades
    "/reformas-bares/madrid",
    "/reformas-bares/barcelona",
    "/reformas-bares/valencia",
    "/reformas-bares/sevilla",
    "/reformas-bares/malaga",
    "/reformas-bares/zaragoza",
    "/reformas-bares/bilbao",
    "/reformas-bares/alicante",
  ].map((p) =>
    typeof p === "string"
      ? { url: p, priority: 0.8 }
      : p
  );

  return pages.map(({ url, priority }) => ({
    url: `${base}${url}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority,
  }));
}
