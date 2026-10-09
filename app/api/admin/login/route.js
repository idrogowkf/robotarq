import { NextResponse } from 'next/server';
import { gate, readBody } from '@/lib/api.mjs';
import { ADMIN_COOKIE, adminSecret, createAdminSession, verifyAdminPassword } from '@/lib/admin-auth.mjs';
export async function POST(req){const blocked=gate(req,5);if(blocked)return blocked;try{const {password}=await readBody(req);if(!verifyAdminPassword(password,process.env.ADMIN_PASSWORD))return NextResponse.json({ok:false,error:'Clave incorrecta.'},{status:401});const response=NextResponse.json({ok:true});response.cookies.set(ADMIN_COOKIE,createAdminSession(adminSecret()),{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',path:'/',maxAge:8*60*60});return response;}catch{return NextResponse.json({ok:false,error:'Acceso no disponible.'},{status:503});}}
