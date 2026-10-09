import test from 'node:test';
import assert from 'node:assert/strict';
import ExcelJS from 'exceljs';
import { PDFDocument } from 'pdf-lib';
const base=process.env.TEST_BASE_URL || 'http://localhost:3005';
async function post(path,data){return fetch(base+path,{method:'POST',headers:{'Content-Type':'application/json','x-robotarq-test':'1'},body:JSON.stringify(data)});}
test('vague request asks for measurements without a fabricated total',async()=>{
 const r=await post('/api/estimate',{prompt:'Quiero reformar'});assert.equal(r.status,422);const d=await r.json();assert.ok(d.questions.length);assert.equal(d.budget,undefined);
});
test('new build cannot be returned as a partial refurbishment budget',async()=>{
 const r=await post('/api/estimate',{obra:'obra_nueva',m2:120,prompt:'Casa de 120 m²'});assert.equal(r.status,422);
});
test('unmeasured ceiling painting cannot borrow tile area',async()=>{
 const r=await post('/api/estimate',{prompt:'Alicatar 60 m² y pintar techos'});assert.equal(r.status,422);
});
test('superscript and plain units give the same explicit quantities without extra lights',async()=>{
 const a=await (await post('/api/estimate',{prompt:'Pegar 60 m² cerámica y cambiar cuadro eléctrico'})).json();
 const b=await (await post('/api/estimate',{prompt:'Pegar 60 m2 cerámica y cambiar cuadro eléctrico'})).json();
 assert.equal(a.ok,true);assert.deepEqual(a.budget,b.budget);
 const items=Object.values(a.budget.chapters).flatMap(c=>c.items);assert.equal(items.find(i=>i.code==='RV01').qty,60);assert.equal(items.some(i=>/puntos|tomas/i.test(i.desc)),false);
});
const doc={meta:{title:'Estimación de prueba',prompt:'60 m² cerámica y cuadro'},rows:[{cap:'RV',capName:'Revestimientos',code:'RV01',desc:'Cerámica',ud:'m2',qty:60,pu:38},{cap:'IN',capName:'Instalaciones',code:'IN01',desc:'Cuadro eléctrico',ud:'ud',qty:1,pu:350}],extra:[],total:2630};
test('Excel retains every code, description and total with no template remnants',async()=>{
 const r=await post('/api/export/xlsx',doc);assert.equal(r.status,200);const wb=new ExcelJS.Workbook();await wb.xlsx.load(Buffer.from(await r.arrayBuffer()));
 const ws=wb.getWorksheet('Partidas');assert.ok(ws);assert.equal(ws.getCell('C3').value,'IN01');assert.equal(ws.getCell('D3').value,'Cuadro eléctrico');assert.equal(wb.getWorksheet('Resumen').getCell('B4').value,2630);
});
test('PDF is a readable PDF rather than a React render error',async()=>{
 const r=await post('/api/export/pdf',doc);assert.equal(r.status,200);const bytes=await r.arrayBuffer();const pdf=await PDFDocument.load(bytes);assert.ok(pdf.getPageCount()>=1);
});
test('export rejects a forged total',async()=>{
 const r=await post('/api/export/xlsx',{...doc,total:1});assert.equal(r.status,400);
});
test('contact validates privacy acknowledgement before provider work',async()=>{
 const r=await post('/api/notify',{name:'Prueba',email:'audit@example.invalid',phone:'000000000'});assert.equal(r.status,400);
});
test('unused paid generation and arbitrary mail routes are disabled',async()=>{
 for(const path of ['/api/ai','/api/generate','/api/export/send']){const r=await post(path,{});assert.equal(r.status,410);}
});
