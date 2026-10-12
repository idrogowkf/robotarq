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
 const doc=await PDFDocument.create(),regular=await doc.embedFont(StandardFonts.Helvetica),bold=await doc.embedFont(StandardFonts.HelveticaBold),dark=rgb(.055,.09,.15),blue=rgb(.015,.41,.60),pale=rgb(.94,.97,.98),line=rgb(.80,.84,.87),muted=rgb(.35,.4,.45);let page,y,pageNo=0;
 const safe=value=>String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/€/g,'EUR').replace(/[^\x20-\x7E]/g,' ');
 const wrap=(value,width,font=regular,size=8)=>{const output=[];for(const token of safe(value).split(/\s+/)){let word=token;while(font.widthOfTextAtSize(word,size)>width){let cut=1;while(cut<word.length&&font.widthOfTextAtSize(word.slice(0,cut+1),size)<=width)cut++;output.push(word.slice(0,cut));word=word.slice(cut);}const last=output.at(-1)||'',candidate=last?`${last} ${word}`:word;if(last&&font.widthOfTextAtSize(candidate,size)<=width)output[output.length-1]=candidate;else if(word)output.push(word);}return output.length?output:[''];};
 const addPage=()=>{page=doc.addPage([595,842]);pageNo++;y=790;page.drawRectangle({x:0,y:814,width:595,height:28,color:dark});page.drawText('robotARQ',{x:35,y:823,size:12,font:bold,color:rgb(1,1,1)});page.drawText('PRESUPUESTO Y MEDICIONES',{x:102,y:824,size:8,font:regular,color:rgb(.55,.84,.95)});page.drawText(`Expediente ${safe(record.id)}  |  Pagina ${pageNo}`,{x:342,y:22,size:7,font:regular,color:muted});};
 const paragraph=(value,{size=9,font=regular,color=dark,width=525,gap=4}={})=>{for(const text of wrap(value,width,font,size)){if(y<55)addPage();page.drawText(text,{x:35,y,size,font,color});y-=size+gap;}};
 const heading=value=>{if(y<90)addPage();y-=8;paragraph(value,{size:15,font:bold,color:blue,gap:8});page.drawLine({start:{x:35,y:y+4},end:{x:560,y:y+4},thickness:1,color:blue});y-=10;};
 const tableHeader=()=>{const labels=['Codigo','Descripcion','Ud','Cantidad','P. unitario','Importe'],widths=[52,232,33,52,78,78];let x=35;page.drawRectangle({x,y:y-21,width:525,height:21,color:dark});labels.forEach((label,index)=>{page.drawText(label,{x:x+4,y:y-14,size:7,font:bold,color:rgb(1,1,1)});x+=widths[index];});y-=21;};
 const tableRow=(cells,{boldRow=false,fill=null}={})=>{const widths=[52,232,33,52,78,78],alignRight=[false,false,false,true,true,true],font=boldRow?bold:regular,size=7,lines=cells.map((cell,index)=>wrap(cell,widths[index]-8,font,size)),height=Math.max(20,...lines.map(value=>value.length*9+7));if(y-height<48){addPage();tableHeader();}if(fill)page.drawRectangle({x:35,y:y-height,width:525,height,color:fill});let x=35;cells.forEach((cell,index)=>{page.drawRectangle({x,y:y-height,width:widths[index],height,borderColor:line,borderWidth:.45});lines[index].forEach((text,row)=>{const tx=alignRight[index]?x+widths[index]-4-font.widthOfTextAtSize(text,size):x+4;page.drawText(text,{x:tx,y:y-12-row*9,size,font,color:dark});});x+=widths[index];});y-=height;};
 addPage();page.drawRectangle({x:0,y:565,width:595,height:249,color:dark});y=732;paragraph('PRESUPUESTO PRELIMINAR',{size:11,font:bold,color:rgb(.49,.83,.95),gap:10});paragraph(record.estimate.project.title,{size:25,font:bold,color:rgb(1,1,1),width:515,gap:10});y-=18;paragraph(`Cliente  ${record.client.name}`,{size:11,color:rgb(.86,.91,.94)});paragraph(`Ubicacion  ${record.estimate.project.location||'Por confirmar'}   |   Superficie  ${record.estimate.project.areaM2||'Por confirmar'} m2`,{size:10,color:rgb(.72,.80,.84)});y=515;paragraph(`EXPEDIENTE  ${record.id}`,{size:9,font:bold,color:blue});paragraph(`Fecha: ${record.createdAt.slice(0,10)}  |  Calidad: ${record.estimate.project.quality}  |  Confianza: ${record.estimate.confidence}`);y-=18;paragraph(record.estimate.project.summary,{size:11,width:520,gap:6});y-=18;page.drawRectangle({x:35,y:y-72,width:525,height:72,color:pale,borderColor:line,borderWidth:1});page.drawText('TOTAL ESTIMADO SIN IVA',{x:53,y:y-25,size:9,font:bold,color:muted});page.drawText(euro(record.estimate.budget.total),{x:53,y:y-54,size:22,font:bold,color:blue});
 addPage();heading('Resumen economico por capitulos');tableHeader();for(const chapter of Object.values(record.estimate.budget.chapters))tableRow([chapter.code,chapter.name,'','','',euro(chapter.total)]);tableRow(['','COSTE DIRECTO','','','',''+euro(record.estimate.budget.subtotal)],{boldRow:true,fill:pale});for(const extra of record.estimate.budget.extras)tableRow([extra.code,extra.desc,extra.unit,String(extra.qty),euro(extra.price),euro(extra.amount)]);tableRow(['','TOTAL SIN IVA','','','',''+euro(record.estimate.budget.total)],{boldRow:true,fill:rgb(.82,.93,.97)});
 heading('Hipotesis de calculo');for(const value of record.estimate.assumptions)paragraph(`- ${value}`,{size:8});heading('Exclusiones');for(const value of record.estimate.exclusions)paragraph(`- ${value}`,{size:8});
 addPage();heading('Presupuesto descompuesto y mediciones');for(const chapter of Object.values(record.estimate.budget.chapters)){if(y<110)addPage();page.drawRectangle({x:35,y:y-25,width:525,height:25,color:blue});page.drawText(`${safe(chapter.code)}  ${safe(chapter.name)}`,{x:43,y:y-17,size:9,font:bold,color:rgb(1,1,1)});y-=25;tableHeader();for(const item of chapter.items)tableRow([item.code,item.desc,item.unit,String(item.qty),euro(item.price),euro(item.amount)]);tableRow(['',`Subtotal ${chapter.name}`,'','','',euro(chapter.total)],{boldRow:true,fill:pale});y-=12;}
 heading('Condiciones');paragraph('Estimacion preliminar sin caracter contractual. Los importes deben confirmarse mediante visita, planos, mediciones, estudio del terreno, calidades, licencias y ofertas de proveedores. No incluye IVA salvo indicacion expresa.',{size:8});
 return doc.save();
}
