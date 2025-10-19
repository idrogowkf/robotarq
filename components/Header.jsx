// components/Header.jsx
"use client";

const HOME = "/";

export default function Header() {
  const goHome = (e) => {
    // fuerza navegación absoluta al home (evita rarezas del router)
    e.preventDefault();
    window.location.assign(HOME);
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur border-b">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo → SIEMPRE al home "/" */}
        <a
          href={HOME}
          onClick={goHome}
          aria-label="robotARQ — inicio"
          className="font-extrabold text-xl tracking-tight"
        >
          robot<span className="font-extrabold">ARQ</span>
        </a>

        <nav className="flex items-center gap-5 text-sm">
          <a href="/estimador" className="hover:underline">Generar presupuesto</a>
          <a href="/contacto" className="hover:underline">Contacto</a>
        </nav>
      </div>
    </header>
  );
}
