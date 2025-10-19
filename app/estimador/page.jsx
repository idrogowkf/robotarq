// app/estimador/page.jsx
import EstimadorClient from "./EstimadorClient";

export const dynamic = "force-dynamic";

export default async function Page(props) {
    const sp = await props.searchParams;

    const initTipo = ((sp?.tipo ?? "local") + "").toString();
    const initPrompt = (
        (sp?.prompt ??
            "Describe tu reforma u obra nueva con detalles (m², estancias, calidades…).") + ""
    ).toString();
    const initCiudad = ((sp?.ciudad ?? "") + "").toString();

    return (
        <div className="pt-24 pb-16">
            <div className="max-w-6xl mx-auto px-4">
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                    Presupuesto técnico
                </h1>
                <p className="text-neutral-600 mt-2">
                    Describe tu reforma u obra nueva y genera un presupuesto con partidas, mediciones y precios.
                </p>

                <div className="mt-8">
                    <EstimadorClient
                        initTipo={initTipo}
                        initPrompt={initPrompt}
                        initCiudad={initCiudad}
                    />
                </div>
            </div>
        </div>
    );
}
