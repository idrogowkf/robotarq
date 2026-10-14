import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { isAdminRequest } from '@/lib/admin-auth.mjs';
import { readBody } from '@/lib/api.mjs';
import { getCase } from '@/lib/cases.mjs';
import { getProvider } from '@/lib/providers.mjs';
import { awardTenderBid, matchProvidersForCase, openTender } from '@/lib/tenders.mjs';
import { sendTenderInvitation } from '@/lib/tender-email.mjs';

export async function GET(req,{params}){if(!isAdminRequest(req))return NextResponse.json({ok:false},{status:401});const {id}=await params,record=await getCase(id);if(!record)return NextResponse.json({ok:false},{status:404});return NextResponse.json({ok:true,tender:record.tender||null,matches:await matchProvidersForCase(record)});}
export async function POST(req,{params}){if(!isAdminRequest(req))return NextResponse.json({ok:false},{status:401});try{const {id}=await params,body=await readBody(req),tender=await openTender(id,body),record=await getCase(id),resend=new Resend(process.env.RESEND_API_KEY),from=process.env.ROBOTARQ_PROVIDER_FROM||'robotARQ Proveedores <proveedores@robotarq.com>',siteUrl=process.env.NEXT_PUBLIC_SITE_URL||'https://robotarq.com',deliveries=[];for(const invitation of tender.invitations){const provider=await getProvider(invitation.providerId);try{const sent=await sendTenderInvitation(resend,{record,provider,from,siteUrl});deliveries.push({providerId:provider.id,ok:true,messageId:sent.messageId});}catch(error){deliveries.push({providerId:provider.id,ok:false,error:error.message});}}return NextResponse.json({ok:true,tender,deliveries},{status:201});}catch(error){return NextResponse.json({ok:false,error:error.message||'No se pudo abrir la ronda.'},{status:422});}}
export async function PATCH(req,{params}){if(!isAdminRequest(req))return NextResponse.json({ok:false},{status:401});try{const {id}=await params,body=await readBody(req);if(body.action!=='award')throw new Error('Acción no permitida');return NextResponse.json({ok:true,tender:await awardTenderBid(id,body.bidId)});}catch(error){return NextResponse.json({ok:false,error:error.message||'No se pudo adjudicar.'},{status:422});}}
