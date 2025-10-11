"use client";
import { useState } from "react";

export default function LandingHero() {
    const PHONE = "+34624473123";
    const WA = `https://wa.me/${PHONE.replace("+", "")}?text=${encodeURIComponent(
        "Hola Robotarq, quiero un presupuesto para mi reforma."
    )}`;

    const [tipo, setTipo] = useState("local");
    const [q, setQ] = useState(
        "Reforma integral de un local de 100 m² con nueva iluminación, pavimento porcelánico e insonorización."
    );

    function goToEstimador(e) {
        e.preventDefault();
        const url = `/estimador?tipo=${encodeURIComponent(tipo)}&q=${encodeURIComponent(q.trim())}`;
        window.location.href = url;
    }

    return (
        <section className="relative">
            <div className="max-w-5xl mx-auto px-4 py-16 text-center">
                <h1 className="font-extrabold leading-none tracking-tight"
                    style={{ fontSize: "clamp(56px, 9vw, 96px)" }}>
                    RoboTARC
                </h1>

                <p className="text-slate-700 mt-4 text-base md:text-lg">
                    Somos tu empresa de reformas aliada. La empresa de reformas con más éxito del mercado.
                </p>

                <p className="text-slate-600 mt-3 text-base md:text-lg max-w-3xl mx-auto">
                    Describe lo que necesitas. Te devolvemos un <strong>presupuesto técnico tipo Presto</strong> con partidas,
                    cantidades y precios. Descárgalo en <strong>PDF</strong> o <strong>Excel</strong>, y compártelo por correo.
                </p>

                <form onSubmit={goToEstimador} className="mt-8 rounded-2xl border p-6 bg-white/80 text-left">
                    <label className="text-sm font-medium">Tipo de reforma</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {[
                            ["local", "Local comercial"],
                            ["vivienda", "Vivienda"],
                            ["hosteleria", "Hostelería"],
                            ["oficina", "Oficina"],
                        ].map(([val, label]) => (
                            <button
                                key={val}
                                type="button"
                                className={`px-3 py-2 rounded-lg border ${tipo === val ? "bg-black text-white" : "bg-white"}`}
                                onClick={() => setTipo(val)}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    <div className="mt-4">
                        <label className="text-sm font-medium">Describe tu reforma</label>
                        <textarea
                            className="w-full mt-2 px-3 py-2 border rounded-xl min-h-[120px]"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Ej.: Reformar bar de 100 m² con nueva barra, pavimento porcelánico, insonorización y salida de humos…"
                        />
                    </div>

                    <div className="mt-4 flex flex-col sm:flex-row gap-3">
                        <button type="submit" className="px-6 py-3 rounded-xl bg-black text-white">
                            Generar presupuesto ahora
                        </button>
                        <a href={WA} target="_blank" rel="noopener" className="px-6 py-3 rounded-xl border text-center">
                            Hablar por WhatsApp
                        </a>
                        <a href={`tel:${PHONE}`} className="px-6 py-3 rounded-xl border text-center">
                            Llamar {PHONE}
                        </a>
                    </div>

                    <p className="text-slate-500 text-sm mt-3">
                        Describe tu reforma → Partidas tipo Presto → Descarga y comparte.
                    </p>
                </form>
            </div>
        </section>
    );
}
