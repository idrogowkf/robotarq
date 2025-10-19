// app/contacto/layout.jsx
const SITE = "https://robotarq.com";
const PATH = "/contacto";
const CANON = `${SITE}${PATH}`;

export const metadata = {
    metadataBase: new URL(SITE),
    title: {
        default: "Contacto | robotARQ",
        template: "%s | robotARQ",
    },
    description:
        "Contacta con robotARQ. Resolvemos presupuestos, proyecto, licencias y obra en toda España.",
    robots: { index: true, follow: true },
    alternates: { canonical: CANON },
    openGraph: {
        title: "Contacto | robotARQ",
        description:
            "Escríbenos para presupuestos de reformas, obra nueva modular y licencias.",
        url: CANON,
        siteName: "robotARQ",
        type: "website",
        locale: "es_ES",
        images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "robotARQ" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "Contacto | robotARQ",
        description:
            "Habla con nuestro técnico comercial de obras y obtén tu presupuesto con IA.",
        images: ["/og-image.jpg"],
    },
};

export default function ContactLayout({ children }) {
    // Ajusta este valor si cambias la altura del header fijo:
    // pt-24 ≈ 96px; si tu header mide 80px usa pt-20; si 64px usa pt-16.
    return <div className="pt-24">{children}</div>;
}
