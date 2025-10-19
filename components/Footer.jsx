// components/Footer.jsx
import Link from "next/link";

export default function Footer() {
    return (
        <footer className="border-t border-neutral-200 mt-12">
            <div className="mx-auto max-w-[1140px] px-4 py-8 grid sm:grid-cols-3 gap-6 text-sm">
                <div>
                    <div className="font-bold">robotARQ</div>
                    <p className="text-neutral-600 mt-2">
                        Presupuestos técnicos con IA. Proyecto, licencias y obra.
                    </p>
                </div>

                <div>
                    <div className="font-semibold">Enlaces</div>
                    <ul className="mt-2 space-y-1">
                        <li><Link href="/" className="hover:underline">Inicio</Link></li>
                        <li><Link href="/estimador" className="hover:underline">Generar presupuesto</Link></li>
                        <li><Link href="/contacto" className="hover:underline">Contacto</Link></li>
                    </ul>
                </div>

                <div>
                    <div className="font-semibold">Contacto</div>
                    <ul className="mt-2 space-y-1">
                        <li><a href="mailto:hola@robotarq.com" className="hover:underline">hola@robotarq.com</a></li>
                        <li><a href="https://wa.me/34624473123" className="hover:underline" target="_blank" rel="noreferrer">WhatsApp: +34 624473123</a></li>
                    </ul>
                </div>
            </div>
            <div className="text-center text-xs text-neutral-500 pb-6">© {new Date().getFullYear()} robotARQ</div>
        </footer>
    );
}
