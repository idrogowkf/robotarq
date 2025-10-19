// app/api/estimate/route.js
import { NextResponse } from "next/server";
import synonyms from "@/content/synonyms.json";

/* ================================
   CONFIG
================================== */

const PRICE_LEVEL = (process.env.PRICE_LEVEL || "standard").toLowerCase(); // economy|standard|alto|premium
const USE_OPENAI = !!process.env.OPENAI_API_KEY;
const USE_SCHEMA = String(process.env.OPENAI_USE_SCHEMA || "false").toLowerCase() === "true";

const CITY_FACTORS = {
    barcelona: 1.15,
    madrid: 1.15,
    valencia: 1.08,
    sevilla: 1.06,
    bilbao: 1.12,
    malaga: 1.06,
    zaragoza: 1.05
};
const LEVEL_FACTORS = { economy: 0.90, standard: 1.0, alto: 1.2, premium: 1.4 };

const r2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;
const normalize = (s = "") => s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");

/* ================================
   CATÁLOGO REFORMA (abreviado)
================================== */
const PRICE_DB = {
    DM: {
        code: "CH-DM",
        name: "Demoliciones y desmontajes",
        items: {
            DM01: { code: "DM01", desc: "Demolición de alicatado", unit: "m2", price: 16 },
            DM02: { code: "DM02", desc: "Demolición de pavimento", unit: "m2", price: 14 },
            DM04: { code: "DM04", desc: "Rozas y desescombro instalaciones", unit: "m2", price: 8 }
        }
    },
    RV: {
        code: "CH-RV",
        name: "Revestimientos",
        items: {
            RV01: { code: "RV01", desc: "Alicatado cerámico paredes", unit: "m2", price: 36 },
            RV02: { code: "RV02", desc: "Pavimento gres/porcelánico", unit: "m2", price: 42 },
            RV03: { code: "RV03", desc: "Rejuntado especial", unit: "m2", price: 6 },
            RV04: { code: "RV04", desc: "Lechada y limpieza final", unit: "m2", price: 4.5 }
        }
    },
    IN: {
        code: "CH-IN",
        name: "Instalaciones",
        items: {
            IN02: { code: "IN02", desc: "Electricidad (punto de luz/toma)", unit: "ud", price: 70 },
            IN03: { code: "IN03", desc: "Cambio de cuadro eléctrico", unit: "ud", price: 520 }
        }
    },
    PT: {
        code: "CH-PT",
        name: "Pintura y acabados",
        items: {
            PT01: { code: "PT01", desc: "Pintura plástica paredes/techos", unit: "m2", price: 11 },
            PT02: { code: "PT02", desc: "Imprimación y reparación base", unit: "m2", price: 5 }
        }
    },
    RS: {
        code: "CH-RS",
        name: "Residuos y seguridad",
        items: {
            RS01: { code: "RS01", desc: "Contenedor y gestión de escombros", unit: "ud", price: 240 },
            RS02: { code: "RS02", desc: "Medios auxiliares / EPIs / Seguridad", unit: "%", price: 5 }
        }
    },
    GB: {
        code: "CH-GB",
        name: "Gastos generales y beneficio",
        items: {
            GB01: { code: "GB01", desc: "Gastos generales", unit: "%", price: 10 },
            GB02: { code: "GB02", desc: "Beneficio industrial", unit: "%", price: 10 }
        }
    }
};

/* ================================
   OBRA NUEVA (€/m²) — AJUSTADA
================================== */
// In situ: pide 1.300–2.700 €/m²
const INSITU_M2 = {
    economy: 1300,
    standard: 1600,
    alto: 2000,
    premium: 2700
};

// Modular (mantenemos bandas realistas; city/level factor se aplican aparte)
const MODULAR_M2 = {
    madera: { economy: 1390, standard: 1600, alto: 1850, premium: 2100 },
    hormigon: { economy: 1390, standard: 1800, alto: 2050, premium: 2300 },
    steel: { economy: 1390, standard: 1750, alto: 2000, premium: 2250 },
    pvc: { economy: 1300, standard: 1550, alto: 1800, premium: 2050 }
};

/* Transporte y montaje modular */
const TRANSPORT_BASE_PER_TRIP = 450;      // incluye hasta 30 km
const TRANSPORT_INCLUDED_KM = 30;       // radio incluido
const TRANSPORT_EXTRA_PER_KM = 2.5;      // €/km por encima del radio incluido
const TRUCK_M2_CAPACITY = 45;       // m² estimados por viaje (aprox. 1 tráiler por 45 m²)

