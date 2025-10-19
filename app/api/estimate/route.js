// app/api/estimate/route.js
import { NextResponse } from "next/server";

/**
 * Utilidades
 */
const r2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

function computeBudgetFromRules({ tipo, ciudad, prompt }) {
    // ⚠️ Heurística mínima (fallback) — ajusta a tu base de precios real
    const chapters = {};

    const add = (chapKey, chapName, code, desc, unit, qty, price) => {
        if (!chapters[chapKey]) chapters[chapKey] = { code: chapKey, name: chapName, items: [] };
        const amount = unit === "%" ? 0 : r2(Number(qty) * Number(price));
        chapters[chapKey].items.push({ code, desc, unit, qty: r2(qty), price, amount });
    };

    // Ejemplo simple de lectura por palabras:
    const text = (prompt || "").toLowerCase();

    // Unidades básicas
    const m2Match = text.match(/(\d+(\.\d+)?)\s*(m2|m²|metros cuadrados)/);
    const m2 = m2Match ? Number(m2Match[1]) : 20;

    if (/pavimento|suelo|porcel/i.test(text)) {
        add("RV", "Revestimientos", "RV02", "Pavimento gres porcelánico", "m2", m2, 32);
        add("OB", "Obra", "OB01", "Recrecidos y regularización", "m2", m2, 14.8);
    }
    if (/pintur|pintar/i.test(text)) {
        add("PT", "Pintura y acabados", "PT01", "Pintura plástica paredes/techos", "m2", m2, 8.5);
    }
    // Puntos
    const tomas = /(\d+)\s*(tomas?|puntos? de toma)/i.exec(text);
    const puntosLuz = /(\d+)\s*(puntos? de luz)/i.exec(text);
    if (tomas) {
        add("IN", "Instalaciones", "IN11", "Toma eléctrica", "ud", Number(tomas[1]), 35);
    }
    if (puntosLuz) {
        add("IN", "Instalaciones", "IN12", "Punto de luz", "ud", Number(puntosLuz[1]), 42);
    }
    if (/cuadro el[eé]ctrico|cuadro\s+general/i.test(text)) {
        add("IN", "Instalaciones", "IN13", "Sustitución de cuadro eléctrico", "ud", 1, 480);
    }

    // Costes fijos mínimos (actuaciones preliminares)
    add("PR", "Actuaciones preliminares", "PR01", "Permiso de ocupación de vía pública (estimación)", "ud", 1, 180);
    add("DM", "Demoliciones", "DM01", "Demoliciones y desmontajes varios (estimación)", "m2", Math.max(10, m2 * 0.6), 12);
    add("RS", "Residuos", "RS01", "Contenedor y gestión de escombros", "ud", 1, 180);

    // Totales
    let subtotal = 0;
    Object.values(chapters).forEach((ch) => {
        ch.total = r2(ch.items.reduce((acc, it) => acc + it.amount, 0));
        subtotal += ch.total;
    });

    // % generales/beneficio (ejemplo)
    const percentLine = (chapKey, code, desc, pct, base) => ({
        chapKey, code, desc, unit: "%", qty: pct, price: base, amount: r2((pct / 100) * base),
    });
    const extras = [
        percentLine("GB", "GB01", "Gastos generales (10%)", 10, subtotal),
        percentLine("GB", "GB02", "Beneficio industrial (10%)", 10, subtotal * 1.10),
    ];
    const extraTotal = r2(extras.reduce((a, e) => a + e.amount, 0));
    const total = r2(subtotal + extraTotal);

    return { chapters, subtotal: r2(subtotal), extras, total };
}

async function callOpenAI({ tipo, ciudad, prompt }) {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error("OPENAI_API_KEY ausente");

    // Carga perezosa del SDK (evita fallos en build si no está)
    let OpenAI;
    try {
        OpenAI = (await import("openai")).default;
    } catch {
        throw new Error("Módulo 'openai' no instalado");
    }

    const client = new OpenAI({ apiKey: key });

    // Instrucción: devolver JSON con estructura chapters/subtotal/extras/total
    const system = `
Eres un estimador de reformas. Devuelve SOLO JSON con esta forma:
{
  "chapters": {
    "<CLAVE>": {
      "code": "<CLAVE>",
      "name": "Nombre",
      "items": [
        {"code":"XX01","desc":"Desc","unit":"m2|ud|%","qty":number,"price":number,"amount":number}
      ],
      "total": number
    }
  },
  "subtotal": number,
  "extras": [
    {"code":"GB01","desc":"Gastos generales (10%)","unit":"%","qty":10,"price":number,"amount":number}
  ],
  "total": number
}`;

    const user = `Tipo: ${tipo}\nCiudad: ${ciudad || "(no indicada)"}\nDescripción: ${prompt}\nDevuelve precios realistas (España) y considera partidas clave: preliminares, demoliciones, residuos, instalaciones (tomas, puntos de luz, cuadro), revestimientos, pintura, etc.`;

    // Usamos Responses API (model gpt-4o-mini)
    const res = await client.responses.create({
        model: "gpt-4o-mini",
        input: [
            { role: "system", content: system },
            { role: "user", content: user },
        ],
        temperature: 0.2,
    });

    const text = res.output_text?.trim();
    if (!text) throw new Error("Sin respuesta de modelo");
    let parsed;
    try {
        parsed = JSON.parse(text);
    } catch {
        // Intenta reparar JSON si vino rodeado de texto/código
        const match = text.match(/\{[\s\S]*\}$/);
        parsed = match ? JSON.parse(match[0]) : null;
    }
    if (!parsed?.chapters) throw new Error("JSON inválido");

    // Normaliza amounts y totales por si el modelo deja algo sin redondear
    let subtotal = 0;
    for (const ch of Object.values(parsed.chapters)) {
        for (const it of ch.items || []) {
            it.amount = it.unit === "%" ? 0 : r2(Number(it.qty) * Number(it.price));
        }
        ch.total = r2((ch.items || []).reduce((a, it) => a + it.amount, 0));
        subtotal += ch.total;
    }
    parsed.subtotal = r2(subtotal);
    if (Array.isArray(parsed.extras)) {
        parsed.extras = parsed.extras.map((e) => ({
            ...e,
            amount: r2((Number(e.qty) / 100) * parsed.subtotal),
            price: parsed.subtotal,
        }));
    } else {
        parsed.extras = [];
    }
    const extraTotal = r2(parsed.extras.reduce((a, e) => a + e.amount, 0));
    parsed.total = r2(parsed.subtotal + extraTotal);

    return parsed;
}

export async function POST(req) {
    try {
        const { tipo = "local", ciudad = "", prompt = "" } = await req.json();

        let budget = null;
        let usedAI = false;
        let errorAI = null;

        // 1) Intentar IA primero
        try {
            budget = await callOpenAI({ tipo, ciudad, prompt });
            usedAI = true;
        } catch (e) {
            errorAI = String(e?.message || e);
            // 2) Fallback a reglas internas
            budget = computeBudgetFromRules({ tipo, ciudad, prompt });
            usedAI = false;
        }

        return NextResponse.json({
            ok: true,
            meta: { tipo, ciudad, prompt, usedAI, errorAI },
            budget,
        });
    } catch (err) {
        return NextResponse.json(
            { ok: false, error: String(err?.message || err) },
            { status: 500 }
        );
    }
}
