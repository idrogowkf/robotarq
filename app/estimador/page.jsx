// app/estimador/page.jsx
import EstimadorClient from "./EstimadorClient";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Page(props) {
    const sp = await props.searchParams;

    const initTipo = ((sp?.tipo ?? "local") + "").toString();
    const initPrompt = (
        (sp?.prompt ??
            "") + ""
    ).toString();
    const initCiudad = ((sp?.ciudad ?? "") + "").toString();
    const fromProfessionalSample = sp?.origen === "muestra-profesional";

    return (
        <div className="pt-24 pb-16">
            <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({'@context':'https://schema.org','@type':'WebApplication',name:'Generador de presupuestos robotARQ',url:'https://robotarq.com/estimador',applicationCategory:'BusinessApplication',operatingSystem:'Web',description:'Genera estimaciones orientativas de obras y reformas por capítulos y partidas.'})}} />
            <div className="max-w-6xl mx-auto px-4">
                {fromProfessionalSample && <div className="mb-6 rounded-2xl border border-sky-200 bg-sky-50 p-5"><strong className="block text-sky-950">El profesional concreto no está disponible en este momento.</strong><p className="mt-1 text-sm leading-6 text-sky-900">Describe el alcance y la ubicación. robotARQ preparará el expediente y comprobará qué profesionales compatibles tienen disponibilidad.</p></div>}
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                    Estimación de reformas
                </h1>
                <p className="text-neutral-600 mt-2">
                    Indica partidas y cantidades para obtener una estimación orientativa. Confirma el alcance y los precios mediante revisión técnica.
                </p>

                <div className="mt-8">
                    <EstimadorClient
                        initTipo={initTipo}
                        initPrompt={initPrompt}
                        initCiudad={initCiudad}
                    />
                </div>
                <section className="mt-14 border-t pt-10 max-w-4xl">
                    <h2 className="text-2xl font-bold">Cómo obtener una estimación útil</h2>
                    <p className="mt-3 text-neutral-700 leading-7">Describe el tipo de inmueble u obra, sus dimensiones, la ciudad, el estado actual y lo que quieres conseguir. Puedes escribir con lenguaje normal: el asistente interpreta expresiones como “metros cuadrados” y, cuando una decisión cambia sustancialmente el cálculo, solicita la información que falta.</p>
                    <div className="mt-7 grid gap-5 md:grid-cols-3"><div><h3 className="font-semibold">1. Define el alcance</h3><p className="mt-2 text-sm text-neutral-600">Aclara sistema constructivo, calidades, transporte, montaje y trabajos incluidos.</p></div><div><h3 className="font-semibold">2. Revisa hipótesis</h3><p className="mt-2 text-sm text-neutral-600">Comprueba capítulos, cantidades, exclusiones y datos pendientes antes de usar el total.</p></div><div><h3 className="font-semibold">3. Compara ofertas</h3><p className="mt-2 text-sm text-neutral-600">Entrega el mismo documento a los profesionales y confirma mediciones y precios.</p></div></div>
                    <p className="mt-7 text-sm text-neutral-600">Metodología revisada el 13 de octubre de 2026. El resultado es orientativo, no constituye una oferta ni sustituye una revisión técnica.</p>
                    <nav aria-label="Tipos de presupuesto" className="mt-6 flex flex-wrap gap-4"><Link className="underline" href="/presupuesto-reforma-integral">Reforma integral</Link><Link className="underline" href="/presupuesto-casa-prefabricada">Casa prefabricada</Link><Link className="underline" href="/presupuesto-reforma-local-comercial">Local comercial</Link><Link className="underline" href="/presupuesto-nave-industrial">Nave industrial</Link></nav>
                </section>
            </div>
        </div>
    );
}
