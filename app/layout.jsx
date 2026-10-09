// app/layout.jsx
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import UsageAnalytics from "@/components/Analytics";

const siteUrl = "https://robotarq.com";

export const metadata = {
    metadataBase: new URL(siteUrl),
    title: {
        default: "robotARQ — Estimación de reformas y revisión técnica",
        template: "%s | robotARQ",
    },
    description:
        "Estimaciones orientativas de reformas con partidas y mediciones explícitas. Solicita revisión técnica y confirma el alcance.",
    robots: { index: true, follow: true },
    keywords: [

        "reformas",

        "presupuesto reforma",
        "empresa de reformas",
        "proyecto y licencias",


        "robotARQ",
    ],
    openGraph: {
        title: "robotARQ — Estimación de reformas",
        description:
            "Estima trabajos concretos de reforma y solicita revisión técnica.",
        url: siteUrl,
        siteName: "robotARQ",
        type: "website",
        locale: "es_ES",
        images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "robotARQ" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "robotARQ — Estimación de reformas",
        description:
            "Estimación orientativa de reformas y revisión técnica.",
        images: ["/opengraph-image"],
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
            "Estimaciones orientativas de reformas y revisión técnica.",

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
                <UsageAnalytics />
            </body>
        </html>
    );
}
