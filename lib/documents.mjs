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

const euro=n=>`${Number(n||0).toLocaleString('es-ES',{minimumFractionDigits:2,maximumFractionDigits:2})} EUR`;
const flatRows=record=>Object.values(record.estimate.budget.chapters).flatMap(chapter=>chapter.items.map(item=>({chapter:chapter.code,chapterName:chapter.name,...item})));

export async function professionalWorkbook(record){
 const {estimate,client}=record,budget=estimate.budget,wb=new ExcelJS.Workbook();wb.creator='robotARQ';wb.created=new Date(record.createdAt);
 const summary=wb.addWorksheet('Resumen');summary.addRows([
  ['robotARQ — Presupuesto preliminar profesional'],['Expediente',record.id],['Fecha',record.createdAt.slice(0,10)],['Proyecto',estimate.project.title],['Ubicación',estimate.project.location],['Superficie m²',estimate.project.areaM2||''],['Calidad',estimate.project.quality],['Confianza',estimate.confidence],['Escenario económico',estimate.market[0].amount],['Escenario probable',estimate.market[1].amount],['Escenario superior',estimate.market[2].amount],['Total probable sin IVA',budget.total],['Descripción',estimate.project.summary],['Estado',record.status]
 ]);
 const chapters=wb.addWorksheet('Capítulos');chapters.addRow(['Código','Capítulo','Importe']);for(const chapter of Object.values(budget.chapters))chapters.addRow([chapter.code,chapter.name,chapter.total]);chapters.addRow(['','Costes directos',budget.subtotal]);for(const extra of budget.extras)chapters.addRow([extra.code,extra.desc,extra.amount]);chapters.addRow(['','TOTAL SIN IVA',budget.total]);
 const measurements=wb.addWorksheet('Mediciones');measurements.addRow(['Capítulo','Nombre','Código','Partida','Ud','Cantidad','Precio unitario','Importe']);for(const row of flatRows(record))measurements.addRow([row.chapter,row.chapterName,row.code,row.desc,row.unit,row.qty,row.price,row.amount]);
 const assumptions=wb.addWorksheet('Hipótesis');assumptions.addRow(['Tipo','Detalle']);for(const value of estimate.assumptions)assumptions.addRow(['Hipótesis',value]);for(const value of estimate.exclusions)assumptions.addRow(['Exclusión',value]);for(const value of estimate.warnings||[])assumptions.addRow(['Advertencia',value]);
 const customer=wb.addWorksheet('Cliente');customer.addRows([['Campo','Valor'],['Nombre',client.name],['Email',client.email],['Teléfono',client.phone],['Empresa',client.company],['NIF/CIF',client.taxId],['Modalidad',record.intent],['Referencia',record.id]]);
 for(const sheet of wb.worksheets){sheet.views=[{state:'frozen',ySplit:1}];sheet.getRow(1).height=28;sheet.getRow(1).font={bold:true,color:{argb:'FFFFFFFF'}};sheet.getRow(1).fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF17202A'}};sheet.columns.forEach((column,index)=>column.width=index===3?55:24);sheet.eachRow((row,rowNumber)=>row.eachCell(cell=>{cell.alignment={vertical:'top',wrapText:true};if(rowNumber>1&&typeof cell.value==='number')cell.numFmt='#,##0.00 [$€-es-ES]';}));}
 return wb.xlsx.writeBuffer();
}

export async function professionalPdf(record){
 const doc=await PDFDocument.create(),regular=await doc.embedFont(StandardFonts.Helvetica),bold=await doc.embedFont(StandardFonts.HelveticaBold),dark=rgb(.07,.11,.16),blue=rgb(.05,.29,.42),muted=rgb(.35,.4,.45);let page,y,pageNo=0;
 const safe=value=>String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/€/g,'EUR').replace(/[^\x20-\x7E]/g,' ');
 const addPage=()=>{page=doc.addPage([595,842]);pageNo++;y=792;page.drawRectangle({x:0,y:817,width:595,height:25,color:dark});page.drawText('robotARQ  |  PRESUPUESTO Y MEDICIONES',{x:40,y:825,size:9,font:bold,color:rgb(1,1,1)});page.drawText(`Expediente ${safe(record.id)}  |  Pagina ${pageNo}`,{x:330,y:25,size:8,font:regular,color:muted});};
 const draw=(value,{size=10,font=regular,color=dark,x=45,indent=0,gap=6}={})=>{const max=500-indent,words=safe(value).split(/\s+/);let line='';for(const word of words){const candidate=line?`${line} ${word}`:word;if(font.widthOfTextAtSize(candidate,size)>max&&line){if(y<65)addPage();page.drawText(line,{x:x+indent,y,size,font,color});y-=size+gap;line=word;}else line=candidate;}if(line){if(y<65)addPage();page.drawText(line,{x:x+indent,y,size,font,color});y-=size+gap;}};
 const heading=value=>{y-=8;draw(value,{size:15,font:bold,color:blue,gap:9});page.drawLine({start:{x:45,y:y+4},end:{x:550,y:y+4},thickness:.8,color:blue});};
 addPage();y=675;draw('PRESUPUESTO PRELIMINAR',{size:26,font:bold,color:blue,gap:12});draw(record.estimate.project.title,{size:18,font:bold,gap:10});y-=20;draw(`Expediente: ${record.id}`,{size:11});draw(`Fecha: ${record.createdAt.slice(0,10)}`,{size:11});draw(`Cliente: ${record.client.name}`,{size:11});draw(`Ubicacion: ${record.estimate.project.location||'Por confirmar'}`,{size:11});draw(`Superficie: ${record.estimate.project.areaM2||'Por confirmar'} m2`,{size:11});y-=25;draw('Documento orientativo sujeto a medicion, proyecto, disponibilidad y revision tecnica.',{size:11,color:muted});
 addPage();heading('1. Memoria del proyecto');draw(record.estimate.project.summary);draw(`Tipologia: ${record.estimate.project.projectType} | Calidad: ${record.estimate.project.quality} | Confianza: ${record.estimate.confidence}`);
 heading('2. Horquilla de mercado');for(const scenario of record.estimate.market){draw(`${scenario.label}: ${euro(scenario.amount)}`,{font:bold});draw(scenario.note,{size:9,color:muted,indent:14});}
 heading('3. Hipotesis');for(const value of record.estimate.assumptions)draw(`- ${value}`,{size:9});heading('4. Exclusiones');for(const value of record.estimate.exclusions)draw(`- ${value}`,{size:9});
 heading('5. Resumen por capitulos');for(const chapter of Object.values(record.estimate.budget.chapters))draw(`${chapter.code}  ${chapter.name}  ${euro(chapter.total)}`,{font:bold});draw(`COSTE DIRECTO: ${euro(record.estimate.budget.subtotal)}`,{font:bold});for(const extra of record.estimate.budget.extras)draw(`${extra.code}  ${extra.desc}: ${euro(extra.amount)}`);draw(`TOTAL SIN IVA: ${euro(record.estimate.budget.total)}`,{size:15,font:bold,color:blue});
 addPage();heading('6. Presupuesto y mediciones');for(const chapter of Object.values(record.estimate.budget.chapters)){draw(`${chapter.code} — ${chapter.name}`,{size:13,font:bold,color:blue});for(const item of chapter.items){draw(`${item.code}  ${item.desc}`,{font:bold});draw(`${item.qty} ${item.unit} x ${euro(item.price)} = ${euro(item.amount)}`,{size:9,color:muted,indent:14});}draw(`Subtotal ${chapter.name}: ${euro(chapter.total)}`,{font:bold});}
 heading('7. Condiciones');draw('Estimacion preliminar sin caracter contractual. Los importes deben confirmarse mediante visita, planos, mediciones, estudio del terreno, calidades, licencias y ofertas de proveedores. No incluye IVA salvo indicacion expresa.');
 return doc.save();
}
