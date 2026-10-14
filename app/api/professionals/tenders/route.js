import { NextResponse } from 'next/server';
import { professionalSessionFromRequest } from '@/lib/professional-auth.mjs';
import { listProviderTenders } from '@/lib/tenders.mjs';
export async function GET(req){const session=professionalSessionFromRequest(req);if(!session)return NextResponse.json({ok:false},{status:401});return NextResponse.json({ok:true,tenders:await listProviderTenders(session.providerId)});}
