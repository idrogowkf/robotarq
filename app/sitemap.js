import {buildSitemapEntries} from '../lib/seo-pages.mjs';

const core=['','/presupuesto-reforma','/estimador','/solicitar-profesional','/profesionales','/profesionales/alta','/profesionales-reformas','/empresas-constructoras','/contacto','/reformas-hosteleria','/reformas-locales','/reformas-viviendas'];

export default function sitemap(){
  return [
    ...core.map(path=>({url:`https://robotarq.com${path||'/'}`,lastModified:'2026-10-13',changeFrequency:'weekly',priority:path===''?1:0.7})),
    ...buildSitemapEntries()
  ];
}
