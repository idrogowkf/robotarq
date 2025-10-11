import OpenAI from "openai";

export const runtime = "nodejs";

export async function POST(req) {
    try {
        const { tipo, prompt } = await req.json();

        const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        // Pedimos un JSON estricto
        const sys = `Eres un presupuestador de reformas. Devuelve un JSON con un array "rows".
Cada row: { cap, capName, code, desc, ud, qty, pu }.
- cap: código del capítulo (p.ej. DM, OB, RV, IN, PT, RS)
- capName: nombre del capítulo
- code: código de partida (p.ej. DM01)
- desc: descripción breve
- ud: unidad (m2, m, ud, h, %)
- qty: número
- pu: precio unitario (EUR, sin IVA)
No expliques nada fuera del JSON.`;
        const usr = `Tipo: ${tipo}\nDescripción: ${prompt}`;

        const rsp = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: sys },
                { role: "user", content: usr },
            ],
            temperature: 0.2,
            response_format: { type: "json_object" },
        });

        let data = {};
        try {
            data = JSON.parse(rsp.choices?.[0]?.message?.content || "{}");
        } catch {
            data = {};
        }
        let rows = Array.isArray(data.rows) ? data.rows : [];

        // Normaliza e impone campos obligatorios
        rows = rows
            .filter(
                (r) =>
                    r.cap && r.capName && r.code && r.desc && r.ud && r.qty && r.pu
            )
            .map((r) => ({
                cap: String(r.cap),
                capName: String(r.capName),
                code: String(r.code),
                desc: String(r.desc),
                ud: String(r.ud),
                qty: Number(r.qty),
                pu: Number(r.pu),
            }));

        // Si sale vacío, fallback mínimo
        if (!rows.length) {
            rows = [
                {
                    cap: "OB",
                    capName: "Obra",
                    code: "OB01",
                    desc: "Partida base",
                    ud: "m2",
                    qty: 10,
                    pu: 30,
                },
            ];
        }

        return new Response(JSON.stringify({ rows }), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (e) {
        return new Response(JSON.stringify({ rows: [] }), {
            headers: { "Content-Type": "application/json" },
            status: 200,
        });
    }
}
