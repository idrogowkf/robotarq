// app/api/estimate/route.js
import { NextResponse } from "next/server";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Pisos de precio por unidad
const PRICE_FLOORS = {
    m2: 25,
    ud: 35,
    ml: 20,
};

// Utilidad
function num(n, d = 2) {
    const x = Number(n);
    if (!isFinite(x)) return 0;
    return Number(x.toFixed(d));
}

function isPointsDesc(desc = "") {
    return /puntos?\s+de\s+luz|tomas?|enchufes?/i.test(desc);
}
function isCuadroDesc(desc = "") {
    return /cuadro\s+el(é|e)ctrico/i.test(desc);
}
function isTilesDesc(desc = "") {
    return /alicat|cer(á|a)mica|porcel(á|a)nico|azulej/i.test(desc);
}

// Normaliza items: qty, price (con mínimos) y amount
function normalizeItems(items = []) {
    return items
        .filter((it) => it && (it.qty || it.amount || it.price) && it.desc)
        .map((it, idx) => {
            const unit = (it.unit || "").toLowerCase() || "ud";
            const qty = Math.max(0, Number(it.qty) || 0);

            let price = Math.max(Number(it.price) || 0, PRICE_FLOORS[unit] ?? 0);

            // Reglas de mínimos por concepto
            const d = String(it.desc || "");
            if (isPointsDesc(d)) price = Math.max(price, 60);           // puntos/tomas ≥ 60 €/ud
            if (isCuadroDesc(d)) price = Math.max(price, 350);          // cuadro eléctrico ≥ 350 €/ud
            if (isTilesDesc(d) && unit === "m2") price = Math.max(price, 38); // alicatado ≥ 38 €/m2

            const amount = num(qty * price);
            return {
                code: it.code || `IT-${idx + 1}`,
                desc: d.trim(),
                unit,
                qty: num(qty, 2),
                price: num(price, 2),
                amount,
            };
        });
}

function chapterTotal(items) {
    return num(items.reduce((s, it) => s + (Number(it.amount) || 0), 0));
}

// Fallback determinista si falla el modelo
function fallbackFromPrompt({ prompt }) {
    const ch = {};
    const p = prompt || "";
    const wantsTiles =
        isTilesDesc(p) || /pared(es)?|suelo/i.test(p);
    const areaMatch = p.match(/(\d+(?:[\.,]\d+)?)\s*m2/i);
    const area = areaMatch ? Number(areaMatch[1].replace(",", ".")) : 20;

    const pointsMatch = p.match(/(\d+)\s*(puntos?|tomas?)(\s+de\s+luz)?/i);
    const points = pointsMatch ? Number(pointsMatch[1]) : 6;

    const cuadro = isCuadroDesc(p);

    if (wantsTiles) {
        const items = normalizeItems([
            { code: "RV01", desc: "Alicatado cerámico paredes/suelo", unit: "m2", qty: area, price: 42 },
            { code: "RV02", desc: "Preparación de base y replanteo", unit: "m2", qty: area, price: 8 },
        ]);
        ch["RV"] = { code: "CH-RV", name: "Revestimientos", items, total: chapterTotal(items) };
    }

    {
        const items = [];
        if (points > 0) items.push({ code: "IN01", desc: "Puntos de luz / tomas (incl. caja y conexión)", unit: "ud", qty: points, price: 60 });
        if (cuadro) items.push({ code: "IN02", desc: "Sustitución y adecuación de cuadro eléctrico", unit: "ud", qty: 1, price: 350 });
        const n = normalizeItems(items);
        if (n.length) ch["IN"] = { code: "CH-IN", name: "Instalaciones", items: n, total: chapterTotal(n) };
    }

    if (/pintar|pintura/i.test(p)) {
        const items = normalizeItems([
            { code: "PT01", desc: "Pintura plástica en techos", unit: "m2", qty: area, price: 14 },
            { code: "PT02", desc: "Imprimación y reparaciones base", unit: "m2", qty: area, price: 6 },
        ]);
        ch["PT"] = { code: "CH-PT", name: "Pintura y acabados", items, total: chapterTotal(items) };
    }

    // Siempre RS
    {
        const items = normalizeItems([{ code: "RS01", desc: "Contenedor y gestión de escombros", unit: "ud", qty: 1, price: 220 }]);
        ch["RS"] = { code: "CH-RS", name: "Residuos y seguridad", items, total: chapterTotal(items) };
    }

    const subtotal = num(Object.values(ch).reduce((s, c) => s + (c.total || 0), 0));
    const extras = [
        { code: "RS02", desc: "Medios auxiliares / EPIs / Seguridad", unit: "%", qty: 5, price: subtotal, amount: num(subtotal * 0.05) },
        { code: "GB01", desc: "Gastos generales", unit: "%", qty: 10, price: subtotal, amount: num(subtotal * 0.10) },
        { code: "GB02", desc: "Beneficio industrial", unit: "%", qty: 10, price: num(subtotal * 1.15), amount: num(subtotal * 0.115) },
    ];
    const total = num(subtotal + extras.reduce((s, e) => s + e.amount, 0));
    return { chapters: ch, subtotal, extras, total };
}

