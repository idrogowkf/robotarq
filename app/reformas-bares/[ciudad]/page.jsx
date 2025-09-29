import cities from "@/content/cities.json";

export function generateStaticParams() {
    return Object.keys(cities).map((slug) => ({ ciudad: slug }));
}

export const metadata = {
    robots: "index,follow"
};

export default function CityPage({ params }) {
    const city = params.ciudad;
    const data = cities[city];
    if (!data) return <div className="p-6">Ciudad no encontrada.</div>;

    return (
        <main className="max-w-6xl mx-auto px-4 py-10">
            <h1 className="text-3xl sm:text-4xl font-extrabold">{data.title}</h1>
            <p className="text-slate-600 mt-2">Proyecto + licencia + obra para bares en {city[0].toUpperCase() + city.slice(1)}.</p>

            <section className="mt-6 grid md:grid-cols-3 gap-4">
                {data.sections.map((s) => (
                    <article key={s} className="border rounded-2xl shadow-sm p-4">
                        <h2 className="font-semibold text-lg">{s.replace("-", " ")}</h2>
                        <p className="text-slate-600 mt-1">Contenido específico de {s} para {city} (rellenar con normativa local, tasas, plazos...)</p>
                    </article>
                ))}
            </section>

            <div className="mt-6">
                <a href="/reformas-bares" className="text-blue-700 underline">← Volver a Reformas de Bares</a>
            </div>
        </main>
    );
}
