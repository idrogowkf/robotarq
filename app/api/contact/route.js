// app/api/contact/route.js
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const body = await req.json();
        const {
            role = "persona",
            nombre = "",
            empresa = "",
            nif = "",
            email = "",
            telefono = "",
            mensaje = "",
        } = body || {};

        // ENV necesarios: RESEND_API_KEY y FROM_EMAIL
        const RESEND_API_KEY = process.env.RESEND_API_KEY;
        const FROM_EMAIL = process.env.FROM_EMAIL || "hola@robotarq.com";
        const OWNER_EMAIL = "hola@robotarq.com";

        if (!RESEND_API_KEY) {
            return NextResponse.json({ ok: false, error: "Falta RESEND_API_KEY" }, { status: 500 });
        }

        // Estructura simple (sin @react-email)
        const subject = `Contacto robotARQ — ${role === "empresa" ? "Empresa" : "Persona"} — ${nombre}`;
        const text = [
            `Rol: ${role}`,
            `Nombre: ${nombre}`,
            empresa ? `Empresa: ${empresa}` : null,
            nif ? `NIF/CIF: ${nif}` : null,
            `Email: ${email}`,
            `Teléfono: ${telefono}`,
            "",
            "Mensaje:",
            mensaje || "(sin mensaje)",
        ].filter(Boolean).join("\n");

        // Llamada directa a Resend REST
        const send = async (to) => fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${RESEND_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                from: `robotARQ <${FROM_EMAIL}>`,
                to,
                subject,
                text,
            }),
        });

        const r1 = await send([OWNER_EMAIL]);
        const r2 = email ? await send([email]) : { ok: true };

        if (!r1.ok || !r2.ok) {
            const t1 = await r1.text();
            const t2 = email ? await r2.text() : "";
            return NextResponse.json({ ok: false, error: `Fallo al enviar: ${t1} | ${t2}` }, { status: 500 });
        }

        return NextResponse.json({ ok: true });
    } catch (err) {
        return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
    }
}
