// app/reformas-bares/layout.jsx
const siteUrl = "https://robotarq.com";
const path = "/reformas-bares";
const fullUrl = `${siteUrl}${path}`;

export const metadata = {
    metadataBase: new URL(siteUrl),
    title: {
        default: "Reformas de Bares — Presupuesto técnico con IA | robotARQ",
        template: "%s | robotARQ",
    },
    description:
        "Reformas de bares y cafeterías en toda España. Presupuesto técnico con partidas, mediciones y precios generados por IA. Proyecto, licencia y obra.",
    robots: { index: true, follow: true },
    keywords: [
        "reformas de bares",
        "reformas hostelería",
        "licencia de actividad bares",
        "salida de humos",
        "presupuesto reforma bar",
        "presupuesto hostelería",
        "obra bar",
        "proyecto bar",
        "robotARQ",
    ],
    alternates: { canonical: fullUrl },
    openGraph: {
        title: "Reformas de Bares — Presupuesto con IA | robotARQ",
        description:
            "Calcula el presupuesto técnico de tu bar: partidas, cantidades y precios. Proyecto, licencia y obra.",
        url: fullUrl,
        siteName: "robotARQ",
        type: "website",
        locale: "es_ES",
        images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "robotARQ" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "Reformas de Bares — Presupuesto con IA | robotARQ",
        description:
            "Presupuesto técnico automático para bares y cafeterías. Proyecto, licencia y obra.",
        images: ["/og-image.jpg"],
    },
};

export default function Layout({ children }) {
    const ld = {
        "@context": "https://schema.org",
        "@type": "Service",
        name: "Reformas de Bares",
        provider: { "@type": "Organization", name: "robotARQ", url: siteUrl },
        areaServed: { "@type": "Country", name: "España" },
        serviceType: "Reforma integral de bar",
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

