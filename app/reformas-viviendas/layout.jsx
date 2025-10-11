// app/reformas-viviendas/layout.jsx
const siteUrl = "https://robotarq.com";
const path = "/reformas-viviendas";
const fullUrl = `${siteUrl}${path}`;

export const metadata = {
    metadataBase: new URL(siteUrl),
    title: {
        default: "Reformas de Viviendas — Presupuesto técnico con IA | robotARQ",
        template: "%s | robotARQ",
    },
    description:
        "Reformas de pisos y viviendas. Presupuesto técnico con partidas y mediciones generado por IA. Proyecto, licencia y obra.",
    robots: { index: true, follow: true },
    keywords: [
        "reformas viviendas",
        "reformas pisos",
        "presupuesto reforma piso",
        "obra vivienda",
        "presupuesto cocina",
        "presupuesto baño",
        "robotARQ",
    ],
    alternates: { canonical: fullUrl },
    openGraph: {
        title: "Reformas de Viviendas — Presupuesto con IA | robotARQ",
        description:
            "Calcula el presupuesto técnico de tu vivienda con IA. Partidas, cantidades y precios. Proyecto, licencia y obra.",
        url: fullUrl,
        siteName: "robotARQ",
        type: "website",
        locale: "es_ES",
        images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "robotARQ" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "Reformas de Viviendas — Presupuesto con IA | robotARQ",
        description:
            "Presupuestos automáticos para reformas de viviendas y pisos. Proyecto, licencia y obra.",
        images: ["/og-image.jpg"],
    },
};

export default function Layout({ children }) {
    const ld = {
        "@context": "https://schema.org",
        "@type": "Service",
        name: "Reformas de Viviendas",
        provider: { "@type": "Organization", name: "robotARQ", url: siteUrl },
        areaServed: { "@type": "Country", name: "España" },
        serviceType: "Reforma de vivienda/piso",
        url: fullUrl,
        telephone: "+34 624473123",
        brand: "robotARQ",
    };

    return (
        <>
            {children}
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
        </>
    );
}
