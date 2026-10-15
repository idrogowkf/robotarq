import test from 'node:test';
import assert from 'node:assert/strict';
import { interpretProject, validateEstimate } from '../lib/ai-estimator.mjs';
import { createCase, createMemoryCaseStore, getCase, verifyDownloadGrant, sealEstimate, anonymizeCase, refreshCaseDocuments, requestProfessionalReview } from '../lib/cases.mjs';
import { professionalPdf, professionalWorkbook } from '../lib/documents.mjs';
import { PDFDocument } from 'pdf-lib';
import ExcelJS from 'exceljs';
import { createAdminSession, verifyAdminSession, verifyAdminPassword, filterCases, casesCsv, groupCasesByClient } from '../lib/admin-auth.mjs';
import { deliverCaseEmails, deliverProfessionalReviewRequest } from '../lib/case-email.mjs';
import { createMemoryProviderStore,saveProvider,listProviders,listPublicProviders,hashProviderPassword,verifyProviderPassword,publicProvider,findProviderByEmail,profileIntegrity,mergeProviderSelfUpdate } from '../lib/providers.mjs';
import { createProfessionalSession,verifyProfessionalSession } from '../lib/professional-auth.mjs';
import { providerQuoteMessage,sendProviderQuote } from '../lib/provider-email.mjs';

const rawEstimate={
 project:{title:'Vivienda unifamiliar aislada',summary:'Chalet de una planta y 60 metros cuadrados.',projectType:'obra nueva',location:'Madrid',areaM2:60,quality:'media'},
 assumptions:['Parcela accesible para medios de obra'],exclusions:['Licencias y honorarios técnicos'],confidence:'media',
 chapters:{
  CI:{code:'CH-CI',name:'Cimentación',items:[{code:'CI01',desc:'Losa de cimentación',unit:'m2',qty:60,price:220,amount:1}]},
  ST:{code:'CH-ST',name:'Estructura',items:[{code:'ST01',desc:'Estructura de vivienda',unit:'m2',qty:60,price:700,amount:1}]}
 }
};

test('a customer can request one professional review and receives a persistent state',async()=>{
 const store=createMemoryCaseStore(),estimate=validateEstimate(rawEstimate),secret='review-secret',created=await createCase({customerId:'customer-1',client:{name:'Ana Pérez',email:'ana@example.com',phone:'600123123'},intent:'download',privacy:true,estimate,estimateToken:sealEstimate(estimate,secret)},{store,secret,notify:async()=>({ok:true})});
 let deliveries=0;const first=await requestProfessionalReview(created.id,{customerId:'customer-1',timeframe:'1-3-months',commitment:true,shareAnonymized:true},{store,notify:async()=>{deliveries++;}});
 assert.equal(first.intent,'assistance');assert.equal(first.status,'new-lead');assert.equal(first.assistanceRequest.timeframe,'1-3-months');assert.equal(first.assistanceRequest.status,'received');
 const repeated=await requestProfessionalReview(created.id,{customerId:'customer-1',timeframe:'immediate',commitment:true},{store,notify:async()=>{deliveries++;}});
 assert.equal(repeated.assistanceRequest.timeframe,'1-3-months');assert.equal(deliveries,1);
});

test('professional review rejects a different customer and rolls back failed delivery',async()=>{
 const store=createMemoryCaseStore(),estimate=validateEstimate(rawEstimate),secret='review-secret',created=await createCase({customerId:'customer-1',client:{name:'Ana Pérez',email:'ana@example.com',phone:'600123123'},intent:'download',privacy:true,estimate,estimateToken:sealEstimate(estimate,secret)},{store,secret,notify:async()=>({ok:true})});
 await assert.rejects(()=>requestProfessionalReview(created.id,{customerId:'customer-2',timeframe:'1-3-months',commitment:true},{store}),/permiso/i);
 await assert.rejects(()=>requestProfessionalReview(created.id,{customerId:'customer-1',timeframe:'1-3-months',commitment:true,shareAnonymized:true},{store,notify:async()=>{throw new Error('mail')}}),/notificar/i);
 const saved=await store.get(created.id);assert.equal(saved.intent,'download');assert.equal(saved.assistanceRequest,undefined);
});

