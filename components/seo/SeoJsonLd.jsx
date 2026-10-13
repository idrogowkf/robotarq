export default function SeoJsonLd({page}){
  const graph=[
    {'@type':'Service','@id':`${page.canonical}#service`,name:page.h1,description:page.description,url:page.canonical,provider:{'@type':'Organization',name:'robotARQ',url:'https://robotarq.com/'}},
    {'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Inicio',item:'https://robotarq.com/'},{'@type':'ListItem',position:2,name:page.h1,item:page.canonical}]},
    {'@type':'FAQPage',mainEntity:page.faqs.map(({q,a})=>({'@type':'Question',name:q,acceptedAnswer:{'@type':'Answer',text:a}}))}
  ];
  return <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({'@context':'https://schema.org','@graph':graph})}}/>;
}
