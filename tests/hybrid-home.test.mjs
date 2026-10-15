import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const read=path=>readFile(new URL(`../${path}`,import.meta.url),'utf8');

test('production home uses the approved hybrid marketplace with real provider data',async()=>{
 const [home,market,carousel]=await Promise.all([read('app/page.jsx'),read('components/HomeMarketplace.jsx'),read('components/ProfessionalCarousel.jsx')]);
 assert.match(home,/listPublicProviders/);
 assert.match(home,/HomeMarketplace/);
 assert.match(carousel,/providers\.map/);
 assert.match(market,/La red está incorporando profesionales/);
 assert.match(market,/ProfessionalCarousel/);
 assert.match(carousel,/Plaza disponible/);
 assert.match(carousel,/Perfiles anteriores/);
 assert.match(carousel,/Perfiles siguientes/);
 assert.match(carousel,/overflow-x-auto/);
 for(const invented of ['Obra Clara Madrid','Espacio Hostelería','Técnica Norte','Instala Sur'])assert.doesNotMatch(home+market,new RegExp(invented));
});

test('hybrid home keeps the budget intake first and the approved section order',async()=>{
 const home=await read('app/page.jsx');
 const intake=home.indexOf('<HomeIntake');
 const output=home.indexOf('muestra-presupuesto');
 const market=home.indexOf('<HomeMarketplace');
 const categories=home.indexOf('Calculadoras por tipo de proyecto');
 assert.ok(intake>0&&output>intake&&market>output&&categories>market);
 assert.match(home,/Describe la obra\. Recibe el presupuesto\./);
 assert.match(home,/Gemini_Generated_Image_8uqwdc8uqwdc8uqw\.jpg/);
 assert.match(home,/Presupuesta primero\. Decide con mejor información\./);
 assert.match(home,/Convierte el presupuesto en obra/);
 assert.match(home,/pb-14 pt-24/);
 assert.doesNotMatch(home,/<b className="block text-2xl">España<\/b>precios en euros/);
});

test('professional centre and signup expose the essential launch experience',async()=>{
 const [directory,signup,form]=await Promise.all([read('app/profesionales/page.jsx'),read('app/profesionales/alta/page.jsx'),read('components/ProfessionalSignupForm.jsx')]);
 assert.match(directory,/Tu oficio\. Oportunidades que encajan contigo/);
 assert.match(directory,/No publicamos obras abiertas/);
 assert.match(directory,/trades-atlas-01/);
 assert.match(directory,/trades-atlas-02/);
 assert.doesNotMatch(directory,/Generar (mi )?presupuesto/);
 assert.doesNotMatch(directory,/href="\/profesionales\/alta"/);
 assert.match(signup,/Perfil, portfolio y verificación/);
 assert.match(form,/Datos profesionales/);
 assert.match(form,/Servicios y cobertura/);
 assert.match(form,/Portfolio/);
 assert.match(form,/Revisar y enviar/);
});

test('mobile header always names the professional signup action completely',async()=>{
 const header=await read('components/Header.jsx');
 assert.match(header,/>Alta profesional</);
 assert.doesNotMatch(header,/>Dar de alta</);
});

test('admin and lead email expose the saved qualification fields',async()=>{
 const [admin,email]=await Promise.all([read('app/administracion/[id]/page.jsx'),read('lib/case-email.mjs')]);
 for(const text of ['contactPreference','assistanceRequest','notes']){assert.match(admin,new RegExp(text));assert.match(email,new RegExp(text));}
});
