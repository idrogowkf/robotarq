"use client";
import { useState } from 'react';
import { track } from '@vercel/analytics';
import ContactForm from '@/components/ContactForm';
const money=n=>new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR'}).format(n);
export default function EstimadorClient({initTipo,initPrompt,initCiudad}){
 const [tipo,setTipo]=useState(initTipo||'local'),[ciudad,setCiudad]=useState(initCiudad||''),[prompt,setPrompt]=useState(initPrompt||'');
 const [result,setResult]=useState(null),[questions,setQuestions]=useState([]),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const [measurements,setMeasurements]=useState({});
 async function generate(e){e.preventDefault();setBusy(true);setResult(null);setError('');setQuestions([]);track('estimate_start');
  try{const r=await fetch('/api/estimate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({tipo,ciudad,prompt,obra:'reforma',measurements})});const d=await r.json();
   if(!r.ok||!d.ok){setQuestions(d.questions||[]);setError(d.error||'No se pudo calcular.');track(r.status===422?'estimate_needs_details':'estimate_error');}else{setResult(d);track('estimate_result');}
  }catch{setError('No se pudo conectar. Inténtalo de nuevo.');track('estimate_error');}finally{setBusy(false);}
 }
 async function download(fmt){setBusy(true);setError('');try{const b=result.budget;const rows=Object.values(b.chapters).flatMap(c=>c.items.map(i=>({cap:c.code,capName:c.name,code:i.code,desc:i.desc,ud:i.unit,qty:i.qty,pu:i.price})));
  const r=await fetch('/api/export/'+fmt,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({meta:{title:'Estimación orientativa robotARQ',prompt},rows,extra:b.extras.map(x=>({code:x.code,desc:x.desc,base:x.price,imp:x.amount})),total:b.total})});if(!r.ok)throw new Error();const url=URL.createObjectURL(await r.blob());const a=document.createElement('a');a.href=url;a.download='Estimacion_robotARQ.'+fmt;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);track('estimate_download',{format:fmt});
  }catch{setError('No se pudo descargar el documento.');track('export_error',{format:fmt});}finally{setBusy(false);}}
 return <div className="mt-8 space-y-6">
  <p className="rounded border border-amber-200 bg-amber-50 p-4 text-sm">Calculamos partidas concretas y estimaciones preliminares de proyectos completos. En vivienda prefabricada, reforma integral u obra nueva, el resultado requiere planos, mediciones, estudio del terreno y revisión técnica antes de contratar. Para proyectos completos, la ciudad y la descripción pueden procesarse mediante OpenAI; no incluyas datos personales. Consulta la <a className="underline" href="/privacidad">información de privacidad</a>.</p>
  <form onSubmit={generate} className="space-y-4">
   <div className="grid sm:grid-cols-2 gap-4"><label>Tipo de reforma<select aria-label="Tipo de reforma" className="block w-full border rounded p-3 mt-1" value={tipo} onChange={e=>setTipo(e.target.value)}>{[['local','Local'],['hosteleria','Bar o restaurante'],['vivienda','Vivienda'],['oficina','Oficina']].map(([v,t])=><option key={v} value={v}>{t}</option>)}</select></label>
   <label>Ciudad<input className="block w-full border rounded p-3 mt-1" value={ciudad} maxLength={100} onChange={e=>setCiudad(e.target.value)} placeholder="Ej.: Madrid" /></label></div>
   <label className="block">Trabajos y mediciones<textarea required maxLength={4000} rows={5} className="block w-full border rounded p-3 mt-1" value={prompt} onChange={e=>{setPrompt(e.target.value);setResult(null);setMeasurements({});}} placeholder="Ej.: colocar 60 m² de cerámica y cambiar un cuadro eléctrico" /></label>
   <details><summary className="cursor-pointer">Aportar cantidades por partida</summary><p className="text-sm text-gray-600 mt-2">Estas cantidades se aplican solo a las partidas que pidas en la descripción. No uses la superficie del local como superficie de pintura.</p><div className="grid sm:grid-cols-2 gap-3 mt-3">{[['tiles','Cerámica (m²)'],['paint','Pintura (m²)'],['lights','Puntos de luz (ud)'],['sockets','Tomas de corriente (ud)'],['panel','Cuadros eléctricos (ud)']].map(([k,t])=><label key={k}>{t}<input type="number" min="0.01" max="10000" step={['tiles','paint'].includes(k)?'0.01':'1'} value={measurements[k]||''} onChange={e=>{setMeasurements(s=>({...s,[k]:e.target.value}));setResult(null);}} className="block w-full border rounded p-2" /></label>)}</div></details>
   <button disabled={busy} className="bg-black text-white rounded px-5 py-3">{busy?'Procesando…':'Calcular estimación'}</button>
  </form>
  {error&&<div role="alert" className="bg-red-50 text-red-800 p-4 rounded">{error}{questions.length>0&&<ul className="list-disc pl-5 mt-2">{questions.map((q,i)=><li key={i}>{q}</li>)}</ul>}<a className="underline" href="/contacto">Solicitar revisión técnica</a></div>}
  {result&&<section aria-live="polite" className="space-y-4"><h2 className="text-2xl font-bold">Estimación orientativa</h2><ul className="list-disc pl-5 text-sm">{result.warnings.map(w=><li key={w}>{w}</li>)}</ul>
   {Object.values(result.budget.chapters).map(c=><div key={c.code}><h3 className="font-semibold mt-4">{c.name}</h3><div className="overflow-x-auto"><table className="min-w-[620px] w-full text-sm"><thead><tr>{['Código','Partida','Ud','Cantidad','Precio','Importe'].map(t=><th key={t} scope="col" className="text-left border-b p-2">{t}</th>)}</tr></thead><tbody>{c.items.map(i=><tr key={i.code}>{[i.code,i.desc,i.unit,i.qty,money(i.price),money(i.amount)].map((v,n)=><td key={n} className="border-b p-2">{v}</td>)}</tr>)}</tbody></table></div></div>)}
   <p>Subtotal: {money(result.budget.subtotal)}</p>{result.budget.extras.map(x=><p key={x.code} className="text-sm">{x.desc}: {money(x.amount)}</p>)}<p className="text-2xl font-bold">Total sin IVA: {money(result.budget.total)}</p>
   <div className="flex flex-wrap gap-3">{['pdf','xlsx'].map(f=><button disabled={busy} className="border rounded px-4 py-2" key={f} onClick={()=>download(f)}>Descargar {f.toUpperCase()}</button>)}</div>
  </section>}
  {result?<section className="border-t pt-6"><h2 className="text-xl font-semibold">Enviar este presupuesto para revisión</h2><p className="text-sm text-gray-600 mt-2">El correo incluirá todas las partidas y el total mostrado arriba.</p><ContactForm budget={result.budget} initialMessage={prompt} submitLabel="Enviar presupuesto para revisión" /></section>:<section className="border-t pt-6"><h2 className="text-xl font-semibold">Revisión técnica</h2><p className="mt-2">Primero genera una estimación para enviarla junto con tu solicitud. Si el proyecto necesita más datos, usa el <a className="underline" href="/contacto">formulario de revisión sin presupuesto</a>.</p></section>}
 </div>;
}
