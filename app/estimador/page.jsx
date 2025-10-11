// app/estimador/page.jsx
import { Suspense } from "react";
import EstimadorClient from "./EstimadorClient";

// Evita el pre-render estático que provoca el error durante la exportación
export const dynamic = "force-dynamic";

export const metadata = {
    title: "Presupuesto técnico — robotARQ",
    description:
        "Genera un presupuesto técnico con partidas y cantidades. robotARQ: proyecto, licencia y obra.",
};

export default function Page({ searchParams }) {
    // Lee valores iniciales del servidor y pásalos al cliente
    const initTipo =
        typeof searchParams?.tipo === "string" ? searchParams.tipo : "local";
    const initPrompt =
        typeof searchParams?.prompt === "string"
            ? searchParams.prompt
            : "Reforma integral de local de 100 m²: pavimento porcelánico, pintura, electricidad y accesibilidad.";
    const initCiudad =
        typeof searchParams?.ciudad === "string" ? searchParams.ciudad : "";

    return (
        <Suspense fallback={<div className="p-6">Cargando…</div>}>
            <EstimadorClient
                initTipo={initTipo}
                initPrompt={initPrompt}
                initCiudad={initCiudad}
            />
        </Suspense>
    );
}
