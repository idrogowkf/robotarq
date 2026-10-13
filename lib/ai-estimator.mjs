import { round } from './estimate.mjs';

const UNITS=new Set(['m2','m²','m','ml','ud','pa','h']);
const arr=value=>Array.isArray(value)?value:Object.values(value||{});
const text=(value,max=300)=>String(value||'').trim().slice(0,max);
const normalized=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export function missingPrefabricatedSystem(prompt){const value=normalized(prompt);return /prefabricad/.test(value)&&!/(?:hormigon|madera|acero|steel framing|entramado ligero|panel(?:es)? sip|contenedor|modul(?:ar|o)|sistema mixto|no lo se|no se que sistema|recomiendame|recomienda un sistema)/.test(value);}

export function validateEstimate(raw,input={}){
 if(!raw||typeof raw!=='object')throw new Error('Respuesta de presupuesto inválida');
 const project={
  title:text(raw.project?.title||'Proyecto de construcción',140),
  summary:text(raw.project?.summary||input.prompt,1200),
  projectType:text(raw.project?.projectType||input.tipo||'proyecto',100),
  location:text(raw.project?.location||input.ciudad,120),
  areaM2:Number.isFinite(Number(raw.project?.areaM2))&&Number(raw.project.areaM2)>0?round(Number(raw.project.areaM2)):null,
  quality:text(raw.project?.quality||'por definir',80)
 };
 const chapters={};let itemCount=0;
 for(const [chapterIndex,chapter] of arr(raw.chapters).slice(0,20).entries()){
  if(!chapter||!Array.isArray(chapter.items)||!chapter.items.length)continue;
  const items=[];
  for(const [itemIndex,item] of chapter.items.entries()){
   itemCount++;if(itemCount>200)throw new Error('Demasiadas partidas');
   const unit=text(item.unit,5).toLowerCase();if(!UNITS.has(unit))throw new Error('Unidad no admitida');
   const qty=Number(item.qty),price=Number(item.price);
   if(!Number.isFinite(qty)||qty<=0||qty>100000||!Number.isFinite(price)||price<0||price>1000000)throw new Error('Cantidad o precio inválido');
   items.push({code:text(item.code||`P${chapterIndex+1}-${itemIndex+1}`,18),desc:text(item.desc,320),unit:unit==='m²'?'m2':unit,qty:round(qty),price:round(price),amount:round(qty*price)});
  }
  const code=text(chapter.code||`CH-${chapterIndex+1}`,18);const key=code.replace(/^CH-/i,'')||String(chapterIndex+1);chapters[key]={code,name:text(chapter.name||`Capítulo ${chapterIndex+1}`,120),items,total:round(items.reduce((sum,item)=>sum+item.amount,0))};
 }
 if(!itemCount)throw new Error('Presupuesto sin partidas');
 const direct=round(Object.values(chapters).reduce((sum,chapter)=>sum+chapter.total,0));
 const extras=[
  {code:'MA',desc:'Medios auxiliares y seguridad (5%)',unit:'%',qty:5,price:direct,amount:round(direct*.05)},
  {code:'GG',desc:'Gastos generales (10%)',unit:'%',qty:10,price:direct,amount:round(direct*.10)}
 ];
 const industrialBase=round(direct+extras.reduce((sum,item)=>sum+item.amount,0));
 extras.push({code:'BI',desc:'Beneficio industrial (10%)',unit:'%',qty:10,price:industrialBase,amount:round(industrialBase*.10)});
 const total=round(direct+extras.reduce((sum,item)=>sum+item.amount,0));
 if(total<=0||total>20000000)throw new Error('Total fuera de límites');
 return {
  project,
  assumptions:arr(raw.assumptions).map(v=>text(v,300)).filter(Boolean).slice(0,20),
  exclusions:arr(raw.exclusions).map(v=>text(v,300)).filter(Boolean).slice(0,20),
  confidence:['baja','media','alta'].includes(text(raw.confidence,10).toLowerCase())?text(raw.confidence,10).toLowerCase():'media',
  budget:{chapters,subtotal:direct,extras,total},
  market:[
   {key:'economico',label:'Escenario económico',amount:round(total*.9),note:'Calidades funcionales y contratación favorable.'},
   {key:'probable',label:'Escenario probable',amount:total,note:'Calidades medias y condiciones habituales.'},
   {key:'superior',label:'Escenario superior',amount:round(total*1.15),note:'Mayor complejidad, calidades o tensión de mercado.'}
  ]
 };
}

function timeoutCall(run,ms){const controller=new AbortController();let timer;return Promise.race([run(controller.signal),new Promise((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(new Error('timeout'));},ms);})]).finally(()=>clearTimeout(timer));}

