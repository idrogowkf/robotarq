const nextConfig={
 async redirects(){return [
  {source:'/:path*',has:[{type:'host',value:'www.robotarq.com'}],destination:'https://robotarq.com/:path*',permanent:true},
  {source:'/reformas-bares',destination:'/reformas-hosteleria',permanent:true},
  {source:'/reformas-bares/:slug*',destination:'/reformas-hosteleria',permanent:true}
 ];},
 async headers(){return [{source:'/:path*',headers:[
  {key:'X-Content-Type-Options',value:'nosniff'},
  {key:'X-Frame-Options',value:'DENY'},
  {key:'Referrer-Policy',value:'strict-origin-when-cross-origin'},
  {key:'Permissions-Policy',value:'camera=(), microphone=(), geolocation=()'},
  {key:'Content-Security-Policy',value:"default-src 'self'; script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com https://vercel.live; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://vitals.vercel-insights.com https://vercel.live; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'"}
 ]}];}
};export default nextConfig;
