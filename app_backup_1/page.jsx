// app/page.jsx  (SERVER – sin "use client")
import LandingHero from "./_components/LandingHero";

export const dynamic = "force-static";

export const metadata = {
    title: "Robotarq — Presupuestos de reformas",
    description:
        "RoboTARC. Describe lo que necesitas y te devolvemos un presupuesto técnico tipo Presto con partidas, cantidades y precios. Descarga en PDF o Excel.",
    robots: "index, follow",
    openGraph: {
        title: "Robotarq — Presupuestos de reformas",
        description:
            "RoboTARC. Describe lo que necesitas y te devolvemos un presupuesto técnico tipo Presto.",
        url: "https://robotarq.com/",
        siteName: "Robotarq",
    },
    alternates: { canonical: "https://robotarq.com/" },
};
export const viewport = { themeColor: "#000000" };

export default function Page() {
    return (
        <main className="min-h-screen bg-white text-slate-900">
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <a href="/" className="flex items-center gap-2" aria-label="Robotarq">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-900 to-sky-400 grid place-items-center text-white font-bold">R</div>
                        <span className="font-bold">Robotarq</span>
                    </a>
                    <nav className="hidden md:block">
                        <ul className="flex items-center gap-3">
                            <li><a href="#como-funciona" className="px-3 py-2 rounded-lg hover:bg-slate-100">Cómo funciona</a></li>
                            <li><a href="#precios" className="px-3 py-2 rounded-lg hover:bg-slate-100">Precios</a></li>
                            <li><a href="#opiniones" className="px-3 py-2 rounded-lg hover:bg-slate-100">Opiniones</a></li>
                            <li><a href="/estimador" className="px-4 py-2 rounded-lg bg-black text-white">Generar presupuesto</a></li>
                        </ul>
                    </nav>
                </div>
            </header>

            <LandingHero />

            <section id="como-funciona" className="max-w-7xl mx-auto px-4 py-14">
                <div className="grid md:grid-cols-3 gap-4">
                    {[
                        ["Describe tu reforma", "Escribe en lenguaje natural: local, vivienda u hostelería. Entendemos tu objetivo y contexto."],
                        ["Partidas tipo Presto", "Convertimos tu descripción en capítulos y partidas con cantidades y precios orientativos."],
                        ["Descarga y comparte", "Previsualiza, descarga en PDF/Excel y recibe el presupuesto por correo."],
                    ].map(([t, d]) => (
                        <div key={t} className="rounded-2xl border border-slate-200 p-6 bg-white/70">
                            <h3 className="text-lg font-semibold tracking-tight">{t}</h3>
                            <p className="text-slate-600 mt-2">{d}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-4">
                <div className="rounded-3xl overflow-hidden border bg-white">
                    <img src="/assets/hero-bar-reformado-01.jpg" alt="Reforma destacada" className="w-full max-h-[520px] object-cover" loading="lazy" />
                </div>
            </section>

            <section id="precios" className="max-w-7xl mx-auto px-4 py-14">
                <h2 className="text-2xl md:text-3xl font-bold text-center">Ejemplos orientativos de precio</h2>
                <p className="text-slate-600 text-center mt-2">Rango estimado por m² según alcance. Pide tu propuesta cerrada.</p>
                <div className="grid md:grid-cols-3 gap-4 mt-6">
                    {[
                        ["Local comercial", "650–900 €/m²", "Integral con acabados medios, electricidad y fontanería base."],
                        ["Vivienda", "500–800 €/m²", "Reforma integral sin mobiliario fijo ni electrodomésticos."],
                        ["Hostelería", "700–1.100 €/m²", "Incluye adecuaciones sanitarias, humos e insonorización."],
                    ].map(([t, p, d]) => (
                        <div key={t} className="rounded-2xl border p-6">
                            <h3 className="font-semibold text-lg">{t}</h3>
                            <p className="text-3xl mt-2">{p}</p>
                            <p className="text-slate-600 mt-2">{d}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section id="opiniones" className="max-w-7xl mx-auto px-4 pb-16">
                <h2 className="text-2xl md:text-3xl font-bold text-center">Clientes que ya reformaron con Robotarq</h2>
                <div className="grid md:grid-cols-3 gap-4 mt-6">
                    {[
                        { t: "Presupuesto rápido y claro. Obra sin sorpresas.", w: "Laura S. – Madrid" },
                        { t: "Para el bar, la salida de humos y la acústica vinieron resueltas.", w: "Dani R. – Barcelona" },
                        { t: "Buena comunicación, pagos por hitos y entrega limpia.", w: "María F. – Valencia" },
                    ].map((q, i) => (
                        <div key={i} className="rounded-2xl border p-6 bg-white/70">
                            <p className="italic leading-relaxed">“{q.t}”</p>
                            <div className="font-semibold mt-3">{q.w}</div>
                        </div>
                    ))}
                </div>
                <div className="text-center mt-10">
                    <a href="/estimador" className="px-6 py-3 rounded-xl bg-black text-white">Generar presupuesto ahora</a>
                </div>
            </section>

            <footer className="bg-slate-50 border-t">
                <div className="max-w-7xl mx-auto px-4 py-8 grid md:grid-cols-3 gap-4 text-slate-700">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-900 to-sky-400 grid place-items-center text-white font-bold">R</div>
                            <span className="font-bold">Robotarq</span>
                        </div>
                        <p className="mt-2">Reformas con presupuesto inteligente.</p>
                    </div>
                    <div>
                        <h4 className="font-semibold">Contacto</h4>
                        <ul className="space-y-1 mt-2">
                            <li>Tel: <a className="text-blue-700" href="tel:+34624473123">+34 624 473 123</a></li>
                            <li>Email: <a className="text-blue-700" href="mailto:hola@robotarq.com">hola@robotarq.com</a></li>
                            <li>WhatsApp: <a className="text-blue-700" href="https://wa.me/34624473123" target="_blank">chatear ahora</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold">Servicios</h4>
                        <ul className="space-y-1 mt-2">
                            <li><a className="hover:underline" href="/reformas-bares/">Reformas de bares</a></li>
                            <li><a className="hover:underline" href="/reformas-locales/">Reformas de locales</a></li>
                            <li><a className="hover:underline" href="/reformas-oficinas/">Reformas de oficinas</a></li>
                        </ul>
                    </div>
                </div>
                <div className="text-center text-slate-500 text-sm pb-6">
                    © {new Date().getFullYear()} Robotarq
                </div>
            </footer>
        </main>
    );
}

