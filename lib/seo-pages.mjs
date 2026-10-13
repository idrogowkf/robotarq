const BASE = 'https://robotarq.com';

const budget = [
  ['presupuesto-reforma-integral','Presupuesto de reforma integral','Calcula un presupuesto de reforma integral por capítulos, calidades y mediciones antes de pedir ofertas.','reforma integral de una vivienda: demolición, albañilería, instalaciones, acabados y coordinación','vivienda'],
  ['presupuesto-reforma-cocina','Presupuesto de reforma de cocina','Estima una reforma de cocina con demoliciones, instalaciones, revestimientos, mobiliario y montaje.','reforma completa de cocina con 12 m², fontanería, electricidad, revestimientos y mobiliario','vivienda'],
  ['presupuesto-reforma-bano','Presupuesto de reforma de baño','Prepara el presupuesto de un baño con mediciones, fontanería, sanitarios, revestimientos y exclusiones.','reforma de baño de 5 m² con ducha, sanitarios, fontanería y alicatado','vivienda'],
  ['presupuesto-reforma-local-comercial','Presupuesto de reforma de local comercial','Calcula por partidas la adecuación de un local comercial y define qué debe revisar un técnico.','reforma de local comercial de 120 m² con acabados, electricidad, climatización y accesibilidad','comercial'],
  ['presupuesto-reforma-bar-restaurante','Presupuesto de reforma de bar o restaurante','Ordena el presupuesto de hostelería por obra, instalaciones, cocina, extracción y acabados.','reforma de restaurante de 150 m² con cocina, extracción, instalaciones, aseos y acabados','hosteleria'],
  ['presupuesto-reforma-oficina','Presupuesto de reforma de oficina','Estima la reforma de una oficina por distribución, instalaciones, iluminación, clima y acabados.','reforma de oficina de 200 m² con mamparas, iluminación, climatización y acabados','comercial'],
  ['presupuesto-construccion-casa','Presupuesto de construcción de casa','Estructura una estimación para construir una casa según superficie, sistema, calidades e instalaciones.','construcción de vivienda unifamiliar de 120 m²; pregunta sistema, plantas, calidades y ubicación','vivienda'],
  ['presupuesto-casa-prefabricada','Presupuesto de casa prefabricada','Compara sistemas prefabricados sin asumir el material y separa fabricación, transporte y montaje.','casa prefabricada de 80 m²; pregunta si será de hormigón, madera, acero u otro sistema y si incluye transporte y montaje','vivienda'],
  ['presupuesto-nave-industrial','Presupuesto de nave industrial','Prepara una estimación de nave industrial con estructura, envolvente, instalaciones y urbanización.','nave industrial de 800 m²; pregunta uso, estructura, altura, cerramientos, instalaciones y urbanización','industrial'],
  ['presupuesto-piscina','Presupuesto de construcción de piscina','Calcula una piscina diferenciando vaso, excavación, instalaciones, acabados y entorno.','piscina exterior de 8 por 4 metros; pregunta sistema constructivo, profundidad, acabado, depuración y accesos','otro'],
  ['presupuesto-fachada','Presupuesto de rehabilitación de fachada','Define mediciones, soporte, acceso, reparación, aislamiento y acabado para presupuestar una fachada.','rehabilitación de fachada de 400 m²; pregunta estado, sistema, aislamiento, andamio y acabado','otro'],
  ['presupuesto-instalacion-electrica','Presupuesto de instalación eléctrica','Estima una instalación eléctrica por cuadros, circuitos, puntos, mecanismos y trabajos auxiliares.','renovación de instalación eléctrica en vivienda de 90 m²; pregunta cuadro, circuitos, puntos y rozas','instalaciones'],
  ['presupuesto-fontaneria','Presupuesto de fontanería','Calcula trabajos de fontanería con puntos, recorridos, materiales, aparatos y albañilería auxiliar.','renovación de fontanería de vivienda con cocina y dos baños; pregunta puntos, recorridos y aparatos','instalaciones'],
  ['presupuesto-pintura','Presupuesto de pintura','Calcula pintura interior o exterior por superficie, estado del soporte, preparación y acabado.','pintura interior de paredes y techos de una vivienda de 90 m²; pregunta superficie real, soporte y acabado','acabados'],
  ['presupuesto-suelo-alicatado','Presupuesto de suelo y alicatado','Estima pavimentos y alicatados por superficie, formato, soporte, retirada y colocación.','colocación de 75 m² de suelo porcelánico; pregunta formato, retirada, soporte, rodapié y material','acabados']
];

