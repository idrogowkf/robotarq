// app/layout.jsx
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const siteUrl = "https://robotarq.com";

export const metadata = {
    metadataBase: new URL(siteUrl),
    title: {
        default: "robotARQ — Reformas y presupuestos generados por IA",
        template: "%s | robotARQ",
    },
    description:
        "Describe tu reforma y obtén un presupuesto técnico con partidas y cantidades. robotARQ: proyecto, licencia y obra. Reformas integrales en locales, bares, viviendas y hostelería en toda España.",
    robots: { index: true, follow: true },
    keywords: [
        "reformas con IA",
        "presupuesto reforma",
        "presupuesto automático",
        "empresa de reformas",
        "reformas locales comerciales",
        "reformas de bares",
        "reformas hostelería",
        "reformas viviendas",
        "robotARQ",
        "presupuestos técnicos",
        "Presto presupuestos",
        "licencias de obra",
        "IA construcción",
        "inteligencia artificial en reformas",
    ],
    openGraph: {
        title: "robotARQ — Reformas y presupuestos técnicos con IA",
        description:
            "Presupuestos técnicos con partidas, cantidades y precios. Proyecto, licencia y obra gestionados con inteligencia artificial.",
        url: siteUrl,
        siteName: "robotARQ",
        type: "website",
        locale: "es_ES",
        images: [
            {
                url: "/og-image.jpg",
                width: 1200,
                height: 630,
                alt: "robotARQ — Reformas y presupuestos generados por IA",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "robotARQ — Reformas y presupuestos técnicos con IA",
        description:
            "Presupuestos automáticos con partidas y cantidades. Proyecto, licencia y obra con IA.",
        creator: "@robotarq",
        images: ["/og-image.jpg"],
    },
    alternates: { canonical: siteUrl },
    icons: {
        icon: "/favicon.ico",
        shortcut: "/favicon.ico",
        apple: "/favicon.ico",
    },
    other: {
        "theme-color": "#ffffff",
    },
};

export default function RootLayout({ children }) {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "robotARQ",
        url: siteUrl,
        logo: `${siteUrl}/favicon.ico`,
        description:
            "robotARQ es la primera plataforma española de presupuestos automáticos de reformas mediante Inteligencia Artificial. Calcula partidas, mediciones y precios técnicos.",
        sameAs: [
            "https://www.linkedin.com/company/robotarq",
            "https://x.com/robotarq",
        ],
        contactPoint: [
            {
                "@type": "ContactPoint",
                telephone: "+34 624473123",
                contactType: "customer service",
                areaServed: "ES",
                availableLanguage: "Spanish",
            },
        ],
        address: {
            "@type": "PostalAddress",
            addressCountry: "ES",
            addressLocality: "Madrid",
            addressRegion: "Comunidad de Madrid",
        },
    };

    return (
        <html lang="es">
            <head>
                <link rel="icon" href="/favicon.ico" />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            </head>
            <body className="bg-white text-gray-900 flex flex-col min-h-screen">
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
            </body>
        </html>
    );
}
