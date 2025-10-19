// app/estimador/EstimadorClient.jsx
"use client";

import { useState } from "react";

/* Helper POST JSON */
async function postJSON(url, data) {
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

const CIUDADES = [
    "Madrid", "Barcelona", "Valencia", "Sevilla", "Zaragoza", "Málaga", "Bilbao", "Valladolid", "Murcia", "Alicante", "Córdoba", "Vigo"
];

export default function EstimadorClient({ initTipo, initPrompt, initCiudad }) {
    /* Controles comunes */
    const [tipo, setTipo] = useState(initTipo || "local"); // local|vivienda|hosteleria|oficina|modular (solo visual en landing)
    const [ciudad, setCiudad] = useState(initCiudad || "");
    const [prompt, setPrompt] = useState(initPrompt || "");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [result, setResult] = useState(null);

    /* Reforma u Obra nueva */
    const [obra, setObra] = useState("reforma"); // reforma | obra_nueva
    const [modalidad, setModalidad] = useState("insitu"); // insitu | modular (solo si obra_nueva)

    /* Obra nueva opciones */
    const [modularTipo, setModularTipo] = useState("madera"); // madera|hormigon|steel|pvc
    const [nivelPrecio, setNivelPrecio] = useState("standard"); // economy|standard|alto|premium
    const [metros, setMetros] = useState(60);
    const [parcela, setParcela] = useState("si"); // si|no|busco

    const generar = async () => {
        setLoading(true);
        setErrorMsg("");
        setResult(null);
        try {
            const payload =
                obra === "reforma"
                    ? { tipo, ciudad, prompt, obra }
                    : {
                        obra,
                        modalidad,
                        modularTipo: modalidad === "modular" ? modularTipo : "",
                        nivelPrecio,
                        m2: Number(metros || 0),
                        ciudad,
                        prompt,
                        tipo // por compatibilidad
                    };
            const data = await postJSON("/api/estimate", payload);
            if (!data?.ok) throw new Error(data?.error || "No se pudo generar el presupuesto.");
            setResult(data);
        } catch (e) {
            setErrorMsg(e.message || "Error al generar el presupuesto.");
        } finally {
            setLoading(false);
        }
    };

    const contactar = async (formData) => {
        setLoading(true);
        setErrorMsg("");
        try {
            const payload = {
                name: formData.name,
                phone: formData.phone,
                email: formData.email,
                empresa: formData.empresa || "",
                nif: formData.nif || "",
                budget: result?.budget || null,
                meta: {
                    tipo,
                    ciudad,
                    prompt,
                    obra,
                    modalidad,
                    modularTipo,
                    nivelPrecio,
                    m2: Number(metros || 0),
                    parcela
                }
            };
            const data = await postJSON("/api/notify", payload);
            if (!data?.ok) throw new Error(data?.error || "No se pudo enviar el correo.");
            return true;
        } catch (e) {
            setErrorMsg(e.message || "Error al enviar el correo.");
            return false;
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-8">
            {/* Filtro superior */}
            <div className="grid md:grid-cols-3 gap-4">
                {/* Tipo de reforma (solo visual, lo mantenemos por compatibilidad) */}
                <div>
                    <label className="text-sm font-medium">Tipo de reforma</label>
                    <div className="mt-2 grid grid-cols-4 gap-2">
                        {["local", "vivienda", "hosteleria", "oficina"].map((t) => (
                            <button
                                key={t}
                                onClick={() => setTipo(t)}
                                className={`border rounded px-3 py-2 text-sm ${tipo === t ? "bg-black text-white" : "bg-white"
                                    }`}
                            >
                                {t === "hosteleria" ? "hostelería" : t}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Ciudad (input con sugerencias) */}
                <div>
                    <label className="text-sm font-medium">Ciudad</label>
                    <input
                        list="ciudades"
                        placeholder="Ej.: Madrid"
                        className="mt-2 w-full border rounded px-3 py-2 text-sm"
                        value={ciudad}
                        onChange={(e) => setCiudad(e.target.value)}
                    />
                    <datalist id="ciudades">
                        {CIUDADES.map((c) => (
                            <option key={c} value={c} />
                        ))}
                    </datalist>
                </div>

                {/* Reforma u Obra nueva */}
                <div>
                    <label className="text-sm font-medium">Tipo de proyecto</label>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                        <button
                            onClick={() => setObra("reforma")}
                            className={`border rounded px-3 py-2 text-sm ${obra === "reforma" ? "bg-black text-white" : "bg-white"
                                }`}
                        >
                            Reforma
                        </button>
                        <button
                            onClick={() => setObra("obra_nueva")}
                            className={`border rounded px-3 py-2 text-sm ${obra === "obra_nueva" ? "bg-black text-white" : "bg-white"
                                }`}
                        >
                            Obra nueva
                        </button>
                    </div>
                </div>
            </div>

            {/* Si obra nueva: modalidad + opciones */}
            {obra === "obra_nueva" && (
                <div className="mt-4 grid md:grid-cols-3 gap-4">
                    {/* Modalidad */}
                    <div>
                        <label className="text-sm font-medium">Modalidad</label>
                        <div className="mt-2 grid grid-cols-2 gap-2">
                            <button
                                onClick={() => setModalidad("insitu")}
                                className={`border rounded px-3 py-2 text-sm ${modalidad === "insitu" ? "bg-black text-white" : "bg-white"
                                    }`}
                            >
                                In situ
                            </button>
                            <button
                                onClick={() => setModalidad("modular")}
                                className={`border rounded px-3 py-2 text-sm ${modalidad === "modular" ? "bg-black text-white" : "bg-white"
                                    }`}
                            >
                                Modular
                            </button>
                        </div>
                    </div>

                    {/* Modalidad: modular → tipo */}
                    {modalidad === "modular" ? (
                        <div>
                            <label className="text-sm font-medium">Sistema modular</label>
                            <div className="mt-2 grid grid-cols-4 gap-2">
                                {[
                                    ["madera", "Madera"],
                                    ["hormigon", "Hormigón"],
                                    ["steel", "Steel frame"],
                                    ["pvc", "PVC"]
                                ].map(([k, label]) => (
                                    <button
                                        key={k}
                                        onClick={() => setModularTipo(k)}
                                        className={`border rounded px-3 py-2 text-sm ${modularTipo === k ? "bg-black text-white" : "bg-white"
                                            }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div>
                            <label className="text-sm font-medium">Calidad (in situ)</label>
                            <div className="mt-2 grid grid-cols-4 gap-2">
                                {["economy", "standard", "alto", "premium"].map((lvl) => (
                                    <button
                                        key={lvl}
                                        onClick={() => setNivelPrecio(lvl)}
                                        className={`border rounded px-3 py-2 text-sm ${nivelPrecio === lvl ? "bg-black text-white" : "bg-white"
                                            }`}
                                    >
                                        {lvl}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Si modular, elegimos precio también (para coherencia visual) */}
                    {modalidad === "modular" && (
                        <div>
                            <label className="text-sm font-medium">Nivel de precio</label>
                            <div className="mt-2 grid grid-cols-4 gap-2">
                                {["economy", "standard", "alto", "premium"].map((lvl) => (
                                    <button
                                        key={lvl}
                                        onClick={() => setNivelPrecio(lvl)}
                                        className={`border rounded px-3 py-2 text-sm ${nivelPrecio === lvl ? "bg-black text-white" : "bg-white"
                                            }`}
                                    >
                                        {lvl}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Metros cuadrados */}
                    <div>
                        <label className="text-sm font-medium">Superficie (m²)</label>
                        <input
                            type="number"
                            min={50}
                            className="mt-2 w-full border rounded px-3 py-2 text-sm"
                            value={metros}
                            onChange={(e) => setMetros(e.target.value)}
                        />
                        <div className="text-xs text-slate-500 mt-1">Mínimo 50 m²</div>
                    </div>

                    {/* Parcela */}
                    <div>
                        <label className="text-sm font-medium">Parcela</label>
                        <div className="mt-2 grid grid-cols-3 gap-2">
                            {[
                                ["si", "Sí"],
                                ["no", "No"],
                                ["busco", "Estoy buscando"]
                            ].map(([k, label]) => (
                                <button
                                    key={k}
                                    onClick={() => setParcela(k)}
                                    className={`border rounded px-3 py-2 text-sm ${parcela === k ? "bg-black text-white" : "bg-white"
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* PROMPT grande */}
            <div className="mt-6">
                <label className="text-sm font-medium">Descripción / Prompt</label>
                <textarea
                    rows={5}
                    className="mt-2 w-full border rounded px-3 py-3 text-sm"
                    placeholder={
                        obra === "reforma"
                            ? "Ej.: Reforma de 100 m²: alicatar paredes 40 m², solado 60 m², 10 enchufes, pintura general."
                            : modalidad === "insitu"
                                ? "Ej.: Obra nueva in situ, vivienda de 120 m², 3 habitaciones, 2 baños, calidades standard."
                                : "Ej.: Modular hormigón 90 m², 3 módulos, 2 baños, cocina abierta. Nivel alto."
                    }
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                />
            </div>

            {/* Botón principal */}
            <div className="mt-4">
                <button
                    onClick={generar}
                    disabled={loading}
                    className="w-full sm:w-auto bg-black text-white rounded px-5 py-3 text-sm font-semibold"
                >
                    {loading ? "Generando…" : "Generar presupuesto"}
                </button>
            </div>

            {/* Estado */}
            {errorMsg ? (
                <div className="mt-4 p-3 rounded bg-red-50 text-red-700 text-sm">{errorMsg}</div>
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

            {/* Contacto (como acordamos) */}
            <div className="mt-10 border-t pt-6">
                <h2 className="text-lg font-semibold">Contactar técnico comercial de obras</h2>
                <ContactoForm onSubmit={contactar} disabled={loading} />
            </div>
        </div>
    );
}

/* ====== Vistas auxiliares ====== */
function eur(n) {
    return `${Number(n).toFixed(2)} €`;
}
function PresupuestoView({ result }) {
    const { budget, meta } = result || {};
    if (!budget) {
        return (
            <div className="text-sm text-gray-500">
                No se pudo interpretar un presupuesto. Prueba a detallar más el prompt.
            </div>
        );
    }
    const chapters = Object.values(budget.chapters || {});
    return (
        <div className="space-y-8">
            <div className="text-sm text-gray-600">
                {meta?.obra === "obra_nueva" ? (
                    <>
                        <div><span className="font-medium">Proyecto:</span> Obra nueva ({meta?.modalidad})</div>
                        {meta?.modalidad === "modular" && (
                            <div><span className="font-medium">Sistema:</span> {meta?.modularTipo}</div>
                        )}
                        <div><span className="font-medium">Nivel:</span> {meta?.nivelPrecio}</div>
                        <div><span className="font-medium">Superficie:</span> {meta?.m2} m²</div>
                    </>
                ) : (
                    <div><span className="font-medium">Tipo reforma:</span> {meta?.tipo}</div>
                )}
                {meta?.ciudad ? <div><span className="font-medium">Ciudad:</span> {meta?.ciudad}</div> : null}
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
                                    <td className="px-3 text-right">{it.unit === "%" ? `${it.qty}%` : it.qty}</td>
                                    <td className="px-3 text-right">{it.unit === "%" ? eur(it.price) : eur(it.price)}</td>
                                    <td className="px-3 text-right">{eur(it.amount)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="border-t">
                                <td className="py-2 px-3 text-right font-medium" colSpan={5}>
                                    Subtotal capítulo
                                </td>
                                <td className="px-3 text-right font-medium">{eur(ch.total)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            ))}

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
                                    <td className="px-3 text-right">{eur(e.price)}</td>
                                    <td className="px-3 text-right">{eur(e.amount)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="flex justify-end">
                <div className="text-right">
                    <div className="text-sm text-gray-500">Subtotal</div>
                    <div className="text-lg font-semibold">{eur(budget.subtotal)}</div>
                    <div className="text-sm text-gray-500 mt-2">TOTAL (sin IVA)</div>
                    <div className="text-2xl font-bold">{eur(budget.total)}</div>
                </div>
            </div>
        </div>
    );
}

function ContactoForm({ onSubmit, disabled }) {
    const [tab, setTab] = useState("persona");
    const [sending, setSending] = useState(false);
    const [ok, setOk] = useState(false);
    const [err, setErr] = useState("");
    const [form, setForm] = useState({
        name: "",
        phone: "",
        email: "",
        empresa: "",
        nif: ""
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
                    className={`px-3 py-2 text-sm ${tab === "persona" ? "bg-black text-white" : "bg-white"}`}
                >
                    Persona
                </button>
                <button
                    type="button"
                    onClick={() => setTab("empresa")}
                    className={`px-3 py-2 text-sm ${tab === "empresa" ? "bg-black text-white" : "bg-white"}`}
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

            {err ? <div className="text-sm text-red-600 mt-2">{err}</div> : null}
        </form>
    );
}
