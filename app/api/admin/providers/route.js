import { NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth.mjs';
import { listProviders, saveProvider } from '@/lib/providers.mjs';
import { readBody } from '@/lib/api.mjs';
export async function GET(req){if(!isAdminRequest(req))return NextResponse.json({ok:false},{status:401});const u=new URL(req.url),result=await listProviders({page:u.searchParams.get('page'),q:u.searchParams.get('q')});return NextResponse.json({ok:true,...result});}
export async function POST(req){if(!isAdminRequest(req))return NextResponse.json({ok:false},{status:401});try{return NextResponse.json({ok:true,provider:await saveProvider(await readBody(req))});}catch(error){return NextResponse.json({ok:false,error:error.message},{status:422});}}
