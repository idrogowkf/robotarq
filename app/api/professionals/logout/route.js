import { NextResponse } from 'next/server';import { PROFESSIONAL_COOKIE } from '@/lib/professional-auth.mjs';
export async function POST(){const response=NextResponse.json({ok:true});response.cookies.set(PROFESSIONAL_COOKIE,'',{httpOnly:true,path:'/',maxAge:0});return response;}
