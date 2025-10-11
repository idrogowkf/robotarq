// app/api/generate/route.js
export const runtime = "nodejs";

import { NextResponse } from "next/server";

/**
 * Estructura esperada del body:
 * { tipo: "local" | "vivienda" | "hosteleria" | "oficina" | "baño" | ..., prompt: string, metros?: number }
 *
 * Respuesta:
 * {
 *   ok: boolean,
 *   status: "success" | "fallback",
 *   meta: { tipo, prompt, metros, model },
 *   budget: {
 *     chapters: [{ code, name, items: [{ code, desc, unit, qty, price, amount }], total }],
 *     subtotal, extras: [{ code, desc, qty, unit:"%", price: base, amount }], total
 *   },
 *   message?: string
 * }
 */

// --- Base de datos simple para fallback (ajústala a tu criterio) ---
const PRICE_DB = {
    DM: {
        code: "CH-DM",
        name: "Demoliciones",
        items: {
            DM01: { code: "DM01", desc: "Demolición de alicatado", unit: "m2", price: 12 },
            DM02: { code: "DM02", desc: "Demolición de pavimento", unit: "m2", price: 10.5 },
            DM03: { code: "DM03", desc: "Retirada de sanitarios", unit: "ud", price: 25 },
        },
    },
    OB: {
        code: "CH-OB",
        name: "Obra y albañilería",
        items: {
            OB01: { code: "OB01", desc: "Recrecidos y regularización", unit: "m2", price: 14.8 },
            OB02: { code: "OB02", desc: "Tabique cartón-yeso 13/48/13", unit: "m2", price: 31 },
            OB03: { code: "OB03", desc: "Impermeabilización zona húmeda", unit: "m2", price: 22.5 },
        },
    },
    RV: {
        code: "CH-RV",
        name: "Revestimientos",
        items: {
            RV01: { code: "RV01", desc: "Alicatado cerámico", unit: "m2", price: 29 },
            RV02: { code: "RV02", desc: "Pavimento porcelánico", unit: "m2", price: 32 },
            RV03: { code: "RV03", desc: "Rejuntado especial", unit: "m2", price: 4.5 },
        },
    },
    IN: {
        code: "CH-IN",
        name: "Instalaciones",
        items: {
            IN01: { code: "IN01", desc: "Fontanería básica", unit: "ud", price: 450 },
            IN02: { code: "IN02", desc: "Electricidad básica", unit: "ud", price: 320 },
        },
    },
    PT: {
        code: "CH-PT",
        name: "Pintura",
        items: {
            PT01: { code: "PT01", desc: "Pintura plástica techo/pared", unit: "m2", price: 8.5 },
        },
    },
    RS: {
        code: "CH-RS",
        name: "Residuos y seguridad",
        items: {
            RS01: { code: "RS01", desc: "Contenedor y gestión de escombros", unit: "ud", price: 180 },
            RS02: { code: "RS02", desc: "Medios auxiliares/EPIs (prorrateo)", unit: "%", price: 5 },
        },
    },
    GB: {
        code: "CH-GB",
        name: "Gastos generales y beneficio",
        items: {
            GB01: { code: "GB01", desc: "Gastos generales", unit: "%", price: 10 },
            GB02: { code: "GB02", desc: "Beneficio industrial", unit: "%", price: 10 },
        },
    },
};

const r2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

function fallbackHeuristic({ tipo, prompt, metros = 10 }) {
    // Estima capítulos según palabras clave simples y superficie
    const area = Math.max(0, Number(metros) || 10);
    const wallArea = area * 2.2; // estimación burda

    const ensure = (acc, chap, key, qty) => {
        const c = PRICE_DB[chap]; if (!c) return;
        const it = c.items[key]; if (!it) return;
        if (!acc[chap]) acc[chap] = { code: c.code, name: c.name, items: [] };
        const amount = it.unit === "%" ? 0 : r2(qty * it.price);
        acc[chap].items.push({
            code: it.code, desc: it.desc, unit: it.unit, qty: r2(qty), price: it.price, amount
        });
    };

    const chapters = {};

    // Regla general por tipo
    const t = (prompt || "").toLowerCase() + " " + (tipo || "");
    if (t.includes("demol") || t.includes("retirar") || t.includes("quitar")) {
        ensure(chapters, "DM", "DM01", r2(wallArea * 0.6));
        ensure(chapters, "DM", "DM02", r2(area));
        ensure(chapters, "DM", "DM03", 1);
    }
    if (t.includes("pavim") || t.includes("suelo") || t.includes("gres") || t.includes("porcel")) {
        ensure(chapters, "RV", "RV02", r2(area));
    }
    if (t.includes("alicat") || t.includes("azulej")) {
        ensure(chapters, "RV", "RV01", r2(wallArea * 0.5));
        ensure(chapters, "RV", "RV03", r2(wallArea * 0.5));
    }
    if (t.includes("pint")) {
        ensure(chapters, "PT", "PT01", r2(area));
    }
    if (t.includes("fontan")) {
        ensure(chapters, "IN", "IN01", 1);
    }
    if (t.includes("electr")) {
        ensure(chapters, "IN", "IN02", 1);
    }
    // Mínimos
    ensure(chapters, "RS", "RS01", 1);

    // Totales y extras
    let subtotal = 0;
    Object.values(chapters).forEach((ch) => {
        ch.total = r2(ch.items.reduce((s, it) => s + it.amount, 0));
        subtotal += ch.total;
    });

    const extras = [];
    const addPercent = (chap, item, base) => {
        const c = PRICE_DB[chap]; if (!c) return;
        const it = c.items[item]; if (!it) return;
        const amount = r2((it.price / 100) * base);
        extras.push({ code: it.code, desc: it.desc, unit: "%", qty: it.price, price: base, amount });
    };

    addPercent("RS", "RS02", subtotal);
    addPercent("GB", "GB01", subtotal);
    addPercent("GB", "GB02", subtotal + (extras[1]?.amount || 0));
    const extraTotal = r2(extras.reduce((s, e) => s + e.amount, 0));
    const total = r2(subtotal + extraTotal);

    return {
        chapters,
        subtotal: r2(subtotal),
        extras,
        total,
    };
}

