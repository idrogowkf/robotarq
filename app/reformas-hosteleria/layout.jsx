// app/reformas-hosteleria/layout.jsx
const siteUrl = "https://robotarq.com";
const path = "/reformas-hosteleria";
const fullUrl = `${siteUrl}${path}`;

export const metadata = {
    metadataBase: new URL(siteUrl),
    title: {
        default: "Reformas de Hostelería — Presupuesto técnico con IA | robotARQ",
        template: "%s | robotARQ",
    },
    description:
        "Reformas para hostelería: bares, restaurantes, cocinas y salas. Presupuesto técnico con IA. Proyecto, licencia, insonorización y salida de humos.",
    robots: { index: true, follow: true },
    keywords: [
        "reformas hostelería",
        "reformas restaurantes",
        "insonorización",
        "salida de humos",
        "licencia de actividad",
        "presupuesto hostelería",
        "robotARQ",
    ],
    alternates: { canonical: fullUrl },
    openGraph: {
        title: "Reformas de Hostelería — Presupuesto con IA | robotARQ",
        description:
            "Calcula el presupuesto de tu negocio de hostelería con IA: partidas, cantidades y precios. Proyecto, licencia y obra.",
        url: fullUrl,
        siteName: "robotARQ",
        type: "website",
        locale: "es_ES",
        images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "robotARQ" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "Reformas de Hostelería — Presupuesto con IA | robotARQ",
        description:
            "Presupuestos automáticos para bares y restaurantes. Proyecto, licencia y obra.",
        images: ["/og-image.jpg"],
    },
};

export default function Layout({ children }) {
    const ld = {
        "@context": "https://schema.org",
        "@type": "Service",
        name: "Reformas de Hostelería",
        provider: { "@type": "Organization", name: "robotARQ", url: siteUrl },
        areaServed: { "@type": "Country", name: "España" },
        serviceType: "Reforma de bar/restaurante",
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
