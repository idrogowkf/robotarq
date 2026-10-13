import {getIndexableSeoPages} from '../lib/seo-pages.mjs';
const base=(process.argv[2]||'http://localhost:3000').replace(/\/$/,'');
const paths=['/','/estimador','/presupuesto-reforma',...getIndexableSeoPages().map(p=>p.path)];
let failures=0;
for(const path of paths){
  try{
    const response=await fetch(base+path,{redirect:'follow'});const html=await response.text();
    const checks={status:response.status===200,title:/<title[^>]*>[^<]+<\/title>/i.test(html),description:/<meta[^>]+name=["']description["'][^>]+content=["'][^"']+/i.test(html)||/<meta[^>]+content=["'][^"']+["'][^>]+name=["']description["']/i.test(html),canonical:/<link[^>]+rel=["']canonical["']/i.test(html),h1:(html.match(/<h1\b/gi)||[]).length===1};
    const broken=Object.entries(checks).filter(([,ok])=>!ok).map(([name])=>name);if(broken.length){failures++;console.error(`FAIL ${path}: ${broken.join(', ')}`)}else console.log(`PASS ${path}`);
  }catch(error){failures++;console.error(`FAIL ${path}: ${error.message}`)}
}
if(failures)process.exitCode=1;else console.log(`Audited ${paths.length} pages successfully.`);
