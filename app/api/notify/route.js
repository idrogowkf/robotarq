// app/api/notify/route.js
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { PDFDocument, StandardFonts, rgb, degrees } from "pdf-lib";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Utilidades */
const eur = (n) =>
    new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(
        Number(n || 0)
    );

/** HTML responsive embebido para el email */
function renderEmailHtml({ customer, meta, budget, aiOk }) {
    const styles = `
  body{margin:0;padding:0;background:#f6f6f6;font-family:Arial,Helvetica,sans-serif;}
  .wrap{max-width:680px;margin:0 auto;padding:24px;}
  .card{background:#ffffff;border-radius:12px;padding:20px;}
  h1{font-size:18px;margin:0 0 10px 0;}
  h2{font-size:16px;margin:18px 0 8px 0;}
  p{font-size:14px;line-height:1.6;margin:6px 0;}
  .muted{color:#666}
  .total{font-size:20px;font-weight:700;}
  table{width:100%;border-collapse:collapse;font-size:13px}
  th,td{border-bottom:1px solid #eee;padding:8px;vertical-align:top}
  th{text-align:left;background:#fafafa}
  .footer{font-size:12px;color:#888;text-align:center;margin-top:10px}
  .pill{display:inline-block;font-size:12px;padding:2px 8px;border-radius:999px;background:#111;color:#fff}
  @media (max-width: 600px){
    .wrap{padding:12px}
    .card{padding:16px}
    table, th, td{font-size:12px}
    .total{font-size:18px}
  }
  `;

    const capsHtml = Object.values(budget?.chapters || {}).map((ch) => {
        const rows = ch.items
            .map(
                (it) => `
        <tr>
          <td>${it.code}</td>
          <td>${it.desc}</td>
          <td>${it.unit}</td>
          <td style="text-align:right">${it.qty}</td>
          <td style="text-align:right">${eur(it.price)}</td>
          <td style="text-align:right;font-weight:600">${eur(it.amount)}</td>
        </tr>`
            )
            .join("");

        return `
      <h2>${ch.code} — ${ch.name}</h2>
      <table role="presentation" cellspacing="0" cellpadding="0">
        <thead>
          <tr>
            <th>Código</th>
            <th>Descripción</th>
            <th>Ud</th>
            <th style="text-align:right">Cantidad</th>
            <th style="text-align:right">P. unit</th>
            <th style="text-align:right">Importe</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="5" style="text-align:right;font-weight:600;padding-top:8px">Subtotal capítulo</td>
            <td style="text-align:right;font-weight:700;padding-top:8px">${eur(ch.total)}</td>
          </tr>
        </tfoot>
      </table>
    `;
    });

    const extrasHtml = (budget?.extras || [])
        .map(
            (e) => `
      <tr>
        <td>${e.code}</td>
        <td>${e.desc}</td>
        <td style="text-align:right">${e.qty}%</td>
        <td style="text-align:right;font-weight:600">${eur(e.amount)}</td>
      </tr>`
        )
        .join("");

    return `
<!doctype html>
<html lang="es">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><style>${styles}</style></head>
<body>
  <div class="wrap">
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <h1>robot<span style="font-weight:800">ARQ</span> · Presupuesto técnico</h1>
        <span class="pill">${meta?.refId || "REF"}</span>
      </div>
      <p class="muted">Tipo: <strong>${meta?.tipo || "-"}</strong> · Ciudad: <strong>${meta?.ciudad || "-"}</strong></p>
      <p style="margin-top:8px"><strong>Descripción:</strong> ${meta?.prompt || "-"}</p>
      ${aiOk
            ? `<p style="color:#0a7d48"><strong>IA:</strong> Interpretación automática completada.</p>`
            : `<p style="color:#b45f06"><strong>IA:</strong> No disponible. Estimación generada con reglas internas.</p>`
        }

      ${capsHtml.join("")}

      ${(budget?.extras?.length || 0) > 0
            ? `
      <h2>Cargos porcentuales</h2>
      <table role="presentation" cellspacing="0" cellpadding="0">
        <thead>
          <tr>
            <th>Código</th><th>Descripción</th><th style="text-align:right">%</th><th style="text-align:right">Importe</th>
          </tr>
        </thead>
        <tbody>
          ${extrasHtml}
        </tbody>
      </table>`
            : ""
        }

      <div style="text-align:right;margin-top:14px">
        <div class="muted">Subtotal</div>
        <div style="font-weight:600">${eur(budget?.subtotal || 0)}</div>
        <div class="muted" style="margin-top:6px">TOTAL (sin IVA)</div>
        <div class="total">${eur(budget?.total || 0)}</div>
      </div>

      <p class="muted" style="margin-top:12px">* Estimación orientativa. Sujeta a medición y calidades definitivas.</p>
    </div>
    <div class="footer">robotARQ · Presupuestos y reformas | <a href="https://robotarq.com" target="_blank">robotarq.com</a></div>
  </div>
</body>
</html>
  `.trim();
}

