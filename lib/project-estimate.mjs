import { estimate, round } from './estimate.mjs';

const PROJECT_RE = /prefabricad|hormigon|obra nueva|vivienda|casa|reforma integral|reformar integral|construir|construccion|estructura|cimentacion/;
const AMBIGUOUS_RE = /(?:^|\s)[-−]\s*\d|\b\d+[.]\d{3}\b|\d\s+\d|\b(?:no|sin|excepto)\b/;
const clean=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/m²/g,'m2');
async function within(run,ms){const controller=new AbortController();let timer;try{return await Promise.race([run(controller.signal),new Promise((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(new Error('Tiempo de espera agotado'));},ms);})]);}finally{clearTimeout(timer);}}

function projectAreas(prompt){return [...clean(prompt).matchAll(/(?<![\d.,-])(\d+(?:[.,]\d+)?)\s*m2\b/g)].map(m=>Number(m[1].replace(',','.')));}

function fallbackProject(area,prompt){
 const p=clean(prompt);let specs;
 if(/prefabricad|hormigon/.test(p))specs=[
  ['CI','Cimentación','CI01','Cimentación y losa de apoyo (referencia preliminar)','m2',area,220],
  ['ST','Estructura','ST01','Sistema prefabricado de hormigón y montaje (referencia preliminar)','m2',area,850],
  ['EN','Envolvente','EN01','Cubierta, aislamiento y cerramientos (referencia preliminar)','m2',area,280],
  ['IN','Instalaciones','IN01','Instalaciones básicas de vivienda (referencia preliminar)','m2',area,320],
  ['AC','Acabados','AC01','Distribución interior y acabados estándar (referencia preliminar)','m2',area,220],
  ['LG','Logística','LG01','Transporte, grúa y medios de montaje (provisión)','pa',1,8500]
 ];
 else if(/reforma integral|reformar integral|renovar todo/.test(p))specs=[
  ['DM','Preparación','DM01','Demoliciones y retirada de residuos (provisión preliminar)','m2',area,120],
  ['AL','Albañilería','AL01','Redistribución y trabajos de albañilería (referencia preliminar)','m2',area,300],
  ['IN','Instalaciones','IN01','Renovación de instalaciones básicas (referencia preliminar)','m2',area,350],
  ['AC','Acabados','AC01','Revestimientos, pintura y acabados estándar (referencia preliminar)','m2',area,320],
  ['LG','Medios auxiliares','LG01','Medios, protecciones y logística (provisión)','pa',1,5000]
 ];
 else specs=[
  ['CI','Cimentación','CI01','Cimentación y losa de apoyo (referencia preliminar)','m2',area,220],
  ['ST','Estructura','ST01','Estructura convencional (referencia preliminar)','m2',area,700],
  ['EN','Envolvente','EN01','Cubierta, aislamiento y cerramientos (referencia preliminar)','m2',area,350],
  ['IN','Instalaciones','IN01','Instalaciones básicas de vivienda (referencia preliminar)','m2',area,320],
  ['AC','Acabados','AC01','Distribución interior y acabados estándar (referencia preliminar)','m2',area,280],
  ['LG','Logística','LG01','Medios de obra y logística (provisión)','pa',1,6000]
 ];
 const chapters={};for(const [k,name,code,desc,unit,qty,price] of specs){chapters[k]={code:'CH-'+k,name,items:[{code,desc,unit,qty,price,amount:round(qty*price)}]};chapters[k].total=chapters[k].items[0].amount;}return {chapters};
}

export function normalizeProjectBudget(raw){
 if(!raw||typeof raw!=='object'||!raw.chapters||typeof raw.chapters!=='object')throw new Error('Presupuesto no válido');
 const chapters={};let itemCount=0;
 for(const [key,value] of Object.entries(raw.chapters).slice(0,12)){
  if(!value||!Array.isArray(value.items))continue;const items=[];
  for(const [index,item] of value.items.slice(0,60).entries()){
   const qty=Number(item.qty),price=Number(item.price);const unit=String(item.unit||'ud').toLowerCase();
   if(!item.desc||!Number.isFinite(qty)||!Number.isFinite(price)||qty<=0||price<=0||qty>10000||price>100000||!['m2','ml','ud','pa'].includes(unit))throw new Error('Partida no válida');
   const code=String(item.code||`${key}${index+1}`).replace(/[^A-Z0-9-]/gi,'').slice(0,16)||`IT${index+1}`;
   items.push({code,desc:String(item.desc).trim().slice(0,220),unit,qty:round(qty),price:round(price),amount:round(qty*price)});itemCount++;if(itemCount>200)throw new Error('Demasiadas partidas');
  }
  if(items.length){const code=String(value.code||`CH-${key}`).replace(/[^A-Z0-9-]/gi,'').slice(0,16);chapters[key]={code,name:String(value.name||key).trim().slice(0,100),items,total:round(items.reduce((s,x)=>s+x.amount,0))};}
 }
 if(!itemCount)throw new Error('Presupuesto vacío');
 const subtotal=round(Object.values(chapters).reduce((s,c)=>s+c.total,0));if(subtotal<=0||subtotal>5000000)throw new Error('Total fuera de límites');
 const extras=[
  {code:'MA',desc:'Medios auxiliares y seguridad (hipótesis 5%)',unit:'%',qty:5,price:subtotal,amount:round(subtotal*.05)},
  {code:'GG',desc:'Gastos generales (hipótesis 10%)',unit:'%',qty:10,price:subtotal,amount:round(subtotal*.10)},
 ];
 const base=round(subtotal+extras.reduce((s,x)=>s+x.amount,0));extras.push({code:'BI',desc:'Beneficio industrial (hipótesis 10%)',unit:'%',qty:10,price:base,amount:round(base*.10)});
 return {chapters,subtotal,extras,total:round(subtotal+extras.reduce((s,x)=>s+x.amount,0))};
}

