import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

export async function POST(req) {
    try {
        const { meta, rows, extra, total, fmt } = await req.json();
        const resend = new Resend(process.env.RESEND_API_KEY);
        const to = [meta?.emailTo].filter(Boolean);
        if (!to.length) return new NextResponse("emailTo requerido", { status: 400 });

        // Generar adjunto
        let contentType = "";
        let filename = "";
        let buffer = null;

        if (fmt === "xlsx") {
            const r = await fetch(new URL("/api/export/xlsx", process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ meta, rows, extra, total }),
            });
            if (!r.ok) throw new Error(await r.text());
            buffer = Buffer.from(await r.arrayBuffer());
            contentType =
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            filename = "Presupuesto_robotARQ.xlsx";
        } else {
            const r = await fetch(new URL("/api/export/pdf", process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ meta, rows, extra, total }),
            });
            if (!r.ok) throw new Error(await r.text());
            buffer = Buffer.from(await r.arrayBuffer());
            contentType = "application/pdf";
            filename = "Presupuesto_robotARQ.pdf";
        }

        // Email marketing-clean (tono sobrio)
        const subject = "Tu presupuesto robotARQ";
        const html = `
      <div style="font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.4">
        <h2 style="margin:0 0 8px;font-weight:800">robotARQ</h2>
        <p>Hola, adjuntamos tu presupuesto solicitado. Puedes responder a este correo si quieres que un técnico lo revise contigo.</p>
        ${meta?.wantsContact
                ? `<p><strong>Has marcado que deseas contacto.</strong> Nuestro equipo te llamará muy pronto.</p>`
                : ""
            }
        <p style="color:#555;font-size:12px;margin-top:16px">Tel: +1 855 520 0991 · hola@robotarq.com</p>
      </div>
    `;

        const recipients = [...to, "hola@robotarq.com"];

        await resend.emails.send({
            from: "robotARQ <hola@robotarq.com>",
            to: recipients,
            subject,
            html,
            attachments: [
                {
                    filename,
                    content: buffer.toString("base64"),
                    contentType,
                },
            ],
        });

        return NextResponse.json({ ok: true });
    } catch (e) {
        return new NextResponse(String(e?.message || e), { status: 500 });
    }
}
