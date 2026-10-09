import ExcelJS from 'exceljs';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { round } from './estimate.mjs';
export function documentData(body){
 const {rows,extra=[],meta={}}=body;
 if(!Array.isArray(rows)||!rows.length||rows.length>200||!Array.isArray(extra)||extra.length>20)throw new Error('Partidas inválidas');
 const clean=rows.map(r=>{if(!r||!Number.isFinite(Number(r.qty))||Number(r.qty)<=0||Number(r.qty)>10000||!Number.isFinite(Number(r.pu))||Number(r.pu)<0||Number(r.pu)>1000000)throw new Error('Medición inválida');return {cap:String(r.cap||'').slice(0,40),capName:String(r.capName||'').slice(0,100),code:String(r.code||'').slice(0,40),desc:String(r.desc||'').slice(0,300),ud:String(r.ud||'').slice(0,10),qty:Number(r.qty),pu:Number(r.pu),amount:round(Number(r.qty)*Number(r.pu))};});
 const subtotal=round(clean.reduce((s,r)=>s+r.amount,0));
 const extras=extra.map(x=>{if(!x||!Number.isFinite(Number(x.imp))||Number(x.imp)<0||Number(x.imp)>1000000||!Number.isFinite(Number(x.base))||Number(x.base)<0)throw new Error('Extras inválidos');return {code:String(x.code||'').slice(0,40),desc:String(x.desc||'').slice(0,300),base:Number(x.base),imp:round(x.imp)};});
 const total=round(subtotal+extras.reduce((s,x)=>s+x.imp,0));if(body.total!==undefined&&(!Number.isFinite(Number(body.total))||Math.abs(total-Number(body.total))>.01))throw new Error('Total incoherente');
 return {meta:{title:String(meta.title||'Estimación orientativa robotARQ').slice(0,150),prompt:String(meta.prompt||'').slice(0,4000)},rows:clean,extra:extras,subtotal,total};
}
export async function xlsxBuffer(data){
 const wb=new ExcelJS.Workbook();wb.creator='robotARQ';
 const summary=wb.addWorksheet('Resumen');summary.addRows([['Estimación orientativa robotARQ'],['Subtotal sin IVA',data.subtotal],['Extras',round(data.total-data.subtotal)],['Total sin IVA',data.total],['Alcance',data.meta.prompt],['Nota','Precios de referencia; requiere revisión técnica. No es un presupuesto contractual.'],['Exclusiones','IVA, licencias, proyecto, residuos y partidas no descritas.']]);
 const ws=wb.addWorksheet('Partidas');ws.addRow(['Capítulo','Nombre','Código','Descripción','Ud','Cantidad','Precio unitario','Importe']);for(const r of data.rows)ws.addRow([r.cap,r.capName,r.code,r.desc,r.ud,r.qty,r.pu,r.amount]);
 const ex=wb.addWorksheet('Extras');ex.addRow(['Código','Descripción','Base','Importe']);for(const x of data.extra)ex.addRow([x.code,x.desc,x.base,x.imp]);
 for(const sheet of wb.worksheets){sheet.getRow(1).font={bold:true};sheet.views=[{state:'frozen',ySplit:1}];sheet.columns.forEach((c,i)=>{c.width=i===3?65:24;});sheet.eachRow(row=>row.eachCell(cell=>{cell.alignment={vertical:'top',wrapText:true};if(typeof cell.value==='number')cell.numFmt='#,##0.00';}));}
 return wb.xlsx.writeBuffer();
}
export async function pdfBuffer(data){
 const doc=await PDFDocument.create();const font=await doc.embedFont(StandardFonts.Helvetica);let page,y;
 function add(){page=doc.addPage([595,842]);y=795;}
 add();
 function safe(s){return String(s).replace(/m²/g,'m2').replace(/[^\x20-\x7E\xA0-\xFF€]/g,'?');}
 function line(s,size=10){const words=safe(s).split(/\s+/).flatMap(word=>{const chunks=[];let chunk='';for(const ch of word){if(font.widthOfTextAtSize(chunk+ch,size)>505){chunks.push(chunk);chunk=ch;}else chunk+=ch;}chunks.push(chunk);return chunks;});let out='';for(const word of words){if(font.widthOfTextAtSize(out+' '+word,size)>505&&out){draw(out,size);out=word;}else out+=(out?' ':'')+word;}draw(out,size);}
 function draw(s,size){if(y<55)add();page.drawText(s,{x:40,y,size,font,color:rgb(.08,.14,.18)});y-=size+7;}
 line(data.meta.title,16);line('Estimación orientativa. Requiere revisión técnica.');line(data.meta.prompt);y-=8;
 let chapter='';for(const r of data.rows){if(chapter!==r.cap){chapter=r.cap;line(r.cap+' - '+r.capName,12);}line(r.code+' | '+r.desc);line(`${r.qty} ${r.ud} x ${r.pu.toFixed(2)} EUR = ${r.amount.toFixed(2)} EUR`);}
 line('Extras',12);for(const x of data.extra)line(`${x.code} ${x.desc}: base ${x.base.toFixed(2)} EUR / importe ${x.imp.toFixed(2)} EUR`);
 line(`Subtotal: ${data.subtotal.toFixed(2)} EUR`);line(`TOTAL SIN IVA: ${data.total.toFixed(2)} EUR`,14);
 line('No incluye IVA, permisos, proyecto, retirada de residuos ni partidas no descritas. Precios de referencia no validados por ciudad.');return doc.save();
}