export async function estimateRequest(body,{generate,fallbackOnInvalid=false,generateTimeoutMs=15000}={}){
 const prompt=String(body?.prompt||'').trim(),p=clean(prompt);const areas=projectAreas(prompt),area=areas[0];const itemEstimate=estimate(body);
 if(prompt.length>4000)return itemEstimate;
 if(itemEstimate.ok||!PROJECT_RE.test(p))return itemEstimate;
 if(areas.length!==1||!Number.isFinite(area)||area<=0||area>10000||AMBIGUOUS_RE.test(p))return {ok:false,error:'Faltan datos para estimar el proyecto.',questions:[areas.length>1?'Indica una única superficie total del proyecto; detalla las mediciones parciales en una solicitud de revisión.':'Indica una superficie positiva en m² y evita cantidades ambiguas o exclusiones.']};
 try{
  let raw,assisted=false;if(generate){raw=await within(signal=>generate({tipo:String(body?.tipo||'vivienda'),ciudad:String(body?.ciudad||''),prompt,area,signal}),generateTimeoutMs);assisted=!!raw;}
  if(!raw)raw=fallbackProject(area,prompt);
  const budget=normalizeProjectBudget(raw);
  return {ok:true,meta:{source:assisted?'assisted-estimate':'reference-fallback',pricing:'preliminary-project-v1',scope:'project-preliminary',tipo:String(body?.tipo||'vivienda').slice(0,50),ciudad:String(body?.ciudad||'').slice(0,100),prompt},budget,warnings:['Estimación preliminar orientativa: no constituye oferta, contrato, proyecto ni medición profesional.','Las partidas, cantidades y precios requieren revisión técnica, estudio del terreno, planos, calidades y confirmación local.','No incluye IVA, licencias, honorarios técnicos, acometidas, urbanización exterior ni imprevistos salvo que aparezcan expresamente como partida.']};
 }catch{
  if(fallbackOnInvalid){try{const budget=normalizeProjectBudget(fallbackProject(area,prompt));return {ok:true,meta:{source:'reference-fallback',pricing:'preliminary-project-v1',scope:'project-preliminary',tipo:String(body?.tipo||'vivienda').slice(0,50),ciudad:String(body?.ciudad||'').slice(0,100),prompt},budget,warnings:['Estimación preliminar orientativa generada con el catálogo de respaldo: no constituye oferta, contrato, proyecto ni medición profesional.','Las partidas, cantidades y precios requieren revisión técnica, estudio del terreno, planos, calidades y confirmación local.','No incluye IVA, licencias, honorarios técnicos, acometidas, urbanización exterior ni imprevistos salvo que aparezcan expresamente como partida.']};}catch{}
  }
  return {ok:false,error:'No se pudo validar un presupuesto técnico seguro.',questions:['Solicita revisión técnica o vuelve a intentarlo con superficie, sistema constructivo, calidades y ubicación.']};
 }
}

export async function generateProjectBudget({tipo,ciudad,prompt,area,signal}){
 if(!process.env.OPENAI_API_KEY)return null;
 const response=await fetch('https://api.openai.com/v1/chat/completions',{method:'POST',signal,headers:{Authorization:`Bearer ${process.env.OPENAI_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({model:'gpt-4o-mini',temperature:.15,response_format:{type:'json_object'},messages:[{role:'system',content:'Eres un presupuestador técnico de construcción en España. Devuelve solo JSON con {"chapters":{"CLAVE":{"code":"CH-XX","name":"Nombre","items":[{"code":"XX01","desc":"Partida concreta","unit":"m2|ml|ud|pa","qty":1,"price":1}]}}}. Prepara una estimación preliminar desglosada; conserva la superficie indicada. Incluye sólo partidas razonablemente inferibles y usa precios unitarios orientativos en EUR sin IVA. Para vivienda prefabricada incluye cimentación, estructura/sistema, envolvente, interiores, instalaciones, acabados y logística/montaje. No incluyas porcentajes, IVA ni honorarios: el servidor los añade o los excluye.'},{role:'user',content:`TIPO: ${tipo}\nCIUDAD: ${ciudad}\nSUPERFICIE: ${area} m2\nDESCRIPCIÓN: ${prompt}`} ]})});
 if(!response.ok)throw new Error('Proveedor no disponible');const data=await response.json();const content=data?.choices?.[0]?.message?.content;if(!content)throw new Error('Respuesta vacía');return JSON.parse(content);
}
