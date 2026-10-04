import {test} from 'node:test';import assert from 'node:assert/strict';import{readFileSync}from'node:fs';import{createRequire}from'node:module';import{runInNewContext}from'node:vm';
const req=createRequire(import.meta.url),{transform}=createRequire(req.resolve('vite'))('esbuild');
const base=new URL('../../docs/lane-requests/design/page-recovery-controls/',import.meta.url);
const ids=['retry-page-recovery','edit-page-recovery-address','back-page-recovery','continue-page-over-http','proceed-page-certificate','toggle-page-connection-details'];
async function read(path){const{code}=await transform(readFileSync(new URL(path,base),'utf8'),{loader:'ts',format:'cjs',target:'chrome154'});const module={exports:{}};runInNewContext(code,{module,exports:module.exports});return JSON.parse(JSON.stringify(module.exports.COMMANDS))}
test('six original-owner Page controls have closed scoped routing with all original definitions untouched',async()=>{
 const before=await read('original/packages/contracts/src/commands.ts'),after=await read('shared-result/packages/contracts/src/commands.ts');assert.deepEqual(after.filter(row=>!ids.includes(row.id)),before);
 for(const id of ids){const rows=after.filter(row=>row.id===id);assert.equal(rows.length,1);assert.equal(rows[0].section,'Page');assert.equal(rows[0].handler,'shell');assert.equal(rows[0].dispatch,'scoped');assert.equal(rows[0].focusShell,true);assert.equal(rows[0].palette,false);assert.deepEqual(rows[0].bindings,[]);assert.deepEqual(rows[0].windows,['normal','private','little','quick-ask'])}
});
