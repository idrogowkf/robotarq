import {NextResponse} from 'next/server';
import {gate,readBody} from '@/lib/api.mjs';
import {verifyProfessionalPasswordResetToken} from '@/lib/professional-auth.mjs';
import {getProvider,hashProviderPassword,saveProvider} from '@/lib/providers.mjs';

export async function POST(req){const blocked=gate(req,8);if(blocked)return blocked;try{const body=await readBody(req);if(body.password!==body.confirmPassword)throw new Error('Las contraseñas no coinciden');const payload=verifyProfessionalPasswordResetToken(body.token);if(!payload)throw new Error('El enlace ha caducado o no es válido');const provider=await getProvider(payload.providerId);if(!provider||provider.email!==payload.email||provider.resetNonce!==payload.nonce)throw new Error('El enlace ya fue utilizado o no es válido');await saveProvider({...provider,passwordHash:hashProviderPassword(body.password),resetNonce:''});return NextResponse.json({ok:true})}catch(error){return NextResponse.json({ok:false,error:error.message||'No se pudo cambiar la contraseña.'},{status:422})}}
