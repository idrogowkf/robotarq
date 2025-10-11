// app/api/estimate/route.js
import { NextResponse } from "next/server";

/** ------------- Utilidades ------------- */
const r2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

/** ------------- Base de precios (simplificada) ------------- */
const PRICE_DB = {
    DM: {
        code: "CH-DM", name: "Demoliciones", items: {
            DM01: { code: "DM01", desc: "Demolición de alicatado", unit: "m2", price: 14 },
            DM02: { code: "DM02", desc: "Demolición de pavimento", unit: "m2", price: 12 },
            DM03: { code: "DM03", desc: "Carga y retirada de escombros", unit: "m3", price: 25 },
        }
    },
    OB: {
        code: "CH-OB", name: "Obra y albañilería", items: {
            OB01: { code: "OB01", desc: "Recrecidos y morteros de nivelación", unit: "m2", price: 18 },
            OB02: { code: "OB02", desc: "Tabique cartón-yeso 13/48/13", unit: "m2", price: 36 },
            OB03: { code: "OB03", desc: "Impermeabilización (zonas húmedas)", unit: "m2", price: 28 },
            OB04: { code: "OB04", desc: "Solera autonivelante", unit: "m2", price: 22 },
        }
    },
    RV: {
        code: "CH-RV", name: "Revestimientos", items: {
            RV01: { code: "RV01", desc: "Alicatado cerámico (+material estándar)", unit: "m2", price: 45 },
            RV02: { code: "RV02", desc: "Pavimento gres porcelánico (+material estándar)", unit: "m2", price: 48 },
            RV03: { code: "RV03", desc: "Juntas y rejuntado especial", unit: "m2", price: 6 },
        }
    },
    IN: {
        code: "CH-IN", name: "Instalaciones", items: {
            IN01: { code: "IN01", desc: "Fontanería base (baño/cocina)", unit: "ud", price: 650 },
            IN02: { code: "IN02", desc: "Electricidad base (6-8 puntos)", unit: "ud", price: 520 },
            IN03: { code: "IN03", desc: "Extracción/Salida de humos", unit: "ud", price: 1200 },
            IN04: { code: "IN04", desc: "Climatización básica (split)", unit: "ud", price: 950 },
            IN05: { code: "IN05", desc: "Cuadro eléctrico y legalización", unit: "ud", price: 780 },
            IN06: { code: "IN06", desc: "Insonorización (mejora acústica)", unit: "m2", price: 55 },
            IN07: { code: "IN07", desc: "Cocina profesional (preinstalaciones)", unit: "ud", price: 1800 },
        }
    },
    PT: {
        code: "CH-PT", name: "Pintura y acabados", items: {
            PT01: { code: "PT01", desc: "Pintura plástica paredes/techos", unit: "m2", price: 9.5 },
        }
    },
    RS: {
        code: "CH-RS", name: "Residuos y seguridad", items: {
            RS01: { code: "RS01", desc: "Contenedor y gestión de escombros", unit: "ud", price: 220 },
            RS02: { code: "RS02", desc: "Medios auxiliares y EPIs", unit: "%", price: 6 },
        }
    },
    GB: {
        code: "CH-GB", name: "Gastos generales y beneficio", items: {
            GB01: { code: "GB01", desc: "Gastos generales", unit: "%", price: 12 },
            GB02: { code: "GB02", desc: "Beneficio industrial", unit: "%", price: 10 },
        }
    },
};

function ensure(map, chap, item, qty) {
    const key = `${chap}-${item}`;
    if (!map[key]) map[key] = { chap, item, qty: 0 };
    map[key].qty += Number(qty) || 0;
}

