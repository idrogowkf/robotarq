import {spawn} from 'node:child_process';
import {readdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
const nextBin=fileURLToPath(new URL('../node_modules/next/dist/bin/next',import.meta.url));
const port=Number(process.env.TEST_PORT||3100+(process.pid%500));
const base=`http://127.0.0.1:${port}`;
const testEnvironment={
  ...process.env,
  NEXT_TELEMETRY_DISABLED:'1',
  VERCEL_ENV:'development',
  CASE_ENCRYPTION_SECRET:'robotarq-test-case-secret-32-characters',
  CUSTOMER_SESSION_SECRET:'robotarq-test-customer-secret-32-characters',
  PROFESSIONAL_SESSION_SECRET:'robotarq-test-professional-secret-32-chars',
  ADMIN_SESSION_SECRET:'robotarq-test-admin-secret-32-characters'
};
const server=spawn(process.execPath,[nextBin,'dev','-p',String(port)],{
  cwd:root,
  env:testEnvironment,
  stdio:['ignore','pipe','pipe']
});

let serverLog='';
for(const stream of [server.stdout,server.stderr])stream.on('data',chunk=>{
  serverLog=(serverLog+chunk.toString()).slice(-12000);
});

const waitForServer=async()=>{
  const deadline=Date.now()+120000;
  while(Date.now()<deadline){
    if(server.exitCode!==null)throw new Error(`El servidor de pruebas terminó antes de arrancar.\n${serverLog}`);
    try{const response=await fetch(base);if(response.ok)return;}catch{}
    await new Promise(resolve=>setTimeout(resolve,300));
  }
  throw new Error(`El servidor de pruebas no respondió en 120 segundos.\n${serverLog}`);
};

const stopServer=async()=>{
  if(server.exitCode!==null)return;
  server.kill('SIGTERM');
  await Promise.race([
    new Promise(resolve=>server.once('exit',resolve)),
    new Promise(resolve=>setTimeout(resolve,5000))
  ]);
  if(server.exitCode===null)server.kill('SIGKILL');
};

try{
  await waitForServer();
  const files=(await readdir(new URL('../tests/',import.meta.url)))
    .filter(name=>name.endsWith('.test.mjs'))
    .map(name=>`tests/${name}`);
  const tests=spawn(process.execPath,['--test',...files],{
    cwd:root,
    env:{...testEnvironment,TEST_BASE_URL:base},
    stdio:'inherit'
  });
  const exitCode=await new Promise((resolve,reject)=>{
    tests.once('error',reject);
    tests.once('exit',code=>resolve(code??1));
  });
  process.exitCode=exitCode;
}catch(error){
  console.error(error instanceof Error?error.message:error);
  process.exitCode=1;
}finally{
  await stopServer();
}
