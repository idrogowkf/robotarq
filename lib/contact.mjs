import { documentData } from './documents.mjs';
export function contactData(body){
 if(body.website)return null;
 if(body.privacy!==true)throw new Error('Lee la información de privacidad.');
 const data={};for(const [key,max] of Object.entries({name:120,email:254,phone:40,empresa:150,nif:30,message:4000})){
  const raw=body[key]??(key==='message'?body.meta?.prompt:'')??'';
  if(typeof raw!=='string'||raw.length>max)throw new Error('Campo inválido');data[key]=raw.trim();
 }
 if(data.name.length<2||!/^([^\s@]+)@([^\s@]+)\.([^\s@]+)$/.test(data.email)||!/[0-9]{6}/.test(data.phone.replace(/[^0-9]/g,''))||data.message.length<5)throw new Error('Datos incompletos');
 return data;
}
export function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
export function budgetEmailDetail(b){
 const rows=Object.values(b?.chapters||{}).flatMap(c=>(c.items||[]).map(i=>({cap:c.code,capName:c.name,code:i.code,desc:i.desc,ud:i.unit,qty:i.qty,pu:i.price})));
 const d=documentData({rows,extra:(b?.extras||[]).map(x=>({code:x.code,desc:x.desc,base:x.price,imp:x.amount})),total:b?.total});
 return '\nEstimación orientativa (sin IVA):\n'+d.rows.map(x=>`${x.code} ${x.desc}: ${x.qty} ${x.ud} x ${x.pu} = ${x.amount} EUR`).join('\n')+'\n'+d.extra.map(x=>`${x.desc}: ${x.imp} EUR`).join('\n')+`\nTotal sin IVA: ${d.total} EUR`;
}
export async function deliverLead(resend,mail){const result=await resend.emails.send(mail);if(result.error||!result.data?.id)throw new Error('Proveedor no aceptó el mensaje');return result.data.id;}
