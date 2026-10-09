import { NextResponse } from 'next/server';
export async function POST(){return NextResponse.json({ok:false,error:'Usa el registro seguro de expedientes.'},{status:410});}