function computeBudget(rows, cityFactor = 1) {
    const chapters = {};
    rows.forEach(({ chap, item, qty }) => {
        const ch = PRICE_DB[chap]; if (!ch) return;
        const it = ch.items[item]; if (!it) return;
        if (!chapters[chap]) chapters[chap] = { code: ch.code, name: ch.name, items: [] };
        const unit = it.unit;
        const price = r2(it.price * cityFactor);
        const amount = unit === "%" ? 0 : r2(Number(qty) * Number(price));
        chapters[chap].items.push({ code: it.code, desc: it.desc, unit, qty: r2(qty), price, amount });
    });

    let subtotal = 0;
    Object.values(chapters).forEach((c) => {
        c.total = r2(c.items.reduce((a, it) => a + it.amount, 0));
        subtotal += c.total;
    });

    const pct = (chapKey, itemKey, base) => {
        const it = PRICE_DB[chapKey]?.items[itemKey]; if (!it) return null;
        const amount = r2((it.price / 100) * base);
        return { code: it.code, desc: it.desc, qty: it.price, unit: "%", price: r2(base), amount };
    };
    // % sobre subtotal
    const rs02 = pct("RS", "RS02", subtotal);
    const gb01 = pct("GB", "GB01", subtotal);
    const gb02 = pct("GB", "GB02", subtotal + (gb01?.amount || 0));

    const extras = [rs02, gb01, gb02].filter(Boolean);
    const total = r2(subtotal + extras.reduce((a, e) => a + e.amount, 0));

    return {
        chapters: Object.values(chapters),
        extras,
        subtotal: r2(subtotal),
        total,
    };
}

/** Factores por ciudad (ajusta a tu criterio real) */
function cityFactor(cityRaw = "") {
    const city = (cityRaw || "").toLowerCase();
    if (/barcelona|bcn/.test(city)) return 1.10;
    if (/madrid|mad/.test(city)) return 1.05;
    if (/bilbao|donostia|san sebastian|sansebasti[aá]n|gipuzkoa/.test(city)) return 1.07;
    if (/valencia|sevilla|malaga|m[aá]laga/.test(city)) return 1.03;
    // Por defecto
    return 1.00;
}

/** Aplica heurística según prompt + opciones */
function heuristicEstimate({ tipo, prompt, spaces, options, city }) {
    // Superficies
    let area = 0, wallArea = 0;
    (spaces || []).forEach((s) => {
        const L = Math.max(0, Number(s.length || 0));
        const W = Math.max(0, Number(s.width || 0));
        const H = Math.max(2.2, Number(s.height || 0) || 2.5);
        area += L * W;
        wallArea += 2 * (L + W) * H;
    });

    const text = (prompt || "").toLowerCase();
    const map = {};

    // Reglas base
    if (/(demol|retir|quitar|demoler)/.test(text)) {
        ensure(map, "DM", "DM01", r2(wallArea * 0.5));
        ensure(map, "DM", "DM02", r2(area));
        ensure(map, "DM", "DM03", r2(area * 0.05)); // 5% del área como m3
        ensure(map, "RS", "RS01", 1);
    }
    if (/(pavim|suelo|gres|porcel|cer[aá]m|baldosa)/.test(text) || area > 0) {
        // Si el prompt dice "pegar cerámica..." área mínima 20 m2 para resultar realista
        ensure(map, "RV", "RV02", r2(Math.max(area, /cer[aá]m|baldosa/.test(text) ? Math.max(area, 20) : area)));
    }
    if (/(alicat|azulej|revest)/.test(text) || wallArea > 0) {
        ensure(map, "RV", "RV01", r2(wallArea * 0.5));
        ensure(map, "RV", "RV03", r2(area));
    }
    if (/pint/.test(text)) {
        ensure(map, "PT", "PT01", r2(Math.max(10, area * 1.1))); // algo más realista
    }
    if (/(electric|punto|ilumin|enchufe)/.test(text)) {
        ensure(map, "IN", "IN02", 1);
        ensure(map, "IN", "IN05", 1);
    }
    if (/(fontaner|bañ|cocin)/.test(text)) {
        ensure(map, "IN", "IN01", 1);
    }

    // Reglas por tipo y opciones (checkboxes)
    const opt = options || {};
    if (tipo === "hosteleria") {
        if (opt.salidaHumos) ensure(map, "IN", "IN03", 1);
        if (opt.insonorizacion) ensure(map, "IN", "IN06", r2(Math.max(area, 40))); // m2 aproximados
        if (opt.cocinaProfesional) ensure(map, "IN", "IN07", 1);
        // en hostelería, obra de adaptación mínima
        ensure(map, "OB", "OB01", r2(Math.max(area * 0.4, 30)));
    } else if (tipo === "local") {
        if (opt.salidaHumos) ensure(map, "IN", "IN03", 1);
        if (opt.insonorizacion) ensure(map, "IN", "IN06", r2(Math.max(area * 0.6, 30)));
        ensure(map, "IN", "IN02", 1);
        ensure(map, "IN", "IN05", 1);
    } else if (tipo === "vivienda") {
        if (opt.climatizacion) ensure(map, "IN", "IN04", 1);
        ensure(map, "PT", "PT01", r2(Math.max(area * 1.2, 40)));
    } else if (tipo === "oficina") {
        if (opt.climatizacion) ensure(map, "IN", "IN04", 1);
        ensure(map, "IN", "IN02", 1);
        ensure(map, "OB", "OB02", r2(Math.max(area * 0.4, 20))); // algo de tabiquería
    }

    // Medidas auxiliares más realistas
    if (area > 0 || wallArea > 0) ensure(map, "RS", "RS01", 1);

    const cf = cityFactor(city);
    return computeBudget(Object.values(map), cf);
}

