// app/layout.jsx
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const siteUrl = "https://robotarq.com";

export const metadata = {
    metadataBase: new URL(siteUrl),
    title: {
        default: "robotARQ — Obra nueva y reformas con IA (presupuesto técnico al instante)",
        template: "%s | robotARQ",
    },
    description:
        "Presupuesto técnico con IA para obra nueva y reformas: partidas, mediciones y precios. Proyecto, licencias y ejecución en toda España.",
    robots: { index: true, follow: true },
    keywords: [
        "obra nueva",
        "reformas",
        "presupuesto con IA",
        "presupuesto reforma",
        "empresa de reformas",
        "proyecto y licencias",
        "presto partidas",
        "IA construcción",
        "robotARQ",
    ],
    openGraph: {
        title: "robotARQ — Obra nueva y reformas con IA",
        description:
            "Calcula tu presupuesto técnico al instante (partidas, mediciones y precios) y gestiona proyecto, licencias y obra.",
        url: siteUrl,
        siteName: "robotARQ",
        type: "website",
        locale: "es_ES",
        images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "robotARQ" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "robotARQ — Obra nueva y reformas con IA",
        description:
            "Presupuestos técnicos con IA para obra nueva y reformas. Proyecto, licencias y obra.",
        images: ["/og-image.jpg"],
    },
    alternates: { canonical: siteUrl },
    icons: {
        icon: [
            { url: "/favicon.ico" },
            { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
            { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
        ],
        apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
        other: [{ rel: "mask-icon", url: "/safari-pinned-tab.svg" }],
    },
    other: { "theme-color": "#ffffff" },
};

export default function RootLayout({ children }) {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "robotARQ",
        url: siteUrl,
        logo: `${siteUrl}/favicon-32x32.png`,
        description:
            "Plataforma de presupuestos técnicos con IA para obra nueva y reformas. Proyecto, licencias y ejecución en España.",
        sameAs: [
            "https://www.linkedin.com/company/robotarq",
            "https://x.com/robotarq",
        ],
        contactPoint: [{
            "@type": "ContactPoint",
            telephone: "+34 624473123",
            contactType: "customer service",
            areaServed: "ES",
            availableLanguage: "Spanish",
        }],
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
                <script type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            </head>
            <body className="bg-white text-gray-900 flex flex-col min-h-screen">
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
            </body>
        </html>
    );
}
