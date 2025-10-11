// app/contacto/ContactForm.jsx
"use client";

import { useState } from "react";

export default function ContactForm() {
    const [tipo, setTipo] = useState("persona"); // "persona" | "empresa"
    const [empresa, setEmpresa] = useState("");
    const [nif, setNif] = useState("");
    const [nombre, setNombre] = useState("");
    const [email, setEmail] = useState("");
    const [telefono, setTelefono] = useState("");
    const [ciudad, setCiudad] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [sending, setSending] = useState(false);

    async function onSubmit(e) {
        e.preventDefault();
        setSending(true);
        try {
            const resp = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tipo,
                    empresa: tipo === "empresa" ? empresa : "",
                    nif: tipo === "empresa" ? nif : "",
                    nombre,
                    email,
                    telefono,
                    ciudad,
                    mensaje,
                    origen: "contacto",
                }),
            });
            const text = await resp.text();
            if (!resp.ok) {
                throw new Error(text || "No se pudo enviar el contacto");
            }
            alert("¡Enviado! Te contactaremos en breve.");
            setEmpresa(""); setNif(""); setNombre(""); setEmail(""); setTelefono(""); setCiudad(""); setMensaje("");
            setTipo("persona");
        } catch (err) {
            console.error(err);
            alert("No se pudo enviar. Intenta de nuevo o escríbenos a hola@robotarq.com");
        } finally {
            setSending(false);
        }
    }

    return (
        <form onSubmit={onSubmit} className="space-y-3">
            <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                    <input
                        type="radio"
                        name="tipo"
                        value="persona"
                        checked={tipo === "persona"}
                        onChange={() => setTipo("persona")}
                    />
                    Particular
                </label>
                <label className="flex items-center gap-2 text-sm">
                    <input
                        type="radio"
                        name="tipo"
                        value="empresa"
                        checked={tipo === "empresa"}
                        onChange={() => setTipo("empresa")}
                    />
                    Empresa
                </label>
            </div>

            {tipo === "empresa" && (
                <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                        <label className="text-sm">Empresa</label>
                        <input className="w-full mt-1 px-3 py-2 border rounded-xl" value={empresa} onChange={(e) => setEmpresa(e.target.value)} />
                    </div>
                    <div>
                        <label className="text-sm">NIF</label>
                        <input className="w-full mt-1 px-3 py-2 border rounded-xl" value={nif} onChange={(e) => setNif(e.target.value)} />
                    </div>
                </div>
            )}

            <div className="grid sm:grid-cols-2 gap-3">
                <div>
                    <label className="text-sm">Nombre</label>
                    <input className="w-full mt-1 px-3 py-2 border rounded-xl" value={nombre} onChange={(e) => setNombre(e.target.value)} />
                </div>
                <div>
                    <label className="text-sm">Email</label>
                    <input type="email" className="w-full mt-1 px-3 py-2 border rounded-xl" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                    <label className="text-sm">Teléfono</label>
                    <input className="w-full mt-1 px-3 py-2 border rounded-xl" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
                </div>
                <div>
                    <label className="text-sm">Ciudad</label>
                    <input className="w-full mt-1 px-3 py-2 border rounded-xl" value={ciudad} onChange={(e) => setCiudad(e.target.value)} />
                </div>
            </div>

            <div>
                <label className="text-sm">Mensaje</label>
                <textarea rows={4} className="w-full mt-1 px-3 py-2 border rounded-xl" value={mensaje} onChange={(e) => setMensaje(e.target.value)} />
            </div>

            <button disabled={sending} className="px-4 py-3 rounded-xl bg-blue-700 text-white disabled:opacity-60">
                {sending ? "Enviando…" : "Enviar"}
            </button>
            <p className="text-xs text-slate-500">Al enviar aceptas la Política de privacidad.</p>
        </form>
    );
}
