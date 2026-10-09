"use client";
import { useState } from 'react';
import { track } from '@vercel/analytics';
import BudgetPreview from '@/components/BudgetPreview';
import CaseCaptureForm from '@/components/CaseCaptureForm';

export default function EstimadorClient({initTipo,initPrompt,initCiudad}){
 const [tipo,setTipo]=useState(initTipo||'vivienda'),[ciudad,setCiudad]=useState(initCiudad||''),[prompt,setPrompt]=useState(initPrompt||'');
 const [result,setResult]=useState(null),[questions,setQuestions]=useState([]),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 async function generate(event){event.preventDefault();setBusy(true);setResult(null);setError('');setQuestions([]);track('estimate_start');
  try{const response=await fetch('/api/estimate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({tipo,ciudad,prompt})}),data=await response.json();if(!response.ok||!data.ok){setQuestions(data.questions||[]);setError(data.error||'No se pudo interpretar el proyecto.');track(response.status===422?'estimate_needs_details':'estimate_error');}else{setResult(data);track('estimate_result');setTimeout(()=>document.getElementById('resultado-presupuesto')?.scrollIntoView({behavior:'smooth'}),50);}}
  catch{setError('No se pudo conectar. Tu descripción se conserva para volver a intentarlo.');}finally{setBusy(false);}
 }
 return <div className="mt-8 space-y-8">
  <div className="rounded-2xl border border-sky-200 bg-sky-50 p-5 text-sm text-slate-700"><strong className="block text-slate-950 mb-1">Descríbelo con tus propias palabras</strong>La IA interpreta frases normales, unidades escritas, errores habituales y proyectos singulares. No necesitas usar códigos ni abreviaturas. Las cifras son preliminares y se recalculan en el servidor.</div>
  <form onSubmit={generate} className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-sm space-y-5">
   <div className="grid sm:grid-cols-2 gap-4"><label className="font-medium">Tipo orientativo<select aria-label="Tipo de proyecto" className="block w-full border rounded-xl p-3 mt-2 bg-white" value={tipo} onChange={event=>setTipo(event.target.value)}>{[['vivienda','Vivienda'],['local','Local comercial'],['hosteleria','Bar o restaurante'],['oficina','Oficina'],['otro','Otro proyecto']].map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label><label className="font-medium">Ciudad o zona<input className="block w-full border rounded-xl p-3 mt-2" value={ciudad} maxLength={120} onChange={event=>setCiudad(event.target.value)} placeholder="Ej.: Madrid" /></label></div>
   <label className="block font-medium">Cuéntanos qué quieres construir o reformar<textarea required maxLength={8000} rows={8} className="block w-full border rounded-xl p-3 mt-2 font-normal" value={prompt} onChange={event=>{setPrompt(event.target.value);setResult(null);}} placeholder="Ej.: Necesito una vivienda unifamiliar aislada tipo chalet de 60 metros cuadrados, una planta, calidades medias y parcela llana..." /><span className="block text-xs text-slate-500 mt-1 text-right">{prompt.length}/8.000</span></label>
   <button disabled={busy} className="rounded-xl bg-slate-950 text-white px-6 py-3 font-semibold disabled:opacity-60">{busy?'Interpretando el proyecto y comprobando partidas…':'Generar presupuesto profesional'}</button>
  </form>
  {error&&<div role="alert" className="rounded-xl border border-red-200 bg-red-50 text-red-900 p-5"><strong>{error}</strong>{questions.length>0&&<ul className="list-disc pl-5 mt-3 space-y-1">{questions.map(question=><li key={question}>{question}</li>)}</ul>}</div>}
  {result&&<><BudgetPreview result={result}/><CaseCaptureForm estimate={result}/></>}
 </div>;
}