/** Construcción PDF A4 con marca de agua diagonal “robotARQ” */
async function buildPdf({ customer, meta, budget }) {
    const pdf = await PDFDocument.create();
    const pageMargin = 36; // 0.5"
    const pageWidth = 595.28; // A4 width pt
    const pageHeight = 841.89; // A4 height pt
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

    // Helper de escritura con word-wrap y paginado
    let page = pdf.addPage([pageWidth, pageHeight]);
    let y = pageHeight - pageMargin;

    const drawWatermark = () => {
        page.drawText("robotARQ", {
            x: pageWidth / 2 - 160,
            y: pageHeight / 2,
            size: 60,
            font: fontBold,
            color: rgb(0.9, 0.9, 0.95),
            rotate: degrees(-35),
            opacity: 0.25,
        });
    };

    drawWatermark();

    const writeLine = (txt, { bold = false, size = 11 } = {}) => {
        const maxWidth = pageWidth - pageMargin * 2;
        const words = String(txt).split(" ");
        let buffer = "";
        const out = [];
        for (const w of words) {
            const t = buffer ? buffer + " " + w : w;
            const wpx = (bold ? fontBold : font).widthOfTextAtSize(t, size);
            if (wpx > maxWidth) {
                out.push(buffer);
                buffer = w;
            } else buffer = t;
        }
        if (buffer) out.push(buffer);

        for (const l of out) {
            if (y < pageMargin + 40) {
                page = pdf.addPage([pageWidth, pageHeight]);
                y = pageHeight - pageMargin;
                drawWatermark();
            }
            page.drawText(l, {
                x: pageMargin,
                y,
                size,
                font: bold ? fontBold : font,
                color: rgb(0, 0, 0),
            });
            y -= size + 4;
        }
    };

    // Cabecera
    writeLine(`robotARQ — Presupuesto técnico`, { bold: true, size: 14 });
    writeLine(`Ref: ${meta?.refId || ""}`);
    writeLine(`Tipo: ${meta?.tipo || "-"} · Ciudad: ${meta?.ciudad || "-"}`);
    writeLine(`Descripción: ${meta?.prompt || "-"}`);
    y -= 6;

    // Cuerpo
    for (const ch of Object.values(budget?.chapters || {})) {
        writeLine(`${ch.code} — ${ch.name}`, { bold: true, size: 12 });
        writeLine(`COD | DESCRIPCIÓN | UD | CANT. | P.UNIT | IMPORTE`, {
            bold: true,
            size: 10,
        });
        for (const it of ch.items) {
            writeLine(
                `${it.code} | ${it.desc} | ${it.unit} | ${it.qty} | ${eur(
                    it.price
                )} | ${eur(it.amount)}`,
                { size: 10 }
            );
        }
        writeLine(`Subtotal capítulo: ${eur(ch.total)}`, { bold: true, size: 10 });
        y -= 4;
    }

    if (budget?.extras?.length) {
        writeLine(`Cargos porcentuales`, { bold: true, size: 12 });
        writeLine(`COD | DESCRIPCIÓN | % | IMPORTE`, { bold: true, size: 10 });
        for (const e of budget.extras) {
            writeLine(`${e.code} | ${e.desc} | ${e.qty}% | ${eur(e.amount)}`, {
                size: 10,
            });
        }
        y -= 4;
    }

    writeLine(`Subtotal: ${eur(budget?.subtotal || 0)}`, { bold: true, size: 12 });
    writeLine(`TOTAL (sin IVA): ${eur(budget?.total || 0)}`, {
        bold: true,
        size: 13,
    });
    writeLine(
        `* Estimación orientativa. Sujeta a medición y calidades definitivas.`,
        { size: 9 }
    );

    const bytes = await pdf.save();
    return Buffer.from(bytes);
}

/** Subject helper */
const subjectLine = (meta, who = "Cliente") =>
    `robotARQ · Presupuesto ${meta?.tipo || "reforma"} · ${meta?.ciudad || ""} · Ref ${meta?.refId || ""} (${who})`;

/** Handler */
export async function POST(req) {
    try {
        const { customer, meta, budget, aiOk } = await req.json();

        const resendKey = process.env.RESEND_API_KEY;
        const from = process.env.RESEND_FROM; // "robotARQ <hola@robotarq.com>"
        const owner = process.env.RESEND_OWNER; // correo interno

        if (!resendKey || !from || !owner) {
            console.error("[/api/notify] Falta configuración:", {
                hasResendKey: !!resendKey,
                hasFrom: !!from,
                hasOwner: !!owner,
            });
            return NextResponse.json(
                { ok: false, error: "Falta configuración de correo." },
                { status: 200 }
            );
        }

        const resend = new Resend(resendKey);
        const html = renderEmailHtml({ customer, meta, budget, aiOk });
        const pdfBuffer = await buildPdf({ customer, meta, budget });

        // Al cliente (si hay email), con CC al owner
        const toCustomer = String(customer?.email || "").trim();
        if (toCustomer) {
            await resend.emails.send({
                from,
                to: toCustomer,
                cc: owner,
                subject: subjectLine(meta, "Cliente"),
                html,
                attachments: [
                    {
                        filename: `robotARQ_${meta?.refId || "presupuesto"}.pdf`,
                        content: pdfBuffer.toString("base64"),
                        contentType: "application/pdf",
                    },
                ],
            });
        }

        // Interno (siempre)
        await resend.emails.send({
            from,
            to: owner,
            subject: subjectLine(meta, "Interno"),
            html,
            attachments: [
                {
                    filename: `robotARQ_${meta?.refId || "presupuesto"}.pdf`,
                    content: pdfBuffer.toString("base64"),
                    contentType: "application/pdf",
                },
            ],
        });

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("[/api/notify] Error:", err);
        return NextResponse.json(
            { ok: false, error: String(err?.message || err) },
            { status: 200 }
        );
    }
}

