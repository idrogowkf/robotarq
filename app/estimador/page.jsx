// app/estimador/page.jsx
import EstimadorClient from "./EstimadorClient";

export const metadata = {
    title: "Presupuesto técnico | robotARQ",
    description: "Genera un presupuesto técnico con partidas y cantidades.",
};

export default async function Page({ searchParams }) {
    const sp = await searchParams; // Next 15: hay que await
    const initTipo = (sp?.tipo ?? "local").toString();
    const initPrompt = (
        sp?.prompt ??
        "Reforma integral de local de 100 m²: pavimento porcelánico, pintura, 10 tomas, 10 puntos de luz y cambio de cuadro eléctrico."
    ).toString();
    const initCiudad = (sp?.ciudad ?? "").toString();

    return (
        <div className="pt-24 pb-16">
            <div className="max-w-6xl mx-auto px-4">
                <EstimadorClient
                    initTipo={initTipo}
                    initPrompt={initPrompt}
                    initCiudad={initCiudad}
                />
            </div>
        </div>
    );
}