async function callOpenAI({ tipo, prompt, metros }) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("Missing OPENAI_API_KEY");

    const system = `Eres un presupuestador técnico estilo Presto. 
Devolverás SOLO JSON válido con esta forma:
{
  "chapters": {
    "CH-XX": {
      "code": "CH-XX",
      "name": "Nombre capítulo",
      "items": [
        { "code":"XX01","desc":"Descripción","unit":"m2|m|ud|%","qty": number,"price": number,"amount": number }
      ],
      "total": number
    }
  },
  "subtotal": number,
  "extras": [
    { "code":"GB01","desc":"Gastos generales","unit":"%","qty":10,"price": base,"amount": number }
  ],
  "total": number
}`;

    const user = `Tipo de reforma: ${tipo || "general"}
Superficie aprox (m2): ${metros || "N/D"}
Descripción del cliente: ${prompt}

Usa precios realistas y coherentes. Mantén cantidades y totales consistentes.`;

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
            model: "gpt-4o-mini",
            temperature: 0.3,
            messages: [
                { role: "system", content: system },
                { role: "user", content: user },
            ],
            response_format: { type: "json_object" },
        }),
    });

    if (!resp.ok) {
        const t = await resp.text().catch(() => "");
        throw new Error(`OpenAI ${resp.status}: ${t}`);
    }

    const data = await resp.json();
    const txt = data.choices?.[0]?.message?.content || "{}";
    const parsed = JSON.parse(txt);

    // Normalizar a la misma estructura que usamos en cliente
    // chapters puede venir como objeto; convertimos a mapa con totales
    const chapters = {};
    let subtotal = 0;
    const chIn = parsed.chapters || parsed.capitulos || {};
    Object.values(chIn).forEach((ch) => {
        const items = (ch.items || []).map((it) => ({
            code: it.code,
            desc: it.desc,
            unit: it.unit,
            qty: Number(it.qty),
            price: Number(it.price),
            amount: r2(Number(it.amount)),
        }));
        const total = r2(items.reduce((s, it) => s + Number(it.amount), 0));
        chapters[ch.code] = { code: ch.code, name: ch.name, items, total };
        subtotal += total;
    });

    const extras = (parsed.extras || []).map((e) => ({
        code: e.code, desc: e.desc, unit: e.unit || "%", qty: Number(e.qty),
        price: Number(e.price), amount: r2(Number(e.amount))
    }));
    const extraTotal = r2(extras.reduce((s, e) => s + e.amount, 0));
    const total = r2(Number(parsed.total) || (subtotal + extraTotal));

    return {
        ok: true,
        status: "success",
        meta: { tipo, prompt, metros, model: "gpt-4o-mini" },
        budget: { chapters, subtotal: r2(subtotal), extras, total },
    };
}

export async function POST(req) {
    try {
        const { tipo, prompt, metros } = await req.json();

        try {
            const out = await callOpenAI({ tipo, prompt, metros });
            return NextResponse.json(out);
        } catch (err) {
            // Fallback que NO revela el error real al usuario
            const budget = fallbackHeuristic({ tipo, prompt, metros });
            return NextResponse.json({
                ok: true,
                status: "fallback",
                meta: { tipo, prompt, metros, model: "fallback" },
                budget,
                message: "Tu presupuesto está en marcha. Un técnico te contactará para afinar detalles.",
            });
        }
    } catch (e) {
        // Si el body está mal, devolvemos fallback básico igualmente
        const budget = fallbackHeuristic({ tipo: "general", prompt: "", metros: 10 });
        return NextResponse.json({
            ok: true,
            status: "fallback",
            meta: { tipo: "general", prompt: "", metros: 10, model: "fallback" },
            budget,
            message: "Tu presupuesto está en marcha. Un técnico te contactará para afinar detalles.",
        });
    }
}
