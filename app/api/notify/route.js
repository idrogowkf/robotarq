import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { randomUUID } from 'node:crypto';
import { gate, readBody, invalid, event } from '@/lib/api.mjs';
import { contactData, escapeHTML, deliverLead } from '@/lib/contact.mjs';
import { documentData } from '@/lib/documents.mjs';
export const runtime='nodejs';
export async function POST(req){
 const blocked=gate(req,5);if(blocked)return blocked;
 let body,data;try{body=await readBody(req);data=contactData(body);}catch{return invalid();}
 if(!data)return NextResponse.json({ok:true});
 if(!process.env.RESEND_API_KEY)return NextResponse.json({ok:false,error:'El envío no está disponible. Usa el contacto directo.'},{status:503});
 const ref=randomUUID();
 const owner=(process.env.OWNER_EMAIL||process.env.RESEND_OWNER||'hola@robotarq.com').replace(/^"+|"+$/g,'').trim();
 const from=(process.env.RESEND_FROM||'robotARQ <hola@robotarq.com>').replace(/^"+|"+$/g,'');
 let detail='';
 if(body.budget){try{
  const b=body.budget;const rows=Object.values(b.chapters||{}).flatMap(c=>(c.items||[]).map(i=>({cap:c.code,capName:c.name,code:i.code,desc:i.desc,ud:i.unit,qty:i.qty,pu:i.price})));
  const d=documentData({rows,extra:(b.extras||[]).map(x=>({code:x.code,desc:x.desc,base:x.price,imp:x.amount})),total:b.total});
  detail='\nEstimación orientativa (sin IVA):\n'+d.rows.map(x=>`${x.code} ${x.desc}: ${x.qty} ${x.ud} x ${x.pu} = ${x.amount} EUR`).join('\n')+'\n'+d.extra.map(x=>`${x.desc}: ${x.imp} EUR`).join('\n')+`\nTotal sin IVA: ${d.total} EUR`;
 }catch{return invalid();}}
 const text=`Solicitud ${ref}\nNombre: ${data.name}\nEmail: ${data.email}\nTeléfono: ${data.phone}\nEmpresa: ${data.empresa}\nNIF: ${data.nif}\nMensaje: ${data.message}${detail}`;
 try{
  const id=await deliverLead(new Resend(process.env.RESEND_API_KEY),{from,to:[owner],replyTo:data.email,subject:'robotARQ — Nueva solicitud '+ref,text,html:'<pre style="white-space:pre-wrap">'+escapeHTML(text)+'</pre>'});
  await event('lead_accepted',{ref,providerId:id},req);return NextResponse.json({ok:true,ref});
 }catch{await event('lead_error',{ref},req);return NextResponse.json({ok:false,error:'No se pudo registrar la solicitud. Usa el contacto directo o inténtalo más tarde.'},{status:502});}
}