// Extrae JSON del texto del modelo
function safeParseJson(text) {
    try {
        const start = text.indexOf("{");
        const end = text.lastIndexOf("}");
        if (start >= 0 && end > start) {
            const slice = text.slice(start, end + 1);
            return JSON.parse(slice);
        }
    } catch { }
    return null;
}

export async function POST(req) {
    try {
        const body = await req.json();
        const tipo = (body?.tipo || "local") + "";
        const ciudad = (body?.ciudad || "") + "";
        const prompt = (body?.prompt || "").trim();

        let usedAI = false;
        let parsed = null;

        if (OPENAI_API_KEY) {
            try {
                const res = await fetch("https://api.openai.com/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${OPENAI_API_KEY}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        model: "gpt-4o-mini",
                        temperature: 0.2,
                        messages: [
                            {
                                role: "system",
                                content:
                                    `Eres un presupuestador técnico de construcción en España.
Devuelve SOLO un JSON con esta forma:

{
  "chapters": {
    "RV": { "code":"CH-RV","name":"Revestimientos","items":[{"code":"RV01","desc":"...","unit":"m2","qty":0,"price":0,"amount":0}], "total":0 },
    "IN": { "code":"CH-IN","name":"Instalaciones","items":[...], "total":0 },
    "PT": { "code":"CH-PT","name":"Pintura y acabados","items":[...], "total":0 },
    "RS": { "code":"CH-RS","name":"Residuos y seguridad","items":[...], "total":0 }
  }
}

Reglas:
- Incluye alicatados/cerámica si el usuario habla de "cerámica", "alicatado", "porcelánico", etc., con cantidades realistas si aporta m².
- Si pide "puntos de luz", "tomas", o "cuadro eléctrico", añade líneas de instalaciones.
- Calcula amount = qty * price. No dejes cantidades o precios a 0 salvo que sea imposible deducirlos.
- No añadas texto fuera del JSON.`
                            },
                            {
                                role: "user",
                                content: `TIPO: ${tipo}\nCIUDAD: ${ciudad}\nDESCRIPCIÓN: ${prompt}`
                            }
                        ]
                    })
                });

                if (res.ok) {
                    const data = await res.json();
                    const text = data?.choices?.[0]?.message?.content || "";
                    const j = safeParseJson(text);
                    if (j && j.chapters) {
                        const out = {};
                        for (const [k, cap] of Object.entries(j.chapters)) {
                            const items = normalizeItems(Array.isArray(cap.items) ? cap.items : []);
                            out[k] = {
                                code: cap.code || `CH-${k}`,
                                name: cap.name || k,
                                items,
                                total: chapterTotal(items),
                            };
                        }

                        // ✅ Asegurar capítulo RS con al menos contenedor
                        if (!out["RS"] || !Array.isArray(out["RS"].items) || out["RS"].items.length === 0) {
                            const rsItems = normalizeItems([
                                { code: "RS01", desc: "Contenedor y gestión de escombros", unit: "ud", qty: 1, price: 220 },
                            ]);
                            out["RS"] = {
                                code: "CH-RS",
                                name: "Residuos y seguridad",
                                items: rsItems,
                                total: chapterTotal(rsItems),
                            };
                        }

                        const subtotal = num(Object.values(out).reduce((s, c) => s + (c.total || 0), 0));
                        const extras = [
                            { code: "RS02", desc: "Medios auxiliares / EPIs / Seguridad", unit: "%", qty: 5, price: subtotal, amount: num(subtotal * 0.05) },
                            { code: "GB01", desc: "Gastos generales", unit: "%", qty: 10, price: subtotal, amount: num(subtotal * 0.10) },
                            { code: "GB02", desc: "Beneficio industrial", unit: "%", qty: 10, price: num(subtotal * 1.15), amount: num(subtotal * 0.115) },
                        ];
                        const total = num(subtotal + extras.reduce((s, e) => s + e.amount, 0));
                        parsed = { chapters: out, subtotal, extras, total };
                        usedAI = true;
                    }
                }
            } catch {
                // fallback
            }
        }

        const budget = parsed ?? fallbackFromPrompt({ prompt });
        const totalAll = Number(budget?.total) || 0;
        const result = totalAll > 0 ? budget : fallbackFromPrompt({ prompt });

        return NextResponse.json({
            ok: true,
            meta: {
                source: usedAI ? "openai" : "fallback",
                pricing: "catalog+floors",
                tipo, ciudad,
            },
            budget: result,
        });
    } catch (e) {
        return NextResponse.json({ ok: false, error: e?.message || "Error en estimación" }, { status: 500 });
    }
}
