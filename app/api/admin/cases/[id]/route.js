import { NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth.mjs';
import { getCase, updateCase, anonymizeCase, refreshCaseDocuments } from '@/lib/cases.mjs';
import { readBody } from '@/lib/api.mjs';
export async function GET(req,{params}){if(!isAdminRequest(req))return NextResponse.json({ok:false},{status:401});const {id}=await params,value=await getCase(id);return value?NextResponse.json({ok:true,case:value}):NextResponse.json({ok:false},{status:404});}
export async function PATCH(req,{params}){if(!isAdminRequest(req))return NextResponse.json({ok:false},{status:401});const {id}=await params,body=await readBody(req);try{const value=body.action==='anonymize'?await anonymizeCase(id):body.action==='regenerate-documents'?await refreshCaseDocuments(id):await updateCase(id,body);return NextResponse.json({ok:true,case:value});}catch(error){return NextResponse.json({ok:false,error:error.message},{status:422});}}
