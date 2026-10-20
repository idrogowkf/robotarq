"use client";
import {useRouter} from 'next/navigation';
import {useState} from 'react';

export default function ProfessionalLogoutButton(){const router=useRouter(),[busy,setBusy]=useState(false);async function logout(){setBusy(true);try{await fetch('/api/professionals/logout',{method:'POST'});router.push('/profesionales/acceso');router.refresh()}finally{setBusy(false)}}return <button type="button" onClick={logout} disabled={busy} className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 font-bold disabled:opacity-60">{busy?'Saliendo…':'Cerrar sesión'}</button>}