const MONTAJE_EUR_M2 = 30;       // €/m² montaje e interconexión
const MONTAJE_MIN = 4500;     // mínimo por montaje

const CRANE_BASE = 1800;     // grúa autopropulsada incluida (radio ≤12 m)
const CRANE_NOTE = "Incluye operación con grúa autopropulsada con radio ≤ 12 m. Radios superiores y condicionantes especiales: a estudio.";

/* ================================
   HELPERS
================================== */
function cityFactor(ciudad = "") {
    const key = normalize(ciudad);
    return CITY_FACTORS[key] || 1.0;
}
const levelFactor = () => LEVEL_FACTORS[PRICE_LEVEL] || 1.0;

function parseArea(text) {
    const m = text.match(/(\d+(?:[.,]\d+)?)\s*(m2|m²|metros?\s*cuadrados?)/i);
    if (!m) return null;
    return Number(m[1].replace(",", "."));
}
function parseIntLike(text, reArray) {
    for (const re of reArray) {
        const m = text.match(re);
        if (m) return Number(m[1]);
    }
    return null;
}
function addItem(chapters, chapKey, itemKey, qty) {
    const chDB = PRICE_DB[chapKey];
    if (!chDB) return;
    const itDB = chDB.items[itemKey];
    if (!itDB) return;
    if (!chapters[chapKey]) chapters[chapKey] = { code: chDB.code, name: chDB.name, items: [] };
    const unit = itDB.unit;
    const price = itDB.price;
    const amount = unit === "%" ? 0 : r2(Number(qty) * Number(price));
    chapters[chapKey].items.push({
        code: itDB.code,
        desc: itDB.desc,
        unit,
        qty: r2(qty),
        price,
        amount
    });
}
function pushCustomItem(chapters, chapKey, { code, desc, unit, qty, price }) {
    if (!chapters[chapKey]) chapters[chapKey] = { code: PRICE_DB[chapKey]?.code || chapKey, name: PRICE_DB[chapKey]?.name || chapKey, items: [] };
    const amount = unit === "%" ? 0 : r2(Number(qty) * Number(price));
    chapters[chapKey].items.push({ code, desc, unit, qty: r2(qty), price: r2(price), amount });
}
function computeTotals(chapters, factor) {
    let subtotal = 0;
    Object.values(chapters).forEach((ch) => {
        ch.items = ch.items.map((it) => {
            if (it.unit !== "%") {
                const p = r2(it.price * factor);
                const amt = r2(it.qty * p);
                return { ...it, price: p, amount: amt };
            }
            return it;
        });
        ch.total = r2(ch.items.reduce((acc, it) => acc + (it.unit === "%" ? 0 : it.amount), 0));
        subtotal += ch.total;
    });
    const extras = [];
    const percent = (chapKey, itemKey, base) => {
        const it = PRICE_DB[chapKey]?.items?.[itemKey];
        if (!it) return null;
        return {
            chapKey,
            code: it.code,
            desc: it.desc,
            unit: it.unit,
            qty: r2(it.price),
            price: base,
            amount: r2((it.price / 100) * base)
        };
    };
    const rs02 = percent("RS", "RS02", subtotal);
    const gb01 = percent("GB", "GB01", subtotal);
    const gb02 = percent("GB", "GB02", subtotal + (gb01 ? gb01.amount : 0));
    [rs02, gb01, gb02].forEach((e) => e && extras.push(e));
    const extraTotal = r2(extras.reduce((a, e) => a + e.amount, 0));
    const total = r2(subtotal + extraTotal);
    return { subtotal: r2(subtotal), extras, total };
}

