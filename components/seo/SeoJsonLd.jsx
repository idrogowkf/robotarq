export default function SeoJsonLd({page}){
  const hub=page.cluster==='profesionales'?'/profesionales':page.cluster==='guias'?'/guias':'/presupuestos';
  const entity=page.type==='guide'
    ? {'@type':'Article','@id':`${page.canonical}#article`,headline:page.h1,description:page.description,url:page.canonical,inLanguage:'es-ES',author:{'@type':'Organization',name:'robotARQ',url:'https://robotarq.com/'}}
    : {'@type':'Service','@id':`${page.canonical}#service`,name:page.h1,description:page.description,url:page.canonical,areaServed:{'@type':'Country',name:'España'},provider:{'@type':'Organization',name:'robotARQ',url:'https://robotarq.com/'}};
  const graph=[
    entity,
    {'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Inicio',item:'https://robotarq.com/'},{'@type':'ListItem',position:2,name:page.cluster,item:`https://robotarq.com${hub}`},{'@type':'ListItem',position:3,name:page.h1,item:page.canonical}]},
    {'@type':'FAQPage',mainEntity:page.faqs.map(({q,a})=>({'@type':'Question',name:q,acceptedAnswer:{'@type':'Answer',text:a}}))}
  ];
  return <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({'@context':'https://schema.org','@graph':graph})}}/>;
}
