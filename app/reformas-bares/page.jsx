// app/reformas-bares/page.jsx — Server Component
export const dynamic = "force-static";

export const metadata = {
    title: "Reformas de Bares — robotARQ",
    description:
        "Servicios de reforma de bares y restaurantes. Proyecto, licencias y obra. Genera tu presupuesto técnico con IA.",
    // Le decimos a Google que la canónica de este contenido es la home "/"
    alternates: { canonical: "/" },
    // Y evitamos indexar esta URL para no competir con la home
    robots: "noindex, follow",
};

export default function ReformasBaresInfo() {
    return (
        <main className="max-w-6xl mx-auto px-4 py-10">
            <h1 className="text-3xl sm:text-4xl font-extrabold">Reformas de Bares</h1>
            <p className="text-slate-600 mt-2">
                Proyecto + licencias + obra. Genera tu presupuesto en la home o en el estimador.
            </p>

            <section className="mt-6 grid md:grid-cols-3 gap-4">
                {[
                    "Proyecto y legalización",
                    "Obra e instalaciones",
                    "Acústica y extracción",
                ].map((s) => (
                    <article key={s} className="border rounded-2xl shadow-sm p-4 bg-white">
                        <h2 className="font-semibold text-lg">{s}</h2>
                        <p className="text-slate-600 mt-1">
                            Servicio especializado para bares y restaurantes: normativa, plazos y costes claros.
                        </p>
                    </article>
                ))}
            </section>

            <div className="mt-8 flex gap-3">
                <a href="/" className="underline">← Ir a la home (generar presupuesto)</a>
                <a href="/estimador" className="underline">Abrir estimador</a>
            </div>
        </main>
    );
}
