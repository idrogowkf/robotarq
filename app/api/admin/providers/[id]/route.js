import { NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth.mjs';
import { deleteProvider, getProvider, saveProvider } from '@/lib/providers.mjs';
import { readBody } from '@/lib/api.mjs';
export async function GET(req,{params}){if(!isAdminRequest(req))return NextResponse.json({ok:false},{status:401});const {id}=await params,value=await getProvider(id);return value?NextResponse.json({ok:true,provider:value}):NextResponse.json({ok:false},{status:404});}
export async function PATCH(req,{params}){if(!isAdminRequest(req))return NextResponse.json({ok:false},{status:401});try{const {id}=await params,current=await getProvider(id);if(!current)return NextResponse.json({ok:false},{status:404});return NextResponse.json({ok:true,provider:await saveProvider({...current,...await readBody(req),id})});}catch(error){return NextResponse.json({ok:false,error:error.message},{status:422});}}
export async function DELETE(req,{params}){if(!isAdminRequest(req))return NextResponse.json({ok:false},{status:401});const {id}=await params;await deleteProvider(id);return NextResponse.json({ok:true});}
