// app/(client)/export-client.js
// Cliente: utilidades de exportación PDF/Excel
export async function descargarPDF(meta, budget) {
    const { jsPDF } = await import("jspdf");

    // A4 mm
    const doc = new jsPDF({ unit: "mm", format: "a4" });

    // Intento de cargar Calibri si el archivo existe en /public/fonts
    // (si no, jsPDF usará Helvetica por defecto)
    try {
        const regular = await fetch("/fonts/Calibri-Regular.ttf");
        if (regular.ok) {
            const buf = await regular.arrayBuffer();
            const base64 = arrayBufferToBase64(buf);
            doc.addFileToVFS("Calibri-Regular.ttf", base64);
            doc.addFont("Calibri-Regular.ttf", "calibri", "normal");
            doc.setFont("calibri", "normal");
        }
        const bold = await fetch("/fonts/Calibri-Bold.ttf");
        if (bold.ok) {
            const buf = await bold.arrayBuffer();
            const base64 = arrayBufferToBase64(buf);
            doc.addFileToVFS("Calibri-Bold.ttf", base64);
            doc.addFont("Calibri-Bold.ttf", "calibri", "bold");
        }
    } catch { }

    const margin = { l: 15, t: 18, r: 15, b: 18 };
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();

    // Marca de agua diagonal en todas las páginas
    function watermark() {
        doc.saveGraphicsState();
        doc.setGState(new doc.GState({ opacity: 0.08 }));
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(60);
        doc.text("robotARQ", pageW / 2, pageH / 2, { angle: 45, align: "center" });
        doc.restoreGraphicsState();
    }

    // Cabecera
    function header() {
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, "bold");
        doc.text(meta.title || "Presupuesto", margin.l, margin.t);
        doc.setFont(undefined, "normal");
        if (meta.subtitle) doc.text(meta.subtitle, margin.l, margin.t + 6);
        if (meta.prompt) {
            doc.setFontSize(9);
            multiText("Descripción: " + meta.prompt, margin.l, margin.t + 12, pageW - margin.l - margin.r, 4);
        }
    }

    // Pie
    function footer(pageNo) {
        const y = pageH - 10;
        doc.setFontSize(8);
        doc.setTextColor(120);
        doc.text(`robotARQ · hola@robotarq.com · +34 624473123 · Página ${pageNo}`, margin.l, y);
    }

    let y = margin.t + 20;
    let page = 1;

    header(); watermark(); footer(page);

    // Tabla por capítulos
    doc.setFontSize(11);
    const cols = [
        { k: "code", w: 22, h: "Código" },
        { k: "desc", w: 92, h: "Descripción" },
        { k: "unit", w: 16, h: "Ud" },
        { k: "qty", w: 16, h: "Cant." },
        { k: "price", w: 20, h: "P. unit" },
        { k: "amount", w: 24, h: "Importe" },
    ];

    function ensurePage(hAdd = 0) {
        if (y + hAdd > pageH - margin.b) {
            doc.addPage();
            page += 1;
            y = margin.t;
            header(); watermark(); footer(page);
        }
    }

    function drawHead() {
        doc.setFont(undefined, "bold");
        doc.setFontSize(10);
        let x = margin.l;
        cols.forEach(c => {
            doc.text(c.h, x, y);
            x += c.w;
        });
        doc.setFont(undefined, "normal");
        y += 6;
        doc.setDrawColor(220);
        doc.line(margin.l, y, pageW - margin.r, y);
        y += 2;
    }

    function rowLine(item) {
        doc.setFontSize(9);
        let x = margin.l;
        const hLine = 5;
        ensurePage(hLine);
        doc.text(String(item.code), x, y); x += cols[0].w;
        // desc multi-line
        const descW = cols[1].w;
        const wrapped = doc.splitTextToSize(item.desc, descW);
        const lines = wrapped.length;
        const blockH = Math.max(hLine, lines * 4.2);
        ensurePage(blockH);
        wrapped.forEach((ln, i) => doc.text(ln, margin.l + cols[0].w, y + i * 4.2));
        // resto en la línea base
        let x2 = margin.l + cols[0].w + descW;
        doc.text(item.unit, x2, y); x2 += cols[2].w;
        doc.text(String(item.qty), x2, y, { align: "right" }); x2 += cols[3].w;
        doc.text((item.price).toFixed(2) + " €", x2, y, { align: "right" }); x2 += cols[4].w;
        doc.text((item.amount).toFixed(2) + " €", x2, y, { align: "right" });

        y += blockH + 2;
    }

    function chapterBlock(ch) {
        ensurePage(10);
        doc.setFont(undefined, "bold");
        doc.setFontSize(11);
        doc.text(`${ch.code} — ${ch.name}`, margin.l, y);
        doc.setFont(undefined, "normal");
        y += 6;
        drawHead();
        ch.items.forEach((it) => rowLine(it));
        // subtotal
        ensurePage(8);
        doc.setFont(undefined, "bold");
        doc.text("Subtotal capítulo:", pageW - margin.r - 44, y);
        doc.text(ch.total.toFixed(2) + " €", pageW - margin.r, y, { align: "right" });
        doc.setFont(undefined, "normal");
        y += 8;
    }

    const chaps = Object.values(budget.chapters);
    chaps.forEach(ch => chapterBlock(ch));

    // Extras
    if (budget.extras?.length) {
        ensurePage(12);
        doc.setFont(undefined, "bold");
        doc.setFontSize(11);
        doc.text("Cargos porcentuales", margin.l, y); y += 6;
        doc.setFont(undefined, "normal");
        drawHead();
        budget.extras.forEach((e) => {
            rowLine({
                code: e.code,
                desc: `${e.desc} (${e.pct}%) Base: ${e.base.toFixed(2)} €`,
                unit: "%",
                qty: e.pct,
                price: e.base,
                amount: e.amount
            });
        });
    }

    // Totales
    ensurePage(16);
    doc.setFont(undefined, "bold");
    doc.setFontSize(12);
    doc.text("Subtotal:", pageW - margin.r - 44, y);
    doc.text(budget.subtotal.toFixed(2) + " €", pageW - margin.r, y, { align: "right" });
    y += 8;
    doc.text("TOTAL (sin IVA):", pageW - margin.r - 44, y);
    doc.text(budget.total.toFixed(2) + " €", pageW - margin.r, y, { align: "right" });

    // Datos de contacto si marcó la casilla
    if (meta.contacto) {
        y += 12;
        doc.setFont(undefined, "normal");
        doc.setFontSize(9);
        doc.text(`Contacto robotARQ · Tel: ${meta.contacto.telefono} · ${"hola@robotarq.com"}`, margin.l, y);
    }

    doc.save("Presupuesto_robotARQ.pdf");
}

