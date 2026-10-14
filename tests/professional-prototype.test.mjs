import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const file=new URL('../public/prototipo-marketplace-profesionales/index.html',import.meta.url);
test('prototype is isolated, noindex and contains the approved product surfaces',async()=>{const html=await readFile(file,'utf8');assert.match(html,/name="robots" content="noindex, nofollow"/);for(const text of ['Alta profesional','Genera tu presupuesto','Explora profesionales','Tu perfil profesional','Comprobación robotARQ','Vista administrativa'])assert.match(html,new RegExp(text));assert.doesNotMatch(html,/<form[^>]+action=/i);});
test('all professional examples are explicitly demonstrations',async()=>{const html=await readFile(file,'utf8');const cards=(html.match(/class="pro-card"/g)||[]).length,labels=(html.match(/Perfil de demostración/g)||[]).length;assert.ok(cards>=4);assert.ok(labels>=cards);});
test('onboarding prototype covers every approved stage',async()=>{const html=await readFile(file,'utf8');for(const stage of ['Cuenta','Empresa','Servicios','Experiencia','Portafolio','Documentación','Preferencias','Revisión'])assert.match(html,new RegExp(`data-step-label="${stage}"`));});
