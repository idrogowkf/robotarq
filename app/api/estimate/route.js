import { NextResponse } from 'next/server';
import { interpretProject } from '@/lib/ai-estimator.mjs';
import { gate, readBody, invalid, event } from '@/lib/api.mjs';
import { sealEstimate } from '@/lib/cases.mjs';
export async function POST(req){
 const blocked=gate(req);if(blocked)return blocked;
 try{const body=await readBody(req),testing=process.env.VERCEL_ENV!=='production'&&req.headers.get('x-robotarq-test')==='1';const generate=testing?async input=>{const area=Number(input.prompt.match(/\d+(?:[.,]\d+)?/)?.[0]?.replace(',','.'))||60;if(input.prompt.length<20)return {project:{title:'Proyecto por definir'},questions:['¿Qué superficie y trabajos debe incluir el proyecto?']};return {project:{title:'Proyecto interpretado',summary:input.prompt,projectType:body.tipo||'proyecto',location:body.ciudad||'',areaM2:area,quality:'media'},questions:[],assumptions:['Condiciones normales de ejecución'],exclusions:['Licencias y honorarios técnicos'],confidence:'media',chapters:[{code:'CH-OB',name:'Obra principal',items:[{code:'OB01',desc:'Ejecución principal del proyecto',unit:'m2',qty:area,price:900}]}]};}:undefined;const data=await interpretProject(body,generate?{generate}:undefined);if(data.ok)data.estimateToken=sealEstimate(data);await event(data.ok?'estimate_success':'estimate_needs_details',{scope:data.meta?.scope||'ai'},req);return NextResponse.json(data,{status:data.status|| (data.ok?200:422)});}catch{return invalid();}
}
