import Link from 'next/link';

const trades=[
 {title:'Fontanería',request:'Fontanería e instalaciones',text:'Agua, saneamiento, baños y reparaciones.',image:'/assets/professionals/trades-atlas-01.png',position:'0% 0%'},
 {title:'Electricidad',request:'Instalaciones eléctricas',text:'Cuadros, iluminación, instalaciones y certificados.',image:'/assets/professionals/trades-atlas-01.png',position:'100% 0%'},
 {title:'Albañilería',request:'Albañiles',text:'Tabiques, solados, alicatados y obra general.',image:'/assets/professionals/trades-atlas-01.png',position:'0% 100%'},
 {title:'Arquitectos y aparejadores',request:'Arquitectos y aparejadores',text:'Proyectos, licencias, mediciones y dirección de obra.',image:'/assets/professionals/trades-atlas-01.png',position:'100% 100%'},
 {title:'Pintura',request:'Pintura',text:'Interiores, fachadas y tratamientos especiales.',image:'/assets/professionals/trades-atlas-02.png',position:'0% 0%'},
 {title:'Carpintería',request:'Carpintería',text:'Puertas, madera, mobiliario y montaje.',image:'/assets/professionals/trades-atlas-02.png',position:'100% 0%'},
 {title:'Climatización',request:'Climatización',text:'Calefacción, ventilación y aire acondicionado.',image:'/assets/professionals/trades-atlas-02.png',position:'0% 100%'},
 {title:'Cubiertas',request:'Cubiertas',text:'Tejados, impermeabilización y rehabilitación.',image:'/assets/professionals/trades-atlas-02.png',position:'100% 100%'}
];

export default function ProfessionalTradeGrid({source='directorio'}){
 return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{trades.map(trade=><Link href={`/solicitar-profesional?origen=${source}&especialidad=${encodeURIComponent(trade.request)}`} key={trade.title} className="group overflow-hidden rounded-3xl border bg-white shadow-sm transition hover:-translate-y-1 hover:border-sky-500 hover:shadow-xl"><span role="img" aria-label={`Ilustración de ${trade.title}`} className="block h-44 bg-cover bg-no-repeat" style={{backgroundImage:`url(${trade.image})`,backgroundSize:'200% 200%',backgroundPosition:trade.position}}/><span className="block p-5"><strong className="text-xl">{trade.title}</strong><span className="mt-2 block text-sm leading-6 text-slate-600">{trade.text}</span><span className="mt-4 block text-sm font-extrabold text-sky-800">Contactar profesionales →</span></span></Link>)}</div>;
}
