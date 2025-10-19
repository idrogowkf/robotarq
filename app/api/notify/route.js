// app/api/notify/route.js
import { NextResponse } from "next/server";
import { Resend } from "resend";

/**
 * Notificación transaccional de presupuestos
 * - Envío al cliente (sin BCC al owner)
 * - Envío interno al owner
 * - HTML limpio + versión texto (mejora inbox “Principal”)
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM = (process.env.RESEND_FROM || "robotARQ <hola@robotarq.com>").replace(/^"+|"+$/g, "");

function extractEmail(s) {
    if (!s) return "";
    const m = String(s).match(/<([^>]+)>/);
    return m ? m[1] : String(s).trim();
}

const OWNER_EMAIL =
    process.env.OWNER_EMAIL?.trim() ||
    extractEmail(process.env.RESEND_OWNER) ||
    "hola@robotarq.com";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://robotarq.com";

// ---------- Helpers ----------
function safeStr(s) {
    if (s === null || s === undefined) return "";
    return String(s);
}

function money(n) {
    const v = Number(n || 0);
    return `${v.toFixed(2)} €`;
}

function renderBudgetText(meta, budget) {
    const parts = [];
    parts.push("robotARQ - Presupuesto técnico");
    if (meta?.tipo) parts.push(`Tipo: ${meta.tipo}`);
    if (meta?.obraTipo) parts.push(`Obra: ${meta.obraTipo}`);
    if (meta?.sistema) parts.push(`Sistema: ${meta.sistema}`);
    if (meta?.provincia) parts.push(`Provincia: ${meta.provincia}`);
    if (meta?.ciudad) parts.push(`Ciudad: ${meta.ciudad}`);
    if (meta?.superficie) parts.push(`Superficie: ${meta.superficie} m²`);
    if (meta?.prompt) {
        parts.push("");
        parts.push(`Descripción: ${meta.prompt}`);
    }
    parts.push("");

    if (budget?.chapters) {
        for (const ch of Object.values(budget.chapters)) {
            parts.push(`== ${ch.code} — ${ch.name} ==`);
            if (Array.isArray(ch.items)) {
                for (const it of ch.items) {
                    parts.push(
                        `${it.code} | ${it.desc} | ${it.unit} | Cant: ${it.qty} | P.unit: ${Number(it.price).toFixed(
                            2
                        )} | Importe: ${Number(it.amount).toFixed(2)}`
                    );
                }
            }
            parts.push(`Subtotal capítulo: ${money(ch.total)}`);
            parts.push("");
        }
    }

    if (Array.isArray(budget?.extras) && budget.extras.length) {
        parts.push("Cargos porcentuales:");
        for (const e of budget.extras) {
            parts.push(`${e.code} ${e.desc} (${e.qty}%) Base: ${money(e.price)} Importe: ${money(e.amount)}`);
        }
        parts.push("");
    }

    parts.push(`Subtotal: ${money(budget?.subtotal)}`);
    parts.push(`TOTAL (sin IVA): ${money(budget?.total)}`);
    parts.push("");
    parts.push("robotarq.com");

    return parts.join("\n");
}

function renderBudgetHTML(meta, budget) {
    const preheader =
        "Presupuesto generado automáticamente por robotARQ. Revisa partidas, cantidades y totales.";

    const chapterBlocks = [];
    if (budget?.chapters) {
        for (const ch of Object.values(budget.chapters)) {
            const rows =
                Array.isArray(ch.items) && ch.items.length
                    ? ch.items
                        .map(
                            (it) => `
          <tr>
            <td style="padding:8px;border-bottom:1px solid #eee;">${safeStr(it.code)}</td>
            <td style="padding:8px;border-bottom:1px solid #eee;">${safeStr(it.desc)}</td>
            <td style="padding:8px;border-bottom:1px solid #eee;">${safeStr(it.unit)}</td>
            <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${safeStr(it.qty)}</td>
            <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${Number(it.price).toFixed(
                                2
                            )} €</td>
            <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${Number(it.amount).toFixed(
                                2
                            )} €</td>
          </tr>`
                        )
                        .join("")
                    : "";

            chapterBlocks.push(`
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top:20px;border:1px solid #e5e7eb;border-radius:8px;">
          <thead>
            <tr>
              <th colspan="6" style="text-align:left;padding:12px 14px;border-bottom:1px solid #e5e7eb;font:600 14px system-ui, -apple-system, Segoe UI, Roboto, sans-serif">
                ${safeStr(ch.code)} — ${safeStr(ch.name)}
              </th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
          <tfoot>
            <tr>
              <td colspan="5" style="padding:10px 14px;text-align:right;border-top:1px solid #e5e7eb;font:600 13px system-ui, -apple-system, Segoe UI, Roboto, sans-serif;">Subtotal capítulo</td>
              <td style="padding:10px 14px;text-align:right;border-top:1px solid #e5e7eb;font:600 13px system-ui, -apple-system, Segoe UI, Roboto, sans-serif;">
                ${money(ch.total)}
              </td>
            </tr>
          </tfoot>
        </table>
      `);
        }
    }

    const metaBlock = `
    <div style="margin-bottom:8px;font:500 14px system-ui, -apple-system, Segoe UI, Roboto, sans-serif;color:#111827;">
      ${meta?.tipo ? `Tipo: ${safeStr(meta.tipo)}` : ""}
      ${meta?.obraTipo ? ` · Obra: ${safeStr(meta.obraTipo)}` : ""}
      ${meta?.sistema ? ` · Sistema: ${safeStr(meta.sistema)}` : ""}
      ${meta?.provincia ? ` · Provincia: ${safeStr(meta.provincia)}` : ""}
      ${meta?.ciudad ? ` · Ciudad: ${safeStr(meta.ciudad)}` : ""}
      ${meta?.superficie ? ` · Superficie: ${safeStr(meta.superficie)} m²` : ""}
    </div>
    ${meta?.prompt ? `<p style="color:#374151;font:400 13px system-ui;">${safeStr(meta.prompt)}</p>` : ""}
  `;

    return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>Presupuesto técnico</title>
  </head>
  <body style="margin:0;background:#f9fafb;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      <tr>
        <td align="center" style="padding:24px 12px;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="640" style="max-width:640px;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;">
            <tr>
              <td style="padding:18px 20px;border-bottom:1px solid #e5e7eb">
                <div style="font:700 16px system-ui;color:#111827;">robotARQ — Presupuesto técnico</div>
                <div style="margin-top:2px;font:400 12px system-ui;color:#6b7280;">Generado automáticamente</div>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 20px">
                ${metaBlock}
                ${chapterBlocks.join("")}
                <div style="margin-top:16px;font:600 14px system-ui;color:#111827;text-align:right;">
                  Subtotal: ${money(budget?.subtotal)}<br/>
                  <span style="font:700 18px system-ui;">TOTAL (sin IVA): ${money(budget?.total)}</span>
                </div>
                <div style="margin-top:18px;font:400 12px system-ui;color:#6b7280;">
                  Documento generado por robotARQ. Más información: 
                  <a href="${SITE_URL}" style="color:#111827;text-decoration:underline;">robotarq.com</a>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:14px 20px;border-top:1px solid #e5e7eb;text-align:center;color:#6b7280;font:400 12px system-ui;">
                © ${new Date().getFullYear()} robotARQ
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

// ---------- Handler ----------
export async function POST(req) {
    try {
        if (!RESEND_API_KEY) {
            return NextResponse.json({ ok: false, error: "Falta RESEND_API_KEY" }, { status: 500 });
        }

        const resend = new Resend(RESEND_API_KEY);
        const body = await req.json().catch(() => ({}));

        const { name, phone, email, empresa, nif, budget, meta } = body || {};
        const customerEmail = safeStr(email).trim();

        if (!customerEmail) {
            return NextResponse.json({ ok: false, error: "Falta email de cliente." }, { status: 400 });
        }

        const ref = (Date.now() + "").slice(-6);
        const subject = `Tu presupuesto — robotARQ #${ref}`;

        const textBody = renderBudgetText(meta || {}, budget || {});
        const htmlBody = renderBudgetHTML(meta || {}, budget || {});

        // 1) Envío al CLIENTE — SIN BCC
        await resend.emails.send({
            from: RESEND_FROM,
            to: [customerEmail],
            subject,
            html: htmlBody,
            text: textBody,
            reply_to: OWNER_EMAIL || undefined,
        });

        // 2) Envío INTERNO al OWNER
        const internalSubject = `robotARQ — Nueva solicitud #${ref}`;
        const internalText = [
            `Nombre: ${safeStr(name)}`,
            `Teléfono: ${safeStr(phone)}`,
            `Email: ${safeStr(email)}`,
            empresa ? `Empresa: ${safeStr(empresa)}` : "",
            nif ? `NIF: ${safeStr(nif)}` : "",
            "",
            textBody,
        ]
            .filter(Boolean)
            .join("\n");

        const internalHTML = `
      <!doctype html>
      <html lang="es"><body style="font:14px system-ui;color:#111827;">
        <h2>Nueva solicitud #${ref}</h2>
        <p><strong>Nombre:</strong> ${safeStr(name)}<br/>
        <strong>Teléfono:</strong> ${safeStr(phone)}<br/>
        <strong>Email:</strong> ${safeStr(email)}<br/>
        ${empresa ? `<strong>Empresa:</strong> ${safeStr(empresa)}<br/>` : ""}
        ${nif ? `<strong>NIF:</strong> ${safeStr(nif)}<br/>` : ""}
        </p>
        ${renderBudgetHTML(meta || {}, budget || {})}
      </body></html>
    `;

        await resend.emails.send({
            from: RESEND_FROM,
            to: [OWNER_EMAIL],
            subject: internalSubject,
            html: internalHTML,
            text: internalText,
        });

        return NextResponse.json({ ok: true, ref });
    } catch (err) {
        console.error("[/api/notify] error:", err);
        return NextResponse.json({ ok: false, error: String(err?.message || err) }, { status: 200 });
    }
}
