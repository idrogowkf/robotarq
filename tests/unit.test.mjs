import test from 'node:test';
import assert from 'node:assert/strict';
import { contactData, deliverLead, escapeHTML } from '../lib/contact.mjs';
import { estimate } from '../lib/estimate.mjs';
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
