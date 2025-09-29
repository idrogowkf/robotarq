"use client";
import { useEffect, useMemo, useRef, useState } from "react";

/* ========= Helpers ========= */
function cls(...a) {
    return a.filter(Boolean).join(" ");
}

function usePhoneDefault() {
    // Número definitivo para WhatsApp y llamadas
    const [phone] = useState("34614016147");
    return phone;
}

const euro = (n) =>
    n.toLocaleString("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

/* ========= Rotating Headline (entre header y collage) ========= */
function RotatingHeadline() {
    const words = ["REFORMAS", "BAR", "TIENDAS", "RESTAURACIÓN"];
    const [i, setI] = useState(0);
    const [fade, setFade] = useState(false);

    useEffect(() => {
        const id = setInterval(() => {
            setFade(true);
            setTimeout(() => {
                setI((x) => (x + 1) % words.length);
                setFade(false);
            }, 200); // pequeño crossfade
        }, 2200);
        return () => clearInterval(id);
    }, []);

    return (
        <div className="max-w-[1400px] mx-auto px-4 pt-4">
            <div className="rounded-2xl border-4 border-black overflow-hidden">
                <div className="bg-black text-white grid place-items-center min-h-[18vh] sm:min-h-[22vh]">
                    <div className="flex flex-col items-center">
                        <h2
                            className={cls(
                                "text-[12vw] sm:text-[8vw] leading-none font-extrabold tracking-tight transition-opacity duration-200 mb-1",
                                fade ? "opacity-0" : "opacity-100"
                            )}
                            aria-live="polite"
                        >
                            {words[i]}
                        </h2>
                        <div className="text-xs sm:text-sm text-white/80 px-3 py-1 rounded mt-1">
                            <strong>SOLICITA TU PRESUPUESTO YA</strong>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ========= Mondrian Tile: cambia color ⇄ imagen de forma independiente ========= */
function MondrianTile({ className, color = "#F6C500", img, startImage = false }) {
    const [showImg, setShowImg] = useState(Boolean(startImage));
    useEffect(() => {
        let alive = true;
        // intervalo aleatorio por tile (3–6s)
        const period = 3000 + Math.floor(Math.random() * 3000);
        const initialDelay = Math.floor(Math.random() * 1200);
        const t0 = setTimeout(() => {
            setShowImg((s) => !s);
            const id = setInterval(() => {
                if (!alive) return;
                setShowImg((s) => !s);
            }, period);
            (MondrianTile)._id = id; // guardar para limpiar
        }, initialDelay);
        return () => {
            alive = false;
            clearTimeout(t0);
            if ((MondrianTile)._id) clearInterval((MondrianTile)._id);
        };
    }, []);

    return (
        <div className={cls("relative overflow-hidden", className)}>
            {/* Capa color */}
            <div
                className={cls(
                    "absolute inset-0 transition-opacity duration-700",
                    showImg ? "opacity-0" : "opacity-100"
                )}
                style={{ backgroundColor: color }}
            />
            {/* Capa imagen */}
            {img ? (
                <div
                    className={cls(
                        "absolute inset-0 bg-center bg-cover transition-opacity duration-700",
                        showImg ? "opacity-100" : "opacity-0"
                    )}
                    style={{ backgroundImage: `url('${img}')` }}
                />
            ) : null}
        </div>
    );
}

/* ========= Collage Mondrian (altura fija para evitar “persiana”) ========= */
function MondrianCollage() {
    // Imágenes locales (si alguna no existe, ese tile queda en color)
    const imgs = {
        hero: "/assets/hero-bar-reformado-01.jpg",
        d1: "/assets/caso-bar-01-despues.jpg",
        a1: "/assets/caso-bar-01-antes.jpg",
        d2: "/assets/caso-bar-02-despues.jpg",
    };

    return (
        <section className="relative max-w-[1400px] mx-auto px-4 pt-4">
            <div className="relative w-full h-[72vh] md:h-[82vh] rounded-2xl overflow-hidden border-4 border-black">
                <div className="grid grid-cols-12 grid-rows-8 gap-1 h-full bg-white">
                    {/* fila superior */}
                    <MondrianTile className="col-span-3 row-span-2" color="#F6C500" img={imgs.a1} />
                    <MondrianTile className="col-span-2 row-span-2" color="#E63946" img={imgs.d1} startImage />
                    <MondrianTile className="col-span-2 row-span-2" color="#1D4ED8" />
                    <MondrianTile className="col-span-1 row-span-2" color="#000000" />
                    <MondrianTile className="col-span-4 row-span-2" color="#F6C500" img={imgs.d2} />

                    {/* bloque hero grande izquierda */}
                    <MondrianTile className="col-span-7 row-span-6" color="#1D4ED8" img={imgs.hero} startImage />

                    {/* columna derecha con mosaico */}
                    <MondrianTile className="col-span-5 row-span-3" color="#E63946" img={imgs.d1} />
                    <MondrianTile className="col-span-3 row-span-2" color="#1D4ED8" img={imgs.a1} startImage />
                    <MondrianTile className="col-span-2 row-span-2" color="#F6C500" img={imgs.d2} />
                    <MondrianTile className="col-span-2 row-span-1" color="#000000" />
                    <MondrianTile className="col-span-1 row-span-1" color="#F6C500" />
                </div>
            </div>
        </section>
    );
}

/* ========= Página ========= */
export default function Page() {
    /* Teléfono y CTA */
    const phone = usePhoneDefault();
    const waHref = useMemo(
        () => `https://wa.me/${phone}?text=${encodeURIComponent("Hola Robotarq, quiero reformar mi bar")}`,
        [phone]
    );

    /* Calculadora */
    const [m2, setM2] = useState(120);
    const [ciudad, setCiudad] = useState("madrid");
    const [tipo, setTipo] = useState("integral");
    const [humos, setHumos] = useState("si");
    const basePorCiudad = {
        madrid: [650, 900],
        barcelona: [700, 950],
        valencia: [550, 800],
        sevilla: [520, 760],
        malaga: [540, 780],
        zaragoza: [500, 730],
        bilbao: [600, 850],
        alicante: [500, 740],
    };
    const multTipo = { integral: 1.0, parcial: 0.75, barra: 0.85 };
    const calcOut = useMemo(() => {
        const S = Math.max(20, Number(m2 || 0));
        const base = basePorCiudad[ciudad] || [550, 800];
        const low = base[0] * multTipo[tipo];
        const high = base[1] * multTipo[tipo];
        const humosPct = humos === "si" ? 0.06 : 0;
        const lowAdj = Math.round(low * (1 + humosPct));
        const highAdj = Math.round(high * (1 + humosPct));
        const totalLow = Math.round(S * lowAdj);
        const totalHigh = Math.round(S * highAdj);
        return { rango: `${euro(lowAdj)} – ${euro(highAdj)}`, total: `${euro(totalLow)} – ${euro(totalHigh)}` };
    }, [m2, ciudad, tipo, humos]);

    /* Formulario + uploads */
    const [nombre, setNombre] = useState("");
    const [telefono, setTelefono] = useState("");
    const [ciudad2, setCiudad2] = useState("Madrid");
    const [mensaje, setMensaje] = useState("");
    const fileRef = useRef(null);
    const [sending, setSending] = useState(false);
    const [prog, setProg] = useState(0);

    async function uploadFiles(files) {
        const urls = [];
        for (let i = 0; i < files.length; i++) {
            const f = files[i];
            setProg(Math.round(((i + 1) / files.length) * 100));
            const presignRes = await fetch("/api/s3-presign", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ filename: f.name, type: f.type }),
            });
            if (!presignRes.ok) throw new Error("No se pudo generar URL de subida");
            const presign = await presignRes.json();
            if (presign.method === "POST" && presign.fields) {
                const fd = new FormData();
                Object.keys(presign.fields).forEach((k) => fd.append(k, presign.fields[k]));
                fd.append("file", f);
                const up = await fetch(presign.url, { method: "POST", body: fd });
                if (!up.ok) throw new Error("Fallo al subir a S3 (POST)");
                urls.push(presign.fileUrl);
            } else {
                const headers = presign.headers || { "Content-Type": f.type || "application/octet-stream" };
                const up2 = await fetch(presign.url, { method: presign.method || "PUT", headers, body: f });
                if (!up2.ok) throw new Error("Fallo al subir a S3 (PUT)");
                urls.push(presign.fileUrl || presign.url.split("?")[0]);
            }
        }
        setTimeout(() => setProg(0), 600);
        return urls;
    }

    async function onSubmit(e) {
        e.preventDefault();
        if (!nombre.trim() || !telefono.trim() || !mensaje.trim()) {
            alert("Completa todos los campos obligatorios.");
            return;
        }
        setSending(true);
        try {
            const files = fileRef.current?.files || [];
            const fileUrls = files.length ? await uploadFiles(files) : [];
            const payload = {
                nombre,
                telefono,
                ciudad: ciudad2,
                mensaje,
                origen: "reformas-bares",
                archivos: fileUrls,
            };
            const resp = await fetch("/api/send-quote", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!resp.ok) throw new Error("No se pudo enviar la solicitud");
            alert("¡Solicitud enviada! Te contactaremos muy pronto.");
            setNombre(""); setTelefono(""); setCiudad2("Madrid"); setMensaje("");
            if (fileRef.current) fileRef.current.value = "";
        } catch (err) {
            console.error(err);
            alert("Hubo un problema al enviar. Intenta de nuevo o contáctanos por teléfono/WhatsApp.");
        } finally {
            setSending(false);
        }
    }

    const [year, setYear] = useState("");
    useEffect(() => setYear(String(new Date().getFullYear())), []);

    return (
        <div className="min-h-screen bg-white text-slate-900">
            {/* HEADER */}
            <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2" aria-label="Robotarq">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-800 to-sky-400 grid place-items-center text-white font-bold">R</div>
                        <span className="font-bold text-lg">Robotarq</span>
                    </div>
                    <nav className="hidden md:block">
                        <ul className="flex items-center gap-3">
                            <li><a href="#calc" className="px-3 py-2 rounded-lg hover:bg-slate-100">Calculadora</a></li>
                            <li><a href="#packs" className="px-3 py-2 rounded-lg hover:bg-slate-100">Packs</a></li>
                            <li><a href="#casos" className="px-3 py-2 rounded-lg hover:bg-slate-100">Proyectos</a></li>
                            <li><a href="#contacto" className="px-3 py-2 rounded-lg bg-blue-700 text-white">Contacto</a></li>
                        </ul>
                    </nav>
                </div>
            </header>

            {/* HEADLINE ROTATOR */}
            <RotatingHeadline />

            {/* COLLAGE MONDRIAN (transiciones independientes) */}
            <MondrianCollage />

            {/* BENEFICIOS */}
            <section id="beneficios" className="max-w-7xl mx-auto px-4 py-10">
                <div className="grid md:grid-cols-3 gap-4">
                    {[
                        { t: "Licencia + obra", d: "Proyecto técnico, licencia de actividad e instalación completa." },
                        { t: "Salida de humos / acústica", d: "Soluciones de extracción e insonorización conforme a normativa." },
                        { t: "Obra ágil y controlada", d: "Planificación por hitos, seguimiento online y entregas limpias." },
                    ].map((b, i) => (
                        <div key={i} className="border rounded-2xl shadow-sm p-5">
                            <h3 className="font-semibold text-lg">{b.t}</h3>
                            <p className="text-slate-700 mt-1">{b.d}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CALCULADORA */}
            <section id="calc" className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid lg:grid-cols-2 gap-6">
                    <div className="border rounded-2xl shadow-sm p-5">
                        <h2 className="text-2xl sm:text-3xl font-bold">Calcula tu presupuesto</h2>
                        <p className="text-slate-600 mt-1">Rango por m² y total estimado según ciudad y tipo de obra.</p>
                        <div className="grid sm:grid-cols-2 gap-3 mt-4">
                            <div>
                                <label className="text-sm">Superficie (m²)</label>
                                <input
                                    type="number"
                                    min={20}
                                    step={1}
                                    value={m2}
                                    onChange={(e) => setM2(e.target.value)}
                                    className="w-full mt-1 px-3 py-2 border rounded-xl"
                                    placeholder="120"
                                />
                            </div>
                            <div>
                                <label className="text-sm">Ciudad</label>
                                <select
                                    value={ciudad}
                                    onChange={(e) => setCiudad(e.target.value)}
                                    className="w-full mt-1 px-3 py-2 border rounded-xl"
                                >
                                    {Object.keys(basePorCiudad).map((k) => (
                                        <option key={k} value={k}>{k[0].toUpperCase() + k.slice(1)}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm">Tipo de reforma</label>
                                <select
                                    value={tipo}
                                    onChange={(e) => setTipo(e.target.value)}
                                    className="w-full mt-1 px-3 py-2 border rounded-xl"
                                >
                                    <option value="integral">Integral</option>
                                    <option value="parcial">Parcial</option>
                                    <option value="barra">Barra y cocina</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm">Salida de humos</label>
                                <select
                                    value={humos}
                                    onChange={(e) => setHumos(e.target.value)}
                                    className="w-full mt-1 px-3 py-2 border rounded-xl"
                                >
                                    <option value="si">Sí, requiere instalación</option>
                                    <option value="no">No / ya existe y cumple</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-3 mt-4">
                            <div className="px-3 py-2 rounded-xl border bg-slate-50">
                                <strong>Rango €/m²:</strong> <span className="font-semibold">{calcOut.rango}</span>
                            </div>
                            <div className="px-3 py-2 rounded-xl border bg-slate-50">
                                <strong>Total estimado:</strong> <span className="font-semibold">{calcOut.total}</span>
                            </div>
                        </div>
                        <a href="#contacto" className="inline-block mt-3 px-4 py-3 rounded-xl bg-blue-700 text-white">
                            Recibe tu presupuesto en 24h
                        </a>
                        <p className="text-xs text-slate-500 mt-2">* Estimación orientativa. No incluye mobiliario/maquinaria ni IVA.</p>
                    </div>

                    {/* Packs comerciales */}
                    <div id="packs" className="grid gap-4">
                        <div className="border rounded-2xl shadow-sm p-5">
                            <h3 className="font-semibold text-xl">Pack “Apertura de bar en 30–45 días”</h3>
                            <ul className="mt-2 space-y-2 text-slate-700">
                                <li>• Proyecto técnico + licencia de actividad</li>
                                <li>• Obra básica: acabados, electricidad y fontanería</li>
                                <li>• Coordinación y seguimiento online</li>
                            </ul>
                        </div>
                        <div className="border rounded-2xl shadow-sm p-5">
                            <h3 className="font-semibold text-xl">Pack “Reforma exprés de barra y cocina (15 días)”</h3>
                            <ul className="mt-2 space-y-2 text-slate-700">
                                <li>• Barra y trasbarra optimizadas</li>
                                <li>• Extracción y adecuación de cocina</li>
                                <li>• Final de obra y limpieza</li>
                            </ul>
                        </div>
                        <div className="border rounded-2xl shadow-sm p-5">
                            <h3 className="font-semibold text-xl">Financiación y pagos por hitos</h3>
                            <p className="text-slate-700 mt-1">Plan de pagos alineado a entregables, para máxima seguridad.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CASOS REALES */}
            <section id="casos" className="max-w-7xl mx-auto px-4 py-12">
                <h2 className="text-2xl sm:text-3xl font-bold text-center">Casos reales (antes / después)</h2>
                <div className="grid md:grid-cols-3 gap-4 mt-4">
                    <figure className="border rounded-2xl overflow-hidden shadow-sm">
                        <img src="/assets/caso-bar-01-antes.jpg" alt="Bar en Madrid antes de la reforma" className="w-full h-56 object-cover" loading="lazy" />
                        <figcaption className="p-3 text-slate-700">Antes · Madrid</figcaption>
                    </figure>
                    <figure className="border rounded-2xl overflow-hidden shadow-sm">
                        <img src="/assets/caso-bar-01-despues.jpg" alt="Bar en Madrid después de la reforma" className="w-full h-56 object-cover" loading="lazy" />
                        <figcaption className="p-3 text-slate-700">Después · Madrid</figcaption>
                    </figure>
                    <figure className="border rounded-2xl overflow-hidden shadow-sm">
                        <img src="/assets/caso-bar-02-despues.jpg" alt="Bar moderno reformado en Barcelona" className="w-full h-56 object-cover" loading="lazy" />
                        <figcaption className="p-3 text-slate-700">Después · Barcelona</figcaption>
                    </figure>
                </div>
            </section>

            {/* TESTIMONIOS */}
            <section id="opiniones" className="max-w-7xl mx-auto px-4 py-12">
                <h2 className="text-2xl sm:text-3xl font-bold">Testimonios</h2>
                <div className="grid md:grid-cols-3 gap-4 mt-4">
                    {[
                        { t: "Nos entregaron el bar listo para abrir, con licencias y sin sorpresas.", w: "Laura S. – Madrid" },
                        { t: "Obra exprés de barra y cocina, abrimos en 2 semanas.", w: "Dani R. – Barcelona" },
                        { t: "Insonorización y salida de humos resueltas sin parar el negocio.", w: "María F. – Valencia" },
                    ].map((q, i) => (
                        <div key={i} className="border rounded-2xl shadow-sm p-4">
                            <p className="italic">“{q.t}”</p>
                            <div className="font-semibold mt-2">{q.w}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CONTACTO */}
            <section id="contacto" className="max-w-7xl mx-auto px-4 py-14">
                <div className="grid md:grid-cols-2 gap-6">
                    <form onSubmit={onSubmit} className="border rounded-2xl shadow-sm p-5">
                        <h2 className="text-2xl sm:text-3xl font-bold">Cuéntanos tu proyecto</h2>
                        <p className="text-slate-600 mt-1">Formulario corto. Adjunta planos o fotos si los tienes.</p>
                        <div className="grid sm:grid-cols-2 gap-3 mt-4">
                            <div>
                                <label className="text-sm">Nombre</label>
                                <input
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    className="w-full mt-1 px-3 py-2 border rounded-xl"
                                    placeholder="Tu nombre"
                                />
                            </div>
                            <div>
                                <label className="text-sm">Teléfono</label>
                                <input
                                    value={telefono}
                                    onChange={(e) => setTelefono(e.target.value)}
                                    className="w-full mt-1 px-3 py-2 border rounded-xl"
                                    placeholder="+34 6XX XXX XXX"
                                />
                            </div>
                            <div>
                                <label className="text-sm">Ciudad</label>
                                <select
                                    value={ciudad2}
                                    onChange={(e) => setCiudad2(e.target.value)}
                                    className="w-full mt-1 px-3 py-2 border rounded-xl"
                                >
                                    {["Madrid", "Barcelona", "Valencia", "Sevilla", "Málaga", "Zaragoza", "Bilbao", "Alicante"].map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm">Adjuntar planos/fotos</label>
                                <input ref={fileRef} type="file" multiple className="w-full mt-1 px-3 py-2 border rounded-xl" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <label className="text-sm">Mensaje</label>
                            <textarea
                                rows={4}
                                value={mensaje}
                                onChange={(e) => setMensaje(e.target.value)}
                                className="w-full mt-1 px-3 py-2 border rounded-xl"
                                placeholder="Superficie, plazos y principales necesidades"
                            />
                        </div>
                        <div
                            className="h-2 bg-slate-200 rounded-full overflow-hidden mt-3"
                            style={{ display: prog > 0 && prog < 100 ? "block" : "none" }}
                        >
                            <span
                                className="block h-full bg-gradient-to-r from-blue-700 to-sky-400"
                                style={{ width: `${prog}%` }}
                            />
                        </div>
                        <button disabled={sending} className="mt-3 px-4 py-3 rounded-xl bg-blue-700 text-white disabled:opacity-60">
                            {sending ? "Enviando…" : "Enviar solicitud"}
                        </button>
                        <p className="text-xs text-slate-500 mt-2">Al enviar aceptas la Política de privacidad.</p>
                    </form>

                    <div className="border rounded-2xl shadow-sm p-5">
                        <h3 className="font-semibold text-lg">También puedes</h3>
                        <div className="mt-3 flex flex-col gap-2">
                            <a className="px-4 py-3 rounded-xl bg-emerald-600 text-white text-center" href={waHref} target="_blank" rel="noopener">
                                Escribir por WhatsApp
                            </a>
                            <a className="px-4 py-3 rounded-xl bg-sky-600 text-white text-center" href={`tel:+${phone}`}>
                                Llamar ahora
                            </a>
                            <a className="px-2 underline text-blue-700 text-center" href="mailto:hola@robotarq.es">
                                hola@robotarq.es
                            </a>
                        </div>
                        <p className="text-slate-600 mt-2">Atención online, firmas electrónicas y seguimiento por internet.</p>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="bg-slate-50 border-t border-slate-200">
                <div className="max-w-7xl mx-auto px-4 py-8 grid md:grid-cols-3 gap-4 text-slate-700">
                    <div>
                        <div className="flex items-center gap-2" aria-label="Robotarq">
                            <div className="h-9 w-9 rounded-xl bg-blue-800 grid place-items-center text-white font-bold">R</div>
                            <span className="font-bold">Robotarq</span>
                        </div>
                        <p className="mt-2">Reformas de bares en España. Proyecto, licencia y obra.</p>
                    </div>
                    <div>
                        <h4 className="font-semibold">Servicios</h4>
                        <ul className="space-y-1 mt-1">
                            <li><a href="/reformas-bares/" className="hover:underline">Reformas de Bares</a></li>
                            <li><a href="/reformas-locales/" className="hover:underline">Reformas de Locales</a></li>
                            <li><a href="/reformas-oficinas/" className="hover:underline">Reformas de Oficinas</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold">Ciudades</h4>
                        <ul className="space-y-1 mt-1">
                            {["madrid", "barcelona", "valencia", "sevilla", "malaga", "zaragoza", "bilbao", "alicante"].map((c) => (
                                <li key={c}><a href={`/reformas-bares/${c}`} className="hover:underline">{c[0].toUpperCase() + c.slice(1)}</a></li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="text-center text-slate-500 text-sm pb-6">
                    © {year} Robotarq · Tel: <a className="text-blue-700" href={`tel:+${phone}`}>+{phone}</a> · Email: <a className="text-blue-700" href="mailto:hola@robotarq.es">hola@robotarq.es</a>
                </div>
            </footer>

            {/* FABs */}
            <div className="fixed right-4 bottom-4 flex flex-col gap-2">
                <a href={waHref} target="_blank" rel="noopener" className="px-4 py-3 rounded-full bg-[#25D366] text-white shadow">WhatsApp</a>
                <a href={`tel:+${phone}`} className="px-4 py-3 rounded-full bg-sky-600 text-white shadow">Llamar</a>
            </div>
        </div>
    );
}
