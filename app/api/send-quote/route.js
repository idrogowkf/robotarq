// app/api/send-quote/route.js
import { NextResponse } from "next/server";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_TO = process.env.EMAIL_TO || "hola@robotarq.com"; // tu buzón
const EMAIL_FROM = process.env.EMAIL_FROM || "notificaciones@robotarq.com"; // dominio verificado en Resend

async function sendEmail({ to, subject, html, replyTo }) {
    const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            from: EMAIL_FROM,
            to: Array.isArray(to) ? to : [to],
            subject,
            html,
            reply_to: replyTo || undefined,
        }),
    });
    if (!res.ok) {
        const t = await res.text();
        throw new Error(`Resend error: ${res.status} ${t}`);
    }
    return res.json();
}

export async function POST(req) {
    try {
        const data = await req.json();
        const {
            nombre = "",
            telefono = "",
            email = "",
            ciudad = "",
            mensaje = "",
            origen = "",
            archivos = [],
        } = data || {};

        // Email interno (a Robotarq)
        const adminHtml = `
      <div style="font-family:Arial,sans-serif">
        <h2>Nuevo lead – ${origen || "web"}</h2>
        <p><strong>Nombre:</strong> ${nombre || "-"}</p>
        <p><strong>Teléfono:</strong> ${telefono || "-"}</p>
        <p><strong>Email:</strong> ${email || "-"}</p>
        <p><strong>Ciudad:</strong> ${ciudad || "-"}</p>
        <p><strong>Mensaje:</strong><br/>${(mensaje || "").replace(/\n/g, "<br/>")}</p>
        ${archivos?.length
                ? `<p><strong>Archivos:</strong><br/>${archivos
                    .map((u) => `<a href="${u}">${u}</a>`)
                    .join("<br/>")}</p>`
                : ""
            }
        <hr/>
        <p>Enviado desde Robotarq · ${new Date().toLocaleString("es-ES")}</p>
      </div>
    `;

        await sendEmail({
            to: EMAIL_TO,
            subject: `Lead Robotarq (${origen || "web"}) – ${nombre || "Sin nombre"}`,
            html: adminHtml,
            replyTo: email || undefined,
        });

        // Email al cliente (si dejó email)
        if (email) {
            const clientHtml = `
        <div style="font-family:Arial,sans-serif">
          <h2>¡Gracias, ${nombre || "cliente"}!</h2>
          <p>Hemos recibido tu solicitud para la reforma de tu bar/local.</p>
          <p><strong>Resumen:</strong></p>
          <ul>
            <li>Teléfono: ${telefono || "-"}</li>
            <li>Ciudad: ${ciudad || "-"}</li>
          </ul>
          <p>Mensaje:</p>
          <blockquote>${(mensaje || "").replace(/\n/g, "<br/>")}</blockquote>
          <p>En breve te contactaremos. Si prefieres, puedes escribirnos por WhatsApp:</p>
          <p><a href="https://wa.me/34614016147" target="_blank">WhatsApp Robotarq</a></p>
          <hr/>
          <p>Robotarq · hola@robotarq.com</p>
        </div>
      `;
            await sendEmail({
                to: email,
                subject: "Robotarq – Hemos recibido tu solicitud",
                html: clientHtml,
            });
        }

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
    }
}
