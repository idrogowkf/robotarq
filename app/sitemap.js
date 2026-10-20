import {buildSitemapEntries} from '../lib/seo-pages.mjs';

const UPDATED='2026-10-20';
const core=['','/presupuestos','/presupuesto-reforma','/estimador','/solicitar-profesional','/profesionales','/profesionales/portal','/profesionales/alta','/profesionales-reformas','/empresas-constructoras','/guias','/contacto','/reformas-hosteleria','/reformas-locales','/reformas-viviendas'];

export default function sitemap(){
  return [
    ...core.map(path=>({url:`https://robotarq.com${path||'/'}`,lastModified:UPDATED})),
    ...buildSitemapEntries()
  ];
}
