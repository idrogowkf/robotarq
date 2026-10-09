"use client";
import { useState } from 'react';
import { track } from '@vercel/analytics';
export default function ContactForm({budget,initialMessage=''}){
 const [busy,setBusy]=useState(false),[status,setStatus]=useState(''),[ok,setOk]=useState(false);
 async function submit(e){e.preventDefault();const form=e.currentTarget;const f=new FormData(form);setBusy(true);setStatus('');track('contact_start');
  try{const payload=Object.fromEntries(f);payload.privacy=f.get('privacy')==='on';payload.budget=budget||null;
   const r=await fetch('/api/notify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});const d=await r.json();if(!r.ok||!d.ok)throw new Error(d.error||'No se pudo enviar.');setOk(true);setStatus('Solicitud registrada. Referencia: '+d.ref);track('contact_accepted');
  }catch(e){setStatus(e.message||'Error de conexión.');track('contact_error');}finally{setBusy(false);}}
 if(ok)return <p role="status" className="mt-4 bg-green-50 text-green-800 p-4 rounded">{status}</p>;
 return <form onSubmit={submit} className="mt-4 space-y-4">
  <div className="grid sm:grid-cols-2 gap-4">{[['name','Nombre','text',120,true],['email','Correo electrónico','email',254,true],['phone','Teléfono','tel',40,true],['empresa','Empresa (opcional)','text',150,false],['nif','NIF (opcional)','text',30,false]].map(([name,label,type,max,required])=><label key={name}>{label}<input name={name} type={type} maxLength={max} required={required} autoComplete={{name:'name',email:'email',phone:'tel',empresa:'organization'}[name]||'off'} className="block border rounded p-3 mt-1 w-full" /></label>)}</div>
  <label className="block">Describe tu proyecto<textarea name="message" required minLength={5} maxLength={4000} defaultValue={initialMessage} rows={4} className="block w-full border rounded p-3 mt-1" /></label>
  <div className="hidden" aria-hidden="true"><label>Sitio web<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
  <label className="flex gap-2 items-start text-sm"><input type="checkbox" name="privacy" required className="mt-1" /><span>He leído la <a className="underline" href="/privacidad" target="_blank" rel="noreferrer">información de privacidad</a>. Envío estos datos para recibir respuesta a mi solicitud.</span></label>
  <p className="text-sm text-gray-600">Tu solicitud se remite al equipo de RobotARQ. No se envían copias automáticas ni mensajes comerciales a la dirección indicada.</p>
  <button disabled={busy} className="bg-black text-white px-5 py-3 rounded">{busy?'Enviando…':'Enviar solicitud'}</button>
  {status&&<p role="alert" className="text-red-700">{status}</p>}
  <p className="text-sm">Contacto directo: <a href="mailto:hola@robotarq.com" className="underline">hola@robotarq.com</a> · <a href="tel:+34624473123" className="underline">+34 624 473 123</a></p>
 </form>;
}
