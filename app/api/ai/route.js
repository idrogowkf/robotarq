import { NextResponse } from 'next/server';
export async function POST(){return NextResponse.json({ok:false,error:'Esta ruta ha sido retirada. Usa el estimador o el formulario de contacto actual.'},{status:410});}
