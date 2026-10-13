import test from 'node:test';
import assert from 'node:assert/strict';
import {SEO_PAGES,LOCAL_CANDIDATES,LONG_TAIL_CANDIDATES,getIndexableSeoPages,buildSitemapEntries} from '../lib/seo-pages.mjs';

test('commercial registry has 15 budget and 8 professional pages',()=>{
  assert.equal(SEO_PAGES.filter(p=>p.type==='budget').length,15);
  assert.equal(SEO_PAGES.filter(p=>p.type==='professional').length,8);
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

