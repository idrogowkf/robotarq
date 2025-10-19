// components/Header.jsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

const NAV = [
    { href: "/estimador", label: "Generar presupuesto" },
    { href: "/contacto", label: "Contacto" },
];

export default function Header() {
    const pathname = usePathname();
    const isActive = useMemo(() => {
        return (href) =>
            href === "/"
                ? pathname === "/"
                : pathname === href || pathname?.startsWith(href + "/");
    }, [pathname]);

    return (
        <header className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur border-b border-neutral-200">
            <div className="mx-auto max-w-[1140px] px-4 h-14 flex items-center justify-between">
                {/* Logo → Home */}
                <Link href="/" prefetch aria-label="Inicio" className="font-extrabold tracking-tight text-xl">
                    robot<span className="font-extrabold">ARQ</span>
                </Link>

                <nav className="flex items-center gap-2">
                    {NAV.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            prefetch
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition
                ${isActive(item.href)
                                    ? "bg-black text-white"
                                    : "text-neutral-800 hover:bg-neutral-100"
                                }`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </div>
        </header>
    );
}
