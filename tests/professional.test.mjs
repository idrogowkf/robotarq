import test from 'node:test';
import assert from 'node:assert/strict';
import { interpretProject, validateEstimate } from '../lib/ai-estimator.mjs';

const rawEstimate={
 project:{title:'Vivienda unifamiliar aislada',summary:'Chalet de una planta y 60 metros cuadrados.',projectType:'obra nueva',location:'Madrid',areaM2:60,quality:'media'},
 assumptions:['Parcela accesible para medios de obra'],exclusions:['Licencias y honorarios técnicos'],confidence:'media',
 chapters:{
  CI:{code:'CH-CI',name:'Cimentación',items:[{code:'CI01',desc:'Losa de cimentación',unit:'m2',qty:60,price:220,amount:1}]},
  ST:{code:'CH-ST',name:'Estructura',items:[{code:'ST01',desc:'Estructura de vivienda',unit:'m2',qty:60,price:700,amount:1}]}
 }
};

test('written square metres reach AI and produce a recalculated project estimate',async()=>{
 let received;const prompt='Necesito una vivienda unifamiliar aislada tipo chalet de 60 metros cuadrados';
 const result=await interpretProject({tipo:'vivienda',ciudad:'Madrid',prompt},{generate:async input=>{received=input;return rawEstimate;}});
 assert.equal(received.prompt,prompt);assert.equal(result.ok,true);assert.equal(result.project.areaM2,60);
 assert.equal(result.budget.chapters.CI.items[0].amount,13200);assert.equal(result.market.length,3);
 assert.equal(result.market[1].amount,result.budget.total);
});

test('unusual intelligible projects reach AI without residential regex gating',async()=>{
 let calls=0;const result=await interpretProject({prompt:'Quiero una vivienda con forma de piña suspendida entre tres árboles'},{generate:async()=>{calls++;return {...rawEstimate,project:{...rawEstimate.project,title:'Vivienda arbórea singular'}};}});
 assert.equal(calls,1);assert.equal(result.ok,true);assert.match(result.project.title,/arbórea/i);
});

test('provider failure cannot become a fabricated successful budget',async()=>{
 const result=await interpretProject({prompt:'Chalet de 60 metros cuadrados'},{generate:async()=>{throw new Error('offline')},timeoutMs:50});
 assert.equal(result.ok,false);assert.equal(result.status,503);assert.equal(result.budget,undefined);
});

test('clarification response contains focused AI questions without a budget',async()=>{
 const result=await interpretProject({prompt:'Quiero construir una casa'},{generate:async()=>({project:{title:'Vivienda'},questions:['¿Qué superficie construida aproximada tendrá?']})});
 assert.equal(result.ok,false);assert.equal(result.status,422);assert.match(result.questions[0],/superficie/i);
});

test('estimate validation rejects unsupported units and excessive rows',()=>{
 assert.throws(()=>validateEstimate({chapters:{A:{name:'A',items:[{desc:'x',unit:'kg',qty:1,price:1}]}}},{}),/unidad/i);
 const chapters={};for(let c=0;c<5;c++)chapters[c]={name:'C',items:Array.from({length:50},(_,i)=>({desc:`P${i}`,unit:'ud',qty:1,price:1}))};
 assert.throws(()=>validateEstimate({chapters},{}),/partidas/i);
});
