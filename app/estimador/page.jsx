// app/estimador/page.jsx
export const dynamic = "force-dynamic";

import EstimadorClient from "./EstimadorClient";

export const metadata = {
    title: "Presupuesto técnico — robotARQ",
    description:
        "Describe tu reforma y genera un presupuesto técnico con partidas, cantidades y precios. Proyecto, licencia y obra.",
};

export default function Page({ searchParams }) {
    const initTipo = (searchParams?.tipo ?? "local").toString();
    const initPrompt = (
        searchParams?.prompt ??
        "Reforma integral de local de 100 m²: pavimento porcelánico, pintura, 10 tomas, 10 puntos de luz y cambio de cuadro eléctrico."
    ).toString();
    const initCiudad = (searchParams?.ciudad ?? "").toString();

    return (
        <div className="pt-24 pb-16"> {/* evita solape bajo header fijo */}
            <EstimadorClient
                initTipo={initTipo}
                initPrompt={initPrompt}
                initCiudad={initCiudad}
            />
        </div>
    );
}
