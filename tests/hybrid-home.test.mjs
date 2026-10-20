import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const read=path=>readFile(new URL(`../${path}`,import.meta.url),'utf8');

test('production home uses the approved hybrid marketplace with real provider data',async()=>{
 const [home,market,carousel]=await Promise.all([read('app/page.jsx'),read('components/HomeMarketplace.jsx'),read('components/ProfessionalCarousel.jsx')]);
 assert.match(home,/listPublicProviders/);
 assert.match(home,/HomeMarketplace/);
 assert.match(carousel,/providers\.map/);
 assert.match(market,/ProfessionalCarousel/);
 assert.match(carousel,/Ver perfil y trabajos/);
 assert.doesNotMatch(carousel,/\/estimador\?tipo=otro&origen=muestra-profesional/);
 assert.doesNotMatch(carousel,/samples\.slice/);
 assert.doesNotMatch(carousel,/Esta posición se reserva/);
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
 assert.match(home,/hero-arquitectura-madrid\.webp/);
 assert.match(home,/isFeaturedProvider/);
 assert.match(home,/Presupuesta primero\. Decide con mejor información\./);
 assert.match(home,/Convierte el presupuesto en obra/);
 assert.match(home,/pb-14 pt-24/);
 assert.doesNotMatch(home,/<b className="block text-2xl">España<\/b>precios en euros/);
});

test('direct professional request has its own authenticated customer journey',async()=>{
 const [page,form,account,api]=await Promise.all([
  read('app/solicitar-profesional/page.jsx'),
  read('components/ProfessionalRequestForm.jsx'),
  read('app/mi-cuenta/page.jsx'),
  read('app/api/professional-requests/route.js')
 ]);
 assert.match(page,/Encuentra el profesional adecuado para tu obra/);
 for(const text of ['Elige una categoría profesional','Cuéntanos qué trabajo necesitas','Ya tengo una cuenta','Enviar solicitud y crear cuenta'])assert.match(form,new RegExp(text));
 assert.doesNotMatch(form,/Tipo de servicio|Cualquier puntuación|COMPARA PERFILES/);
 assert.match(form,/Apellidos/);
 assert.match(form,/¿Has olvidado tu contraseña\?/);
 assert.match(form,/href="\/recuperar-clave"/);
 assert.doesNotMatch(form,/NIF\/CIF|Confirmar contraseña/);
 for(const trade of ['pintur','carpinter','climat','cubiert'])assert.match(form,new RegExp(`includes\\('${trade}`));
 assert.match(account,/Profesionales solicitados/);
 assert.match(api,/customerSessionFromRequest/);
});

test('landing photography and unavailable sample flow stay coherent',async()=>{
 const [market,tradeGrid,estimator,providerForm]=await Promise.all([read('components/HomeMarketplace.jsx'),read('components/ProfessionalTradeGrid.jsx'),read('app/estimador/page.jsx'),read('components/ProviderForm.jsx')]);
 for(const asset of ['trades-atlas-01.png','trades-atlas-02.png'])assert.match(tradeGrid,new RegExp(asset.replace('.','\\.')));
 assert.match(estimator,/El profesional concreto no está disponible/);
 assert.match(providerForm,/Destacar en la portada/);
});

