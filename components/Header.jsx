// components/Header.jsx
import Link from 'next/link';

export default function Header() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur border-b">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo → SIEMPRE al home "/" */}
        <Link
          href="/"
          aria-label="robotARQ — inicio"
          className="font-extrabold text-xl tracking-tight"
        >
          robot<span className="font-extrabold">ARQ</span>
        </Link>

        <nav aria-label="Navegación principal" className="flex items-center gap-2 sm:gap-4">
          <Link href="/estimador" className="text-xs font-bold hover:text-sky-700 sm:text-sm">Generar presupuesto</Link>
          <Link href="/profesionales" className="hidden text-sm font-semibold text-slate-600 hover:text-sky-700 lg:inline">Buscar profesionales</Link>
          <Link href="/acceso" className="hidden text-sm font-semibold text-slate-600 hover:text-sky-700 xl:inline">Mis presupuestos</Link>
          <Link href="/profesionales/alta" className="rounded-xl border-2 border-sky-700 bg-sky-50 px-3 py-2 text-xs font-extrabold text-sky-900 shadow-sm hover:bg-sky-100 sm:px-4 sm:text-sm"><span className="hidden lg:inline">¿Eres profesional? </span>Alta profesional</Link>
        </nav>
      </div>
    </header>
  );
}
