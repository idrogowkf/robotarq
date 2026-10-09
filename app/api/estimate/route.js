import { NextResponse } from 'next/server';
import { interpretProject } from '@/lib/ai-estimator.mjs';
import { gate, readBody, invalid, event } from '@/lib/api.mjs';
export async function POST(req){
 const blocked=gate(req);if(blocked)return blocked;
 try{const data=await interpretProject(await readBody(req));await event(data.ok?'estimate_success':'estimate_needs_details',{scope:data.meta?.scope||'ai'},req);return NextResponse.json(data,{status:data.status|| (data.ok?200:422)});}catch{return invalid();}
}
