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
export async function deliverLead(resend,mail){const result=await resend.emails.send(mail);if(result.error||!result.data?.id)throw new Error('Proveedor no aceptó el mensaje');return result.data.id;}
