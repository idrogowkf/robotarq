// app/contacto/page.jsx
"use client";

import { useState } from "react";

export default function Contacto() {
    const [data, setData] = useState({
        tipo: "consulta",
        nombre: "",
        empresa: "",
        nif: "",
        email: "",
        telefono: "",
        mensaje: "",
    });
    const [sending, setSending] = useState(false);
    const [ok, setOk] = useState(null);

    async function onSubmit(e) {
        e.preventDefault();
        setSending(true);
        setOk(null);
        try {
            const budget = null; // aquí podrías adjuntar última estimación guardada si quisieras
            const resp = await fetch("/api/notify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status: "fallback",
                    meta: { tipo: data.tipo, prompt: data.mensaje, metros: null, model: "contact" },
                    budget,
                    customer: { name: data.nombre, email: data.email, phone: data.telefono },
                }),
            });
            const j = await resp.json();
            setOk(j.ok);
        } catch {
            setOk(false);
        } finally {
            setSending(false);
        }
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="mx-auto max-w-3xl px-4 py-10">
                <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Contacto</h1>
                <p className="text-sm text-muted-foreground mt-2">
                    Cuéntanos tu proyecto y te llamaremos para coordinar visita de obra.
                </p>

                <form onSubmit={onSubmit} className="mt-6 space-y-4">
                    <div>
                        <label className="text-sm font-medium">Tipo</label>
                        <div className="mt-2 flex gap-2 flex-wrap">
                            {["consulta", "presupuesto", "visita"].map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => setData({ ...data, tipo: t })}
                                    className={`px-3 py-1.5 rounded-full border ${data.tipo === t ? "bg-black text-white border-black" : ""
                                        }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                            placeholder="Nombre"
                            value={data.nombre}
                            onChange={(e) => setData({ ...data, nombre: e.target.value })}
                            className="w-full border rounded-md px-3 py-2"
                            required
                        />
                        <input
                            placeholder="Empresa (opcional)"
                            value={data.empresa}
                            onChange={(e) => setData({ ...data, empresa: e.target.value })}
                            className="w-full border rounded-md px-3 py-2"
                        />
                        <input
                            placeholder="NIF (si empresa)"
                            value={data.nif}
                            onChange={(e) => setData({ ...data, nif: e.target.value })}
                            className="w-full border rounded-md px-3 py-2"
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            value={data.email}
                            onChange={(e) => setData({ ...data, email: e.target.value })}
                            className="w-full border rounded-md px-3 py-2"
                            required
                        />
                        <input
                            placeholder="Teléfono"
                            value={data.telefono}
                            onChange={(e) => setData({ ...data, telefono: e.target.value })}
                            className="w-full border rounded-md px-3 py-2"
                            required
                        />
                    </div>

                    <textarea
                        placeholder="Cuéntanos brevemente tu reforma"
                        value={data.mensaje}
                        onChange={(e) => setData({ ...data, mensaje: e.target.value })}
                        className="w-full border rounded-md px-3 py-2 min-h-[120px]"
                    />

                    <button
                        type="submit"
                        disabled={sending}
                        className="px-4 py-2 rounded-md bg-black text-white"
                    >
                        {sending ? "Enviando..." : "Enviar"}
                    </button>

                    {ok === true && (
                        <p className="text-green-600 text-sm mt-2">
                            Gracias. Te contactaremos muy pronto.
                        </p>
                    )}
                    {ok === false && (
                        <p className="text-amber-600 text-sm mt-2">
                            No pudimos enviar ahora. Inténtalo en unos minutos.
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
}