export async function descargarExcel(meta, budget) {
    const XLSX = await import("xlsx");

    // Hoja 1: resumen
    const rows1 = [["Capítulo", "Nombre", "Subtotal €"]];
    Object.values(budget.chapters).forEach(ch => {
        rows1.push([ch.code, ch.name, ch.total]);
    });
    rows1.push([]);
    rows1.push(["Subtotal", "", budget.subtotal]);
    rows1.push(["TOTAL (sin IVA)", "", budget.total]);

    // Hoja 2: detalle
    const rows2 = [["Capítulo", "Código", "Descripción", "Ud", "Cantidad", "P. unit", "Importe"]];
    Object.values(budget.chapters).forEach(ch => {
        ch.items.forEach(it => {
            rows2.push([ch.code, it.code, it.desc, it.unit, it.qty, it.price, it.amount]);
        });
    });
    if (budget.extras?.length) {
        rows2.push([]);
        rows2.push(["CARGOS PORCENTUALES"]);
        budget.extras.forEach(e => {
            rows2.push(["", e.code, `${e.desc} (${e.pct}%) Base: ${e.base.toFixed(2)} €`, "%", e.pct, e.base, e.amount]);
        });
    }

    const wb = XLSX.utils.book_new();
    const ws1 = XLSX.utils.aoa_to_sheet(rows1);
    const ws2 = XLSX.utils.aoa_to_sheet(rows2);

    // Estilos básicos y anchos columnas
    ws1["!cols"] = [{ wch: 16 }, { wch: 42 }, { wch: 18 }];
    ws2["!cols"] = [{ wch: 12 }, { wch: 12 }, { wch: 60 }, { wch: 6 }, { wch: 10 }, { wch: 12 }, { wch: 14 }];

    // Encabezado/pie como “marca de agua” para impresión
    ws1["!margins"] = { left: 0.5, right: 0.5, top: 0.6, bottom: 0.6, header: 0.2, footer: 0.2 };
    ws2["!margins"] = { left: 0.5, right: 0.5, top: 0.6, bottom: 0.6, header: 0.2, footer: 0.2 };

    ws1["!pageSetup"] = { paperSize: 9, orientation: "portrait", fitToWidth: 1, scale: 100 };
    ws2["!pageSetup"] = { paperSize: 9, orientation: "portrait", fitToWidth: 1, scale: 100 };

    ws1["!header"] = "&C&KAAAAAA&\"Calibri,Bold\" robotARQ";
    ws1["!footer"] = "&C&KAAAAAA&\"Calibri\" robotARQ — Página &P de &N";
    ws2["!header"] = "&C&KAAAAAA&\"Calibri,Bold\" robotARQ";
    ws2["!footer"] = "&C&KAAAAAA&\"Calibri\" robotARQ — Página &P de &N";

    XLSX.utils.book_append_sheet(wb, ws1, "Resumen");
    XLSX.utils.book_append_sheet(wb, ws2, "Detalle");

    XLSX.writeFile(wb, "Presupuesto_robotARQ.xlsx", { compression: true });
}

// helper
function arrayBufferToBase64(buffer) {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
}