/** -------- OpenAI (si hay API key) -------- */
async function iaEstimate({ tipo, prompt, spaces, options, city }, signal) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("missing_openai_key");

    const sys = `
Eres un presupuestador de reformas en España. Devuelve SOLO JSON con este esquema:
{
  "chapters":[
    {"code":"CH-XX","name":"Nombre","items":[
      {"code":"XX01","desc":"Descripción","unit":"m2|ud|m","qty":number,"price":number,"amount":number}
    ],"total":number}
  ],
  "extras":[
    {"code":"RS02","desc":"Medios auxiliares y EPIs","qty":6,"unit":"%","price":base,"amount":number},
    {"code":"GB01","desc":"Gastos generales","qty":12,"unit":"%","price":base,"amount":number},
    {"code":"GB02","desc":"Beneficio industrial","qty":10,"unit":"%","price":baseMasGG,"amount":number}
  ],
  "subtotal":number,
  "total":number
}
Reglas:
- Precios y rendimientos coherentes con mercado español.
- Ajusta precios con un factor por ciudad (Barcelona ~+10%, Madrid ~+5%, norte ~+7%, costa/levante ~+3%).
- Considera residuos, medios auxiliares, GG y BI SIEMPRE.
- Si opciones (salida de humos, insonorización, cocina profesional, climatización) están activas, añádelas.
- Usa cantidades derivadas de superficies (Largo x Ancho, perímetros y altura si hay).
- SIN texto fuera del JSON.
`.trim();

    const cf = cityFactor(city);
    const user = JSON.stringify({ tipo, prompt, spaces, options, city, cityFactor: cf });

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "gpt-4o-mini",
            temperature: 0.2,
            messages: [
                { role: "system", content: sys },
                { role: "user", content: user },
            ],
            response_format: { type: "json_object" },
        }),
        signal,
    });

    if (!resp.ok) {
        const t = await resp.text().catch(() => "");
        throw new Error(`openai_http_${resp.status}: ${t}`);
    }

    const json = await resp.json();
    const content = json?.choices?.[0]?.message?.content;
    if (!content) throw new Error("openai_empty");

    const parsed = JSON.parse(content);
    parsed.chapters = parsed.chapters || [];
    parsed.extras = parsed.extras || [];
    parsed.subtotal = Number(parsed.subtotal || 0);
    parsed.total = Number(parsed.total || parsed.subtotal);
    return parsed;
}

/** -------- Handler POST -------- */
export async function POST(req) {
    try {
        const payload = await req.json();
        // payload: { tipo, prompt, spaces, options, city }

        try {
            const ac = new AbortController();
            const to = setTimeout(() => ac.abort(), 17000);
            const budget = await iaEstimate(payload, ac.signal);
            clearTimeout(to);
            return NextResponse.json({ ok: true, budget });
        } catch (e) {
            // Fallback SIEMPRE devuelve algo
            const budget = heuristicEstimate(payload);
            return NextResponse.json({ ok: true, budget, fallback: true });
        }
    } catch (e) {
        console.error("[/api/estimate] error", e);
        const budget = heuristicEstimate({ tipo: "local", prompt: "", spaces: [], options: {}, city: "" });
        return NextResponse.json({ ok: true, budget, fallback: true });
    }
}
