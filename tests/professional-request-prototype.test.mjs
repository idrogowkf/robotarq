import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const path=new URL('../public/prototipos/solicitud-profesional/index.html',import.meta.url);

test('direct professional request prototype covers customer and admin journeys',async()=>{
 const html=await readFile(path,'utf8');
 for(const copy of ['Describe la obra. Recibe el presupuesto.','Generar presupuesto','Capítulos, mediciones, hipótesis y exclusiones','Después del presupuesto, encuentra quién puede ejecutar la obra.','¿Qué profesional necesitas?','Centro administrativo','Ubicación del trabajo','Cuéntanos el proyecto','Tus datos de contacto','Revisa y envía','Solicitud registrada','Solicitudes de profesionales','Presupuestos y ofertas','Buscar candidatos compatibles','Preparar solicitud a seleccionados'])assert.match(html,new RegExp(copy));
 assert.match(html,/PDF<\/b><span>maquetado técnico/);
 assert.match(html,/Excel<\/b><span>con mediciones/);
 const sectionOrder=['id="budget-hero"','id="budget-proof"','id="specialties"','id="professional-hero"','id="site-footer"'].map(marker=>html.indexOf(marker));
 assert.deepEqual(sectionOrder,[...sectionOrder].sort((a,b)=>a-b),'hybrid landing sections must follow the approved order');
 assert.ok(sectionOrder.every(index=>index>=0),'every approved section must exist');
 assert.match(html,/data-budget-demo/);
 assert.match(html,/14,90\s*€/);
 assert.match(html,/Primero encontramos profesionales compatibles\. Después decides si activar la búsqueda\./);
 assert.match(html,/Pago único, después de confirmar candidatos/);
 assert.match(html,/No se realizará ningún cargo/);
 assert.match(html,/Demostración interactiva/);
 assert.doesNotMatch(html,/href=["'][^"']*estimador/i);
});

test('every professional specialty uses its own photographic asset',async()=>{
 const html=await readFile(path,'utf8');
 const assets=[...html.matchAll(/assets\/prototype-professional\/([a-z-]+\.webp)/g)].map(match=>match[1]);
 const expected=['reforma-integral.webp','albanileria-alicatado.webp','fontaneria.webp','electricidad.webp','arquitectura-tecnica.webp'];
 for(const asset of expected)assert.ok(assets.includes(asset),`missing ${asset}`);
 assert.equal(new Set(expected).size,expected.length);
});
