import { NextResponse } from 'next/server';
import { gate,readBody } from '@/lib/api.mjs';
import { professionalSessionFromRequest } from '@/lib/professional-auth.mjs';
import { submitTenderBid } from '@/lib/tenders.mjs';
export async function POST(req,{params}){const limited=gate(req,30);if(limited)return limited;const session=professionalSessionFromRequest(req);if(!session)return NextResponse.json({ok:false},{status:401});try{const {id}=await params,bid=await submitTenderBid(id,session.providerId,await readBody(req));return NextResponse.json({ok:true,bid},{status:201});}catch(error){return NextResponse.json({ok:false,error:error.message||'No se pudo registrar la oferta.'},{status:422});}}
