// app/_components/LandingHero.jsx
export default function LandingHero() {
    return (
        <section className="container-page py-10 md:py-16">
            <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                        Robotarq
                    </h1>
                    <p className="mt-3 text-lg text-slate-600">
                        La forma más rápida de obtener un{" "}
                        <strong>presupuesto técnico tipo Presto</strong> para tu reforma.
                        Escribe lo que necesitas, genera partidas, cantidades y precios y
                        descárgalo en <strong>PDF o Excel</strong>.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                        <a
                            href="/estimador"
                            className="px-5 py-3 rounded-xl bg-black text-white hover:opacity-90"
                        >
                            Generar presupuesto
                        </a>
                        <a
                            href="/reformas-bares"
                            className="px-5 py-3 rounded-xl border border-slate-300 hover:bg-slate-50"
                        >
                            Reformas de bares
                        </a>
                    </div>
                </div>
                <div className="rounded-2xl overflow-hidden border border-slate-200">
                    <img
                        src="/assets/hero-bar-reformado-01.jpg"
                        alt="Bar reformado moderno con acabados de calidad"
                        className="w-full h-[280px] md:h-[360px] object-cover"
                        loading="eager"
                    />
                </div>
            </div>
        </section>
    );
}

