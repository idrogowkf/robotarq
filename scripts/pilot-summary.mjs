import { list } from '@vercel/blob';
try { process.loadEnvFile('.env.local'); } catch {}
let cursor;const counts={};let samples=0;
do {
 const page=await list({prefix:'robotarq-metrics/',limit:1000,cursor});cursor=page.hasMore?page.cursor:undefined;
 for(const blob of page.blobs){const r=await fetch(blob.url);if(!r.ok)continue;const x=await r.json();if(x.version!=='pilot-v1')continue;counts[x.event]=(counts[x.event]||0)+1;samples++;}
}while(cursor);
console.log(JSON.stringify({samples,counts,note:'Eventos agregados, no usuarios únicos ni ventas. Las pruebas se deben separar por fecha y registro de auditoría.'},null,2));
