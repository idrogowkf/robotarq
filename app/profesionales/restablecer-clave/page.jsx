import {Suspense} from 'react';
import ProfessionalPasswordResetForm from '@/components/ProfessionalPasswordResetForm';
export const metadata={title:'Crear nueva contraseña profesional',robots:{index:false,follow:false}};
export default function Page(){return <main className="mx-auto max-w-md px-4 pb-16 pt-24"><p className="text-xs font-bold uppercase tracking-widest text-sky-700">Cuenta profesional</p><h1 className="mt-2 text-4xl font-extrabold">Crear contraseña nueva</h1><p className="mt-3 text-slate-600">Utiliza una contraseña segura que no emplees en otros servicios.</p><Suspense><ProfessionalPasswordResetForm/></Suspense></main>}
