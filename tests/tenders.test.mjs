import test from 'node:test';
import assert from 'node:assert/strict';
import {
  openTender,
  listProviderTenders,
  submitTenderBid,
  awardTenderBid,
  matchProvidersForCase,
} from '../lib/tenders.mjs';
import { createMemoryCaseStore } from '../lib/cases.mjs';
import { createMemoryProviderStore, saveProvider } from '../lib/providers.mjs';
import { tenderInvitationMessage } from '../lib/tender-email.mjs';

const caseRecord=(overrides={})=>({
  id:'case-1',createdAt:'2026-10-14T10:00:00.000Z',updatedAt:'2026-10-14T10:00:00.000Z',
  client:{name:'Cliente',email:'cliente@example.com',phone:'600000000'},events:[],
  estimate:{project:{title:'Instalación eléctrica industrial',projectType:'electricidad',location:'Madrid',summary:'Adecuación eléctrica.'},budget:{total:24000,chapters:{}}},
  ...overrides,
});

async function setup(){
  const caseStore=createMemoryCaseStore(),providerStore=createMemoryProviderStore();
  await caseStore.put(caseRecord());
  const madrid=await saveProvider({businessName:'Eléctrica Madrid',email:'madrid@example.com',specialties:'electricidad industrial',provinces:'Madrid',status:'active'},{store:providerStore});
  const sevilla=await saveProvider({businessName:'Reformas Sevilla',email:'sevilla@example.com',specialties:'albañilería',provinces:'Sevilla',status:'active'},{store:providerStore});
  return {caseStore,providerStore,madrid,sevilla};
}

test('matching ranks active providers by specialty and location',async()=>{
  const {caseStore,providerStore,madrid,sevilla}=await setup(),record=await caseStore.get('case-1');
  const matches=await matchProvidersForCase(record,{providerStore});
  assert.equal(matches[0].id,madrid.id);
  assert.ok(matches[0].matchScore>matches.find(value=>value.id===sevilla.id).matchScore);
});

test('admin opens a private tender for at most four unique active providers',async()=>{
  const {caseStore,providerStore,madrid,sevilla}=await setup();
  const tender=await openTender('case-1',{providerIds:[madrid.id,madrid.id,sevilla.id],deadline:'2026-11-01T18:00:00.000Z',instructions:'Oferta desglosada por capítulos.'},{caseStore,providerStore,now:()=>new Date('2026-10-15T10:00:00.000Z')});
  assert.equal(tender.status,'open');assert.equal(tender.invitations.length,2);assert.equal(tender.maxInvitations,4);
  assert.equal((await caseStore.get('case-1')).events.at(-1).type,'tender-opened');
  await assert.rejects(()=>openTender('case-1',{providerIds:Array.from({length:5},(_,i)=>`p-${i}`),deadline:'2026-11-01T18:00:00.000Z'},{caseStore,providerStore}),/cuatro/i);
  await assert.rejects(()=>openTender('case-1',{providerIds:[madrid.id],deadline:'2026-11-02T18:00:00.000Z'},{caseStore,providerStore}),/ronda/i);
});

test('professional sees only invited tenders and customer contact remains private',async()=>{
  const {caseStore,providerStore,madrid,sevilla}=await setup();
  await openTender('case-1',{providerIds:[madrid.id],deadline:'2026-11-01T18:00:00.000Z'},{caseStore,providerStore,now:()=>new Date('2026-10-15T10:00:00.000Z')});
  const visible=await listProviderTenders(madrid.id,{caseStore,now:()=>new Date('2026-10-16T10:00:00.000Z')});
  assert.equal(visible.length,1);assert.equal(visible[0].client,undefined);assert.equal(visible[0].project.location,'Madrid');
  assert.equal((await listProviderTenders(sevilla.id,{caseStore})).length,0);
});

test('invited professional submits a structured sealed bid and can revise it',async()=>{
  const {caseStore,providerStore,madrid}=await setup();
  await openTender('case-1',{providerIds:[madrid.id],deadline:'2026-11-01T18:00:00.000Z'},{caseStore,providerStore,now:()=>new Date('2026-10-15T10:00:00.000Z')});
  const first=await submitTenderBid('case-1',madrid.id,{amountNet:22000,vatRate:21,durationDays:30,availableFrom:'2026-11-10',validUntil:'2026-11-20',inclusions:'Material y montaje',exclusions:'Licencias',requiresVisit:true,offerType:'provisional'},{caseStore,now:()=>new Date('2026-10-16T10:00:00.000Z')});
  assert.equal(first.version,1);assert.equal(first.amountGross,26620);assert.equal(first.status,'submitted');
  const revised=await submitTenderBid('case-1',madrid.id,{amountNet:21500,vatRate:21,durationDays:28,availableFrom:'2026-11-10',validUntil:'2026-11-20',inclusions:'Material y montaje',exclusions:'Licencias',requiresVisit:false,offerType:'final',termsAccepted:true},{caseStore,now:()=>new Date('2026-10-17T10:00:00.000Z')});
  assert.equal(revised.version,2);assert.equal(revised.offerType,'final');
  assert.equal((await caseStore.get('case-1')).tender.bids.length,2);
});

