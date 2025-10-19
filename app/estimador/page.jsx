// app/estimador/page.jsx
export const dynamic = "force-dynamic";

import { Suspense } from "react";
import EstimadorClient from "./EstimadorClient";

function EstimadorPageInner({ searchParams }) {
    const initTipo = ((searchParams?.tipo ?? "local") + "").toString();
    const initPrompt =
        (
            searchParams?.prompt ??
            "Describe tu reforma u obra nueva con detalles (m², estancias, calidades…)"
        ) + "";
    const initCiudad = ((searchParams?.ciudad ?? "") + "").toString();

    return (
        <div className="pt-24 pb-16">
            <div className="max-w-6xl mx-auto px-4">
                <h1 className="text-3xl sm:text-4xl font-extrabold">Presupuesto técnico</h1>
                <p className="text-slate-600 mt-2">
                    Reformas u obra nueva (in situ o modular). Partidas, cantidades y precios orientativos.
                </p>
                <EstimadorClient
                    initTipo={initTipo}
                    initPrompt={initPrompt}
                    initCiudad={initCiudad}
                />
            </div>
        </div>
    );
}

export default function Page(props) {
    return (
        <Suspense fallback={<div className="pt-24 pb-16 px-4">Cargando…</div>}>
            {/* @ts-expect-error Async searchParams in App Router */}
            <EstimadorPageInner {...props} />
        </Suspense>
    );
}
