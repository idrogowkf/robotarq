import { createHash, createHmac, randomUUID, timingSafeEqual, createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { put, list, get, del } from '@vercel/blob';
import { professionalPdf, professionalWorkbook } from './documents.mjs';

const canonical=value=>JSON.stringify(value,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.entries(v).sort(([a],[b])=>a.localeCompare(b))):v);
const b64=value=>Buffer.from(value).toString('base64url');
const sign=(value,secret)=>b64(createHmac('sha256',secret).update(value).digest());
const safeEqual=(a,b)=>{const aa=Buffer.from(String(a)),bb=Buffer.from(String(b));return aa.length===bb.length&&timingSafeEqual(aa,bb);};
export const caseSecret=()=>{const value=process.env.CASE_ENCRYPTION_SECRET||'';if(value.length<32)throw new Error('CASE_ENCRYPTION_SECRET debe tener al menos 32 caracteres');return value;};

const estimatePayload=estimate=>{const value=structuredClone(estimate);delete value.estimateToken;return value;};
export function sealEstimate(estimate,secret=caseSecret()){
 if(!secret)throw new Error('Falta el secreto de expedientes');const hash=createHash('sha256').update(canonical(estimatePayload(estimate))).digest('hex');const exp=Date.now()+30*60*1000;const payload=b64(JSON.stringify({hash,exp}));return `${payload}.${sign(payload,secret)}`;
}
export function verifyEstimateSeal(estimate,token,secret=caseSecret()){
 if(!secret||!token)return false;const [payload,signature]=String(token).split('.');if(!payload||!safeEqual(signature,sign(payload,secret)))return false;
 try{const parsed=JSON.parse(Buffer.from(payload,'base64url').toString());return parsed.exp>Date.now()&&parsed.hash===createHash('sha256').update(canonical(estimatePayload(estimate))).digest('hex');}catch{return false;}
}
export function downloadGrant(id,secret=caseSecret(),ttlMs=24*60*60*1000){const payload=b64(JSON.stringify({id,exp:Date.now()+ttlMs}));return `${payload}.${sign(payload,secret)}`;}
export function verifyDownloadGrant(id,token,secret=caseSecret()){
 if(!secret||!token)return false;const [payload,signature]=String(token).split('.');if(!payload||!safeEqual(signature,sign(payload,secret)))return false;
 try{const value=JSON.parse(Buffer.from(payload,'base64url').toString());return value.id===id&&value.exp>Date.now();}catch{return false;}
}

function cipherKey(secret){return createHash('sha256').update(secret).digest();}
export function encryptCase(value,secret=caseSecret()){const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',cipherKey(secret),iv);const body=Buffer.concat([cipher.update(canonical(value)),cipher.final()]);return [b64(iv),b64(cipher.getAuthTag()),b64(body)].join('.');}
export function decryptCase(value,secret=caseSecret()){const [iv,tag,body]=String(value).split('.').map(v=>Buffer.from(v,'base64url'));const decipher=createDecipheriv('aes-256-gcm',cipherKey(secret),iv);decipher.setAuthTag(tag);return JSON.parse(Buffer.concat([decipher.update(body),decipher.final()]).toString());}

export function createMemoryCaseStore(){const records=new Map();return {async put(value){records.set(value.id,structuredClone(value));},async get(id){return records.has(id)?structuredClone(records.get(id)):null;},async list(){return [...records.values()].map(structuredClone);},async delete(id){records.delete(id);}};}
export const sharedTestCaseStore=globalThis.__robotarqTestCaseStore||(globalThis.__robotarqTestCaseStore=createMemoryCaseStore());
export function createBlobCaseStore({secret=caseSecret()}={}){return {
 async put(value){await put(`cases/${value.id}.case`,encryptCase(value,secret),{access:'public',contentType:'application/octet-stream',addRandomSuffix:false,allowOverwrite:true});},
 async get(id){const result=await get(`cases/${id}.case`,{access:'public'});if(!result)return null;return decryptCase(await new Response(result.stream).text(),secret);},
 async list(){const values=[];let cursor;do{const page=await list({prefix:'cases/',limit:1000,cursor});for(const blob of page.blobs){const result=await get(blob.pathname,{access:'public'});if(result)values.push(decryptCase(await new Response(result.stream).text(),secret));}cursor=page.hasMore?page.cursor:undefined;}while(cursor);return values;},
 async delete(id){await del(`cases/${id}.case`);}
};}

const clean=(value,max)=>String(value||'').trim().slice(0,max);
function validClient(client){const value={name:clean(client?.name,120),email:clean(client?.email,180).toLowerCase(),phone:clean(client?.phone,40),company:clean(client?.company,160),taxId:clean(client?.taxId,40)},digits=value.phone.replace(/\D/g,'');if(value.name.length<2||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email)||digits.length<7||digits.length>15)throw new Error('Datos del cliente incompletos');return value;}

