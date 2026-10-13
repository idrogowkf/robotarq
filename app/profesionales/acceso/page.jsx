import { Suspense } from 'react';import ProfessionalLoginForm from '@/components/ProfessionalLoginForm';
export const metadata={title:'Acceso profesional',robots:{index:false,follow:false}};
export default function Page(){return <main className="mx-auto max-w-md px-4 pt-24 pb-16"><h1 className="text-4xl font-extrabold">Acceso profesional</h1><p className="text-slate-600 mt-3">Gestiona tu ficha, especialidades y zonas de trabajo.</p><Suspense><ProfessionalLoginForm/></Suspense></main>}
