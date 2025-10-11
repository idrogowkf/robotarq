import "./globals.css";

export const dynamic = "force-static";

export const viewport = {
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#0f172a" },
        { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
    ],
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://robotarq.com";

export const metadata = {
    metadataBase: new URL(SITE_URL),
    title: {
        default: "Robotarq | Reformas de Bares en España",
        template: "%s | Robotarq",
    },
    description:
        "Reformas de bares en España: proyecto técnico, licencia de actividad y obra. Pack apertura 30–45 días y reforma exprés de barra/cocina. Atención online.",
    applicationName: "Robotarq",
    keywords: [
        "reformas de bares",
        "reforma bar",
        "licencia de actividad",
        "salida de humos",
        "insonorización",
        "cocinas industriales",
        "reformas locales comerciales",
        "reformas de locales",
        "reformas de oficinas",
    ],
    alternates: { canonical: `${SITE_URL}/reformas-bares` },
    openGraph: {
        type: "website",
        url: `${SITE_URL}/reformas-bares`,
        title: "Reformas de Bares en España – Robotarq",
        description:
            "Proyecto, licencia y obra para bares. Packs de apertura y reforma exprés. Atención online y por hitos.",
        siteName: "Robotarq",
        images: [
            {
                url: "/assets/hero-bar-reformado-01.jpg",
                width: 1200,
                height: 630,
                alt: "Reforma de bar moderna por Robotarq",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Reformas de Bares en España – Robotarq",
        description:
            "Proyecto, licencia y obra para bares. Packs de apertura y reforma exprés. Atención online.",
        images: ["/assets/hero-bar-reformado-01.jpg"],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true },
    },
    icons: { icon: [{ url: "/favicon.ico" }] },
};

export default function RootLayout({ children }) {
    const org = {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Robotarq",
        url: SITE_URL,
        logo: `${SITE_URL}/favicon.ico`,
        contactPoint: [
            {
                "@type": "ContactPoint",
                telephone: "+34 624 473 123",
                contactType: "customer service",
                areaServed: "ES",
                availableLanguage: ["Spanish"],
            },
        ],
    };

    const service = {
        "@context": "https://schema.org",
        "@type": "ProfessionalService",
        name: "Reformas de Bares – Robotarq",
        url: `${SITE_URL}/reformas-bares`,
        areaServed: "ES",
        serviceType: [
            "Reformas de bares",
            "Licencia de actividad",
            "Salida de humos",
            "Insonorización",
            "Cocinas industriales",
            "Reformas locales comerciales",
        ],
    };

    return (
        <html lang="es">
            <body>
                {children}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }}
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(service) }}
                />
            </body>
        </html>
    );
}
