// app/api/send-quote/route.js
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* === Config contacto (tel/whatsapp) === */
const PHONE_E164 = "34624473123"; // +34 624 473 123 (sin + para wa.me)
const PHONE_PRETTY = "+34 624 473 123";
const WA_LINK = `https://wa.me/${PHONE_E164}`;
const WEB_URL = "https://robotarq.com/reformas-bares"; // ajusta si usas otro dominio/slug

/* === Utilidades === */
function esc(s) {
    return String(s || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");
}

function isEmail(x) {
    return typeof x === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x);
}

/* === Estilos inline (compatibles) === */
const baseStyles = `
  body{margin:0;padding:0;background:#f6f7f9;color:#0f172a}
  .wrap{max-width:680px;margin:0 auto;background:#ffffff}
  .header{padding:18px 22px;border-bottom:1px solid #e5e7eb;display:flex;align-items:center}
  .logo{width:38px;height:38px;border-radius:12px;background:linear-gradient(135deg,#1e40af,#38bdf8);color:#fff;display:grid;place-items:center;font-weight:700}
  .brand{font:600 16px/1.2 system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;margin-left:10px}
  .hero{padding:22px}
  .h1{font:700 22px/1.15 system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;margin:0 0 8px}
  .lead{color:#334155;margin:6px 0 0;font:400 15px/1.5 system-ui,Segoe UI,Roboto,Helvetica,Arial}
  .card{margin:12px 22px 0;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden}
  .card-h{padding:12px 16px;background:#f8fafc;border-bottom:1px solid #e5e7eb;font:600 14px/1.2 system-ui,Segoe UI,Roboto,Helvetica,Arial}
  .card-b{padding:14px 16px}
  .row{margin:0 0 6px}
  .label{display:inline-block;min-width:110px;color:#475569}
  .val{color:#0f172a}
  .files a{color:#1d4ed8;text-decoration:underline;word-break:break-all}
  .ul{margin:8px 0 0;padding-left:18px;color:#334155}
  .cta{padding:18px 22px 22px}
  .btns a{display:inline-block;margin-right:8px;margin-bottom:10px;padding:10px 14px;border-radius:12px;text-decoration:none;font:600 14px/1.2 system-ui,Segoe UI,Roboto,Helvetica,Arial}
  .btn-call{background:#0369a1;color:#fff}
  .btn-wa{background:#22c55e;color:#fff}
  .btn-web{background:#111827;color:#fff}
  .muted{color:#64748b;font:400 12px/1.5 system-ui,Segoe UI,Roboto,Helvetica,Arial;margin:0 22px 18px}
  .divider{height:1px;background:#e5e7eb;margin:18px 22px}
`;

/* === Plantillas HTML === */
function htmlInterno({ nombre, telefono, email, ciudad, mensaje, origen, archivos }) {
    const escArch = (archivos || [])
        .map((u) => `<div><a href="${esc(u)}" target="_blank" rel="noreferrer">${esc(u)}</a></div>`)
        .join("");
    return `
  <!doctype html>
  <html lang="es"><head>
    <meta charSet="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>Nuevo lead – Robotarq</title>
    <style>${baseStyles}</style>
  </head><body>
    <div class="wrap">
      <div class="header">
        <div class="logo">R</div>
        <div class="brand">Robotarq</div>
      </div>
      <div class="hero">
        <h1 class="h1">Nuevo lead recibido</h1>
        <p class="lead">Solicitud desde <strong>${esc(origen)}</strong>. Responde en 15–30 min hábiles.</p>
      </div>
      <div class="card">
        <div class="card-h">Resumen del lead</div>
        <div class="card-b">
          <div class="row"><span class="label">Nombre:</span> <span class="val">${esc(nombre)}</span></div>
          <div class="row"><span class="label">Teléfono:</span> <span class="val">${esc(telefono)}</span></div>
          ${isEmail(email) ? `<div class="row"><span class="label">Email:</span> <span class="val">${esc(email)}</span></div>` : ""}
          <div class="row"><span class="label">Ciudad:</span> <span class="val">${esc(ciudad)}</span></div>
          <div class="row"><span class="label">Mensaje:</span></div>
          <div class="row val" style="white-space:pre-wrap">${esc(mensaje)}</div>
          ${escArch ? `<div class="row files"><span class="label">Archivos:</span><div class="val">${escArch}</div></div>` : ""}
        </div>
      </div>
      <div class="card" style="margin-top:12px">
        <div class="card-h">Siguiente paso recomendado</div>
        <div class="card-b">
          <ul class="ul">
            <li>Llama o escribe por <strong>WhatsApp</strong> para afinar requisitos.</li>
            <li>Solicita <strong>planos/fotos</strong> si faltan y valida plazos.</li>
            <li>Ofrece estimación y <strong>cita técnica</strong> (si aplica).</li>
          </ul>
        </div>
      </div>
      <div class="cta">
        <div class="btns">
          <a class="btn-call" href="tel:+${PHONE_E164}">Llamar · ${PHONE_PRETTY}</a>
          <a class="btn-wa" href="${WA_LINK}" target="_blank" rel="noreferrer">WhatsApp</a>
          <a class="btn-web" href="${WEB_URL}" target="_blank" rel="noreferrer">Ver ficha</a>
        </div>
      </div>
      <div class="divider"></div>
      <p class="muted">Correo automático desde la web. Responde con saludo breve, 2–3 preguntas clave y siguiente paso.</p>
    </div>
  </body></html>`;
}

