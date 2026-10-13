import Link from 'next/link';
export default function Breadcrumbs({label}){return <nav aria-label="Ruta de navegación" className="text-sm text-slate-600"><Link href="/" className="underline">Inicio</Link><span aria-hidden="true"> / </span><span>{label}</span></nav>;}
