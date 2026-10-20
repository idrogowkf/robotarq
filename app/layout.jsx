// app/layout.jsx
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import UsageAnalytics from "@/components/Analytics";
import CookieNotice from "@/components/CookieNotice";

const siteUrl = "https://robotarq.com";

export const metadata = {
    metadataBase: new URL(siteUrl),
    title: {
        default: "robotARQ — Presupuestos, reformas y profesionales",
        template: "%s | robotARQ",
    },
    description:
        "Genera presupuestos de reforma por partidas y encuentra empresas, constructoras, contratistas y técnicos para ejecutar tu proyecto en España.",
    robots: { index: true, follow: true },
    keywords: [

        "reformas",

        "presupuesto reforma",
        "empresa de reformas",
        "constructoras",
        "contratistas de obra",
        "profesionales de reformas",
        "buscar técnicos",
        "proveedores de construcción",
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
    const organization = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "robotARQ",
        url: siteUrl,
        logo: `${siteUrl}/favicon-32x32.png`,
        description:
            "Presupuestos orientativos de obras y reformas y conexión con profesionales en España.",
        email: "hola@robotarq.com",
        telephone: "+34 624473123",
        areaServed: { "@type": "Country", name: "España" },
        knowsLanguage: "es-ES",
        makesOffer: {
            "@type": "Offer",
            priceCurrency: "EUR",
            itemOffered: { "@type": "Service", name: "Estimación de obras y reformas en España" },
        },

        contactPoint: [{
            "@type": "ContactPoint",
            telephone: "+34 624473123",
            contactType: "customer service",
            areaServed: "ES",
            availableLanguage: "Spanish",
        }],
    };
    const website = {"@context":"https://schema.org","@type":"WebSite","@id":`${siteUrl}/#website`,name:"robotARQ",url:siteUrl,inLanguage:"es-ES",publisher:{"@id":`${siteUrl}/#organization`}};

    return (
        <html lang="es-ES">
            <head>
                <link rel="icon" href="/favicon.ico" />
                <script type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify({"@context":"https://schema.org","@graph":[organization,website]}) }} />
            </head>
            <body className="bg-white text-gray-900 flex flex-col min-h-screen">
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
                <UsageAnalytics />
                <CookieNotice />
            </body>
        </html>
    );
}
