// app/page.jsx — Server Component
export const dynamic = "force-static";

export const metadata = {
    title: "Estimación de reformas de bares y locales",
    description:
        "Estima trabajos concretos de reforma con mediciones explícitas y solicita revisión técnica.",
    robots: "index, follow",
    alternates: { canonical: "/" },
};

const PHONE = "+34624473123";
const WA = `https://wa.me/34624473123?text=${encodeURIComponent(
    "Hola, quiero un presupuesto para reformar mi bar/local."
)}`;

function Section({ children, className = "" }) {
    return <section className={`max-w-[1140px] mx-auto px-4 ${className}`}>{children}</section>;
}

export default function LandingHome() {
    return (
        <div className="bg-white text-[#0a0a0a]">
            {/* ===== HERO ===== */}
            <Section className="pt-24 pb-6">
                {/* Marca en una sola línea: robotARQ */}
                <h1 className="font-extrabold tracking-tight text-[14vw] sm:text-[11vw] md:text-[8rem] leading-none">
                    robot<span className="font-extrabold">ARQ</span>
                </h1>

                {/* Subtítulo */}
                <p className="mt-4 text-lg sm:text-xl text-neutral-700 max-w-3xl">
                    Describe trabajos concretos de tu reforma y obtén una{" "}
                    <strong>estimación orientativa</strong> con partidas, cantidades y precios.
                </p>

                {/* Formulario -> /estimador (bloque minimal y protagonista) */}
                <div className="mt-8">
                    <form
                        action="/estimador"
                        method="GET"
                        className="rounded-2xl border border-neutral-200 p-5 shadow-sm bg-white"
                    >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                            <div className="w-full sm:w-64">
                                <label htmlFor="home-tipo" className="text-sm text-neutral-600">Tipo de reforma</label>
                                <select
                                    id="home-tipo" name="tipo"
                                    defaultValue="hosteleria"
                                    className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-3 outline-none focus:ring-2 focus:ring-black/10"
                                >
                                    <option value="hosteleria">Hostelería (bares / restaurantes)</option>
                                    <option value="local">Local comercial</option>
                                    <option value="vivienda">Vivienda</option>
                                    <option value="oficina">Oficina</option>
                                </select>
                            </div>

                            <div className="flex-1">
                                <label htmlFor="home-prompt" className="text-sm text-neutral-600">Describe tu reforma</label>
                                <input
                                    id="home-prompt" name="prompt" maxLength={4000}
                                    required
                                    placeholder="Ej.: colocar 60 m² de cerámica y cambiar un cuadro eléctrico"
                                    className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-4 outline-none focus:ring-2 focus:ring-black/10 text-base"
                                />
                            </div>
                        </div>

                        <div className="mt-4">
                            <button
                                type="submit"
                                className="inline-flex items-center justify-center rounded-xl bg-black text-white px-6 py-3.5 font-semibold hover:bg-black/90"
                            >
                                Abrir estimador
                            </button>
                        </div>

                        <p className="mt-3 text-sm text-neutral-500">
                            Describe tu reforma · partidas · cantidades · precios.
                        </p>
                    </form>
                </div>
            </Section>

            <Section className="py-12"><h2 className="text-2xl font-bold">Primero el alcance, después el precio</h2><p className="mt-4 text-neutral-700">El estimador piloto calcula cerámica, pintura, puntos de luz, tomas y cuadros con cantidades aportadas. Las reformas integrales, licencias y obras con instalaciones especiales requieren estudio y revisión técnica.</p><p className="mt-3 text-neutral-700">La atención y ejecución se confirman según ubicación y disponibilidad. Una estimación automática no sustituye una visita ni constituye una oferta contractual.</p></Section>
            {/* ===== Servicios ===== */}
            <Section className="pb-16">
                <h2 className="text-2xl sm:text-3xl font-bold">Servicios</h2>
                <div className="grid sm:grid-cols-4 gap-4 mt-4">
                    {[
                        { t: "Generar Presupuesto", href: "/estimador" },
                        { t: "Reformas de Bares", href: "/reformas-hosteleria" },
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

            {/* ===== FABs (fijos) ===== */}
            <div className="fixed right-4 bottom-4 flex flex-col gap-2 z-40">
                <a
                    href={WA}
                    target="_blank"
                    rel="noopener"
                    className="px-4 py-3 rounded-full bg-[#166534] text-white shadow"
                >
                    WhatsApp
                </a>
                <a href={`tel:${PHONE}`} className="px-4 py-3 rounded-full bg-sky-800 text-white shadow">
                    Llamar
                </a>
            </div>
        </div>
    );
}
