// app/estimador/layout.jsx
const siteUrl = "https://robotarq.com";
const path = "/estimador";
const fullUrl = `${siteUrl}${path}`;

export const metadata = {
    metadataBase: new URL(siteUrl),
    title: {
        default: "Estimador de Presupuestos — Partidas y mediciones con IA | robotARQ",
        template: "%s | robotARQ",
    },
    description:
        "Genera un presupuesto técnico con partidas, mediciones y precios usando IA. Descubre el alcance y costes de tu reforma antes de empezar.",
    robots: { index: true, follow: true },
    keywords: [
        "estimador de presupuestos",
        "presupuesto automático",
        "presto partidas",
        "IA construcción",
        "presupuesto reforma",
        "robotARQ",
    ],
    alternates: { canonical: fullUrl },
    openGraph: {
        title: "Estimador de Presupuestos — IA | robotARQ",
        description:
            "Obtén partidas y mediciones técnicas con IA para tu reforma. Más precisión, más rapidez.",
        url: fullUrl,
        siteName: "robotARQ",
        type: "website",
        locale: "es_ES",
        images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "robotARQ" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "Estimador de Presupuestos — IA | robotARQ",
        description:
            "Presupuestos técnicos con partidas y cantidades para tu reforma.",
        images: ["/og-image.jpg"],
    },
};

export default function Layout({ children }) {
    const ld = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "Estimador de Presupuestos robotARQ",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        url: fullUrl,
        offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
        provider: { "@type": "Organization", name: "robotARQ", url: siteUrl },
    };

    return (
        <>
            {children}
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
        </>
    );
}
