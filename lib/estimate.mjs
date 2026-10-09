export const round = n => Math.round((Number(n) + Number.EPSILON) * 100) / 100;
const catalog = {
 tiles: {code:'RV01',desc:'Colocación de cerámica (referencia estándar)',unit:'m2',price:38,chapter:'RV',name:'Revestimientos'},
 paint: {code:'PT01',desc:'Pintura interior sobre soporte preparado',unit:'m2',price:14,chapter:'PT',name:'Pintura'},
 lights: {code:'IN01',desc:'Punto de luz (referencia estándar)',unit:'ud',price:60,chapter:'IN',name:'Instalaciones'},
 sockets: {code:'IN02',desc:'Toma de corriente (referencia estándar)',unit:'ud',price:60,chapter:'IN',name:'Instalaciones'},
 panel: {code:'IN03',desc:'Sustitución de cuadro eléctrico (referencia)',unit:'ud',price:350,chapter:'IN',name:'Instalaciones'},
};
function text(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/m²/g,'m2').replace(/seramica/g,'ceramica').replace(/canbiar/g,'cambiar');}
export function estimate(body){
 const prompt=String(body?.prompt||'').trim();const p=text(prompt).replace(/\b(\d+),(\d+)\b/g,'$1.$2');
 if(prompt.length>4000) return {ok:false,error:'La descripción supera 4.000 caracteres.',questions:['Resume las partidas y mediciones.']};
 const questions=[];
 if(body?.obra==='obra_nueva'||body?.modalidad==='modular'||/obra nueva|modular|reform\w*\s+(?:integral\w*|complet\w*)|renovar todo|reformar todo|cocina.*(?:montaje|materiales|completa)|(?:montaje|materiales).*cocina/.test(p))
   return {ok:false,error:'Este proyecto necesita una valoración técnica completa.',questions:['Solicita revisión: superficie, planos, instalaciones, acabados y capítulos necesarios.']};
 if(/(?:^|\s)[-−]\s*\d|\b\d+[.]\d{3}\b|\d\s+\d|\b(?:no|sin|excepto)\b/.test(p))return {ok:false,error:'La descripción contiene cantidades ambiguas o exclusiones.',questions:['Indica solo las partidas que deseas calcular, con cantidades positivas y sin separadores de miles. Usa dos decimales como máximo.']};
 const selected={};
 const patterns={tiles:/alicat\w*|ceramica|porcelan\w*|azulej\w*|solad\w*/,paint:/pint\w*/,lights:/puntos?(?: de)? luz|puntos? de iluminacion/,sockets:/tomas?(?: de corriente)?|enchufes?/,panel:/cuadro(?: electrico)?/};
 const explicit=body?.measurements||{};
 const clauses=p.split(/[,;\n]|\s+y\s+|\s+(?=pintar|pintura|alicatar|solado|cambiar|sustituir|instalar)/).filter(Boolean);
 const requested={};for(const [key,re] of Object.entries(patterns))requested[key]=re.test(p);
 for(const [key,re] of Object.entries(patterns)){
  if(!requested[key])continue;
  const relevant=clauses.filter(c=>re.test(c));
  const found=relevant.flatMap(c=>[...c.matchAll(key==='tiles'||key==='paint'?/(?<![\d.,-])(\d+(?:[.,]\d+)?)\s*m2\b/g:/(?<![\d.,-])(\d+(?:[.,]\d+)?)\s*(?:puntos?|tomas?|enchufes?|cuadros?)/g)]);
  const hasExplicit=explicit[key]!==undefined&&explicit[key]!=='';
  let qty=hasExplicit?Number(explicit[key]):found.length===1?Number(found[0][1].replace(',','.')):key==='panel'&&/\bcuadro\b/.test(p)&&/cambiar|sustitu|cambio/.test(p)?1:NaN;
  if(!Number.isFinite(qty)||qty<=0||qty>10000){questions.push(`Indica la cantidad de ${catalog[key].desc.toLowerCase()} (${catalog[key].unit}).`);continue;}
  if(!['tiles','paint'].includes(key)&&!Number.isInteger(qty)){questions.push('Los puntos, tomas y cuadros deben tener una cantidad entera.');continue;}
  selected[key]=qty;
 }
 // Never silently estimate a known unsupported requested trade.
 if(/fontan|tuberia|demolic|derrib|barra|extraccion|acustic|insonoriz|mueble|encimera|estructura|cimentacion|transporte|grua|ventana|puerta|climatiz|calefacc|impermeabil|tabique|pladur|parquet|tarima|cocina|cableado|instalacion electrica/.test(p))questions.push('El alcance incluye partidas fuera del catálogo piloto. Solicita revisión técnica.');
 if(!Object.keys(selected).length&&!questions.length)questions.push('Describe partidas concretas: cerámica, pintura, puntos de luz, tomas o cambio de cuadro, con sus cantidades.');
 if(questions.length)return {ok:false,error:'Faltan datos o hay partidas que requieren revisión.',questions};
 const chapters={};
 for(const [key,qty] of Object.entries(selected)){
  const item=catalog[key];const ch=chapters[item.chapter]??={code:'CH-'+item.chapter,name:item.name,items:[],total:0};
  const amount=round(qty*item.price);ch.items.push({code:item.code,desc:item.desc,unit:item.unit,qty,price:item.price,amount});ch.total=round(ch.total+amount);
 }
 const subtotal=round(Object.values(chapters).reduce((s,c)=>s+c.total,0));
 const extras=[{code:'MA',desc:'Medios auxiliares y seguridad (hipótesis 5%)',unit:'%',qty:5,price:subtotal,amount:round(subtotal*.05)},{code:'GG',desc:'Gastos generales (hipótesis 10%)',unit:'%',qty:10,price:subtotal,amount:round(subtotal*.1)}];
 const base=round(subtotal+extras.reduce((s,x)=>s+x.amount,0));extras.push({code:'BI',desc:'Beneficio industrial (hipótesis 10%)',unit:'%',qty:10,price:base,amount:round(base*.1)});
 const total=round(subtotal+extras.reduce((s,x)=>s+x.amount,0));
 return {ok:true,meta:{source:'reference-catalog',pricing:'pilot-reference-v1',tipo:String(body.tipo||'local').slice(0,50),ciudad:String(body.ciudad||'').slice(0,100),obra:'reforma',prompt},budget:{chapters,subtotal,extras,total},warnings:['Estimación orientativa de las partidas indicadas, no presupuesto contractual ni proyecto técnico.','Precios de referencia sin validación comercial por ciudad; requieren comprobación y visita técnica.','No incluye IVA, permisos, proyecto, demoliciones, retirada de residuos ni trabajos no descritos. Los extras son hipótesis visibles.']};
}
