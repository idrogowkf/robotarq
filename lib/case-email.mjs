const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const absolute=(siteUrl,path)=>new URL(path,siteUrl).toString();
function accepted(result){if(result?.error||!result?.data?.id)throw new Error('El servicio de correo rechazó la entrega');return result;}

export async function deliverCaseEmails(resend,{record,downloads,from,owner,siteUrl}){
 const [pdfPath,xlsxPath]=downloads,pdf=absolute(siteUrl,pdfPath),xlsx=absolute(siteUrl,xlsxPath),admin=absolute(siteUrl,`/administracion/${record.id}`);
 const summary=`Expediente ${record.id}\nCliente: ${record.client.name}\nEmail: ${record.client.email}\nTeléfono: ${record.client.phone}\nModalidad: ${record.intent}\nProyecto: ${record.estimate.project.title}\nTotal probable sin IVA: ${record.estimate.budget.total.toFixed(2)} EUR`;
 accepted(await resend.emails.send({from,to:[owner],replyTo:record.client.email,subject:`robotARQ — ${record.intent==='assistance'?'Solicitud técnica':'Presupuesto descargado'} ${record.id}`,text:`${summary}\nAdministración: ${admin}\nPDF: ${pdf}\nExcel: ${xlsx}`,html:`<pre style="white-space:pre-wrap">${esc(summary)}</pre><p><a href="${esc(admin)}">Abrir expediente</a> · <a href="${esc(pdf)}">PDF</a> · <a href="${esc(xlsx)}">Excel</a></p>`}));
 accepted(await resend.emails.send({from,to:[record.client.email],replyTo:owner,subject:`robotARQ — Tu presupuesto ${record.id}`,text:`Hemos registrado tu presupuesto.\nReferencia: ${record.id}\nDescargar PDF: ${pdf}\nDescargar Excel: ${xlsx}`,html:`<p>Hemos registrado tu presupuesto.</p><p><strong>Referencia:</strong> ${esc(record.id)}</p><p><a href="${esc(pdf)}">Descargar PDF</a> · <a href="${esc(xlsx)}">Descargar Excel</a></p>`}));
 return {ok:true};
}
