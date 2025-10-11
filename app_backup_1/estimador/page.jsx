// app/estimador/page.jsx
"use client";

import { useEffect, useMemo, useState } from "react";

/** ========= Utilidades ========= */
const PHONE = "+34624473123";
const EMAIL_OWNER = "hola@robotarq.com";

// Formato dinero EUR
const fmt = (n) =>
    (Number(n) || 0).toLocaleString("es-ES", {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 2,
    });

// Base local mínima (fallback)
const PRICE_DB = {
    DM: {
        code: "CH-DM",
        name: "Demoliciones y desmontajes",
        items: {
            DM01: { code: "DM01", desc: "Demolición de alicatado existente", unit: "m2", price: 12.0 },
            DM02: { code: "DM02", desc: "Demolición de pavimento existente", unit: "m2", price: 10.5 },
            DM03: { code: "DM03", desc: "Retirada de sanitarios / mobiliario", unit: "ud", price: 25.0 },
        },
    },
    OB: {
        code: "CH-OB",
        name: "Obra y albañilería",
        items: {
            OB01: { code: "OB01", desc: "Recrecidos y regularización", unit: "m2", price: 14.8 },
            OB02: { code: "OB02", desc: "Tabique cartón-yeso 13/48/13", unit: "m2", price: 31.0 },
        },
    },
    RV: {
        code: "CH-RV",
        name: "Revestimientos",
        items: {
            RV01: { code: "RV01", desc: "Alicatado cerámico", unit: "m2", price: 29.0 },
            RV02: { code: "RV02", desc: "Pavimento gres porcelánico", unit: "m2", price: 32.0 },
        },
    },
    IN: {
        code: "CH-IN",
        name: "Instalaciones",
        items: {
            IN01: { code: "IN01", desc: "Fontanería (tomas y desagües)", unit: "ud", price: 450.0 },
            IN02: { code: "IN02", desc: "Electricidad (4–6 puntos)", unit: "ud", price: 320.0 },
        },
    },
    RS: {
        code: "CH-RS",
        name: "Residuos y seguridad",
        items: {
            RS01: { code: "RS01", desc: "Contenedor y gestión de escombros", unit: "ud", price: 180.0 },
            RS02: { code: "RS02", desc: "Medios auxiliares y EPIs", unit: "%", price: 5.0 },
        },
    },
    GB: {
        code: "CH-GB",
        name: "Gastos generales y beneficio",
        items: {
            GB01: { code: "GB01", desc: "Gastos generales", unit: "%", price: 10.0 },
            GB02: { code: "GB02", desc: "Beneficio industrial", unit: "%", price: 10.0 },
        },
    },
};

// Heurística de contingencia
function fallbackEstimate({ prompt = "", tipo = "local" }) {
    const txt = prompt.toLowerCase();
    const baseM2 = tipo === "hosteleria" ? 90 : tipo === "vivienda" ? 70 : 80;
    const area = Math.max(40, Math.min(400, baseM2));
    const rows = [];
    const push = (chap, item, qty) => rows.push({ chap, item, qty });

    if (/demol|retir|quitar/.test(txt)) {
        push("DM", "DM01", area * 0.6);
        push("DM", "DM02", area);
        push("DM", "DM03", 4);
    }
    if (/alicat|azulej/.test(txt) || /bañ|ducha/.test(txt)) {
        push("RV", "RV01", area * 0.5);
    }
    if (/pavim|suelo|gres|porcel/.test(txt)) {
        push("RV", "RV02", area);
    }
    if (/electr|puntos|ilumin/.test(txt)) {
        push("IN", "IN02", tipo === "vivienda" ? 1 : 2);
    }
    if (/fontan|bañ|agua/.test(txt)) {
        push("IN", "IN01", 1);
    }
    push("RS", "RS01", 1);
    return rows;
}

