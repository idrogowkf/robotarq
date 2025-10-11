// app/layout.js
import "./globals.css";
import Link from "next/link";

// app/layout.jsx
const siteUrl = "https://robotarq.com";

export const metadata = {
    metadataBase: new URL(siteUrl),
    title: {
        default: "robotARQ — Reformas y presupuestos generados por IA",
        template: "%s | robotARQ",
    },
    description:
        "Describe tu reforma y obtén un presupuesto técnico con partidas y cantidades. robotARQ: proyecto, licencia y obra. Reformas integrales en locales, bares, viviendas y hostelería en toda España.",
    robots: {
        index: true,
        follow: true,
        nocache: false,
    },
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
    alternates: {
        canonical: siteUrl,
    },
    icons: {
        icon: "/favicon.ico",
        shortcut: "/favicon.ico",
        apple: "/favicon.ico",
    },
    other: {
        "theme-color": "#ffffff",
    },
};

// --- Utilidad: clases comunes (Tailwind) ---
function Container({ children }) {
    return <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>;
}

// --- Header (server component, sin handlers) ---
function Header() {
    return (
        <header className="border-b border-neutral-200/60 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-40">
            <Container>
                <div className="flex h-16 items-center justify-between">
                    <Link href="/" className="inline-flex items-baseline group">
                        <span className="font-extrabold tracking-tight text-2xl leading-none">
                            robot<span className="uppercase">ARQ</span>
                        </span>
                        <span className="sr-only">Ir al inicio</span>
                    </Link>

                    <nav className="flex items-center gap-2">
                        <Link
                            href="/estimador"
                            className="inline-flex items-center rounded-full border border-neutral-900 px-4 py-2 text-sm font-semibold hover:bg-neutral-900 hover:text-white transition"
                        >
                            Generar presupuesto
                        </Link>
                        <Link
                            href="/contacto"
                            className="inline-flex items-center rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-100 transition"
                        >
                            Contacto
                        </Link>
                    </nav>
                </div>
            </Container>
        </header>
    );
}

// --- Footer (server component) ---
function Footer() {
    return (
        <footer className="border-t border-neutral-200/60 bg-white">
            <Container>
                <div className="grid gap-8 py-10 md:grid-cols-3">
                    <div>
                        <div className="font-extrabold text-xl">robot<span className="uppercase">ARQ</span></div>
                        <p className="mt-2 text-sm text-neutral-600">
                            Reformas con presupuesto técnico, proyecto, licencia y obra.
                        </p>
                    </div>

                    <div>
                        <div className="text-sm font-semibold">Contacto</div>
                        <ul className="mt-3 space-y-2 text-sm">
                            <li>
                                <a className="underline underline-offset-2 hover:no-underline" href="mailto:hola@robotarq.com">
                                    hola@robotarq.com
                                </a>
                            </li>
                            <li>
                                <a className="underline underline-offset-2 hover:no-underline" href="tel:+34624473123">
                                    +34 624473123
                                </a>{" "}
                                ·{" "}
                                <a
                                    className="underline underline-offset-2 hover:no-underline"
                                    href="https://wa.me/34624473123"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    WhatsApp
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <div className="text-sm font-semibold">Enlaces</div>
                        <ul className="mt-3 space-y-2 text-sm">
                            <li>
                                <Link className="underline underline-offset-2 hover:no-underline" href="/estimador">
                                    Generar presupuesto
                                </Link>
                            </li>
                            <li>
                                <Link className="underline underline-offset-2 hover:no-underline" href="/contacto">
                                    Formulario de contacto
                                </Link>
                            </li>
                            <li>
                                <a
                                    className="underline underline-offset-2 hover:no-underline"
                                    href="https://robotarq.com"
                                >
                                    robotarq.com
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="flex items-center justify-between border-t border-neutral-200/60 py-6 text-xs text-neutral-500">
                    <span>© {new Date().getFullYear()} robotARQ</span>
                    <span>Madrid · Barcelona · Valencia</span>
                </div>
            </Container>
        </footer>
    );
}

// --- Botón flotante WhatsApp (sin JS, solo <a>) ---
function FloatingWhatsApp() {
    return (
        <a
            href="https://wa.me/34624473123"
            target="_blank"
            rel="noreferrer"
            aria-label="WhatsApp robotARQ"
            className="fixed bottom-5 right-5 inline-flex h-12 w-12 items-center justify-center rounded-full border border-neutral-200 bg-white shadow-lg hover:shadow-xl"
            title="WhatsApp directo"
        >
            {/* círculo + símbolo WA simple en SVG (negro) */}
            <svg viewBox="0 0 32 32" width="22" height="22" aria-hidden="true">
                <path
                    fill="currentColor"
                    d="M19.11 17.38c-.26-.13-1.5-.74-1.73-.82-.23-.09-.4-.13-.57.13-.17.26-.66.82-.81.99-.15.17-.3.2-.55.07-.26-.13-1.08-.4-2.05-1.27-.76-.68-1.27-1.51-1.42-1.76-.15-.26-.02-.4.11-.53.11-.1.26-.27.39-.4.13-.13.17-.22.26-.37.09-.17.04-.31-.02-.44-.07-.13-.57-1.38-.78-1.89-.21-.5-.42-.43-.57-.43h-.49c-.17 0-.44.06-.67.31-.23.26-.88.86-.88 2.1s.9 2.43 1.03 2.6c.13.17 1.77 2.7 4.3 3.79.6.26 1.07.41 1.44.52.61.19 1.16.16 1.6.1.49-.07 1.5-.61 1.71-1.19.21-.58.21-1.07.15-1.19-.06-.12-.23-.19-.49-.32zM16 3C8.83 3 3 8.83 3 16c0 2.29.62 4.44 1.69 6.29L3 29l6.86-1.79A12.93 12.93 0 0 0 16 29c7.17 0 13-5.83 13-13S23.17 3 16 3z"
                />
            </svg>
        </a>
    );
}

export default function RootLayout({ children }) {
    return (
        <html lang="es">
            <body className="bg-white text-neutral-900 antialiased">
                <Header />
                <main>
                    {children}
                </main>
                <Footer />
                <FloatingWhatsApp />
            </body>
        </html>
    );
}
