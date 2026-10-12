import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { isAdminRequest } from '@/lib/admin-auth.mjs';
import { getCase, updateCase } from '@/lib/cases.mjs';
import { getProvider } from '@/lib/providers.mjs';
import { sendProviderQuote } from '@/lib/provider-email.mjs';
import { readBody } from '@/lib/api.mjs';
export async function POST(req,{params}){if(!isAdminRequest(req))return NextResponse.json({ok:false},{status:401});try{const {id}=await params,{providerId}=await readBody(req),record=await getCase(id),provider=await getProvider(providerId);if(!record||!provider)throw new Error('Expediente o proveedor no encontrado');if(provider.status!=='active')throw new Error('El proveedor está inactivo');const adminEmail=process.env.ADMIN_EMAIL||'info@robotarq.com',adminPhone=process.env.ROBOTARQ_ADMIN_PHONE||'+34 624 473 123',from=process.env.ROBOTARQ_PROVIDER_FROM||'robotARQ Proveedores <proveedores@robotarq.com>';const sent=await sendProviderQuote(new Resend(process.env.RESEND_API_KEY),{record,provider,from,adminEmail,adminPhone});await updateCase(id,{quoteRequest:{providerId:provider.id,providerName:provider.businessName,providerEmail:provider.email,messageId:sent.messageId}});return NextResponse.json({ok:true});}catch(error){return NextResponse.json({ok:false,error:error.message||'No se pudo enviar la solicitud.'},{status:422});}}
