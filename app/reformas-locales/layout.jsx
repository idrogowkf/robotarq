// app/reformas-locales/layout.jsx
const siteUrl = "https://robotarq.com";
const path = "/reformas-locales";
const fullUrl = `${siteUrl}${path}`;

export const metadata = {
    metadataBase: new URL(siteUrl),
    title: {
        default: "Reformas de Locales — Presupuesto técnico con IA | robotARQ",
        template: "%s | robotARQ",
    },
    description:
        "Reformas de locales comerciales: retail, oficinas y clínicas. Presupuesto técnico con partidas y mediciones generadas por IA. Proyecto, licencia y obra.",
    robots: { index: true, follow: true },
    keywords: [
        "reformas de locales",
        "reformas locales comerciales",
        "presupuesto reforma local",
        "licencia de actividad",
        "adecuación local",
        "obra local",
        "robotARQ",
    ],
    alternates: { canonical: fullUrl },
    openGraph: {
        title: "Reformas de Locales — Presupuesto con IA | robotARQ",
        description:
            "Calcula el presupuesto de tu local comercial con IA: partidas, cantidades y precios. Proyecto, licencia y obra.",
        url: fullUrl,
        siteName: "robotARQ",
        type: "website",
        locale: "es_ES",
        images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "robotARQ" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "Reformas de Locales — Presupuesto con IA | robotARQ",
        description:
            "Presupuestos técnicos automáticos para locales comerciales. Proyecto, licencia y obra.",
        images: ["/og-image.jpg"],
    },
};

export default function Layout({ children }) {
    const ld = {
        "@context": "https://schema.org",
        "@type": "Service",
        name: "Reformas de Locales Comerciales",
        provider: { "@type": "Organization", name: "robotARQ", url: siteUrl },
        areaServed: { "@type": "Country", name: "España" },
        serviceType: "Reforma integral de local",
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
