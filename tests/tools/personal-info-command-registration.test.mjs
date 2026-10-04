import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
const require=createRequire(import.meta.url),{transform}=createRequire(require.resolve('vite'))('esbuild');
const base=new URL('../../docs/lane-requests/design/personal-info-controls/',import.meta.url);
const ids=['retry-personal-info','import-prior-personal-info','edit-personal-info','save-personal-info','cancel-personal-info'];
async function commands(kind){const source=readFileSync(new URL(kind+'/packages/contracts/src/commands.ts',base),'utf8');const{code}=await transform(source,{loader:'ts',format:'cjs',target:'chrome154'});const module={exports:{}};runInNewContext(code,{module,exports:module.exports});return JSON.parse(JSON.stringify(module.exports.COMMANDS))}
test('five actual metadata rows preserve all original definitions and normal focused scoped dispatch',async()=>{
 const before=await commands('shared-original'),after=await commands('shared-result');assert.deepEqual(after.filter(row=>!ids.includes(row.id)),before);
 for(const id of ids){const rows=after.filter(row=>row.id===id);assert.equal(rows.length,1);assert.deepEqual(rows[0].windows,['normal']);assert.equal(rows[0].handler,'shell');assert.equal(rows[0].focusShell,true);assert.equal(rows[0].palette,false);assert.equal(rows[0].dispatch,"scoped");assert.deepEqual(rows[0].bindings,[])}
 const source=readFileSync(new URL('shared-result/apps/shell/src/commands.ts',base),'utf8');
 assert.match(source,/Object\.fromEntries\(SCOPED_COMMANDS\.map\(\(\{ id \}\) => \[id, .*invokeScopedControl\(id, context\)\]/);
});