/* ================================
   EXTRACCIÓN (reformas)
================================== */
function extractSignalsReforma(rawPrompt) {
    const raw = rawPrompt || "";
    const text = normalize(raw);

    const area = parseArea(raw) || synonyms.defaults.area_m2_if_missing || 30;

    const hasInstall = synonyms.actions.install.some((w) => text.includes(normalize(w)));
    const hasRemove = synonyms.actions.remove.some((w) => text.includes(normalize(w)));

    const mentionsWall = synonyms.surfaces.wall.some((w) => text.includes(normalize(w)));
    const mentionsFloor = synonyms.surfaces.floor.some((w) => text.includes(normalize(w)));

    const hasCeramicFloor = synonyms.materials.ceramic_floor.some((w) =>
        text.includes(normalize(w))
    );
    const hasCeramicWall = synonyms.materials.ceramic_wall.some((w) =>
        text.includes(normalize(w))
    );
    const hasCeramic = hasCeramicFloor || hasCeramicWall;

    const electricPoints = parseIntLike(text, [
        /(\d+)\s*puntos?\s*(de\s*)?luz/,
        /(\d+)\s*(enchufes|tomas?)\b/,
        /(\d+)\s*puntos?\s*(de\s*)?iluminacion/
    ]);
    const changeBoard =
        synonyms.electric.board.some((w) => text.includes(normalize(w))) || /cuadro\s+electric/.test(text);

    const wantsPaint = synonyms.materials.paint.some((w) => text.includes(normalize(w)));

    return {
        area,
        hasInstall,
        hasRemove,
        mentionsWall,
        mentionsFloor,
        hasCeramic,
        ceramicTargets: {
            wall: hasCeramicWall || (hasCeramic && mentionsWall),
            floor: hasCeramicFloor || (hasCeramic && (mentionsFloor || !mentionsWall))
        },
        electric: {
            points: electricPoints || 0,
            board: changeBoard
        },
        paint: wantsPaint
    };
}
function rulesMapToItems(sig) {
    const chapters = {};
    if (sig.hasInstall && sig.hasCeramic) {
        if (sig.ceramicTargets.wall) {
            addItem(chapters, "RV", "RV01", sig.area);
            addItem(chapters, "DM", "DM01", sig.area);
        }
        if (sig.ceramicTargets.floor) {
            addItem(chapters, "RV", "RV02", sig.area);
            addItem(chapters, "DM", "DM02", sig.area);
        }
        const m2Total =
            (sig.ceramicTargets.wall ? sig.area : 0) + (sig.ceramicTargets.floor ? sig.area : 0);
        if (m2Total > 0) {
            addItem(chapters, "RV", "RV03", m2Total);
            addItem(chapters, "RV", "RV04", m2Total);
            addItem(chapters, "DM", "DM04", m2Total);
            addItem(chapters, "RS", "RS01", 1);
        }
    }
    if (sig.electric.points > 0) addItem(chapters, "IN", "IN02", sig.electric.points);
    if (sig.electric.board) addItem(chapters, "IN", "IN03", 1);
    if (sig.paint) {
        addItem(chapters, "PT", "PT02", sig.area);
        addItem(chapters, "PT", "PT01", sig.area);
    }
    return chapters;
}
function ensureCoverage(chapters, sig) {
    const hasCeramic =
        (chapters.RV?.items || []).some((it) => it.code === "RV01" || it.code === "RV02");
    const hasContainer = (chapters.RS?.items || []).some((it) => it.code === "RS01");
    if (hasCeramic && !hasContainer) addItem(chapters, "RS", "RS01", 1);

    const hasPav = (chapters.RV?.items || []).some((it) => it.code === "RV02");
    const hasDM2 = (chapters.DM?.items || []).some((it) => it.code === "DM02");
    if (hasPav && !hasDM2) addItem(chapters, "DM", "DM02", sig.area);

    const hasWall = (chapters.RV?.items || []).some((it) => it.code === "RV01");
    const hasDM1 = (chapters.DM?.items || []).some((it) => it.code === "DM01");
    if (hasWall && !hasDM1) addItem(chapters, "DM", "DM01", sig.area);

    return chapters;
}