function htmlCliente({ nombre, telefono, ciudad, mensaje, archivos }) {
    const escArch = (archivos || [])
        .map((u) => `<div><a href="${esc(u)}" target="_blank" rel="noreferrer">${esc(u)}</a></div>`)
        .join("");
    return `
  <!doctype html>
  <html lang="es"><head>
    <meta charSet="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>Robotarq · Hemos recibido tu solicitud</title>
    <style>${baseStyles}</style>
  </head><body>
    <div class="wrap">
      <div class="header">
        <div class="logo">R</div>
        <div class="brand">Robotarq</div>
      </div>
      <div class="hero">
        <h1 class="h1">¡Gracias, ${esc(nombre)}!</h1>
        <p class="lead">Un técnico te contactará en breve para orientarte y preparar tu <strong>presupuesto sin compromiso</strong>.</p>
      </div>
      <div class="card">
        <div class="card-h">Resumen enviado</div>
        <div class="card-b">
          <div class="row"><span class="label">Nombre:</span> <span class="val">${esc(nombre)}</span></div>
          <div class="row"><span class="label">Teléfono:</span> <span class="val">${esc(telefono)}</span></div>
          <div class="row"><span class="label">Ciudad:</span> <span class="val">${esc(ciudad)}</span></div>
          <div class="row"><span class="label">Mensaje:</span></div>
          <div class="row val" style="white-space:pre-wrap">${esc(mensaje)}</div>
          ${escArch ? `<div class="row files"><span class="label">Archivos:</span><div class="val">${escArch}</div></div>` : ""}
        </div>
      </div>
      <div class="card" style="margin-top:12px">
        <div class="card-h">¿Qué ocurre ahora?</div>
        <div class="card-b">
          <ul class="ul">
            <li>Te llamaremos para aclarar <strong>plazos</strong>, <strong>superficie</strong> y <strong>necesidades</strong>.</li>
            <li>Si es útil, pediremos <strong>planos o fotos</strong>.</li>
            <li>Te enviaremos un <strong>presupuesto orientativo</strong> y el siguiente paso.</li>
          </ul>
        </div>
      </div>
      <div class="cta">
        <p class="lead" style="margin:0 0 10px">Si prefieres, contáctanos ahora:</p>
        <div class="btns">
          <a class="btn-call" href="tel:+${PHONE_E164}">Llamar · ${PHONE_PRETTY}</a>
          <a class="btn-wa" href="${WA_LINK}" target="_blank" rel="noreferrer">WhatsApp</a>
          <a class="btn-web" href="${WEB_URL}" target="_blank" rel="noreferrer">Ver casos y packs</a>
        </div>
      </div>
      <div class="divider"></div>
      <p class="muted">Robotarq · Reformas de bares, locales y oficinas · Atención online y por hitos.</p>
    </div>
  </body></html>`;
}

/* === Llamada HTTP a Resend (sin SDK) === */
async function sendWithResend({ apiKey, from, to, subject, html }) {
    const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            from,
            to: Array.isArray(to) ? to : [to],
            subject,
            html,
        }),
    });

    if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(`Resend error ${res.status}: ${t}`);
    }
    return res.json();
}

export async function POST(req) {
    try {
        const RESEND_API_KEY = process.env.RESEND_API_KEY;
        const EMAIL_FROM = process.env.EMAIL_FROM; // debe ser dominio verificado en Resend
        const EMAIL_TO = process.env.EMAIL_TO;

        if (!RESEND_API_KEY) return NextResponse.json({ ok: false, error: "Falta RESEND_API_KEY" }, { status: 500 });
        if (!EMAIL_FROM || !EMAIL_TO) return NextResponse.json({ ok: false, error: "Falta EMAIL_FROM o EMAIL_TO" }, { status: 500 });

        const body = await req.json().catch(() => ({}));
        const {
            nombre = "",
            telefono = "",
            email = "",
            ciudad = "",
            mensaje = "",
            origen = "reformas-bares",
            archivos = [],
        } = body || {};

        if (!nombre.trim() || !telefono.trim() || !mensaje.trim()) {
            return NextResponse.json(
                { ok: false, error: "Campos obligatorios vacíos (nombre/telefono/mensaje)" },
                { status: 400 }
            );
        }

        // 1) Interno
        await sendWithResend({
            apiKey: RESEND_API_KEY,
            from: EMAIL_FROM,
            to: EMAIL_TO,
            subject: `Robotarq · Nuevo lead (${origen}) – ${nombre}`,
            html: htmlInterno({ nombre, telefono, email, ciudad, mensaje, origen, archivos }),
        });

        // 2) Cliente (si hay email válido)
        if (isEmail(email)) {
            await sendWithResend({
                apiKey: RESEND_API_KEY,
                from: EMAIL_FROM,
                to: email,
                subject: "Robotarq · Hemos recibido tu solicitud",
                html: htmlCliente({ nombre, telefono, ciudad, mensaje, archivos }),
            });
        }

        return NextResponse.json({ ok: true }, { status: 200 });
    } catch (err) {
        const msg = String(err?.message || err);
        // Pista de 401
        if (/401/.test(msg)) {
            return NextResponse.json(
                { ok: false, error: `Resend 401 (API key inválida o no cargada): ${msg}` },
                { status: 401 }
            );
        }
        return NextResponse.json({ ok: false, error: msg }, { status: 500 });
    }
}