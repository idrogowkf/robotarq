import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { randomUUID } from 'node:crypto';
const buckets=new Map();
export function gate(req,limit=60){
 const origin=req.headers.get('origin');const url=new URL(req.url);
 if(origin&&origin!==url.origin&&origin!=='https://robotarq.com'&&origin!=='https://www.robotarq.com')return NextResponse.json({ok:false,error:'Origen no permitido.'},{status:403});
 const ip=req.headers.get('x-vercel-forwarded-for')||req.headers.get('x-forwarded-for')||'local';const key=url.pathname+':'+ip;const now=Date.now();
 for(const [k,v] of buckets)if(now-v.start>900000)buckets.delete(k);
 const bucket=buckets.get(key)||{start:now,count:0};bucket.count++;buckets.set(key,bucket);
 if(bucket.count>limit)return NextResponse.json({ok:false,error:'Demasiadas solicitudes. Inténtalo en 15 minutos.'},{status:429,headers:{'Retry-After':'900'}});
 if(buckets.size>10000)return NextResponse.json({ok:false,error:'Servicio temporalmente ocupado.'},{status:503});
 return null;
}
export async function readBody(req){
 if(!req.headers.get('content-type')?.includes('application/json'))throw new Error('Se requiere JSON.');
 const raw=await req.text();if(raw.length>64000)throw new Error('Solicitud demasiado grande.');
 const body=JSON.parse(raw);if(!body||typeof body!=='object'||Array.isArray(body))throw new Error('Solicitud inválida.');return body;
}
export function invalid(){return NextResponse.json({ok:false,error:'Datos inválidos. Revisa la solicitud.'},{status:400});}
export async function event(name,fields={},req){
 const record={event:name,timestamp:new Date().toISOString(),version:'pilot-v1',format:fields.format||undefined};
 console.info(JSON.stringify(record));
 if(process.env.VERCEL_ENV!=='production'||!process.env.BLOB_READ_WRITE_TOKEN||req?.headers.get('x-robotarq-test')==='1')return;
 try{await put(`robotarq-metrics/${record.timestamp.slice(0,10)}/${randomUUID()}.json`,JSON.stringify(record),{access:'public',contentType:'application/json',addRandomSuffix:false});}
 catch{console.error(JSON.stringify({event:'metrics_write_error'}));}
}
