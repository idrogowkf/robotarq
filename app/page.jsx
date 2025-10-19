/// app/page.jsx — Server Component (sin "use client")
export const dynamic = "force-static";

export const metadata = {
    title: "robotARQ — Reformas y Obra Nueva | Genera tu Presupuesto Técnico",
    description:
        "Somos tu empresa de reformas y obra nueva. Describe lo que necesitas y generamos un presupuesto técnico con partidas, cantidades y precios.",
    robots: "index, follow",
    alternates: { canonical: "/" },
};

const PHONE = "+34624473123";
const WA = `https://wa.me/34624473123?text=${encodeURIComponent(
    "Hola, quiero un presupuesto con robotARQ."
)}`;

function Section({ children, className = "" }) {
    return <section className={`max-w-[1140px] mx-auto px-4 ${className}`}>{children}</section>;
}

export default function LandingRobotARQ() {
    return (
        <main className="bg-white text-[#0a0a0a]">
            {/* ===== HERO ===== */}
            <Section className="pt-14 pb-6">
                {/* Marca en una sola línea: robotARQ */}
                <h1 className="font-extrabold tracking-tight text-[14vw] sm:text-[11vw] md:text-[8rem] leading-none">
                    robot<span className="font-extrabold">ARQ</span>
                </h1>

                {/* Subtítulo */}
                <p className="mt-4 text-lg sm:text-xl text-neutral-700 max-w-3xl">
                    Somos tu empresa de reformas y obra nueva. Describe lo que necesitas y te devolvemos un{" "}
                    <strong>presupuesto técnico</strong> con partidas, cantidades y precios.
                </p>

                {/* ==== PROMPT MINIMAL: Ámbito + Descripción + CTA ==== */}
                <div className="mt-8">
                    <form
                        action="/estimador"
                        method="GET"
                        className="rounded-2xl border border-neutral-200 p-5 shadow-sm bg-white"
                    >
                        <div className="grid gap-3">
                            <div className="w-full sm:w-80">
                                <label className="text-sm text-neutral-600">Ámbito</label>
                                <select
                                    name="tipo"
                                    defaultValue="hosteleria"
                                    className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-3 outline-none focus:ring-2 focus:ring-black/10"
                                >
                                    <option value="hosteleria">Hostelería (bares / restaurantes)</option>
                                    <option value="local">Local comercial</option>
                                    <option value="vivienda">Vivienda</option>
                                    <option value="oficina">Oficina</option>
                                    <option value="modular">Modular (obra nueva)</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-sm text-neutral-600">Describe tu reforma / obra</label>
                                <textarea
                                    name="prompt"
                                    required
                                    rows={4}
                                    placeholder="Ej.: Reforma de 120 m² con pavimento porcelánico, pintura e iluminación LED."
                                    className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-4 outline-none focus:ring-2 focus:ring-black/10 text-base"
                                />
                                <p className="text-xs text-neutral-500 mt-1">
                                    Añade unidades si quieres (p. ej., “alicatado 60 m²”, “10 tomas”, “cambio de cuadro eléctrico”).
                                </p>
                            </div>

                            <div className="pt-1">
                                <button
                                    type="submit"
                                    className="inline-flex items-center justify-center rounded-xl bg-black text-white px-6 py-3.5 font-semibold hover:bg-black/90"
                                >
                                    Generar presupuesto ahora
                                </button>
                            </div>

                            <p className="text-xs text-neutral-500">
                                Los detalles (ciudad, calidades, modular/in situ…) los completarás en el estimador.
                            </p>
                        </div>
                    </form>
                </div>
            </Section>

            {/* ===== Imagen destacada ===== */}
            <Section className="pt-10 pb-16">
                <figure className="rounded-3xl overflow-hidden border border-neutral-200 shadow-sm">
                    <img
                        src="/assets/caso-bar-01-despues.jpg"
                        alt="Reforma finalizada — Madrid"
                        className="w-full h-[48vh] sm:h-[58vh] object-cover"
                        loading="eager"
                    />
                </figure>
            </Section>

            {/* ===== Bloque empresa / método ===== */}
            <Section className="pb-10">
                <div className="grid md:grid-cols-2 gap-6 items-start">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-bold">Por qué robotARQ</h2>
                        <p className="text-neutral-700 mt-2">
                            Unimos presupuesto técnico, proyecto, licencias y obra. Control de calidad por hitos y
                            seguimiento claro para abrir cuanto antes.
                        </p>
                        <ul className="mt-4 space-y-2 text-neutral-800">
                            <li>• Estructura de partidas comparable y transparente</li>
                            <li>• Coordinación técnica y constructiva en un solo equipo</li>
                            <li>• Comunicación simple: lo que ves en la estimación es lo que ejecutamos</li>
                        </ul>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                        {[
                            { t: "Presupuesto técnico", d: "Partidas, cantidades y precios claros." },
                            { t: "Proyecto y licencias", d: "Cumplimiento normativo desde el inicio." },
                            { t: "Obra ágil", d: "Planificación por hitos y entregas limpias." },
                            { t: "PDF / Excel", d: "Descarga e integración en tus procesos." },
                        ].map((b, i) => (
                            <div key={i} className="border rounded-2xl p-5 shadow-sm bg-white">
                                <div className="font-semibold">{b.t}</div>
                                <p className="text-neutral-700 mt-1">{b.d}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </Section>

            {/* ===== Ejemplos de precios ===== */}
            <Section className="pb-12">
                <h2 className="text-2xl sm:text-3xl font-bold">Ejemplos de precios</h2>
                <p className="text-neutral-600 mt-1">
                    Importes orientativos sin IVA. La estimación detallará las partidas y cantidades.
                </p>

                <div className="grid md:grid-cols-3 gap-4 mt-6">
                    {[
                        {
                            t: "Local Comercial · 100 m²",
                            p: "35.000 – 55.000 €",
                            d: "Pavimento, pintura, electricidad, accesibilidad y rotulación interior.",
                        },
                        {
                            t: "Vivienda · 90 m²",
                            p: "28.000 – 48.000 €",
                            d: "Demoliciones, acabados, cocina/baño estándar y electricidad básica.",
                        },
                        {
                            t: "Hostelería · 120 m²",
                            p: "60.000 – 95.000 €",
                            d: "Barra/cocina, extracción, acústica, pavimentos y proyecto técnico.",
                        },
                    ].map((c, i) => (
                        <div
                            key={i}
                            className="rounded-3xl border border-neutral-200 shadow-sm bg-gradient-to-b from-white to-neutral-50 p-6"
                        >
                            <div className="text-neutral-900 text-lg font-semibold">{c.t}</div>
                            <div className="text-3xl font-bold mt-3">{c.p}</div>
                            <p className="text-neutral-700 mt-2">{c.d}</p>
                        </div>
                    ))}
                </div>
            </Section>

            {/* ===== Construcción modular (bloque informativo corto) ===== */}
            <Section className="pb-12">
                <h2 className="text-2xl sm:text-3xl font-bold">Construcción Modular</h2>
                <p className="text-neutral-700 mt-2">
                    Elige entre <strong>madera</strong>, <strong>hormigón</strong>, <strong>steel frame</strong> o <strong>PVC</strong>.
                    Completa los detalles en el estimador para ajustar calidades (€/m²), transporte y montaje.
                </p>
            </Section>

            {/* ===== Testimonios ===== */}
            <Section className="pb-12">
                <h2 className="text-2xl sm:text-3xl font-bold">Testimonios</h2>
                <div className="grid md:grid-cols-3 gap-4 mt-4">
                    {[
                        {
                            q: "Nos entregaron el bar listo para abrir, con licencias y sin sorpresas.",
                            w: "Laura S. — Madrid",
                        },
                        {
                            q: "Obra exprés de barra y cocina, abrimos en 2 semanas.",
                            w: "Dani R. — Barcelona",
                        },
                        {
                            q: "Insonorización y salida de humos resueltas sin parar el negocio.",
                            w: "María F. — Valencia",
                        },
                    ].map((t, i) => (
                        <div key={i} className="border rounded-2xl shadow-sm p-6 bg-white">
                            <p className="italic">“{t.q}”</p>
                            <div className="font-semibold mt-2">{t.w}</div>
                        </div>
                    ))}
                </div>
            </Section>

            {/* ===== Servicios ===== */}
            <Section className="pb-16">
                <h2 className="text-2xl sm:text-3xl font-bold">Servicios</h2>
                <div className="grid sm:grid-cols-4 gap-4 mt-4">
                    {[
                        { t: "Generar Presupuesto", href: "/estimador" },
                        { t: "Reformas de Bares", href: "/reformas-bares" },
                        { t: "Reformas de Locales", href: "/reformas-locales" },
                        { t: "Reformas de Viviendas", href: "/reformas-viviendas" },
                    ].map((s, i) => (
                        <a
                            key={i}
                            href={s.href}
                            className="border rounded-2xl p-5 bg-white shadow-sm hover:shadow transition-shadow"
                        >
                            <div className="font-semibold">{s.t}</div>
                            <div className="text-neutral-600 text-sm mt-1">Más información</div>
                        </a>
                    ))}
                </div>
            </Section>

            {/* ===== CTA final ===== */}
            <Section className="pb-24">
                <div className="rounded-3xl bg-black text-white p-8 sm:p-10 text-center">
                    <h3 className="text-2xl sm:text-3xl font-bold">¿Listo para tu presupuesto?</h3>
                    <p className="mt-2 text-white/80">
                        Genera tu estimación ahora o contáctanos para una valoración guiada.
                    </p>
                    <div className="mt-5 flex flex-col sm:flex-row gap-2 justify-center">
                        <a
                            href="/estimador"
                            className="inline-flex items-center justify-center rounded-xl bg-white text-black px-5 py-3 font-medium hover:bg-white/90"
                        >
                            Abrir estimador
                        </a>
                    </div>
                </div>
            </Section>

            {/* ===== FABs (fijos en la esquina) ===== */}
            <div className="fixed right-4 bottom-4 flex flex-col gap-2 z-40">
                <a
                    href={WA}
                    target="_blank"
                    rel="noopener"
                    className="px-4 py-3 rounded-full bg-[#25D366] text-white shadow"
                >
                    WhatsApp
                </a>
                <a href={`tel:${PHONE}`} className="px-4 py-3 rounded-full bg-sky-600 text-white shadow">
                    Llamar
                </a>
            </div>
        </main>
    );
}

