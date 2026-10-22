import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const root=new URL('../',import.meta.url);

test('the default verification commands run without a manually started server',async()=>{
  const pkg=JSON.parse(await readFile(new URL('package.json',root),'utf8'));
  assert.equal(pkg.scripts.test,'node scripts/test-with-server.mjs');
  assert.equal(pkg.scripts['audit:seo'],'node scripts/audit-seo.mjs https://robotarq.com');
});

test('the self-contained test runner exists',async()=>{
  const source=await readFile(new URL('scripts/test-with-server.mjs',root),'utf8');
  assert.match(source,/next\/dist\/bin\/next/);
  assert.match(source,/TEST_BASE_URL/);
  assert.match(source,/CASE_ENCRYPTION_SECRET/);
  assert.match(source,/CUSTOMER_SESSION_SECRET/);
  assert.match(source,/PROFESSIONAL_SESSION_SECRET/);
  assert.match(source,/ADMIN_SESSION_SECRET/);
  assert.match(source,/finally/);
});
