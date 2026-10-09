import test from 'node:test';
import assert from 'node:assert/strict';
import { contactData, deliverLead, escapeHTML } from '../lib/contact.mjs';
import { estimate } from '../lib/estimate.mjs';
import { estimateRequest } from '../lib/project-estimate.mjs';
import { budgetEmailDetail } from '../lib/contact.mjs';
import { documentData } from '../lib/documents.mjs';
test('provider rejection cannot be reported as an accepted lead',async()=>{
 await assert.rejects(()=>deliverLead({emails:{send:async()=>({data:null,error:{message:'rejected',name:'validation_error'}})}},{}));
});
test('accepted provider request returns the actual tracking id',async()=>{
 assert.equal(await deliverLead({emails:{send:async()=>({data:{id:'controlled-test-id'},error:null})}},{}),'controlled-test-id');
});
test('contact input rejects invalid emails and oversized messages',()=>{
 const valid={privacy:true,name:'Prueba',email:'audit@example.invalid',phone:'000000000',message:'Una solicitud de prueba'};
 assert.equal(contactData(valid).email,'audit@example.invalid');
 assert.throws(()=>contactData({...valid,email:'invalid'}));assert.throws(()=>contactData({...valid,message:'x'.repeat(4001)}));
 assert.equal(contactData({...valid,website:'spam'}),null);
});
test('untrusted customer text is escaped for the HTML email',()=>{
 assert.equal(escapeHTML('<img src="x"> &'),'&lt;img src=&quot;x&quot;&gt; &amp;');
});
test('separate painting and tile measurements are retained',()=>{
 const r=estimate({prompt:'Alicatar 60 m² y pintar 20 m² de techos'});assert.equal(r.ok,true);assert.equal(r.budget.chapters.PT.items[0].qty,20);assert.equal(r.budget.chapters.PT.items[0].price,14);assert.equal(r.budget.subtotal,2560);
});
test('explicit measurement fields resolve missing measurement without adding trades',()=>{
 const r=estimate({prompt:'Pintura de techos',measurements:{paint:40,tiles:200}});assert.equal(r.ok,true);assert.equal(r.budget.chapters.PT.items[0].qty,40);assert.equal(Object.keys(r.budget.chapters).length,1);
});
test('unsupported mixed scope cannot silently omit plumbing',()=>{
 assert.equal(estimate({prompt:'Alicatar 60 m2 y fontanería'}).ok,false);
});
test('nonfinite quantities and manipulated document totals are rejected',()=>{
 assert.throws(()=>documentData({rows:[{qty:'Infinity',pu:10}]}));
 assert.throws(()=>documentData({rows:[{qty:1,pu:10}],total:0}));
});
test('decimal comma is preserved and negative or ambiguous thousands are not silently changed',()=>{
 const r=estimate({prompt:'20,5 m2 de cerámica'});assert.equal(r.ok,true);assert.equal(r.budget.chapters.RV.items[0].qty,20.5);
 for(const prompt of ['2.5 puntos de luz','pintar -20 m2','pintar 1.000 m2','pintar 1 500 m2','pintar 1\u00a0500 m2'])assert.equal(estimate({prompt}).ok,false,prompt);
});
test('whole-project variants and negated work require clarification',()=>{
 for(const prompt of ['colocar 20 m2 de cerámica y reformar integralmente la vivienda','Pintar 20 m2 y renovar todo el cableado','no pintar 20 m2, solo cambiar cuadro'])assert.equal(estimate({prompt}).ok,false,prompt);
});
test('a 60 m2 prefabricated concrete home produces a validated preliminary budget',async()=>{
 const generate=async()=>({chapters:{
  ST:{code:'CH-ST',name:'Estructura',items:[{code:'ST01',desc:'Sistema prefabricado de hormigón',unit:'m2',qty:60,price:900,amount:1}]},
  IN:{code:'CH-IN',name:'Instalaciones',items:[{code:'IN01',desc:'Instalaciones básicas',unit:'m2',qty:60,price:250,amount:1}]}
 }});
 const r=await estimateRequest({tipo:'vivienda',ciudad:'Madrid',prompt:'Vivienda prefabricada de hormigón de 60 m2'},{generate});
 assert.equal(r.ok,true);assert.equal(r.meta.scope,'project-preliminary');
 assert.equal(r.budget.chapters.ST.items[0].amount,54000);
 assert.equal(r.budget.subtotal,69000);assert.ok(r.budget.total>r.budget.subtotal);
});
test('malformed or excessive project budgets are rejected instead of displayed',async()=>{
 const generate=async()=>({chapters:{ST:{name:'Estructura',items:[{desc:'Partida',unit:'m2',qty:60,price:9999999}]}}});
 const r=await estimateRequest({tipo:'vivienda',ciudad:'Madrid',prompt:'Vivienda prefabricada de hormigón de 60 m2'},{generate});
 assert.equal(r.ok,false);assert.match(r.error,/validar/i);
});
test('production mode falls back to a bounded project catalog when assistance is invalid',async()=>{
 const r=await estimateRequest({tipo:'vivienda',ciudad:'Madrid',prompt:'Vivienda prefabricada de hormigón de 60 m2'},{generate:async()=>{throw new Error('provider failed')},fallbackOnInvalid:true});
 assert.equal(r.ok,true);assert.equal(r.meta.source,'reference-fallback');assert.equal(r.budget.chapters.ST.items[0].qty,60);assert.ok(r.budget.total>0);
});
test('production mode does not leave the estimator waiting when assistance times out',async()=>{
 const start=Date.now();const r=await estimateRequest({tipo:'vivienda',prompt:'Vivienda prefabricada de hormigón de 60 m2'},{generate:()=>new Promise(()=>{}),fallbackOnInvalid:true,generateTimeoutMs:10});
 assert.equal(r.ok,true);assert.equal(r.meta.source,'reference-fallback');assert.ok(Date.now()-start<500);
});
test('oversized project descriptions are rejected before calling assistance',async()=>{
 let assisted=false;const r=await estimateRequest({prompt:'Vivienda prefabricada '+('x'.repeat(4000))+' 60 m2'},{generate:async()=>{assisted=true;return {};},fallbackOnInvalid:true});
 assert.equal(r.ok,false);assert.equal(assisted,false);assert.match(r.error,/4.000/);
});
test('the contact email includes the same generated budget and total',()=>{
 const budget={chapters:{ST:{code:'CH-ST',name:'Estructura',items:[{code:'ST01',desc:'Sistema prefabricado',unit:'m2',qty:60,price:900,amount:54000}]}},extras:[],total:54000};
 const detail=budgetEmailDetail(budget);assert.match(detail,/ST01 Sistema prefabricado/);assert.match(detail,/Total sin IVA: 54000 EUR/);
});
test('a simple measured item remains deterministic even when it mentions a home',async()=>{
 let assisted=false;const r=await estimateRequest({prompt:'Pintar 20 m2 en vivienda'},{generate:async()=>{assisted=true;return {};}});
 assert.equal(r.ok,true);assert.equal(r.meta.source,'reference-catalog');assert.equal(r.budget.chapters.PT.items[0].qty,20);assert.equal(assisted,false);
});
test('project budgets over the shared 200-row document limit are rejected',async()=>{
 const chapters={};for(let c=0;c<4;c++)chapters['C'+c]={name:'Capítulo '+c,items:Array.from({length:60},(_,i)=>({code:`C${c}-${i}`,desc:'Partida',unit:'ud',qty:1,price:10}))};
 const r=await estimateRequest({prompt:'Vivienda prefabricada de hormigón de 60 m2'},{generate:async()=>({chapters})});assert.equal(r.ok,false);
});
test('integral refurbishment fallback does not invent a prefabricated concrete system',async()=>{
 const r=await estimateRequest({prompt:'Reforma integral de vivienda de 60 m2'},{generate:async()=>{throw new Error('offline')},fallbackOnInvalid:true});
 assert.equal(r.ok,true);const descriptions=Object.values(r.budget.chapters).flatMap(c=>c.items.map(i=>i.desc)).join(' ');assert.doesNotMatch(descriptions,/prefabricado/i);assert.match(descriptions,/reforma|instalaciones/i);
});
test('multiple areas require clarification instead of using the first number',async()=>{
 let assisted=false;const r=await estimateRequest({prompt:'Reforma integral: pintar 20 m2 en vivienda de 60 m2'},{generate:async()=>{assisted=true;return {};},fallbackOnInvalid:true});
 assert.equal(r.ok,false);assert.equal(assisted,false);assert.match(r.questions.join(' '),/superficie total/i);
});
test('timed-out assistance receives an abort signal',async()=>{
 let aborted=false;const generate=({signal})=>new Promise((_,reject)=>signal.addEventListener('abort',()=>{aborted=true;reject(new Error('aborted'));},{once:true}));
 const r=await estimateRequest({prompt:'Vivienda prefabricada de hormigón de 60 m2'},{generate,fallbackOnInvalid:true,generateTimeoutMs:10});assert.equal(r.ok,true);assert.equal(aborted,true);
});
