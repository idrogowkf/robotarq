import { NextResponse } from 'next/server';
export async function POST(){return NextResponse.json({ok:false,error:'Registra el expediente para desbloquear el PDF.'},{status:410});}