/* ================================
   OBRA NUEVA (in situ / modular)
================================== */
function computeObraNueva({ modalidad, modularTipo, nivelPrecio, m2, ciudad, parcela, dist_km }) {
    const chapters = {};
    const cityF = cityFactor(ciudad);
    const levelF = LEVEL_FACTORS[PRICE_LEVEL] || 1.0;

    const m2_safe = Math.max(Number(m2 || 0), synonyms.defaults.obra_nueva_min_m2 || 50);
    const km = Math.max(0, Number(dist_km ?? TRANSPORT_INCLUDED_KM)); // si no viene, asumimos 30 km

    let base_m2 = 0;
    let desc = "";
    if (modalidad === "insitu") {
        base_m2 = INSITU_M2[nivelPrecio || "standard"] || INSITU_M2.standard;
        desc = `Ejecución de obra nueva in situ — nivel ${nivelPrecio || "standard"}`;
    } else {
        const tipo = modularTipo || "madera";
        base_m2 = (MODULAR_M2[tipo] && MODULAR_M2[tipo][nivelPrecio || "standard"]) || 1600;
        const label = tipo === "hormigon" ? "hormigón" : (tipo === "steel" ? "steel frame" : tipo.toUpperCase());
        desc = `Vivienda modular (${label}) — nivel ${nivelPrecio || "standard"}`;
    }

    // Ajuste de precio m² por ciudad y nivel global
    const precio_m2_ajustado = r2(base_m2 * cityF * levelF);

    // Capítulo principal
    chapters.CN = {
        code: "CH-CN",
        name: "Construcción nueva",
        items: [
            {
                code: modalidad === "insitu" ? "CN01" : "CM01",
                desc,
                unit: "m2",
                qty: m2_safe,
                price: precio_m2_ajustado,
                amount: r2(m2_safe * precio_m2_ajustado)
            }
        ]
    };

    // Logística modular: transporte + montaje + grúa (radio ≤ 12 m)
    if (modalidad === "modular") {
        // nº de viajes estimados (módulos / camiones)
        const trips = Math.max(1, Math.ceil(m2_safe / TRUCK_M2_CAPACITY));

        // coste por viaje según km
        const extraKm = Math.max(0, km - TRANSPORT_INCLUDED_KM);
        const costPerTrip = TRANSPORT_BASE_PER_TRIP + extraKm * TRANSPORT_EXTRA_PER_KM;
        const transportTotal = r2(trips * costPerTrip);

        // montaje por m² con mínimo
        const montajeBase = r2(Math.max(MONTAJE_MIN, m2_safe * MONTAJE_EUR_M2));

        // grúa base con nota
        const craneCost = CRANE_BASE;

        // Añadimos al capítulo RS (logística/seguridad)
        pushCustomItem(chapters, "RS", {
            code: "TR01",
            desc: `Transporte de módulos (${trips} viaje/s, incluye ${TRANSPORT_INCLUDED_KM} km desde fábrica; +${TRANSPORT_EXTRA_PER_KM} €/km extra)`,
            unit: "ud",
            qty: 1,
            price: transportTotal
        });
        pushCustomItem(chapters, "RS", {
            code: "MN01",
            desc: "Montaje e interconexión de módulos en obra",
            unit: "ud",
            qty: 1,
            price: montajeBase
        });
        pushCustomItem(chapters, "RS", {
            code: "CR01",
            desc: `Grúa autopropulsada. ${CRANE_NOTE}`,
            unit: "ud",
            qty: 1,
            price: craneCost
        });
    }

    // Parcela (informativo)
    if (parcela) {
        if (!chapters.GB) chapters.GB = { code: "CH-GB", name: "Gastos generales y beneficio", items: [] };
        chapters.GB.items.push({
            code: "NT01",
            desc:
                parcela === "si"
                    ? "Parcela disponible (no incluido movimiento de tierras ni acometidas)"
                    : parcela === "no"
                        ? "Sin parcela: estudio de opciones (no incluido)"
                        : "Buscando parcela: asesoramiento (no incluido)",
            unit: "ud",
            qty: 1,
            price: 0,
            amount: 0
        });
    }

    // Totales (no re-factorizamos logística, ya está costeada; aún así aplicamos factor 1)
    const totals = computeTotals(chapters, 1);
    return { chapters, ...totals };
}

