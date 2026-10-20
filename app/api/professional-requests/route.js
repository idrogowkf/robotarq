import { NextResponse } from 'next/server';
import { customerSessionFromRequest } from '@/lib/customer-auth.mjs';
import { getCustomer,customerPublic } from '@/lib/customers.mjs';
import { gate,readBody } from '@/lib/api.mjs';
import { listProfessionalRequests,saveProfessionalRequest } from '@/lib/professional-requests.mjs';

export async function GET(req){const session=customerSessionFromRequest(req);if(!session)return NextResponse.json({ok:false},{status:401});return NextResponse.json({ok:true,requests:await listProfessionalRequests({customerId:session.customerId})});}
export async function POST(req){const blocked=gate(req,8);if(blocked)return blocked;const session=customerSessionFromRequest(req);if(!session)return NextResponse.json({ok:false,error:'Inicia sesión o crea una cuenta para enviar la solicitud.'},{status:401});try{const body=await readBody(req);if(body.privacy!==true||body.commitment!==true)throw new Error('Confirma la solicitud y la información de privacidad');const customer=await getCustomer(session.customerId);if(!customer)throw new Error('Cuenta no encontrada');const request=await saveProfessionalRequest({...body,customerId:customer.id,customer:customerPublic(customer)});return NextResponse.json({ok:true,request},{status:201});}catch(error){return NextResponse.json({ok:false,error:error.message||'No se pudo registrar la solicitud.'},{status:422});}}
