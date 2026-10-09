import Link from 'next/link';
export const metadata = {
 title: 'Cómo calcular y comparar un presupuesto de reforma',
 description: 'Prepara mediciones, calcula partidas y compara presupuestos de reforma. Ejemplo desglosado, PDF y Excel, exclusiones y revisión técnica.',
 alternates: { canonical: 'https://robotarq.com/presupuesto-reforma' },
 openGraph: { title: 'Cómo preparar un presupuesto de reforma', description: 'Mediciones, partidas y un ejemplo de cálculo orientativo.', url: 'https://robotarq.com/presupuesto-reforma' }
};
const sections = [
 ['Qué necesitas para presupuestar una reforma','Anota la ciudad, el uso del inmueble, los trabajos que quieres hacer y sus mediciones. Adjunta fotos o planos cuando solicites revisión. Los metros cuadrados del inmueble no equivalen a los metros de paredes, techos o cerámica que se van a intervenir.'],
 ['Cómo calcular las partidas','Para cada trabajo, multiplica la cantidad por el precio unitario y conserva la unidad: m² para pintura o cerámica, unidades para puntos eléctricos o cuadros. Suma las partidas y presenta por separado los medios auxiliares, gastos generales, beneficio e impuestos.'],
 ['Cómo comparar dos presupuestos','Comprueba que ambos incluyen las mismas superficies, calidades, preparación del soporte, mano de obra y materiales. Revisa demoliciones, retirada de residuos, transporte, permisos e IVA. Un total menor puede corresponder a trabajos excluidos. Solicita aclaración de cualquier partida sin cantidad o alcance.'],
 ['Cuándo hace falta una valoración técnica','Una reforma integral, cocina o baño completo, cambio de distribución, actividad o instalaciones necesita un estudio específico. La calculadora no valida proyectos, licencias ni el estado de la instalación. La revisión profesional debe confirmar alcance, mediciones y precios antes de contratar.']
];
export default function Page(){
 const breadcrumb={'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Inicio',item:'https://robotarq.com/'},{'@type':'ListItem',position:2,name:'Presupuesto de reforma',item:'https://robotarq.com/presupuesto-reforma'}]};
 return <article className="max-w-3xl mx-auto px-4 pt-28 pb-16">
 <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(breadcrumb)}} />
 <nav aria-label="Ruta de navegación"><Link href="/" className="underline">Inicio</Link> / Presupuesto de reforma</nav>
 <h1 className="text-4xl font-bold mt-6">Cómo calcular un presupuesto de reforma por partidas</h1>
 <p className="mt-4">Si buscas un presupuesto de reforma online, empieza por definir qué trabajos necesitas. robotARQ permite estimar pintura, cerámica y electricidad básica con cantidades explícitas y descargar el resultado en PDF y Excel.</p>
 <p className="mt-3 text-sm">Revisión: 9 de octubre de 2026 · Equipo robotARQ · Guía del estimador piloto.</p>
 <a href="/estimador" className="inline-block mt-6 bg-black text-white rounded p-3">Calcular mi estimación</a>
 {sections.map(([title,text])=><section key={title} className="mt-8"><h2 className="text-2xl font-semibold">{title}</h2><p className="mt-3">{text}</p></section>)}
 <section className="mt-8"><h2 className="text-2xl font-semibold">Ejemplo: 60 m² de cerámica y un cuadro eléctrico</h2>
 <p className="mt-3">Ejemplo aritmético del catálogo piloto; no es una oferta ni un precio de mercado validado.</p>
 <div className="overflow-x-auto mt-4"><table className="w-full text-left"><caption className="text-left mb-2">Desglose orientativo sin IVA</caption><thead><tr><th scope="col">Concepto</th><th scope="col">Cálculo</th><th scope="col">Importe</th></tr></thead><tbody>
 {[['Cerámica','60 m² × 38 €/m²','2.280,00 €'],['Cuadro eléctrico','1 ud × 350 €/ud','350,00 €'],['Subtotal','Suma de partidas','2.630,00 €'],['Medios y seguridad','5 % del subtotal','131,50 €'],['Gastos generales','10 % del subtotal','263,00 €'],['Beneficio','10 % del subtotal más extras anteriores','302,45 €'],['Total sin IVA','Referencia del piloto','3.326,95 €']].map(r=><tr key={r[0]}>{r.map((v,i)=><td className="border-b py-2 pr-4" key={i}>{v}</td>)}</tr>)}
 </tbody></table></div>
 <p className="mt-3">Excluye IVA, licencias, proyecto, demoliciones, residuos y trabajos no descritos. Las tarifas y porcentajes son supuestos del piloto y requieren confirmación local. No incluyen automáticamente una reforma eléctrica completa.</p></section>
 <section className="mt-8"><h2 className="text-2xl font-semibold">Preguntas habituales</h2><h3 className="font-semibold mt-4">¿Puedo calcular una reforma integral por los metros del piso?</h3><p>No. Se necesitan partidas, calidades e instalaciones concretas. Solicita revisión técnica para definirlas.</p><h3 className="font-semibold mt-4">¿El documento es un presupuesto contractual?</h3><p>No. Es una estimación orientativa; requiere revisión y aceptación de una oferta concreta antes de contratar.</p><h3 className="font-semibold mt-4">¿Cómo obtengo PDF y Excel?</h3><p>Introduce trabajos compatibles y mediciones en el estimador. Cuando el cálculo sea válido, podrás descargar ambos documentos.</p></section>
 <section className="mt-8"><h2 className="text-2xl font-semibold">Prepara el presupuesto según el inmueble</h2><ul className="list-disc pl-5 mt-3"><li><a className="underline" href="/reformas-viviendas">Presupuesto de reforma de vivienda</a></li><li><a className="underline" href="/reformas-locales">Presupuesto de reforma de local comercial</a></li><li><a className="underline" href="/reformas-hosteleria">Presupuesto de reforma de bar o restaurante</a></li></ul><a className="inline-block mt-6 underline" href="/contacto">Solicitar revisión del alcance y las mediciones</a></section>
 </article>;
}
