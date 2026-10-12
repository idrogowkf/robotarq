import { randomUUID } from 'node:crypto';
import { put, list, get, del } from '@vercel/blob';
import { encryptCase, decryptCase, caseSecret } from './cases.mjs';

const clean=(value,max=300)=>String(value||'').trim().slice(0,max);
export function normalizeProvider(input={}){
 const value={id:clean(input.id,80)||randomUUID(),businessName:clean(input.businessName,160),contactName:clean(input.contactName,120),email:clean(input.email,180).toLowerCase(),phone:clean(input.phone,40),specialties:clean(input.specialties,500),provinces:clean(input.provinces,300),notes:clean(input.notes,2000),status:input.status==='inactive'?'inactive':'active'};
 if(value.businessName.length<2||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email))throw new Error('Nombre y correo del proveedor son obligatorios');
 return value;
}
export function createMemoryProviderStore(){const values=new Map();return {async put(v){values.set(v.id,structuredClone(v));},async get(id){return values.has(id)?structuredClone(values.get(id)):null;},async list(){return [...values.values()].map(value=>structuredClone(value));},async delete(id){values.delete(id);}};}
export function createBlobProviderStore({secret=caseSecret()}={}){return {
 async put(value){await put(`providers/${value.id}.provider`,encryptCase(value,secret),{access:'public',contentType:'application/octet-stream',addRandomSuffix:false,allowOverwrite:true});},
 async get(id){const result=await get(`providers/${id}.provider`,{access:'public'});return result?decryptCase(await new Response(result.stream).text(),secret):null;},
 async list(){const values=[];let cursor;do{const page=await list({prefix:'providers/',limit:1000,cursor});for(const blob of page.blobs){const result=await get(blob.pathname,{access:'public'});if(result)values.push(decryptCase(await new Response(result.stream).text(),secret));}cursor=page.hasMore?page.cursor:undefined;}while(cursor);return values;},
 async delete(id){await del(`providers/${id}.provider`);}
};}
export async function saveProvider(input,{store=createBlobProviderStore()}={}){const now=new Date().toISOString(),prior=input.id?await store.get(input.id):null,value={...normalizeProvider(input),createdAt:prior?.createdAt||now,updatedAt:now};await store.put(value);return value;}
export async function listProviders({store=createBlobProviderStore(),page=1,pageSize=20,q=''}={}){const needle=clean(q,100).toLowerCase(),all=(await store.list()).filter(v=>!needle||[v.businessName,v.contactName,v.email,v.specialties,v.provinces].join(' ').toLowerCase().includes(needle)).sort((a,b)=>a.businessName.localeCompare(b.businessName,'es'));const safePage=Math.max(1,Number(page)||1),size=Math.min(100,Math.max(1,Number(pageSize)||20));return {items:all.slice((safePage-1)*size,safePage*size),page:safePage,pageSize:size,total:all.length,pages:Math.max(1,Math.ceil(all.length/size))};}
export async function getProvider(id,{store=createBlobProviderStore()}={}){return store.get(id);}
export async function deleteProvider(id,{store=createBlobProviderStore()}={}){return store.delete(id);}