test('professional centre and signup expose the essential launch experience',async()=>{
 const [directory,portal,tradeGrid,signup,form]=await Promise.all([read('app/profesionales/page.jsx'),read('app/profesionales/portal/page.jsx'),read('components/ProfessionalTradeGrid.jsx'),read('app/profesionales/alta/page.jsx'),read('components/ProfessionalSignupForm.jsx')]);
 assert.match(directory,/Busca el gremio que necesita tu obra/);
 assert.match(directory,/ProfessionalTradeGrid/);
 assert.match(tradeGrid,/solicitar-profesional\?origen=/);
 assert.match(tradeGrid,/trades-atlas-01/);
 assert.match(tradeGrid,/trades-atlas-02/);
 assert.doesNotMatch(directory,/Acceder al panel profesional|Entrar en mi cuenta profesional|Tu oficio\. Oportunidades/);
 assert.match(portal,/Tu oficio\. Oportunidades que encajan contigo/);
 assert.match(portal,/Acceder al panel profesional/);
 assert.match(portal,/Crear mi perfil profesional/);
 assert.match(portal,/href="\/profesionales\/acceso"/);
 assert.match(portal,/href="\/profesionales\/alta"/);
 assert.match(signup,/Perfil, portfolio y verificación/);
 assert.match(form,/Datos profesionales/);
 assert.match(form,/Servicios y cobertura/);
 assert.match(form,/Portfolio/);
 assert.match(form,/Revisar y enviar/);
});

test('professional account journey includes recovery, reset and logout',async()=>{
 const [login,access,requestPage,requestForm,resetPage,resetForm,panel,logout,requestApi,resetApi]=await Promise.all([
  read('components/ProfessionalLoginForm.jsx'),read('app/profesionales/acceso/page.jsx'),read('app/profesionales/recuperar-clave/page.jsx'),read('components/ProfessionalPasswordRequestForm.jsx'),read('app/profesionales/restablecer-clave/page.jsx'),read('components/ProfessionalPasswordResetForm.jsx'),read('app/profesionales/panel/page.jsx'),read('components/ProfessionalLogoutButton.jsx'),read('app/api/professionals/password/request/route.js'),read('app/api/professionals/password/reset/route.js')
 ]);
 assert.match(login,/profesionales\/recuperar-clave/);
 assert.match(login,/¿Has olvidado tu contraseña\?/);
 assert.match(access,/ProfessionalLoginForm/);
 assert.match(login,/params\.get\('reset'\)/);
 assert.match(requestPage+requestForm,/Enviar enlace de recuperación/);
 assert.match(resetPage+resetForm,/Guardar contraseña nueva/);
 assert.match(panel,/ProfessionalLogoutButton/);
 assert.match(logout,/api\/professionals\/logout/);
 assert.match(requestApi,/createProfessionalPasswordResetToken/);
 assert.match(resetApi,/verifyProfessionalPasswordResetToken/);
});

test('mobile header always names the professional signup action completely',async()=>{
 const [header,footer,sitemap]=await Promise.all([read('components/Header.jsx'),read('components/Footer.jsx'),read('app/sitemap.js')]);
 assert.match(header,/href="\/profesionales\/portal"/);
 assert.match(header,/>¿Eres profesional\?</);
 assert.match(footer,/href="\/profesionales\/portal"[^>]*>Área profesional</);
 assert.match(sitemap,/\/profesionales\/portal/);
 assert.doesNotMatch(header,/>Dar de alta</);
});

test('landing trade cards use the approved illustrations and open direct requests',async()=>{
 const [market,tradeGrid,carousel]=await Promise.all([read('components/HomeMarketplace.jsx'),read('components/ProfessionalTradeGrid.jsx'),read('components/ProfessionalCarousel.jsx')]);
 assert.match(market,/¿Qué profesional necesitas\?/);
 assert.match(market,/ProfessionalTradeGrid/);
 assert.match(tradeGrid,/trades-atlas-01\.png/);
 assert.match(tradeGrid,/trades-atlas-02\.png/);
 assert.match(tradeGrid,/solicitar-profesional\?origen=/);
 assert.doesNotMatch(market,/Primero defines el alcance y el presupuesto/);
 assert.doesNotMatch(carousel,/Especialidad robotARQ/);
});

test('admin and lead email expose the saved qualification fields',async()=>{
 const [admin,email]=await Promise.all([read('app/administracion/[id]/page.jsx'),read('lib/case-email.mjs')]);
 for(const text of ['contactPreference','assistanceRequest','notes']){assert.match(admin,new RegExp(text));assert.match(email,new RegExp(text));}
});
