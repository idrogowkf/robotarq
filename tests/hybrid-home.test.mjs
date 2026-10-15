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
});

test('professional centre and signup expose the essential launch experience',async()=>{
 const [directory,signup,form]=await Promise.all([read('app/profesionales/page.jsx'),read('app/profesionales/alta/page.jsx'),read('components/ProfessionalSignupForm.jsx')]);
 assert.match(directory,/Encuentra profesionales para llevar tu presupuesto a obra/);
 assert.match(directory,/Explora trabajos y descubre quién puede ejecutarlos/);
 assert.match(directory,/Reformas integrales/);
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
