import { NextResponse } from 'next/server';
import { documentData, xlsxBuffer } from '@/lib/documents.mjs';
import { gate, readBody, invalid, event } from '@/lib/api.mjs';
export const runtime='nodejs';
export async function POST(req){
 const blocked=gate(req);if(blocked)return blocked;
 let data;try{data=documentData(await readBody(req));}catch{return invalid();}
 try{const buffer=await xlsxBuffer(data);await event('export_success',{format:'xlsx'},req);return new NextResponse(buffer,{headers:{'Content-Type':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','Content-Disposition':'attachment; filename="Estimacion_robotARQ.xlsx"','Cache-Control':'no-store'}});}catch{await event('export_error',{format:'xlsx'},req);return NextResponse.json({ok:false,error:'No se pudo generar el documento.'},{status:500});}
}