test('a bid is rejected after deadline or without invitation',async()=>{
  const {caseStore,providerStore,madrid,sevilla}=await setup();
  await openTender('case-1',{providerIds:[madrid.id],deadline:'2026-11-01T18:00:00.000Z'},{caseStore,providerStore,now:()=>new Date('2026-10-15T10:00:00.000Z')});
  const input={amountNet:22000,vatRate:21,durationDays:30,availableFrom:'2026-11-10',validUntil:'2026-11-20',inclusions:'Todo',exclusions:'Nada',offerType:'provisional'};
  await assert.rejects(()=>submitTenderBid('case-1',sevilla.id,input,{caseStore}),/invitado/i);
  await assert.rejects(()=>submitTenderBid('case-1',madrid.id,input,{caseStore,now:()=>new Date('2026-11-02T10:00:00.000Z')}),/finalizado/i);
});

test('a final offer remains valid through the selected calendar day',async()=>{
 const {caseStore,providerStore,madrid}=await setup();
 await openTender('case-1',{providerIds:[madrid.id],deadline:'2026-11-01T18:00:00.000Z'},{caseStore,providerStore,now:()=>new Date('2026-10-15T10:00:00.000Z')});
 const bid=await submitTenderBid('case-1',madrid.id,{amountNet:22000,vatRate:21,durationDays:30,availableFrom:'2026-10-20',validUntil:'2026-10-16',inclusions:'Todo',offerType:'final',termsAccepted:true},{caseStore,now:()=>new Date('2026-10-16T10:00:00.000Z')});
 assert.equal(bid.validUntil,'2026-10-16T23:59:59.999Z');
});

test('admin can award only the latest final accepted offer and locks the tender',async()=>{
  const {caseStore,providerStore,madrid}=await setup();
  await openTender('case-1',{providerIds:[madrid.id],deadline:'2026-11-01T18:00:00.000Z'},{caseStore,providerStore,now:()=>new Date('2026-10-15T10:00:00.000Z')});
  const provisional=await submitTenderBid('case-1',madrid.id,{amountNet:22000,vatRate:21,durationDays:30,availableFrom:'2026-11-10',validUntil:'2026-11-20',inclusions:'Todo',exclusions:'Nada',offerType:'provisional'},{caseStore,now:()=>new Date('2026-10-16T10:00:00.000Z')});
  await assert.rejects(()=>awardTenderBid('case-1',provisional.id,{caseStore}),/final/i);
  const final=await submitTenderBid('case-1',madrid.id,{amountNet:21500,vatRate:21,durationDays:28,availableFrom:'2026-11-10',validUntil:'2026-11-20',inclusions:'Todo',exclusions:'Nada',offerType:'final',termsAccepted:true},{caseStore,now:()=>new Date('2026-10-17T10:00:00.000Z')});
  const tender=await awardTenderBid('case-1',final.id,{caseStore,now:()=>new Date('2026-10-18T10:00:00.000Z')});
  assert.equal(tender.status,'awarded');assert.equal(tender.awardedBidId,final.id);
  await assert.rejects(()=>submitTenderBid('case-1',madrid.id,{amountNet:21000,vatRate:21,durationDays:20,availableFrom:'2026-11-10',validUntil:'2026-11-20',inclusions:'Todo',exclusions:'Nada',offerType:'final',termsAccepted:true},{caseStore}),/cerrada/i);
});

test('tender invitation identifies the deadline and portal without exposing customer contact',()=>{
 const record=caseRecord({tender:{deadline:'2026-11-01T18:00:00.000Z'}}),provider={businessName:'Eléctrica Madrid',contactName:'Eva',email:'eva@example.com'};
 const message=tenderInvitationMessage({record,provider,siteUrl:'https://robotarq.com'});
 assert.match(message.subject,/ronda privada/i);assert.match(message.html,/1 de noviembre de 2026/i);assert.match(message.html,/profesionales\/panel/);assert.doesNotMatch(message.html,/cliente@example.com|600000000/);
});

test('professional review request records commercial qualification',async()=>{
 const { requestProfessionalReview }=await import('../lib/cases.mjs');
 const store=createMemoryCaseStore();await store.put({...caseRecord(),customerId:'customer-1'});
 const value=await requestProfessionalReview('case-1',{customerId:'customer-1',timeframe:'1-3-months',commitment:true,shareAnonymized:true,contactPreference:'phone',notes:'Necesito comparar ejecución completa.'},{store,notify:async()=>({ok:true})});
 assert.equal(value.assistanceRequest.shareAnonymized,true);
 assert.equal(value.assistanceRequest.contactPreference,'phone');
 assert.equal(value.assistanceRequest.notes,'Necesito comparar ejecución completa.');
 assert.equal(value.events.at(-1).type,'professional-review-requested');
});
