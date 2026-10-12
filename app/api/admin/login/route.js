import { NextResponse } from 'next/server';
import { gate, readBody } from '@/lib/api.mjs';
import { ADMIN_COOKIE, adminSecret, createAdminSession, verifyAdminCredentials } from '@/lib/admin-auth.mjs';
export async function POST(req){const blocked=gate(req,5);if(blocked)return blocked;try{const {email,password}=await readBody(req);if(!verifyAdminCredentials(email,password))return NextResponse.json({ok:false,error:'Correo o clave incorrectos.'},{status:401});const response=NextResponse.json({ok:true});response.cookies.set(ADMIN_COOKIE,createAdminSession(adminSecret()),{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',path:'/',maxAge:8*60*60});return response;}catch{return NextResponse.json({ok:false,error:'Acceso no disponible.'},{status:503});}}