// Calcula presupuesto
function computeBudget(rows) {
    const chapters = {};
    rows.forEach(({ chap, item, qty }) => {
        const ch = PRICE_DB[chap];
        const it = ch?.items?.[item];
        if (!ch || !it) return;
        if (!chapters[chap]) chapters[chap] = { code: ch.code, name: ch.name, items: [] };
        const amount = it.unit === "%" ? 0 : Number(qty) * it.price;
        chapters[chap].items.push({
            code: it.code,
            desc: it.desc,
            unit: it.unit,
            qty: Math.round((Number(qty) + Number.EPSILON) * 100) / 100,
            price: it.price,
            amount: Math.round((amount + Number.EPSILON) * 100) / 100,
        });
    });

    let subtotal = 0;
    Object.values(chapters).forEach((ch) => {
        ch.total = ch.items.reduce((a, b) => a + (b.amount || 0), 0);
        ch.total = Math.round((ch.total + Number.EPSILON) * 100) / 100;
        subtotal += ch.total;
    });

    const pct = (chapKey, itemKey, base) => {
        const it = PRICE_DB[chapKey]?.items?.[itemKey];
        if (!it) return null;
        return {
            code: it.code,
            desc: it.desc,
            unit: it.unit,
            qty: it.price,
            price: base,
            amount: Math.round(((it.price / 100) * base + Number.EPSILON) * 100) / 100,
        };
    };

    const rs02 = pct("RS", "RS02", subtotal);
    const gb01 = pct("GB", "GB01", subtotal);
    const gb02 = pct("GB", "GB02", subtotal + (gb01?.amount || 0));

    const extras = [rs02, gb01, gb02].filter(Boolean);
    const total =
        Math.round(
            (subtotal + extras.reduce((a, e) => a + e.amount, 0) + Number.EPSILON) * 100
        ) / 100;

    return { chapters, subtotal, extras, total };
}

