// app/layout.jsx
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const siteUrl = "https://robotarq.com";

export const metadata = {
    metadataBase: new URL(siteUrl),
    title: {
        default: "robotARQ — Obra nueva y reformas con presupuestos generados por IA",
        template: "%s | robotARQ",
    },
    description:
        "Describe tu obra nueva o reforma y obtén un presupuesto técnico con partidas y cantidades. robotARQ: proyecto, licencia y obra.",
    robots: { index: true, follow: true },
    keywords: [
        "obra nueva",
        "reformas con IA",
        "presupuesto reforma",
        "presupuesto obra nueva",
        "empresa de reformas",
        "robotARQ",
        "presupuestos técnicos",
        "licencias de obra",
        "IA construcción",
    ],
    openGraph: {
        title: "robotARQ — Obra nueva y reformas con IA",
        description:
            "Presupuestos técnicos con partidas, cantidades y precios. Proyecto, licencia y obra con IA.",
        url: siteUrl,
        siteName: "robotARQ",
        type: "website",
        locale: "es_ES",
        images: [
            { url: "/og-image.jpg", width: 1200, height: 630, alt: "robotARQ — Obra nueva y reformas" },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "robotARQ — Obra nueva y reformas con IA",
        description:
            "Presupuestos técnicos con partidas y cantidades. Proyecto, licencia y obra.",
        images: ["/og-image.jpg"],
    },
    alternates: { canonical: siteUrl },
    icons: {
        icon: [
            { url: "/favicon.ico", sizes: "any" },
            { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
            { url: "/favicon-48.png", sizes: "48x48", type: "image/png" },
            { url: "/favicon-192.png", sizes: "192x192", type: "image/png" },
        ],
        apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
        shortcut: "/favicon.ico",
    },
    other: { "theme-color": "#ffffff" },
};

export default function RootLayout({ children }) {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "robotARQ",
        url: siteUrl,
        logo: `${siteUrl}/favicon-192.png`,
        description:
            "Plataforma de presupuestos automáticos de obras y reformas mediante IA. Calcula partidas, mediciones y precios técnicos.",
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