test('professional review email identifies the lead and links its admin case',async()=>{
 const sent=[],resend={emails:{send:async message=>{sent.push(message);return {data:{id:'mail-1'}};}}},record={id:'case-1',client:{name:'Ana Pérez',email:'ana@example.com',phone:'600123123'},estimate:validateEstimate(rawEstimate),assistanceRequest:{timeframe:'1-3-months'}};
 await deliverProfessionalReviewRequest(resend,{record,from:'robotARQ <hola@robotarq.com>',owner:'owner@example.com',siteUrl:'https://robotarq.com'});
 assert.equal(sent.length,1);assert.match(sent[0].subject,/solicitud profesional/i);assert.match(sent[0].html,/1–3 meses/);assert.match(sent[0].html,/administracion\/case-1/);
});

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
test('generic prefabricated homes require the construction system before pricing',async()=>{let calls=0;const result=await interpretProject({prompt:'Quiero una vivienda prefabricada de 80 metros cuadrados en Madrid'},{generate:async()=>{calls++;return rawEstimate;}});assert.equal(result.ok,false);assert.equal(result.status,422);assert.equal(calls,0);assert.match(result.questions[0],/hormigón|madera|acero/i);});
test('a nontechnical customer can ask robotARQ to recommend the prefabricated system',async()=>{let received;const result=await interpretProject({prompt:'Quiero una vivienda prefabricada de 80 metros cuadrados. No sé qué sistema elegir; recomiéndame el más adecuado.'},{generate:async input=>{received=input;return {...rawEstimate,project:{...rawEstimate.project,summary:'Hipótesis de referencia: sistema de madera.'},assumptions:['Sistema de madera adoptado como hipótesis para estimar.']};}});assert.equal(result.ok,true);assert.match(received.prompt,/recomiéndame/i);assert.match(result.assumptions[0],/hipótesis/i);});

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

test('case creation requires a signed unchanged estimate and stores client intent',async()=>{
 const store=createMemoryCaseStore(),estimate=await interpretProject({prompt:'Chalet de 60 metros cuadrados'},{generate:async()=>rawEstimate});
 const estimateToken=sealEstimate(estimate,'test-secret');
 const created=await createCase({client:{name:'Ana Pérez',email:'ana@example.com',phone:'600123123'},intent:'assistance',privacy:true,estimate,estimateToken},{store,secret:'test-secret',notify:async()=>({ok:true})});
 assert.match(created.id,/^[0-9a-f-]{36}$/);assert.equal(created.status,'new-lead');assert.equal(created.downloads.length,2);
 const saved=await getCase(created.id,{store});assert.equal(saved.client.email,'ana@example.com');assert.equal(saved.estimate.budget.total,estimate.budget.total);assert.ok(saved.files.pdf.length>1000);assert.ok(saved.files.xlsx.length>1000);
 assert.equal(verifyDownloadGrant(created.id,created.downloadToken,'test-secret'),true);
 await assert.rejects(()=>createCase({client:{name:'Ana',email:'ana@example.com',phone:'600123123'},intent:'download',privacy:true,estimate:{...estimate,project:{...estimate.project,title:'alterado'}},estimateToken},{store,secret:'test-secret'}),/presupuesto/i);
});

test('case is not persisted when owner notification fails',async()=>{
 const store=createMemoryCaseStore(),estimate=await interpretProject({prompt:'Casa 60 metros cuadrados'},{generate:async()=>rawEstimate});
 await assert.rejects(()=>createCase({client:{name:'Luis',email:'luis@example.com',phone:'600111222'},intent:'download',privacy:true,estimate,estimateToken:sealEstimate(estimate,'s')},{store,secret:'s',notify:async()=>{throw new Error('mail')}}),/notificar/i);
 assert.equal((await store.list()).length,0);
});

test('anonymization removes personal identifiers and retains technical totals',async()=>{
 const store=createMemoryCaseStore(),estimate=await interpretProject({prompt:'Casa 60 metros cuadrados'},{generate:async()=>rawEstimate});
 const made=await createCase({client:{name:'Luis',email:'luis@example.com',phone:'600111222'},intent:'download',privacy:true,estimate,estimateToken:sealEstimate(estimate,'s')},{store,secret:'s',notify:async()=>({ok:true})});
 await anonymizeCase(made.id,{store});const saved=await getCase(made.id,{store});
 assert.equal(saved.client.email,'');assert.equal(saved.client.name,'Anonimizado');assert.equal(saved.estimate.budget.total,estimate.budget.total);
 const wb=new ExcelJS.Workbook();await wb.xlsx.load(Buffer.from(saved.files.xlsx,'base64'));assert.equal(wb.getWorksheet('Cliente').getCell('B2').value,'Anonimizado');assert.equal(wb.getWorksheet('Cliente').getCell('B3').value,'');
});

