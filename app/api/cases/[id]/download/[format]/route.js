import { NextResponse } from 'next/server';
import { createBlobCaseStore, sharedTestCaseStore, verifyDownloadGrant } from '@/lib/cases.mjs';
import { gate } from '@/lib/api.mjs';

export const runtime='nodejs';
export async function GET(req,{params}){const blocked=gate(req,20);if(blocked)return blocked;const {id,format}=await params,token=new URL(req.url).searchParams.get('token');if(!verifyDownloadGrant(id,token))return NextResponse.json({ok:false,error:'Enlace de descarga inválido o caducado.'},{status:403});
 const testing=process.env.VERCEL_ENV!=='production'&&req.headers.get('x-robotarq-test')==='1',record=await (testing?sharedTestCaseStore:createBlobCaseStore()).get(id);if(!record)return NextResponse.json({ok:false,error:'Expediente no encontrado.'},{status:404});
 if(format==='pdf'&&record.files?.pdf){return new NextResponse(Buffer.from(record.files.pdf,'base64'),{headers:{'Content-Type':'application/pdf','Content-Disposition':`attachment; filename="robotARQ-${id}.pdf"`,'Cache-Control':'private, no-store'}});}
 if(format==='xlsx'&&record.files?.xlsx){return new NextResponse(Buffer.from(record.files.xlsx,'base64'),{headers:{'Content-Type':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','Content-Disposition':`attachment; filename="robotARQ-${id}.xlsx"`,'Cache-Control':'private, no-store'}});}
 return NextResponse.json({ok:false,error:'Formato no admitido.'},{status:404});}
