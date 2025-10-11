// app/contacto/layout.jsx
const siteUrl = "https://robotarq.com";
const path = "/contacto";
const fullUrl = `${siteUrl}${path}`;

export const metadata = {
    metadataBase: new URL(siteUrl),
    title: {
        default: "Contacto — robotARQ",
        template: "%s | robotARQ",
    },
    description:
        "Cuéntanos tu proyecto de reforma. Te contactaremos para revisar el presupuesto técnico y coordinar visita de obra.",
    robots: { index: true, follow: true },
    keywords: [
        "contacto robotARQ",
        "empresa de reformas",
        "presupuesto reforma",
        "visita de obra",
    ],
    alternates: { canonical: fullUrl },
    openGraph: {
        title: "Contacto — robotARQ",
        description:
            "Te ayudamos con presupuesto técnico, proyecto, licencia y obra.",
        url: fullUrl,
        siteName: "robotARQ",
        type: "website",
        locale: "es_ES",
        images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "robotARQ" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "Contacto — robotARQ",
        description: "Te contactaremos en breve para tu reforma.",
        images: ["/og-image.jpg"],
    },
};

export default function Layout({ children }) {
    const ld = {
        "@context": "https://schema.org",
        "@type": "ContactPage",
        name: "Contacto robotARQ",
        url: fullUrl,
        publisher: { "@type": "Organization", name: "robotARQ", url: siteUrl },
        contactPoint: {
            "@type": "ContactPoint",
            telephone: "+34 624473123",
            contactType: "customer service",
            areaServed: "ES",
            availableLanguage: "Spanish",
        },
    };

    return (
        <>
            {children}
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
        </>
    );
}