test('professional PDF and workbook derive from the stored case snapshot',async()=>{
 const store=createMemoryCaseStore(),estimate=await interpretProject({prompt:'Casa 60 metros cuadrados'},{generate:async()=>rawEstimate});
 const made=await createCase({client:{name:'Ana Pérez',email:'ana@example.com',phone:'600123123'},intent:'assistance',privacy:true,estimate,estimateToken:sealEstimate(estimate,'s')},{store,secret:'s',notify:async()=>({ok:true})});
 const record=await getCase(made.id,{store}),pdf=await professionalPdf(record),xlsx=await professionalWorkbook(record);
 const parsed=await PDFDocument.load(pdf);assert.ok(parsed.getPageCount()>=2);assert.ok(pdf.length>3000);
 const wb=new ExcelJS.Workbook();await wb.xlsx.load(xlsx);assert.deepEqual(wb.worksheets.map(s=>s.name),['Resumen','Capítulos','Mediciones','Hipótesis','Cliente']);
 assert.equal(wb.getWorksheet('Resumen').getCell('B12').value,estimate.budget.total);
 assert.equal(wb.getWorksheet('Cliente').getCell('B2').value,'Ana Pérez');
 assert.equal(wb.getWorksheet('Mediciones').getCell('H2').value,13200);
 await refreshCaseDocuments(made.id,{store});assert.equal((await getCase(made.id,{store})).documentVersion,2);
});

test('admin authentication uses signed expiring sessions and constant password comparison',()=>{
 const token=createAdminSession('session-secret',1000);assert.equal(verifyAdminSession(token,'session-secret'),true);assert.equal(verifyAdminSession(token,'wrong'),false);
 assert.equal(verifyAdminPassword('correct horse','correct horse'),true);assert.equal(verifyAdminPassword('wrong','correct horse'),false);
});

test('admin case filtering and CSV cover client, city and intent',()=>{
 const cases=[{id:'1',createdAt:'2026-10-09',status:'new-lead',intent:'assistance',client:{name:'Ana Pérez',email:'ana@example.com'},estimate:{project:{title:'Chalet',location:'Madrid'},budget:{total:100}}},{id:'2',createdAt:'2026-10-08',status:'download-only',intent:'download',client:{name:'Luis',email:'luis@example.com'},estimate:{project:{title:'Local',location:'Sevilla'},budget:{total:200}}}];
 assert.deepEqual(filterCases(cases,{q:'madrid',intent:'assistance'}).map(value=>value.id),['1']);const csv=casesCsv(cases);assert.match(csv,/Ana Pérez/);assert.match(csv,/download-only/);
 assert.deepEqual(filterCases(cases,{from:'2026-10-09',type:'chalet'}).map(value=>value.id),['1']);
 const grouped=groupCasesByClient([...cases,{...cases[0],id:'3',estimate:{...cases[0].estimate,budget:{total:50}}}]);assert.equal(grouped.length,2);assert.equal(grouped.find(value=>value.email==='ana@example.com').cases.length,2);assert.equal(grouped.find(value=>value.email==='ana@example.com').total,150);
});

