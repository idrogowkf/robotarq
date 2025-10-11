import { NextResponse } from "next/server";
import React from "react";
import { pdf, Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";

export const runtime = "nodejs";

// Fuentes base (Helvetica ya está)
const styles = StyleSheet.create({
    page: { padding: 28, fontSize: 10, fontFamily: "Helvetica" },
    h1: { fontSize: 16, fontWeight: 700, marginBottom: 6 },
    h2: { fontSize: 12, fontWeight: 700, marginBottom: 4, marginTop: 8 },
    small: { fontSize: 9, color: "#555" },
    row: { flexDirection: "row" },
    cell: { padding: 4, borderBottom: "1pt solid #eee" },
    th: { fontWeight: 700, backgroundColor: "#f5f5f5" },
});

function PDFDoc({ meta, rows, extra, total }) {
    // Agrupar capítulos
    const grouped = {};
    rows.forEach((r) => {
        const k = `${r.cap}|${r.capName}`;
        if (!grouped[k]) grouped[k] = [];
        grouped[k].push(r);
    });

    const subtotal = rows.reduce((a, r) => a + Number(r.qty) * Number(r.pu), 0);
    const extrasImp = extra.reduce((a, e) => a + Number(e.imp), 0);

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <Text style={styles.h1}>{meta?.title || "Presupuesto técnico"}</Text>
                <Text style={styles.small}>{meta?.subtitle || "Partidas, cantidades y precios"}</Text>
                <Text style={[styles.small, { marginTop: 4 }]}>
                    Tipo: {meta?.tipo || ""} — Descripción: {meta?.prompt || ""}
                </Text>

                {Object.entries(grouped).map(([k, items], idx) => {
                    const [cap, capName] = k.split("|");
                    const sub = items.reduce(
                        (a, i) => a + Number(i.qty) * Number(i.pu),
                        0
                    );
                    return (
                        <View key={idx} wrap={false}>
                            <Text style={styles.h2}>
                                {cap} — {capName}
                            </Text>
                            {/* Cabecera */}
                            <View style={[styles.row, styles.th]}>
                                <Text style={[styles.cell, { width: "12%" }]}>Código</Text>
                                <Text style={[styles.cell, { width: "48%" }]}>Descripción</Text>
                                <Text style={[styles.cell, { width: "8%" }]}>Ud</Text>
                                <Text style={[styles.cell, { width: "10%", textAlign: "right" }]}>
                                    Cant.
                                </Text>
                                <Text style={[styles.cell, { width: "10%", textAlign: "right" }]}>
                                    P. unit
                                </Text>
                                <Text style={[styles.cell, { width: "12%", textAlign: "right" }]}>
                                    Importe
                                </Text>
                            </View>
                            {items.map((it, i) => (
                                <View key={i} style={styles.row}>
                                    <Text style={[styles.cell, { width: "12%" }]}>{it.code}</Text>
                                    <Text style={[styles.cell, { width: "48%" }]}>{it.desc}</Text>
                                    <Text style={[styles.cell, { width: "8%" }]}>{it.ud}</Text>
                                    <Text style={[styles.cell, { width: "10%", textAlign: "right" }]}>
                                        {it.qty}
                                    </Text>
                                    <Text style={[styles.cell, { width: "10%", textAlign: "right" }]}>
                                        {Number(it.pu).toFixed(2)} €
                                    </Text>
                                    <Text style={[styles.cell, { width: "12%", textAlign: "right" }]}>
                                        {(Number(it.qty) * Number(it.pu)).toFixed(2)} €
                                    </Text>
                                </View>
                            ))}
                            <View style={[styles.row, { justifyContent: "flex-end" }]}>
                                <Text style={[styles.cell, { width: "80%", textAlign: "right", fontWeight: 700 }]}>
                                    Subtotal capítulo
                                </Text>
                                <Text style={[styles.cell, { width: "12%", textAlign: "right", fontWeight: 700 }]}>
                                    {sub.toFixed(2)} €
                                </Text>
                            </View>
                        </View>
                    );
                })}

                <Text style={styles.h2}>Cargos porcentuales</Text>
                {extra.map((e, i) => (
                    <View key={i} style={styles.row}>
                        <Text style={[styles.cell, { width: "20%" }]}>{e.code}</Text>
                        <Text style={[styles.cell, { width: "50%" }]}>{e.desc}</Text>
                        <Text style={[styles.cell, { width: "15%", textAlign: "right" }]}>
                            {Number(e.base).toFixed(2)} €
                        </Text>
                        <Text style={[styles.cell, { width: "15%", textAlign: "right" }]}>
                            {Number(e.imp).toFixed(2)} €
                        </Text>
                    </View>
                ))}

                <View style={[styles.row, { justifyContent: "flex-end", marginTop: 8 }]}>
                    <Text style={[styles.cell, { width: "73%", textAlign: "right", fontWeight: 700 }]}>
                        Subtotal
                    </Text>
                    <Text style={[styles.cell, { width: "12%", textAlign: "right", fontWeight: 700 }]}>
                        {subtotal.toFixed(2)} €
                    </Text>
                </View>
                <View style={[styles.row, { justifyContent: "flex-end" }]}>
                    <Text style={[styles.cell, { width: "73%", textAlign: "right", fontWeight: 700 }]}>
                        TOTAL (sin IVA)
                    </Text>
                    <Text style={[styles.cell, { width: "12%", textAlign: "right", fontWeight: 700 }]}>
                        {Number(subtotal + extrasImp).toFixed(2)} €
                    </Text>
                </View>
            </Page>
        </Document>
    );
}

export async function POST(req) {
    try {
        const { meta, rows, extra, total } = await req.json();
        const blob = await pdf(<PDFDoc meta={meta} rows={rows} extra={extra} total={total} />).toBuffer();
        return new NextResponse(blob, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": 'attachment; filename="Presupuesto_robotARQ.pdf"',
            },
        });
    } catch (e) {
        // NOTA: si quieres PDF idéntico a Excel, el camino pro es usar Playwright/Chromium
        // para renderizar una plantilla HTML que copie tu Excel al píxel y luego imprimir a PDF.
        return new NextResponse(String(e?.message || e), { status: 500 });
    }
}
