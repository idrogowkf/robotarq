import AdminLogin from '@/components/AdminLogin';
export const metadata={title:'Acceso administrativo | robotARQ',robots:{index:false,follow:false}};
export default function Page(){return <main className="mx-auto max-w-md px-4 py-20"><p className="text-sm uppercase tracking-wider text-sky-700 font-bold">robotARQ</p><h1 className="text-3xl font-bold mt-2">Centro administrativo</h1><p className="text-slate-600 mt-3">Acceso restringido a la gestión de expedientes.</p><AdminLogin/></main>}
