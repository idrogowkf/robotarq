import { NextResponse } from "next/server";
import path from "node:path";
import { promises as fs } from "node:fs";
import ExcelJS from "exceljs";

export const runtime = "nodejs";

export async function POST(req) {
    try {
        const { meta, rows, extra, total } = await req.json();

        // 1) Carga de plantilla EXACTA
        const tplPath = path.join(process.cwd(), "public", "templates", "ejemplo.xlsx");
        const exists = await fs
            .access(tplPath)
            .then(() => true)
            .catch(() => false);
        if (!exists) {
            return new NextResponse(
                "No se encontró plantilla /public/templates/ejemplo.xlsx",
                { status: 400 }
            );
        }

        const wb = new ExcelJS.Workbook();
        await wb.xlsx.readFile(tplPath);

        // 2) Asumimos hojas (ajusta nombres si tu plantilla difiere):
        // Hoja 1: "Resumen" (cabecera, totales)
        // Hoja 2: "Partidas" (detalle por partidas)
        // Hoja 3: "Extras"   (cargos porcentuales)
        const wsResumen = wb.getWorksheet("Resumen") || wb.worksheets[0];
        const wsPartidas = wb.getWorksheet("Partidas") || wb.worksheets[1];
        const wsExtras = wb.getWorksheet("Extras") || wb.worksheets[2];

        // 3) Relleno encabezados de resumen (ajusta celdas a tu plantilla)
        // Ejemplo de celdas:
        // A2: Título, A3: Subtítulo, A4: Tipo, A5: Prompt
        wsResumen.getCell("A2").value = meta?.title || "Presupuesto técnico";
        wsResumen.getCell("A3").value = meta?.subtitle || "Partidas, cantidades y precios";
        wsResumen.getCell("A4").value = `Tipo: ${meta?.tipo || ""}`;
        wsResumen.getCell("A5").value = `Descripción: ${meta?.prompt || ""}`;

        // Totales:
        wsResumen.getCell("A7").value = "Subtotal";
        wsResumen.getCell("B7").value = Number(
            rows.reduce((a, r) => a + Number(r.qty) * Number(r.pu), 0).toFixed(2)
        );
        const extrasImp = extra.reduce((a, e) => a + Number(e.imp), 0);
        wsResumen.getCell("A8").value = "Cargos";
        wsResumen.getCell("B8").value = Number(extrasImp.toFixed(2));
        wsResumen.getCell("A9").value = "TOTAL (sin IVA)";
        wsResumen.getCell("B9").value = Number(Number(total).toFixed(2));

        // 4) Volcado de partidas (cabeceras suponemos en la plantilla)
        // Empezamos en fila 5, ajusta si tus cabeceras están en otra fila:
        let rowIndex = 5;
        // Si hay cabeceras ya puestas en la plantilla, respétalas y empieza debajo.
        rows.forEach((r) => {
            const row = wsPartidas.getRow(rowIndex++);
            row.getCell(1).value = r.cap;
            row.getCell(2).value = r.capName;
            row.getCell(3).value = r.code;
            row.getCell(4).value = r.desc;
            row.getCell(5).value = r.ud;
            row.getCell(6).value = Number(r.qty);
            row.getCell(7).value = Number(r.pu);
            row.getCell(8).value = Number((Number(r.qty) * Number(r.pu)).toFixed(2));
            row.commit();
        });

        // 5) Extras
        let exIndex = 5;
        extra.forEach((e) => {
            const row = wsExtras.getRow(exIndex++);
            row.getCell(1).value = e.code;
            row.getCell(2).value = e.desc;
            row.getCell(3).value = Number(e.base);
            row.getCell(4).value = Number(e.imp);
            row.commit();
        });

        // 6) Exporta
        const out = await wb.xlsx.writeBuffer();
        return new NextResponse(out, {
            status: 200,
            headers: {
                "Content-Type":
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "Content-Disposition":
                    'attachment; filename="Presupuesto_robotARQ.xlsx"',
            },
        });
    } catch (e) {
        return new NextResponse(String(e?.message || e), { status: 500 });
    }
}
