"use client";

// === Cliente: descargar PDF / Excel llamando a tus APIs ===

export async function descargarPDF(payload) {
    const res = await fetch("/api/export/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const t = await res.text();
        throw new Error("Error PDF: " + t);
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Presupuesto_robotARQ.pdf";
    a.click();
    URL.revokeObjectURL(url);
}

export async function descargarExcel(payload) {
    const res = await fetch("/api/export/excel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const t = await res.text();
        throw new Error("Error Excel: " + t);
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Presupuesto_robotARQ.xlsx";
    a.click();
    URL.revokeObjectURL(url);
}
