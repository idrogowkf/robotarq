import {randomUUID} from 'node:crypto';
import {NextResponse} from 'next/server';
import {Resend} from 'resend';
import {gate,readBody} from '@/lib/api.mjs';
import {createProfessionalPasswordResetToken} from '@/lib/professional-auth.mjs';
import {findProviderByEmail,saveProvider} from '@/lib/providers.mjs';
import {sendPasswordResetEmail} from '@/lib/customer-email.mjs';

const generic='Si existe una cuenta profesional con ese correo, recibirás un enlace en unos minutos.';
export async function POST(req){const blocked=gate(req,5);if(blocked)return blocked;try{const body=await readBody(req),provider=await findProviderByEmail(body.email);if(provider){provider.resetNonce=randomUUID();const saved=await saveProvider(provider),token=createProfessionalPasswordResetToken(saved),site=process.env.NEXT_PUBLIC_SITE_URL||'https://robotarq.com';if(!process.env.RESEND_API_KEY)throw new Error('Correo no disponible');await sendPasswordResetEmail(new Resend(process.env.RESEND_API_KEY),{to:saved.email,name:saved.contactName||saved.businessName,resetUrl:`${site}/profesionales/restablecer-clave?token=${encodeURIComponent(token)}`,from:(process.env.RESEND_FROM||'robotARQ <hola@robotarq.com>').replace(/^"+|"+$/g,'')})}return NextResponse.json({ok:true,message:generic})}catch{return NextResponse.json({ok:true,message:generic})}}
