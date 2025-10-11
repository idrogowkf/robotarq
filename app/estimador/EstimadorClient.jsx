// app/estimador/EstimadorClient.jsx
"use client";

import { useEffect, useMemo, useState } from "react";

// Pequeño helper para POST JSON
async function postJSON(url, data) {
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export default function EstimadorClient({ initTipo, initPrompt, initCiudad }) {
    const [tipo, setTipo] = useState(initTipo || "local");
    const [ciudad, setCiudad] = useState(initCiudad || "");
    const [prompt, setPrompt] = useState(initPrompt || "");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [result, setResult] = useState(null);

    // Generar presupuesto llamando a tu API interna (usa OpenAI si está configurado)
    const onGenerate = async () => {
        setLoading(true);
        setErrorMsg("");
        setResult(null);
        try {
            const payload = {
                tipo,
                ciudad,
                prompt,
            };
            const data = await postJSON("/api/estimate", payload);
            // La API debe devolver { ok, meta, budget, html? }
            if (!data?.ok) {
                throw new Error(data?.error || "No se pudo generar el presupuesto.");
            }
            setResult(data);
        } catch (e) {
            setErrorMsg(e.message || "Error al generar el presupuesto.");
        } finally {
            setLoading(false);
        }
    };

    // Enviar correo (usa /api/notify del proyecto)
    const onContactar = async (formData) => {
        setLoading(true);
        setErrorMsg("");
        try {
            const payload = {
                // datos cliente
                name: formData.name,
                phone: formData.phone,
                email: formData.email,
                empresa: formData.empresa || "",
                nif: formData.nif || "",
                // presupuesto generado (si existe)
                budget: result?.budget || null,
                meta: {
                    tipo,
                    ciudad,
                    prompt,
                },
            };
            const data = await postJSON("/api/notify", payload);
            if (!data?.ok) {
                throw new Error(data?.error || "No se pudo enviar el correo.");
            }
            return true;
        } catch (e) {
            setErrorMsg(e.message || "Error al enviar el correo.");
            return false;
        } finally {
            setLoading(false);
        }
    };

    // UI mínima (sustituye/estiliza con Tailwind según tu diseño actual)
    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <h1 className="text-2xl md:text-3xl font-semibold">Presupuesto técnico</h1>
            <p className="text-sm text-gray-500 mt-1">
                Describe tu reforma y genera un presupuesto con partidas y cantidades.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="col-span-1">
                    <label className="text-sm font-medium">Tipo de reforma</label>
                    <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-1">
                        {["local", "vivienda", "hosteleria", "oficina"].map((t) => (
                            <button
                                key={t}
                                onClick={() => setTipo(t)}
                                className={`border rounded px-3 py-2 text-sm text-left ${tipo === t ? "bg-black text-white" : "bg-white"
                                    }`}
                            >
                                {t === "hosteleria" ? "hostelería" : t}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="col-span-1">
                    <label className="text-sm font-medium">Ciudad</label>
                    <input
                        type="text"
                        placeholder="Madrid, Barcelona, …"
                        value={ciudad}
                        onChange={(e) => setCiudad(e.target.value)}
                        className="mt-2 w-full border rounded px-3 py-2 text-sm"
                    />
                </div>

                <div className="col-span-3 sm:col-span-1 flex items-end">
                    <button
                        onClick={onGenerate}
                        disabled={loading}
                        className="w-full bg-black text-white rounded px-4 py-3 text-sm font-medium"
                    >
                        {loading ? "Generando…" : "Generar presupuesto"}
                    </button>
                </div>
            </div>

            <div className="mt-4">
                <label className="text-sm font-medium">Descripción (prompt)</label>
                <textarea
                    rows={5}
                    className="mt-2 w-full border rounded px-3 py-2 text-sm"
                    placeholder="Ej.: Reforma de 100 m² con pavimento porcelánico, pintura, 10 tomas, 10 puntos de luz y cambio de cuadro eléctrico."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                />
            </div>

            {errorMsg ? (
                <div className="mt-4 p-3 rounded bg-red-50 text-red-700 text-sm">
                    {errorMsg}
                </div>
            ) : null}

            {/* Resultado */}
            <div className="mt-8">
                {!result ? (
                    <div className="text-sm text-gray-500">
                        Genera tu presupuesto para ver aquí el desglose.
                    </div>
                ) : (
                    <PresupuestoView result={result} />
                )}
            </div>

            {/* Contacto (aparece siempre, o si prefieres, sólo cuando hay presupuesto) */}
            <div className="mt-10 border-t pt-6">
                <h2 className="text-lg font-semibold">Contactar técnico comercial de obras</h2>
                <ContactoForm onSubmit={onContactar} disabled={loading} />
            </div>
        </div>
    );
}

/* ---------- Componentes auxiliares básicos ---------- */

function PresupuestoView({ result }) {
    const { budget, meta } = result || {};

    if (!budget) {
        return (
            <div className="text-sm text-gray-500">
                No se pudo interpretar un presupuesto. Prueba a detallar más el prompt.
            </div>
        );
    }

    // budget.chapters => { CH: { code, name, items:[{code,desc,unit,qty,price,amount}], total } }
    // budget.subtotal, budget.extras, budget.total
    const chapters = Object.values(budget.chapters || {});
    return (
        <div className="space-y-8">
            <div className="text-sm text-gray-600">
                <div>
                    <span className="font-medium">Tipo:</span> {meta?.tipo}
                </div>
                {meta?.ciudad ? (
                    <div>
                        <span className="font-medium">Ciudad:</span> {meta.ciudad}
                    </div>
                ) : null}
            </div>

            {chapters.map((ch) => (
                <div key={ch.code} className="border rounded">
                    <div className="px-4 py-3 border-b font-medium">
                        {ch.code} — {ch.name}
                    </div>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-gray-500">
                                <th className="py-2 px-3">Código</th>
                                <th className="px-3">Descripción</th>
                                <th className="px-3">Ud</th>
                                <th className="px-3 text-right">Cantidad</th>
                                <th className="px-3 text-right">P. unit</th>
                                <th className="px-3 text-right">Importe</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ch.items?.map((it, idx) => (
                                <tr key={`${it.code}-${idx}`} className="border-t">
                                    <td className="py-2 px-3">{it.code}</td>
                                    <td className="px-3">{it.desc}</td>
                                    <td className="px-3">{it.unit}</td>
                                    <td className="px-3 text-right">{it.qty}</td>
                                    <td className="px-3 text-right">
                                        {Number(it.price).toFixed(2)} €
                                    </td>
                                    <td className="px-3 text-right">
                                        {Number(it.amount).toFixed(2)} €
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="border-t">
                                <td className="py-2 px-3 text-right font-medium" colSpan={5}>
                                    Subtotal capítulo
                                </td>
                                <td className="px-3 text-right font-medium">
                                    {Number(ch.total).toFixed(2)} €
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            ))}

            {/* Extras */}
            {Array.isArray(budget.extras) && budget.extras.length > 0 && (
                <div className="border rounded">
                    <div className="px-4 py-3 border-b font-medium">Cargos porcentuales</div>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-gray-500">
                                <th className="py-2 px-3">Código</th>
                                <th className="px-3">Descripción</th>
                                <th className="px-3">% aplicado</th>
                                <th className="px-3 text-right">Base</th>
                                <th className="px-3 text-right">Importe</th>
                            </tr>
                        </thead>
                        <tbody>
                            {budget.extras.map((e, i) => (
                                <tr key={i} className="border-t">
                                    <td className="py-2 px-3">{e.code}</td>
                                    <td className="px-3">{e.desc}</td>
                                    <td className="px-3">{e.qty}%</td>
                                    <td className="px-3 text-right">{Number(e.price).toFixed(2)} €</td>
                                    <td className="px-3 text-right">{Number(e.amount).toFixed(2)} €</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Totales */}
            <div className="flex justify-end">
                <div className="text-right">
                    <div className="text-sm text-gray-500">Subtotal</div>
                    <div className="text-lg font-semibold">
                        {Number(budget.subtotal).toFixed(2)} €
                    </div>
                    <div className="text-sm text-gray-500 mt-2">TOTAL (sin IVA)</div>
                    <div className="text-2xl font-bold">{Number(budget.total).toFixed(2)} €</div>
                </div>
            </div>
        </div>
    );
}

function ContactoForm({ onSubmit, disabled }) {
    const [tab, setTab] = useState("persona"); // 'persona' | 'empresa'
    const [sending, setSending] = useState(false);
    const [ok, setOk] = useState(false);
    const [err, setErr] = useState("");

    const [form, setForm] = useState({
        name: "",
        phone: "",
        email: "",
        empresa: "",
        nif: "",
    });

    const handle = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }));

    const submit = async (e) => {
        e.preventDefault();
        setSending(true);
        setErr("");
        setOk(false);
        const success = await onSubmit(form);
        setOk(!!success);
        if (!success) setErr("No se pudo enviar. Inténtalo de nuevo.");
        setSending(false);
    };

    if (ok) {
        return (
            <div className="mt-4 p-4 rounded bg-green-50 text-green-700 text-sm">
                ¡Gracias! Te contactaremos en breve.
            </div>
        );
    }

    return (
        <form onSubmit={submit} className="mt-4 space-y-3">
            <div className="inline-flex rounded border overflow-hidden">
                <button
                    type="button"
                    onClick={() => setTab("persona")}
                    className={`px-3 py-2 text-sm ${tab === "persona" ? "bg-black text-white" : "bg-white"
                        }`}
                >
                    Persona
                </button>
                <button
                    type="button"
                    onClick={() => setTab("empresa")}
                    className={`px-3 py-2 text-sm ${tab === "empresa" ? "bg-black text-white" : "bg-white"
                        }`}
                >
                    Empresa
                </button>
            </div>

            {tab === "empresa" && (
                <div className="grid sm:grid-cols-2 gap-3">
                    <input
                        className="border rounded px-3 py-2 text-sm"
                        placeholder="Empresa"
                        value={form.empresa}
                        onChange={handle("empresa")}
                    />
                    <input
                        className="border rounded px-3 py-2 text-sm"
                        placeholder="NIF"
                        value={form.nif}
                        onChange={handle("nif")}
                    />
                </div>
            )}

            <div className="grid sm:grid-cols-3 gap-3">
                <input
                    className="border rounded px-3 py-2 text-sm"
                    placeholder={tab === "empresa" ? "Persona de contacto" : "Nombre"}
                    value={form.name}
                    onChange={handle("name")}
                    required
                />
                <input
                    className="border rounded px-3 py-2 text-sm"
                    placeholder="Teléfono"
                    value={form.phone}
                    onChange={handle("phone")}
                    required
                />
                <input
                    type="email"
                    className="border rounded px-3 py-2 text-sm"
                    placeholder="Email"
                    value={form.email}
                    onChange={handle("email")}
                    required
                />
            </div>

            <div className="flex gap-3">
                <button
                    type="submit"
                    disabled={disabled || sending}
                    className="bg-black text-white rounded px-4 py-2 text-sm"
                >
                    {sending ? "Enviando…" : "Contactar técnico comercial de obras"}
                </button>

                <a
                    href="https://wa.me/34624473123"
                    target="_blank"
                    rel="noreferrer"
                    className="border rounded px-4 py-2 text-sm"
                >
                    WhatsApp
                </a>
            </div>

            {err ? (
                <div className="text-sm text-red-600 mt-2">{err}</div>
            ) : null}
        </form>
    );
}
