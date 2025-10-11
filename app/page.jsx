export const dynamic = "force-static";

export default function Home() {
    return (
        <main className="min-h-screen bg-white">
            {/* Hero */}
            <section className="mx-auto max-w-6xl px-4 pt-14 pb-10">
                <div className="text-center">
                    <h1 className="text-[48px] md:text-[64px] font-extrabold tracking-tight">
                        robot<span className="font-extrabold">ARQ</span>
                    </h1>
                    <p className="mt-3 text-neutral-600">
                        Presupuesto técnico con IA · Partidas, cantidades y precios.
                    </p>

                    <div className="mt-6 flex items-center justify-center gap-3">
                        <a
                            href="/estimador"
                            className="inline-flex items-center justify-center px-5 py-3 rounded-md bg-black text-white font-semibold"
                        >
                            Generar presupuesto
                        </a>
                        <a
                            href="/contacto"
                            className="inline-flex items-center justify-center px-5 py-3 rounded-md border font-semibold"
                        >
                            Contacto
                        </a>
                    </div>
                </div>
            </section>

            {/* Bloque de valor */}
            <section className="mx-auto max-w-6xl px-4 pb-16">
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="rounded-2xl border p-6">
                        <div className="text-lg font-semibold">Presupuesto técnico</div>
                        <p className="text-sm text-neutral-600 mt-2">
                            Partidas tipo Presto, precios orientativos y desglose claro.
                        </p>
                    </div>
                    <div className="rounded-2xl border p-6">
                        <div className="text-lg font-semibold">Proyecto y licencias</div>
                        <p className="text-sm text-neutral-600 mt-2">
                            Equipo técnico para proyecto, licencias y legalizaciones.
                        </p>
                    </div>
                    <div className="rounded-2xl border p-6">
                        <div className="text-lg font-semibold">Ejecución de obra</div>
                        <p className="text-sm text-neutral-600 mt-2">
                            Cuadrillas propias y control de calidad de principio a fin.
                        </p>
                    </div>
                </div>
            </section>

            {/* CTA final */}
            <section className="mx-auto max-w-6xl px-4 pb-24">
                <div className="rounded-2xl border p-8 text-center">
                    <div className="text-2xl font-semibold">¿Listo para tu presupuesto?</div>
                    <p className="text-neutral-600 mt-2">
                        Escribe lo que necesitas y la IA lo convierte en partidas y precios.
                    </p>
                    <div className="mt-6">
                        <a
                            href="/estimador"
                            className="inline-flex items-center justify-center px-5 py-3 rounded-md bg-black text-white font-semibold"
                        >
                            Generar presupuesto
                        </a>
                    </div>
                </div>
            </section>
        </main>
    );
}
