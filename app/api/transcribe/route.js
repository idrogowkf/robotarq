import {NextResponse} from 'next/server';import {gate,event} from '@/lib/api.mjs';import {transcribeAudio} from '@/lib/transcription.mjs';
export async function POST(req){const blocked=gate(req,12);if(blocked)return blocked;try{const form=await req.formData(),audio=form.get('audio');if(!(audio instanceof File))throw new Error('No se recibió audio');const text=await transcribeAudio(audio);await event('voice_transcribed',{},req);return NextResponse.json({ok:true,text});}catch(error){return NextResponse.json({ok:false,error:error.message||'No se pudo procesar el dictado.'},{status:422});}}

