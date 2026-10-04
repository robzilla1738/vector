import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import ts from 'typescript';
const require=createRequire(new URL('../../apps/shell/package.json',import.meta.url));
const viteRequire=createRequire(require.resolve('vite/package.json'));
const {rollup}=await import(pathToFileURL(viteRequire.resolve('rollup')));
const source=ts.createSourceFile('vite.config.ts',readFileSync(new URL('../../apps/shell/vite.config.ts',import.meta.url),'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TS);
let initializer;
function visit(node){if(ts.isPropertyAssignment(node)&&node.name.getText(source)==='chunkFileNames')initializer=node.initializer;ts.forEachChild(node,visit)}visit(source);
assert.ok(initializer);
const emitted=ts.transpileModule(`export default ${initializer.getText(source)};`,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const {default:filename}=await import('data:text/javascript,'+encodeURIComponent(emitted));
test('original boot and forbidden-development filename selectors remain intact',()=>{
 for(const name of ['App','MockPage','xterm'])assert.equal(filename({name}),'assets/[name]-[hash].js');
 for(const name of ['Conversation','Settings','deferred'])assert.equal(filename({name}),'assets/[hash].js');
 assert.ok(readFileSync(new URL('../../scripts/budgets.json',import.meta.url),'utf8').includes('^assets/App-'));
 assert.ok(readFileSync(new URL('../../chromium/stage-shell.mjs',import.meta.url),'utf8').includes('(?:MockPage|xterm)-'));
 assert.equal(source.statements.filter(s=>s.getText(source).includes('entryFileNames')).length,0);
});
test('actual installed Rollup preserves entry, modules, exports and lazy graph with supported filename callback',async()=>{
 const inputs={main:'export const loadApp=()=>import("App");export const loadOther=()=>import("Other");',App:'globalThis.appEffects=(globalThis.appEffects??0)+1;export const value=7;',Other:'globalThis.otherEffects=(globalThis.otherEffects??0)+1;export const value=8;'};
 const bundle=await rollup({input:'main',plugins:[{name:'owned-source',resolveId:id=>Object.hasOwn(inputs,id)?id:null,load:id=>inputs[id]}]});
 try{
  const before=(await bundle.generate({format:'es',entryFileNames:'assets/[name]-[hash].js',chunkFileNames:'assets/[name]-[hash].js'})).output;
  const after=(await bundle.generate({format:'es',entryFileNames:'assets/[name]-[hash].js',chunkFileNames:filename})).output;
  const byName=new Map(after.map(x=>[x.name,x]));const mapping=new Map(before.map(x=>[x.fileName,byName.get(x.name).fileName]));
  for(const b of before){const a=byName.get(b.name);assert.deepEqual(a.moduleIds,b.moduleIds);assert.deepEqual(a.exports,b.exports);assert.equal(a.isEntry,b.isEntry);assert.deepEqual(a.imports,b.imports.map(x=>mapping.get(x)));assert.deepEqual(a.dynamicImports,b.dynamicImports.map(x=>mapping.get(x)));let code=a.code;for(const [old,next]of mapping)code=code.replaceAll(next,old).replaceAll(next.slice(7),old.slice(7));assert.equal(code,b.code)}
  assert.match(byName.get('App').fileName,/^assets\/App-[\w-]{8}\.js$/);assert.match(byName.get('Other').fileName,/^assets\/[\w-]{8}\.js$/);
 }finally{await bundle.close()}
});
test('same-content dynamic chunks retain eight-character hash collision handling and unique URLs',async()=>{
 const inputs={main:'export const first=()=>import("first");export const second=()=>import("second");',first:'export const value=1;',second:'export const value=1;'};
 const bundle=await rollup({input:'main',plugins:[{name:'owned-identical-source',resolveId:id=>Object.hasOwn(inputs,id)?id:null,load:id=>inputs[id]}]});
 try{const chunks=(await bundle.generate({format:'es',entryFileNames:'assets/[name]-[hash].js',chunkFileNames:filename})).output;const lazy=chunks.filter(x=>!x.isEntry);assert.equal(lazy.length,2);assert.equal(lazy[0].code,lazy[1].code);assert.equal(new Set(chunks.map(x=>x.fileName.toLowerCase())).size,chunks.length);for(const x of lazy)assert.match(x.fileName,/^assets\/[\w-]{8}\.js$/)}finally{await bundle.close()}
});