const professionals = [
  ['empresas-reformas','Empresas de reformas','Describe tu obra, obtén una estimación y solicita una revisión para buscar empresas de reformas adecuadas.','empresa de reformas para ejecutar una reforma integral; define ciudad, alcance, fechas y estado del inmueble'],
  ['constructoras','Constructoras para tu proyecto','Prepara el alcance y el presupuesto antes de consultar constructoras para una obra o construcción.','constructora para una vivienda o edificio; define ubicación, proyecto, superficie, sistema y calendario'],
  ['arquitectos-tecnicos','Arquitectos técnicos para obras y reformas','Identifica cuándo necesitas mediciones, estudio, dirección o coordinación de un arquitecto técnico.','arquitecto técnico para revisar mediciones, presupuesto y ejecución de una obra'],
  ['contratistas-obra','Contratistas de obra','Convierte una descripción de obra en partidas comparables antes de consultar contratistas.','contratista para ejecutar una obra; define especialidad, alcance, ubicación y calendario'],
  ['instaladores-electricistas','Instaladores electricistas','Define cuadros, circuitos y puntos para consultar instaladores electricistas con un alcance claro.','electricista para renovar o ampliar una instalación; define inmueble, cuadro, circuitos y puntos'],
  ['fontaneros','Fontaneros para obras y reformas','Prepara mediciones y alcance de fontanería antes de solicitar una revisión profesional.','fontanero para renovación de tuberías o reforma; define puntos, recorridos, aparatos y ciudad'],
  ['empresas-reformas-locales','Empresas de reformas de locales','Presupuesta la adecuación de un local y solicita profesionales según actividad, instalaciones y ciudad.','empresa para reformar un local comercial; define actividad, superficie, estado e instalaciones'],
  ['empresas-construccion-industrial','Empresas de construcción industrial','Estructura una obra industrial antes de buscar empresas por sistema, instalaciones y ubicación.','empresa de construcción industrial; define uso, superficie, estructura, instalaciones y urbanización']
];

const commonFaqs = [
  {q:'¿La estimación es una oferta contractual?',a:'No. Es una referencia preliminar basada en los datos introducidos. Un profesional debe comprobar mediciones, soluciones, precios, impuestos y condiciones antes de contratar.'},
  {q:'¿Puedo comparar empresas con el resultado?',a:'Sí. Usa los mismos capítulos, cantidades, calidades y exclusiones al pedir ofertas para que la comparación sea coherente.'},
  {q:'¿Qué ocurre si faltan datos?',a:'El estimador puede pedir aclaraciones y deja visibles las hipótesis. No debe sustituir una visita o un estudio técnico cuando la obra lo requiera.'}
];

function completeDescription(description){return description.length>=90?description:`${description} Genera un desglose orientativo online con robotARQ.`;}
function makeBudget([slug,title,description,preset,category]) {
  return {slug,path:`/${slug}`,type:'budget',title,description:completeDescription(description),h1:title,canonical:`${BASE}/${slug}`,summary:`Organiza el alcance de ${title.toLowerCase()} y recibe una estimación desglosada antes de consultar profesionales.`,preset,category,indexable:true,evidenceComplete:true,lastModified:'2026-10-13',
    sections:[
      {title:'Qué debe incluir',text:`El cálculo separa preparación, obra principal, instalaciones, acabados, medios auxiliares y trabajos asociados. Describe cantidades y calidades para evitar que una cifra global oculte diferencias de alcance.`},
      {title:'Datos que cambian el presupuesto',text:`La ubicación, el estado existente, los accesos, las mediciones, el sistema elegido, la calidad y los trabajos previos modifican el resultado. robotARQ pregunta por los datos decisivos y muestra las hipótesis que todavía deben comprobarse.`},
      {title:'Cómo comparar propuestas',text:`Entrega a cada empresa el mismo alcance y revisa unidades, cantidades, suministros, retirada de residuos, plazos, impuestos y exclusiones. La cifra final solo es comparable si todos valoran lo mismo.`}
    ],faqs:commonFaqs,related:['/estimador','/presupuesto-reforma','/empresas-reformas']};
}

function makeProfessional([slug,title,description,preset]) {
  return {slug,path:`/${slug}`,type:'professional',title,description:completeDescription(description),h1:title,canonical:`${BASE}/${slug}`,summary:'Define primero la obra y su presupuesto; después podrás solicitar contacto profesional con un expediente claro.',preset,indexable:true,evidenceComplete:true,lastModified:'2026-10-13',
    sections:[
      {title:'Un alcance que se puede revisar',text:'La solicitud parte de capítulos, mediciones, calidades, hipótesis y exclusiones. Esto permite entender la necesidad antes del contacto y reduce consultas sin información suficiente.'},
      {title:'Cómo funciona la solicitud',text:'Genera la estimación, regístrate para conservar el expediente y solicita hablar con un profesional. robotARQ revisa los datos de contacto y el alcance antes de gestionar el siguiente paso.'},
      {title:'Antes de contratar',text:'Comprueba identidad profesional, experiencia aplicable, seguros, alcance, calendario, forma de pago y documentación necesaria para tu caso. La disponibilidad se confirma individualmente.'}
    ],faqs:commonFaqs,related:['/estimador','/profesionales','/presupuesto-reforma']};
}

export const SEO_PAGES = [...budget.map(makeBudget),...professionals.map(makeProfessional)];
export const LOCAL_CANDIDATES = ['madrid','barcelona','valencia','sevilla','malaga','zaragoza','alicante','bilbao'].map(city=>({slug:`presupuesto-reforma-${city}`,type:'local',indexable:false,evidenceComplete:false,reason:'Requiere contenido local y referencias públicas verificadas'}));
export const LONG_TAIL_CANDIDATES = ['precio-reforma-por-metro-cuadrado','cuanto-cuesta-reformar-una-casa','presupuesto-obra-online'].map(slug=>({slug,type:'long-tail',indexable:false,evidenceComplete:false,reason:'Requiere demanda demostrada en Search Console'}));

export function getSeoPage(slug){return SEO_PAGES.find(page=>page.slug===slug);}
export function getIndexableSeoPages(){return SEO_PAGES.filter(page=>page.indexable&&page.evidenceComplete);}
export function buildSitemapEntries(){return getIndexableSeoPages().map(page=>({url:page.canonical,lastModified:page.lastModified,changeFrequency:'monthly',priority:page.type==='budget'?0.8:0.7}));}

