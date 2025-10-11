"use client";
import Link from "next/link";

export default function Header() {
    return (
        <header className="w-full bg-white shadow-sm fixed top-0 z-50">
            <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
                <Link href="/" className="text-xl font-bold tracking-tight text-gray-900">
                    robot<span className="text-blue-600">ARQ</span>
                </Link>
                <div className="space-x-6 text-sm font-medium">
                    <Link href="/estimador" className="hover:text-blue-600">
                        Generar Presupuesto
                    </Link>
                    <Link href="/contacto" className="hover:text-blue-600">
                        Contacto
                    </Link>
                </div>
            </nav>
        </header>
    );
}
