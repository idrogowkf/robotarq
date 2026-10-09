import { NextResponse } from 'next/server';
import { estimateRequest, generateProjectBudget } from '@/lib/project-estimate.mjs';
import { gate, readBody, invalid, event } from '@/lib/api.mjs';
export async function POST(req){
 const blocked=gate(req);if(blocked)return blocked;
 try{const data=await estimateRequest(await readBody(req),{generate:generateProjectBudget,fallbackOnInvalid:true});await event(data.ok?'estimate_success':'estimate_needs_details',{scope:data.meta?.scope||'items'},req);return NextResponse.json(data,{status:data.ok?200:422});}catch{return invalid();}
}
