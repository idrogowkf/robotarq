import { NextResponse } from 'next/server';import { listPublicProviders } from '@/lib/providers.mjs';
export async function GET(req){const url=new URL(req.url);return NextResponse.json({ok:true,...await listPublicProviders({q:url.searchParams.get('q'),page:url.searchParams.get('page')})});}
