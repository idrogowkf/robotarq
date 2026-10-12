import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createCase, createBlobCaseStore, sharedTestCaseStore } from '@/lib/cases.mjs';
import { gate, readBody, invalid, event } from '@/lib/api.mjs';
import { deliverCaseEmails } from '@/lib/case-email.mjs';

async function notifyCase(record,{downloads},skip){if(skip)return {ok:true};if(!process.env.RESEND_API_KEY)throw new Error('Correo no disponible');return deliverCaseEmails(new Resend(process.env.RESEND_API_KEY),{record,downloads,owner:(process.env.OWNER_EMAIL||process.env.RESEND_OWNER||'hola@robotarq.com').replace(/^"+|"+$/g,'').trim(),from:(process.env.RESEND_FROM||'robotARQ <hola@robotarq.com>').replace(/^"+|"+$/g,''),siteUrl:process.env.NEXT_PUBLIC_SITE_URL||'https://robotarq.com'});}
export async function POST(req){const blocked=gate(req,8);if(blocked)return blocked;try{const body=await readBody(req,256000),testing=process.env.VERCEL_ENV!=='production'&&req.headers.get('x-robotarq-test')==='1';const result=await createCase(body,{store:testing?sharedTestCaseStore:createBlobCaseStore(),notify:(record,context)=>notifyCase(record,context,testing)});await event('case_created',{intent:body.intent},req);return NextResponse.json({ok:true,...result});}catch(error){return NextResponse.json({ok:false,error:error?.message||'No se pudo crear el expediente.'},{status:422});}}