/* ================================
   IA (enriquecimiento reforma)
================================== */
async function openAI_enrich({ tipo, ciudad, prompt, baseLines }) {
    if (!USE_OPENAI) return baseLines;
    const { default: OpenAI } = await import("openai");
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const sys = `
Eres ayudante para completar partidas de reforma en España. Devuelve SOLO JSON:
{
  "lines": [
    { "chap": "RV|DM|IN|PT|RS|GB", "item": "...", "qty": number }
  ],
  "why": "breve explicación de supuestos"
}
No repitas partidas ya presentes. Rellena huecos evidentes (p.ej. si hay cerámica pero faltan demoliciones/rehuntado/lechada).
Respeta cantidades del usuario.
`.trim();
    const user = { tipo, ciudad, prompt, base: baseLines };

    try {
        if (USE_SCHEMA) {
            const strictSchema = {
                name: "robotarq_enrich",
                schema: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                        lines: {
                            type: "array",
                            items: {
                                type: "object",
                                additionalProperties: false,
                                properties: {
                                    chap: { type: "string", enum: ["RV", "DM", "IN", "PT", "RS", "GB"] },
                                    item: { type: "string" },
                                    qty: { type: "number" }
                                },
                                required: ["chap", "item", "qty"]
                            }
                        },
                        why: { type: "string" }
                    },
                    required: ["lines"]
                },
                strict: true
            };
            const resp = await client.responses.create({
                model: "gpt-4o-mini",
                input: [
                    { role: "system", content: sys },
                    { role: "user", content: JSON.stringify(user) }
                ],
                text: { format: "json", schema: strictSchema }
            });
            const txt =
                resp?.output?.[0]?.content?.[0]?.text ||
                resp?.content?.[0]?.text ||
                resp?.choices?.[0]?.message?.content ||
                "";
            const json = txt ? JSON.parse(txt) : null;
            if (json?.lines?.length) return [...baseLines, ...json.lines];
            return baseLines;
        }

        const resp = await client.responses.create({
            model: "gpt-4o-mini",
            input: [
                { role: "system", content: sys },
                { role: "user", content: JSON.stringify(user) }
            ],
            text: { format: "json" }
        });
        const txt =
            resp?.output?.[0]?.content?.[0]?.text ||
            resp?.content?.[0]?.text ||
            resp?.choices?.[0]?.message?.content ||
            "";
        const json = txt ? JSON.parse(txt) : null;
        if (json?.lines?.length) return [...baseLines, ...json.lines];
    } catch (_) {
        // seguimos con reglas si falla IA
    }
    return baseLines;
}

/* ================================
   ROUTE
================================== */
export async function POST(req) {
    try {
        const body = await req.json();
        const {
            tipo = "local",
            ciudad = "",
            prompt = "",
            // Obra nueva
            obra = "reforma", // "reforma" | "obra_nueva"
            modalidad = "",   // "insitu" | "modular"
            modularTipo = "", // "madera" | "hormigon" | "steel" | "pvc"
            nivelPrecio = "", // "economy" | "standard" | "alto" | "premium"
            m2 = 0,
            parcela = "",     // "si" | "no" | "busco"
            dist_km = 30      // distancia desde fábrica (km). Default 30 km
        } = body || {};

        // *** OBRA NUEVA ***
        if (obra === "obra_nueva") {
            const metros = Math.max(Number(m2 || 0), synonyms.defaults.obra_nueva_min_m2 || 50);
            const nivel = (nivelPrecio || "standard").toLowerCase();
            if (modalidad === "insitu" || modalidad === "modular") {
                const on = computeObraNueva({
                    modalidad,
                    modularTipo,
                    nivelPrecio: nivel,
                    m2: metros,
                    ciudad,
                    parcela,
                    dist_km
                });
                const meta = {
                    source: "obra_nueva",
                    modalidad,
                    modularTipo: modalidad === "modular" ? modularTipo : null,
                    nivelPrecio: nivel,
                    m2: metros,
                    ciudad,
                    dist_km
                };
                return NextResponse.json({ ok: true, meta, budget: on });
            }
            return NextResponse.json(
                { ok: false, error: "Falta modalidad (insitu|modular) para obra nueva." },
                { status: 400 }
            );
        }

        // *** REFORMA ***
        const sig = extractSignalsReforma(prompt);
        let chapters = rulesMapToItems(sig);
        let baseLines = [];
        Object.entries(chapters).forEach(([chapKey, ch]) =>
            ch.items.forEach((it) => baseLines.push({ chap: chapKey, item: it.code, qty: it.qty }))
        );
        if (USE_OPENAI) {
            baseLines = await openAI_enrich({ tipo, ciudad, prompt, baseLines });
            chapters = {};
            baseLines.forEach(({ chap, item, qty }) => addItem(chapters, chap, item, qty));
        }
        chapters = ensureCoverage(chapters, sig);

        const factor = r2(cityFactor(ciudad) * (LEVEL_FACTORS[PRICE_LEVEL] || 1.0));
        const totals = computeTotals(chapters, factor);
        const budget = { chapters, ...totals };
        const meta = {
            source: USE_OPENAI ? "rules+ai" : "rules",
            pricing: "catalog",
            tipo,
            ciudad
        };
        return NextResponse.json({ ok: true, meta, budget });
    } catch (e) {
        return NextResponse.json(
            { ok: false, error: e?.message || "Error inesperado en /api/estimate" },
            { status: 500 }
        );
    }
}
