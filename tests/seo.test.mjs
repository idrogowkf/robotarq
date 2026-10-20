import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {SEO_PAGES,LOCAL_CANDIDATES,LONG_TAIL_CANDIDATES,getIndexableSeoPages,buildSitemapEntries} from '../lib/seo-pages.mjs';

const read=path=>readFile(new URL(`../${path}`,import.meta.url),'utf8');

test('commercial registry has the approved budget, professional and guide coverage',()=>{
  assert.equal(SEO_PAGES.filter(p=>p.type==='budget').length,23);
  assert.equal(SEO_PAGES.filter(p=>p.type==='professional').length,15);
  assert.equal(SEO_PAGES.filter(p=>p.type==='guide').length,3);
});
test('published pages have unique search fields and substantive authored content',()=>{
  for(const field of ['slug','title','description','h1','canonical','preset']) assert.equal(new Set(SEO_PAGES.map(p=>p[field])).size,SEO_PAGES.length,field);
  for(const page of SEO_PAGES){assert.match(page.canonical,new RegExp(`/${page.slug}$`));assert.ok(page.description.length>=90);assert.ok(page.sections.length>=3);assert.ok(page.faqs.length>=3);assert.ok(page.related.length>=3);}
});
test('publication gates exclude incomplete local and long-tail candidates',()=>{
  assert.ok([...LOCAL_CANDIDATES,...LONG_TAIL_CANDIDATES].every(p=>!p.indexable&&!p.evidenceComplete));
  const urls=buildSitemapEntries().map(e=>e.url);
  assert.equal(urls.length,getIndexableSeoPages().length);
  assert.ok(!urls.some(url=>/(privacidad|condiciones|administracion|mi-cuenta|recuperar)/.test(url)));
});

test('technical indexation contract is Spain-specific and excludes private routes',async()=>{
  const [layout,robots,sitemap]=await Promise.all([read('app/layout.jsx'),read('app/robots.txt/route.js'),read('app/sitemap.js')]);
  assert.match(layout,/<html lang="es-ES">/);
  assert.match(layout,/areaServed:\s*"ES"/);
  assert.match(layout,/priceCurrency:\s*"EUR"/);
  assert.match(robots,/Disallow: \/administracion/);
  assert.match(robots,/Disallow: \/profesionales\/restablecer-clave/);
  assert.doesNotMatch(sitemap,/changeFrequency|priority/);
  const entries=buildSitemapEntries();
  assert.equal(new Set(entries.map(entry=>entry.url)).size,entries.length);
  assert.ok(entries.every(entry=>Object.keys(entry).sort().join(',')==='lastModified,url'));
});

test('commercial registry owns distinct clusters and specific authored content',()=>{
  const allowed=new Set(['presupuestos','profesionales','guias']);
  for(const page of SEO_PAGES){
    assert.ok(allowed.has(page.cluster),`${page.slug} cluster`);
    assert.ok(page.sections.length>=5,`${page.slug} sections`);
    assert.ok(page.sections.every(section=>section.text.length>=150),`${page.slug} section depth`);
    assert.ok(page.spainContext.length>=100,`${page.slug} Spain context`);
  }
  assert.equal(new Set(SEO_PAGES.map(page=>page.sections.map(section=>section.text).join('|'))).size,SEO_PAGES.length);
});

test('priority high-intent Spain pages are present and indexable',()=>{
  const expected=[
    'presupuesto-reforma-metro-cuadrado','cuanto-cuesta-reformar-casa','presupuesto-obra-online',
    'presupuesto-cubierta-tejado','presupuesto-ventanas','presupuesto-climatizacion',
    'presupuesto-aislamiento-termico','presupuesto-impermeabilizacion-humedades',
    'empresas-albanileria','instaladores-climatizacion','empresas-ventanas','impermeabilizadores',
    'pintores-profesionales','alicatadores-soladores','tecnicos-licencias-proyectos',
    'comparar-presupuestos-reforma','que-incluye-presupuesto-obra','diferencia-estimacion-presupuesto-oferta'
  ];
  const slugs=new Set(getIndexableSeoPages().map(page=>page.slug));
  for(const slug of expected)assert.ok(slugs.has(slug),slug);
});

test('search hubs and navigation connect the three public journeys',async()=>{
  const [budgets,guides,header,footer,home]=await Promise.all([
    read('app/presupuestos/page.jsx'),read('app/guias/page.jsx'),read('components/Header.jsx'),read('components/Footer.jsx'),read('app/page.jsx')
  ]);
  assert.match(budgets,/SEO_PAGES/);
  assert.match(guides,/cluster==='guias'/);
  assert.match(header,/href="\/presupuestos"/);
  assert.match(header,/href="\/profesionales"/);
  assert.match(header,/href="\/profesionales\/portal"/);
  assert.match(footer,/href="\/guias"/);
  assert.match(home,/["']\/presupuestos["']/);
});