export async function createCase(body,{store=createBlobCaseStore(),secret=caseSecret(),notify=async()=>({ok:true})}={}){
 if(!body?.privacy)throw new Error('Debes aceptar la información de privacidad');if(!verifyEstimateSeal(body.estimate,body.estimateToken,secret))throw new Error('El presupuesto ha cambiado o ha caducado');
 const now=new Date().toISOString(),id=randomUUID(),intent=body.intent==='assistance'?'assistance':'download';
 const record={id,createdAt:now,updatedAt:now,customerId:clean(body.customerId,80),client:validClient(body.client),intent,status:intent==='assistance'?'new-lead':'download-only',notes:'',estimate:structuredClone(body.estimate),events:[{at:now,type:'created',intent}]};
 const pdf=await professionalPdf(record),xlsx=await professionalWorkbook(record);record.files={pdf:Buffer.from(pdf).toString('base64'),xlsx:Buffer.from(xlsx).toString('base64')};record.documentVersion=2;
 const token=downloadGrant(id,secret),downloads=[`/api/cases/${id}/download/pdf?token=${encodeURIComponent(token)}`,`/api/cases/${id}/download/xlsx?token=${encodeURIComponent(token)}`];
 await store.put(record);try{await notify(record,{downloads});}catch{await store.delete?.(id);throw new Error('No se pudo notificar ni registrar el expediente');}
 return {id,status:record.status,downloadToken:token,downloads};
}
export async function getCase(id,{store=createBlobCaseStore()}={}){return store.get(id);}
export async function listCases({store=createBlobCaseStore()}={}){return (await store.list()).sort((a,b)=>b.createdAt.localeCompare(a.createdAt));}
export async function updateCase(id,patch,{store=createBlobCaseStore()}={}){const value=await store.get(id);if(!value)throw new Error('Expediente no encontrado');const allowed=['new-lead','download-only','contacted','in-review','discarded','converted'];if(patch.status&&allowed.includes(patch.status))value.status=patch.status;if(patch.notes!==undefined)value.notes=clean(patch.notes,4000);value.updatedAt=new Date().toISOString();if(patch.quoteRequest){value.status='in-review';value.quoteRequests=value.quoteRequests||[];value.quoteRequests.push({...patch.quoteRequest,sentAt:value.updatedAt,status:'sent'});value.events.push({at:value.updatedAt,type:'provider-quote-requested',provider:patch.quoteRequest.providerName});}else value.events.push({at:value.updatedAt,type:'admin-update',status:value.status});await store.put(value);return value;}
export async function refreshCaseDocuments(id,{store=createBlobCaseStore()}={}){const value=await store.get(id);if(!value)throw new Error('Expediente no encontrado');const pdf=await professionalPdf(value),xlsx=await professionalWorkbook(value);value.files={pdf:Buffer.from(pdf).toString('base64'),xlsx:Buffer.from(xlsx).toString('base64')};value.documentVersion=2;value.updatedAt=new Date().toISOString();value.events.push({at:value.updatedAt,type:'documents-regenerated',version:2});await store.put(value);return value;}
export async function requestProfessionalReview(id,input,{store=createBlobCaseStore(),notify=async()=>({ok:true})}={}){
 const value=await store.get(id);if(!value)throw new Error('Expediente no encontrado');if(value.customerId!==clean(input?.customerId,80))throw new Error('No tienes permiso sobre este expediente');
 if(value.assistanceRequest?.status==='received'||value.assistanceRequest?.status==='pending')return value;
 const allowed=['immediate','1-3-months','3-6-months','exploring'],timeframe=clean(input?.timeframe,30);if(!allowed.includes(timeframe)||input?.commitment!==true)throw new Error('Confirma el plazo y la intención real del proyecto');
 const requestId=randomUUID(),now=new Date().toISOString(),original={intent:value.intent,status:value.status};value.assistanceRequest={id:requestId,status:'pending',timeframe,requestedAt:now};value.updatedAt=now;await store.put(value);
 try{await notify(value);}catch{const current=await store.get(id);if(current?.assistanceRequest?.id===requestId){delete current.assistanceRequest;current.intent=original.intent;current.status=original.status;current.updatedAt=new Date().toISOString();await store.put(current);}throw new Error('No se pudo notificar la solicitud profesional');}
 const current=await store.get(id);current.intent='assistance';current.status='new-lead';current.assistanceRequest={...current.assistanceRequest,status:'received',confirmedAt:new Date().toISOString()};current.updatedAt=current.assistanceRequest.confirmedAt;current.events.push({at:current.updatedAt,type:'professional-review-requested',timeframe});await store.put(current);return current;
}
export async function anonymizeCase(id,{store=createBlobCaseStore()}={}){const value=await store.get(id);if(!value)throw new Error('Expediente no encontrado');value.client={name:'Anonimizado',email:'',phone:'',company:'',taxId:''};value.status='anonymized';value.updatedAt=new Date().toISOString();value.events.push({at:value.updatedAt,type:'anonymized'});const pdf=await professionalPdf(value),xlsx=await professionalWorkbook(value);value.files={pdf:Buffer.from(pdf).toString('base64'),xlsx:Buffer.from(xlsx).toString('base64')};value.documentVersion=2;await store.put(value);return value;}