test('resolved Resend errors are rejected and client delivery includes document links',async()=>{
 const calls=[];const resend={emails:{send:async payload=>{calls.push(payload);return calls.length===1?{data:{id:'owner-1'},error:null}:{data:null,error:{message:'rejected'}};}}};
 await assert.rejects(()=>deliverCaseEmails(resend,{record:{id:'abc',intent:'download',client:{name:'Ana',email:'ana@example.com',phone:'600000000'},estimate:{project:{title:'Chalet'},budget:{total:100}}},downloads:['/pdf','/xlsx'],from:'robotARQ <hola@robotarq.com>',owner:'hola@robotarq.com',siteUrl:'https://robotarq.com'}),/correo/i);
 assert.match(calls[1].text,/\/pdf/);assert.match(calls[1].text,/\/xlsx/);
 assert.match(calls[0].html,/Centro administrativo/);assert.match(calls[0].html,/background:#0f172a/);assert.match(calls[1].html,/Descargar presupuesto PDF/);assert.match(calls[1].html,/robot<span/);
});

test('provider directory validates, searches and paginates companies',async()=>{const store=createMemoryProviderStore();await saveProvider({businessName:'Obras Madrid',email:'proveedor@example.com',specialties:'albañilería',provinces:'Madrid'},{store});await saveProvider({businessName:'Instalaciones Norte',email:'norte@example.com',specialties:'electricidad',provinces:'Madrid, Segovia'},{store});const result=await listProviders({store,q:'electricidad',page:1,pageSize:1});assert.equal(result.total,1);assert.equal(result.items[0].businessName,'Instalaciones Norte');});
test('professional passwords are derived, complex and sessions reject tampering',()=>{assert.throws(()=>hashProviderPassword('una-clave-segura'),/mayúscula/i);const stored=hashProviderPassword('Una-clave-segura1');assert.doesNotMatch(stored,/Una-clave-segura1/);assert.equal(verifyProviderPassword('Una-clave-segura1',stored),true);assert.equal(verifyProviderPassword('incorrecta',stored),false);const token=createProfessionalSession({id:'pro-1',email:'pro@example.com'},'secret',1000);assert.equal(verifyProfessionalSession(token,'secret').providerId,'pro-1');assert.equal(verifyProfessionalSession(token+'x','secret'),null);});
test('pending professionals remain private until admin approval',async()=>{const store=createMemoryProviderStore();const pending=await saveProvider({businessName:'Técnica Sur',email:'sur@example.com',phone:'600000000',taxId:'B12345678',status:'pending',createdBy:'self',passwordHash:hashProviderPassword('Clave-muy-segura1')},{store});assert.equal(publicProvider(pending),null);assert.equal((await listPublicProviders({store})).total,0);const approved=await saveProvider({...pending,status:'active'},{store});const publicValue=publicProvider(approved);assert.equal(publicValue.businessName,'Técnica Sur');assert.equal(publicValue.email,undefined);assert.equal(publicValue.phone,undefined);assert.equal(publicValue.taxId,undefined);assert.equal(publicValue.passwordHash,undefined);assert.equal((await findProviderByEmail('SUR@example.com',{store})).id,pending.id);});
test('professional profiles normalize portfolio and expose an integrity report',async()=>{const store=createMemoryProviderStore();const provider=await saveProvider({businessName:'Construcciones Centro',contactName:'Ana',email:'ana@centro.es',phone:'600000000',taxId:'B12345678',specialties:'reformas integrales, albañilería',provinces:'Madrid',description:'Empresa especializada en reformas integrales de viviendas y locales comerciales con equipo propio y dirección técnica.',yearsExperience:12,portfolio:['https://cdn.example.com/obra-1.webp','javascript:alert(1)','https://cdn.example.com/obra-2.jpg'],status:'pending'},{store});assert.deepEqual(provider.portfolio,['https://cdn.example.com/obra-1.webp','https://cdn.example.com/obra-2.jpg']);const report=profileIntegrity(provider);assert.ok(report.score>=70);assert.equal(report.missing.includes('portfolio'),false);const approved=await saveProvider({...provider,status:'active'},{store});assert.equal(publicProvider(approved).portfolio.length,2);});
test('editing public fields sends an approved profile back to review',()=>{const current={id:'p1',email:'pro@example.com',businessName:'Empresa aprobada',description:'Descripción aprobada',status:'active',passwordHash:'secret',notes:'private',reviewNotes:'ok'};const changed=mergeProviderSelfUpdate(current,{description:'Nueva descripción'});assert.equal(changed.status,'pending');assert.equal(changed.reviewNotes,'ok');const privateOnly=mergeProviderSelfUpdate(current,{phone:'600000001'});assert.equal(privateOnly.status,'active');});
test('public directory searches and paginates beyond one hundred approved profiles',async()=>{const store=createMemoryProviderStore();for(let index=0;index<125;index++)await saveProvider({businessName:`Empresa ${String(index).padStart(3,'0')}`,email:`p${index}@example.com`,specialties:index===124?'especialidad singular':'reformas',status:'active'},{store});const result=await listPublicProviders({store,q:'singular',page:1,pageSize:10});assert.equal(result.total,1);assert.equal(result.items[0].businessName,'Empresa 124');});
test('provider quote keeps customer contact private and uses robotARQ contact',async()=>{const record={id:'EXP-1',client:{email:'cliente@privado.es',phone:'600000001'},estimate:{project:{title:'Reforma de vivienda',location:'Madrid',areaM2:60},budget:{total:50000}},files:{pdf:Buffer.from('pdf').toString('base64')}},provider={businessName:'Proveedor',contactName:'Ana',email:'proveedor@example.com'},message=providerQuoteMessage({record,provider,adminEmail:'info@robotarq.com',adminPhone:'+34 624 473 123'});assert.doesNotMatch(message.html,/cliente@privado/);assert.match(message.html,/info@robotarq.com/);let payload;const result=await sendProviderQuote({emails:{send:async value=>(payload=value,{data:{id:'mail-1'}})}},{record,provider,from:'robotARQ Proveedores <proveedores@robotarq.com>',adminEmail:'info@robotarq.com',adminPhone:'+34 624 473 123'});assert.equal(result.messageId,'mail-1');assert.equal(payload.to[0],provider.email);assert.equal(payload.replyTo,'info@robotarq.com');assert.equal(payload.attachments[0].filename,'robotARQ-EXP-1.pdf');});