export default function EstimadorPage() {
    // Lee tipo y q desde la URL
    const [tipo, setTipo] = useState("local");
    const [prompt, setPrompt] = useState("");

    useEffect(() => {
        try {
            const sp = new URLSearchParams(window.location.search);
            const t = sp.get("tipo");
            const q = sp.get("q");
            if (t) setTipo(t);
            if (q) setPrompt(q);
        } catch { }
    }, []);

    const [loading, setLoading] = useState(false);
    const [rows, setRows] = useState([]);
    const [usedFallback, setUsedFallback] = useState(false);
    const budget = useMemo(() => computeBudget(rows), [rows]);

    // Gating
    const [showGate, setShowGate] = useState(false);
    const [formatToSend, setFormatToSend] = useState(null); // pdf | xlsx
    const [isCompany, setIsCompany] = useState(false);
    const [form, setForm] = useState({
        name: "",
        company: "",
        nif: "",
        phone: "",
        email: "",
        consent: true,
    });
    const canSubmitGate =
        form.name.trim() &&
        form.phone.trim() &&
        form.email.trim() &&
        (!isCompany || (form.company.trim() && form.nif.trim()));

    async function handleEstimate() {
        setLoading(true);
        setUsedFallback(false);
        try {
            const res = await fetch("/api/ai/estimate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt, contexto: tipo }),
            });
            if (!res.ok) throw new Error("AI endpoint no disponible");
            const data = await res.json();
            if (!Array.isArray(data?.rows)) throw new Error("Respuesta IA inválida");
            setRows(data.rows);
        } catch (e) {
            console.warn("[Estimador] Fallback local por:", e.message);
            const fr = fallbackEstimate({ prompt, tipo });
            setRows(fr);
            setUsedFallback(true);
        } finally {
            setLoading(false);
        }
    }

    // Exportación PDF: layout de columnas fijas (ajustado a tu ejemplo).
    async function exportPDF() {
        const { jsPDF } = await import("jspdf");
        const doc = new jsPDF({ unit: "pt", format: "a4" }); // puntos para controlar 1:1
        let y = 56; // margen superior

        // Título
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text(`Presupuesto técnico — ${tipo}`, 56, y);
        y += 18;

        // Descripción
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        const desc = `Descripción: ${prompt}`;
        doc.text(desc, 56, y, { maxWidth: 483 }); // ancho útil (595-2*56)
        y += 22;

        // Cabecera tabla
        const col = {
            codigo: 56,
            cantidad: 140,
            ud: 200,
            resumen: 232,
            precio: 430,
            subtotal: 495,
            importe: 560,
        };

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.text("CÓDIGO", col.codigo, y);
        doc.text("CANTIDAD", col.cantidad, y);
        doc.text("UD", col.ud, y);
        doc.text("RESUMEN", col.resumen, y);
        doc.text("PRECIO", col.precio, y, { align: "right" });
        doc.text("SUBTOTAL", col.subtotal, y, { align: "right" });
        doc.text("IMPORTE", col.importe, y, { align: "right" });
        y += 12;

        // Líneas por capítulo
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);

        function ensurePage(minSpace = 48) {
            if (y + minSpace > 812) {
                doc.addPage({ format: "a4", unit: "pt" });
                y = 56;
            }
        }

        Object.values(budget.chapters).forEach((ch) => {
            ensurePage(32);
            doc.text(`${ch.code} — ${ch.name}`, col.codigo, y);
            y += 14;

            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);

            ch.items.forEach((it) => {
                ensurePage(18);
                const sub = (it.price * it.qty) || 0;

                doc.text(String(it.code), col.codigo, y);
                doc.text(String(it.qty), col.cantidad, y);
                doc.text(String(it.unit), col.ud, y);
                doc.text(String(it.desc), col.resumen, y, { maxWidth: 180 });
                doc.text((it.price).toFixed(2) + " €", col.precio, y, { align: "right" });
                doc.text(sub.toFixed(2) + " €", col.subtotal, y, { align: "right" });
                doc.text((it.amount).toFixed(2) + " €", col.importe, y, { align: "right" });

                y += 12;
            });

            ensurePage(20);
            doc.setFont("helvetica", "bold");
            doc.text(`Subtotal capítulo: ${fmt(ch.total)}`, col.codigo, y);
            y += 16;

            doc.setFont("helvetica", "normal");
        });

        if (budget.extras?.length) {
            ensurePage(28);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            doc.text("Cargos porcentuales", col.codigo, y);
            y += 14;

            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            budget.extras.forEach((e) => {
                ensurePage(14);
                doc.text(String(e.code), col.codigo, y);
                doc.text(String(e.qty) + "%", col.cantidad, y);
                doc.text("%", col.ud, y);
                doc.text(String(e.desc), col.resumen, y, { maxWidth: 180 });
                doc.text(fmt(e.price), col.precio, y, { align: "right" });
                doc.text("", col.subtotal, y, { align: "right" });
                doc.text(fmt(e.amount), col.importe, y, { align: "right" });
                y += 12;
            });
            y += 4;
        }

        ensurePage(24);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text(`TOTAL PRESUPUESTO (sin IVA): ${fmt(budget.total)}`, col.codigo, y);
        y += 16;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.text(
            "Observación: precios orientativos; sujetos a visita técnica, mediciones y memoria de calidades.",
            col.codigo,
            y
        );

        doc.save("Robotarq_Presupuesto.pdf");
    }

    // Export Excel
    async function exportXLSX() {
        try {
            const XLSX = await import("xlsx");
            const rowsExcel = [];
            rowsExcel.push([
                "CÓDIGO",
                "CANTIDAD",
                "UD",
                "RESUMEN",
                "PRECIO",
                "SUBTOTAL",
                "IMPORTE",
            ]);

            Object.values(budget.chapters).forEach((ch) => {
                rowsExcel.push([`${ch.code} — ${ch.name}`, "", "", "", "", "", ""]);
                ch.items.forEach((it) => {
                    rowsExcel.push([
                        it.code,
                        it.qty,
                        it.unit,
                        it.desc,
                        it.price,
                        (it.price * it.qty).toFixed(2),
                        it.amount.toFixed(2),
                    ]);
                });
                rowsExcel.push(["Subtotal capítulo", "", "", "", "", "", ch.total]);
                rowsExcel.push(["", "", "", "", "", "", ""]);
            });

            if (budget.extras?.length) {
                rowsExcel.push(["Cargos porcentuales", "", "", "", "", "", ""]);
                budget.extras.forEach((e) => {
                    rowsExcel.push([
                        e.code,
                        `${e.qty}%`,
                        "%",
                        e.desc,
                        e.price,
                        "",
                        e.amount,
                    ]);
                });
            }
            rowsExcel.push(["TOTAL (sin IVA)", "", "", "", "", "", budget.total]);

            const ws = XLSX.utils.aoa_to_sheet(rowsExcel);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Presupuesto");

            const wbout = XLSX.write(wb, { type: "array", bookType: "xlsx" });
            const blob = new Blob([wbout], {
                type:
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "Robotarq_Presupuesto.xlsx";
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            alert("Instala la dependencia 'xlsx' para exportar Excel: npm i xlsx");
            console.error(err);
        }
    }

    // Email con adjunto (usa tu /api/send-quote actual si soporta adjuntos)
    async function sendEmailWithAttachment(type) {
        let filename = "";
        let mime = "";
        let base64 = "";

        if (type === "pdf") {
            const { jsPDF } = await import("jspdf");
            const d = new jsPDF({ unit: "pt", format: "a4" });
            d.setFont("helvetica", "bold");
            d.setFontSize(14);
            d.text(`Presupuesto técnico — ${tipo}`, 56, 56);
            const blob = d.output("blob");
            const buff = await blob.arrayBuffer();
            base64 = btoa(String.fromCharCode(...new Uint8Array(buff)));
            filename = "Robotarq_Presupuesto.pdf";
            mime = "application/pdf";
        } else if (type === "xlsx") {
            try {
                const XLSX = await import("xlsx");
                const ws = XLSX.utils.aoa_to_sheet([["TOTAL (sin IVA)", budget.total]]);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "Presupuesto");
                const out = XLSX.write(wb, { type: "array", bookType: "xlsx" });
                const buff = new Uint8Array(out);
                base64 = btoa(String.fromCharCode(...buff));
                filename = "Robotarq_Presupuesto.xlsx";
                mime =
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            } catch {
                alert("Instala 'xlsx' para enviar Excel: npm i xlsx");
                return;
            }
        }

        const payload = {
            nombre: form.name,
            empresa: isCompany ? form.company : "",
            nif: isCompany ? form.nif : "",
            telefono: form.phone,
            email: form.email,
            origen: "estimador-ia",
            mensaje: `Tipo: ${tipo}\nDescripción: ${prompt}\nTotal: ${fmt(
                budget.total
            )}`,
            adjuntos: [
                {
                    filename,
                    mime,
                    contentBase64: base64,
                },
            ],
            enviarAlCliente: true,
            enviarAlPropietario: true,
            propietarioEmail: EMAIL_OWNER,
            formatoPreferido: type,
        };

        try {
            const res = await fetch("/api/send-quote", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const t = await res.text();
                throw new Error(t);
            }
            alert("Enviado por correo correctamente.");
        } catch (err) {
            console.error(err);
            alert(
                "No se pudo enviar por correo con adjunto. Aun así, puedes descargar el archivo localmente."
            );
        }
    }

    function openGate(type) {
        setFormatToSend(type);
        setShowGate(true);
    }

    async function confirmGate() {
        if (formatToSend === "pdf") await exportPDF();
        if (formatToSend === "xlsx") await exportXLSX();
        await sendEmailWithAttachment(formatToSend);
        setShowGate(false);
    }

    return (
        <div className="min-h-screen bg-white text-slate-900">
            {/* HEADER */}
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <a href="/" className="flex items-center gap-2" aria-label="Robotarq">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-900 to-sky-400 grid place-items-center text-white font-bold">
                            R
                        </div>
                        <span className="font-bold">Robotarq</span>
                    </a>
                    <div className="hidden md:flex items-center gap-3">
                        <a href={`tel:${PHONE}`} className="px-3 py-2 rounded-lg border">
                            Llamar {PHONE}
                        </a>
                        <a
                            href={`https://wa.me/${PHONE.replace("+", "")}`}
                            className="px-3 py-2 rounded-lg border"
                            target="_blank"
                            rel="noopener"
                        >
                            WhatsApp
                        </a>
                    </div>
                </div>
            </header>

            {/* Título */}
            <section className="max-w-5xl mx-auto px-4 py-10 text-center">
                <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">
                    Presupuesto técnico
                </h1>
                <p className="text-slate-600 mt-3">
                    Partidas, cantidades y precios orientativos tipo Presto. Descarga en
                    PDF/Excel o envíalo por correo.
                </p>
            </section>

            {/* Tipo + Prompt */}
            <section className="max-w-5xl mx-auto px-4">
                <div className="rounded-2xl border p-6 bg-white/80">
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
                                className={`px-3 py-2 rounded-lg border ${tipo === val ? "bg-black text-white" : "bg-white"
                                    }`}
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
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Ej.: Reformar bar de 100 m² con nueva barra, pavimento porcelánico, insonorización y salida de humos…"
                        />
                    </div>

                    <div className="mt-4 flex gap-3">
                        <button
                            onClick={handleEstimate}
                            disabled={loading}
                            className="px-5 py-3 rounded-xl bg-black text-white disabled:opacity-60"
                        >
                            {loading ? "Generando…" : "Previsualizar presupuesto"}
                        </button>
                        {usedFallback && (
                            <span className="text-amber-600 text-sm">
                                Modo contingencia activado (IA no disponible). Se usó heurística
                                local.
                            </span>
                        )}
                    </div>
                </div>
            </section>

            {/* Previsualización */}
            <section className="max-w-7xl mx-auto px-4 py-10">
                <div className="rounded-2xl border p-6 overflow-x-auto bg-white">
                    <div className="flex items-center justify-between gap-4">
                        <h2 className="text-xl md:text-2xl font-bold">
                            Presupuesto — {tipo}
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            <button onClick={() => openGate("pdf")} className="px-4 py-2 rounded-lg border">
                                Descargar PDF / Enviar
                            </button>
                            <button onClick={() => openGate("xlsx")} className="px-4 py-2 rounded-lg border">
                                Descargar Excel / Enviar
                            </button>
                        </div>
                    </div>

                    <div className="mt-4 min-w-[820px]">
                        <table className="w-full text-sm border-separate border-spacing-y-1">
                            <thead>
                                <tr className="text-left">
                                    <th className="py-2">CÓDIGO</th>
                                    <th>CANTIDAD</th>
                                    <th>UD</th>
                                    <th>RESUMEN</th>
                                    <th className="text-right">PRECIO</th>
                                    <th className="text-right">SUBTOTAL</th>
                                    <th className="text-right">IMPORTE</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.values(budget.chapters).map((ch) => (
                                    <>
                                        <tr key={ch.code}>
                                            <td colSpan={7} className="pt-4 pb-2 font-semibold">
                                                {ch.code} — {ch.name}
                                            </td>
                                        </tr>
                                        {ch.items.map((it) => (
                                            <tr key={it.code} className="bg-slate-50">
                                                <td className="py-2 px-2">{it.code}</td>
                                                <td className="px-2">{it.qty}</td>
                                                <td className="px-2">{it.unit}</td>
                                                <td className="px-2">{it.desc}</td>
                                                <td className="px-2 text-right">{fmt(it.price)}</td>
                                                <td className="px-2 text-right">{fmt(it.price * it.qty)}</td>
                                                <td className="px-2 text-right">{fmt(it.amount)}</td>
                                            </tr>
                                        ))}
                                        <tr>
                                            <td colSpan={6} className="text-right font-medium pt-2">
                                                Subtotal capítulo
                                            </td>
                                            <td className="text-right font-medium pt-2">
                                                {fmt(ch.total)}
                                            </td>
                                        </tr>
                                    </>
                                ))}
                            </tbody>

                            {budget.extras?.length ? (
                                <tfoot>
                                    <tr>
                                        <td colSpan={7} className="pt-6 font-semibold">
                                            Cargos porcentuales
                                        </td>
                                    </tr>
                                    {budget.extras.map((e, i) => (
                                        <tr key={i} className="bg-slate-50">
                                            <td className="py-2 px-2">{e.code}</td>
                                            <td className="px-2">{e.qty}%</td>
                                            <td className="px-2">%</td>
                                            <td className="px-2">{e.desc}</td>
                                            <td className="px-2 text-right">{fmt(e.price)}</td>
                                            <td className="px-2 text-right"></td>
                                            <td className="px-2 text-right">{fmt(e.amount)}</td>
                                        </tr>
                                    ))}
                                    <tr>
                                        <td colSpan={6} className="text-right font-semibold pt-3">
                                            TOTAL (sin IVA)
                                        </td>
                                        <td className="text-right font-bold pt-3">
                                            {fmt(budget.total)}
                                        </td>
                                    </tr>
                                </tfoot>
                            ) : (
                                <tfoot>
                                    <tr>
                                        <td colSpan={6} className="text-right font-semibold pt-3">
                                            TOTAL (sin IVA)
                                        </td>
                                        <td className="text-right font-bold pt-3">
                                            {fmt(budget.total)}
                                        </td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                        <p className="text-xs text-slate-500 mt-4">
                            * Orientativo. Sujeto a visita, mediciones y memoria de calidades.
                        </p>
                    </div>
                </div>
            </section>

            {/* Modal Gating */}
            {showGate && (
                <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center px-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-6 border">
                        <h3 className="text-xl font-semibold">Antes de descargar</h3>
                        <p className="text-slate-600 mt-1">
                            Déjanos tus datos y te enviaremos el presupuesto por correo.
                        </p>

                        <div className="mt-4">
                            <label className="text-sm font-medium">¿Es empresa?</label>
                            <div className="mt-2 flex gap-2">
                                <button
                                    className={`px-3 py-2 rounded-lg border ${!isCompany ? "bg-black text-white" : "bg-white"}`}
                                    onClick={() => setIsCompany(false)}
                                >
                                    No
                                </button>
                                <button
                                    className={`px-3 py-2 rounded-lg border ${isCompany ? "bg-black text-white" : "bg-white"}`}
                                    onClick={() => setIsCompany(true)}
                                >
                                    Sí
                                </button>
                            </div>
                        </div>

                        {isCompany && (
                            <div className="grid md:grid-cols-2 gap-3 mt-3">
                                <div>
                                    <label className="text-sm">Empresa</label>
                                    <input
                                        className="w-full mt-1 px-3 py-2 border rounded-xl"
                                        value={form.company}
                                        onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                                        placeholder="Nombre fiscal"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm">NIF</label>
                                    <input
                                        className="w-full mt-1 px-3 py-2 border rounded-xl"
                                        value={form.nif}
                                        onChange={(e) => setForm((f) => ({ ...f, nif: e.target.value }))}
                                        placeholder="B12345678"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="grid md:grid-cols-2 gap-3 mt-3">
                            <div>
                                <label className="text-sm">Nombre</label>
                                <input
                                    className="w-full mt-1 px-3 py-2 border rounded-xl"
                                    value={form.name}
                                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                                    placeholder="Tu nombre"
                                />
                            </div>
                            <div>
                                <label className="text-sm">Teléfono</label>
                                <input
                                    className="w-full mt-1 px-3 py-2 border rounded-xl"
                                    value={form.phone}
                                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                                    placeholder="+34 6XX XXX XXX"
                                />
                            </div>
                        </div>
                        <div className="mt-3">
                            <label className="text-sm">Email</label>
                            <input
                                className="w-full mt-1 px-3 py-2 border rounded-xl"
                                value={form.email}
                                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                                placeholder="tu@email.com"
                            />
                        </div>

                        <div className="mt-4 flex items-center gap-2">
                            <input
                                id="consent"
                                type="checkbox"
                                checked={form.consent}
                                onChange={(e) => setForm((f) => ({ ...f, consent: e.target.checked }))}
                            />
                            <label htmlFor="consent" className="text-sm text-slate-600">
                                Acepto la Política de privacidad y que Robotarq me contacte.
                            </label>
                        </div>

                        <div className="mt-6 flex gap-2">
                            <button onClick={() => setShowGate(false)} className="px-4 py-2 rounded-lg border">
                                Cancelar
                            </button>
                            <button
                                disabled={!canSubmitGate}
                                onClick={confirmGate}
                                className="px-4 py-2 rounded-lg bg-black text-white disabled:opacity-60"
                            >
                                Descargar y enviar
                            </button>
                        </div>

                        <p className="text-xs text-slate-500 mt-3">
                            Se enviará copia a {EMAIL_OWNER}. Escribe a{" "}
                            <a className="text-blue-700" href={`mailto:${EMAIL_OWNER}`}>
                                {EMAIL_OWNER}
                            </a>{" "}
                            o llámanos al{" "}
                            <a className="text-blue-700" href={`tel:${PHONE}`}>
                                {PHONE}
                            </a>
                            .
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
