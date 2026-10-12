import { NextResponse } from 'next/server';
import { isAdminRequest, filterCases, casesCsv } from '@/lib/admin-auth.mjs';
import { listCases } from '@/lib/cases.mjs';
export async function GET(req){if(!isAdminRequest(req))return NextResponse.json({ok:false,error:'No autorizado.'},{status:401});const url=new URL(req.url),values=filterCases(await listCases(),Object.fromEntries(['q','intent','status','type','from','to'].map(key=>[key,url.searchParams.get(key)])));if(url.searchParams.get('format')==='csv')return new NextResponse('\ufeff'+casesCsv(values),{headers:{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="robotarq-expedientes.csv"'}});return NextResponse.json({ok:true,cases:values});}
