import { createHmac, timingSafeEqual } from 'node:crypto';
export const PROFESSIONAL_COOKIE='robotarq_professional';
const b64=value=>Buffer.from(value).toString('base64url');
const sign=(value,secret)=>b64(createHmac('sha256',secret).update(value).digest());
const equal=(a,b)=>{const aa=Buffer.from(String(a)),bb=Buffer.from(String(b));return aa.length===bb.length&&timingSafeEqual(aa,bb);};
export const professionalSecret=()=>process.env.PROFESSIONAL_SESSION_SECRET||process.env.ADMIN_SESSION_SECRET||'';
export function createProfessionalSession(provider,secret=professionalSecret(),ttlMs=7*24*60*60*1000){if(!secret)throw new Error('Falta secreto de sesión');const payload=b64(JSON.stringify({role:'professional',providerId:provider.id,email:provider.email,exp:Date.now()+ttlMs}));return `${payload}.${sign(payload,secret)}`;}
export function verifyProfessionalSession(token,secret=professionalSecret()){if(!token||!secret)return null;const [payload,sig]=String(token).split('.');if(!payload||!equal(sig,sign(payload,secret)))return null;try{const value=JSON.parse(Buffer.from(payload,'base64url').toString());return value.role==='professional'&&value.providerId&&value.exp>Date.now()?value:null;}catch{return null;}}
export const professionalSessionFromRequest=req=>verifyProfessionalSession(req.cookies.get(PROFESSIONAL_COOKIE)?.value);
export function createProfessionalPasswordResetToken(provider,secret=professionalSecret(),ttlMs=30*60*1000){if(!secret)throw new Error('Falta secreto de recuperación');const payload=b64(JSON.stringify({purpose:'professional-password-reset',providerId:provider.id,email:provider.email,nonce:provider.resetNonce,exp:Date.now()+ttlMs}));return `${payload}.${sign(payload,secret)}`;}
export function verifyProfessionalPasswordResetToken(token,secret=professionalSecret()){if(!token||!secret)return null;const [payload,sig]=String(token).split('.');if(!payload||!equal(sig,sign(payload,secret)))return null;try{const value=JSON.parse(Buffer.from(payload,'base64url').toString());return value.purpose==='professional-password-reset'&&value.providerId&&value.nonce&&value.exp>Date.now()?value:null;}catch{return null;}}
