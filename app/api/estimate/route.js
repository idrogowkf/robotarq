import { NextResponse } from 'next/server';
import { estimate } from '@/lib/estimate.mjs';
import { gate, readBody, invalid, event } from '@/lib/api.mjs';
export async function POST(req){
 const blocked=gate(req);if(blocked)return blocked;
 try{const data=estimate(await readBody(req));await event(data.ok?'estimate_success':'estimate_needs_details',{},req);return NextResponse.json(data,{status:data.ok?200:422});}catch{return invalid();}
}
