import { randomUUID } from 'node:crypto';
import { put,list,get } from '@vercel/blob';
import { encryptCase,decryptCase,caseSecret } from './cases.mjs';

const clean=(value,max=500)=>String(value||'').trim().slice(0,max);
export function normalizeProfessionalRequest(input={}){
 const now=new Date().toISOString();
 const value={id:clean(input.id,80)||`PRO-${randomUUID()}`,customerId:clean(input.customerId,80),customer:{name:clean(input.customer?.name,120),email:clean(input.customer?.email,180),phone:clean(input.customer?.phone,40)},service:clean(input.service,120),details:clean(input.details,3000),city:clean(input.city,120),postalCode:clean(input.postalCode,12),address:clean(input.address,300),timeframe:clean(input.timeframe,80),budgetRange:clean(input.budgetRange,80),shareSimilar:input.shareSimilar===true,targetProviderId:clean(input.targetProviderId,80),targetProviderName:clean(input.targetProviderName,160),status:clean(input.status,40)||'new',source:clean(input.source,80)||'direct-professional-request',createdAt:input.createdAt||now,updatedAt:now};
 if(!value.customerId||value.service.length<2||value.details.length<20||value.city.length<2)throw new Error('Completa el servicio, la descripción y la ubicación');
 return value;
}
export function createMemoryProfessionalRequestStore(){const values=new Map();return {async put(value){values.set(value.id,structuredClone(value));},async get(id){return values.has(id)?structuredClone(values.get(id)):null;},async list(){return [...values.values()].map(value=>structuredClone(value));}};}
export function createBlobProfessionalRequestStore({secret=caseSecret()}={}){return {async put(value){await put(`professional-requests/${value.id}.request`,encryptCase(value,secret),{access:'public',contentType:'application/octet-stream',addRandomSuffix:false,allowOverwrite:true});},async get(id){const result=await get(`professional-requests/${id}.request`,{access:'public'});return result?decryptCase(await new Response(result.stream).text(),secret):null;},async list(){const values=[];let cursor;do{const page=await list({prefix:'professional-requests/',limit:1000,cursor});for(const blob of page.blobs){const result=await get(blob.pathname,{access:'public'});if(result)values.push(decryptCase(await new Response(result.stream).text(),secret));}cursor=page.hasMore?page.cursor:undefined;}while(cursor);return values;}};}
export async function saveProfessionalRequest(input,{store=createBlobProfessionalRequestStore()}={}){const value=normalizeProfessionalRequest(input);await store.put(value);return value;}
export async function listProfessionalRequests({store=createBlobProfessionalRequestStore(),customerId}={}){const values=await store.list();return values.filter(value=>!customerId||value.customerId===customerId).sort((a,b)=>b.createdAt.localeCompare(a.createdAt));}