export async function interpretProject(input,{generate=generateWithOpenAI,timeoutMs=85000}={}){
 const prompt=text(input?.prompt,8000);if(!prompt)return {ok:false,status:400,error:'Describe el proyecto que quieres presupuestar.'};
 if(missingPrefabricatedSystem(prompt))return {ok:false,status:422,error:'Necesitamos definir el sistema constructivo de la vivienda prefabricada.',questions:['¿Qué sistema prefabricado quieres presupuestar: hormigón, madera, acero ligero, paneles SIP, contenedores u otro?']};
 try{
  const raw=await timeoutCall(signal=>generate({tipo:text(input.tipo,80),ciudad:text(input.ciudad,120),prompt,signal}),timeoutMs);
  const questions=arr(raw?.questions).map(v=>text(v,300)).filter(Boolean).slice(0,6);
  if(questions.length&&arr(raw?.chapters).length===0)return {ok:false,status:422,error:'Necesitamos concretar algunos datos del proyecto.',questions,project:raw.project||null};
  const result=validateEstimate(raw,{...input,prompt});
  return {ok:true,status:200,meta:{source:'ai-structured-estimate',scope:'professional-preliminary',model:process.env.OPENAI_MODEL||'gpt-5.4'},...result,warnings:['Estimación preliminar orientativa: requiere mediciones, proyecto y revisión técnica antes de contratar.','Los tres escenarios representan rangos de mercado, no ofertas de proveedores identificados.','Importes sin IVA, licencias ni honorarios técnicos salvo partida expresa.']};
 }catch(error){return {ok:false,status:503,error:'No hemos podido interpretar el proyecto con fiabilidad. Conserva el texto e inténtalo de nuevo en unos minutos.',detail:process.env.NODE_ENV==='development'?text(error?.message,200):undefined};}
}

const responseSchema={type:'object',additionalProperties:false,required:['project','questions','assumptions','exclusions','confidence','chapters'],properties:{
 project:{type:'object',additionalProperties:false,required:['title','summary','projectType','location','areaM2','quality'],properties:{title:{type:'string'},summary:{type:'string'},projectType:{type:'string'},location:{type:'string'},areaM2:{type:['number','null']},quality:{type:'string'}}},
 questions:{type:'array',items:{type:'string'}},assumptions:{type:'array',items:{type:'string'}},exclusions:{type:'array',items:{type:'string'}},confidence:{type:'string',enum:['baja','media','alta']},
 chapters:{type:'array',items:{type:'object',additionalProperties:false,required:['code','name','items'],properties:{code:{type:'string'},name:{type:'string'},items:{type:'array',items:{type:'object',additionalProperties:false,required:['code','desc','unit','qty','price'],properties:{code:{type:'string'},desc:{type:'string'},unit:{type:'string',enum:['m2','m','ml','ud','pa','h']},qty:{type:'number'},price:{type:'number'}}}}}}}
}};

export async function generateWithOpenAI({tipo,ciudad,prompt,signal}){
 if(!process.env.OPENAI_API_KEY)throw new Error('OPENAI_API_KEY no configurada');
 const response=await fetch('https://api.openai.com/v1/chat/completions',{method:'POST',signal,headers:{Authorization:`Bearer ${process.env.OPENAI_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({model:process.env.OPENAI_MODEL||'gpt-5.4',reasoning_effort:'low',messages:[
  {role:'system',content:'Eres un arquitecto técnico y presupuestador experto en España. Interpreta libremente lenguaje natural, sin exigir formatos ni abreviaturas. Identifica el proyecto completo aunque sea singular. No atribuyas materiales ni sistemas constructivos que el usuario no haya indicado. En una vivienda prefabricada, si falta el sistema (hormigón, madera, acero ligero, SIP, contenedores u otro), pregunta antes de presupuestar. Si el usuario dice que no lo sabe o pide una recomendación, elige el sistema de referencia más razonable según ubicación, superficie, plantas, presupuesto, plazo, parcela y preferencias disponibles; identifica expresamente esa elección como hipótesis en project.summary y assumptions, y menciona que madera, acero/SIP u hormigón pueden alterar el precio. Si los datos no permiten una recomendación responsable, pregunta por presupuesto objetivo, plazo, plantas y preferencias antes de crear partidas. Si faltan datos críticos que impiden cuantificar, devuelve preguntas concretas y chapters vacío. Si puedes estimar con hipótesis razonables, crea un presupuesto preliminar completo estilo Presto, con capítulos y partidas específicas, cantidades coherentes y precios unitarios orientativos actuales en EUR. No inventes proveedores ni ofertas reales. No incluyas porcentajes, IVA, honorarios ni licencias: el servidor los trata. Devuelve JSON conforme al esquema.'},
  {role:'user',content:`TIPO SELECCIONADO: ${tipo||'sin seleccionar'}\nCIUDAD: ${ciudad||'no indicada'}\nDESCRIPCIÓN LIBRE:\n${prompt}`}
 ],response_format:{type:'json_schema',json_schema:{name:'robotarq_estimate',strict:true,schema:responseSchema}}})});
 if(!response.ok)throw new Error(`OpenAI ${response.status}`);const data=await response.json();const content=data?.choices?.[0]?.message?.content;if(!content)throw new Error('Respuesta vacía');return JSON.parse(content);
}
