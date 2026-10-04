import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {runInNewContext} from 'node:vm';
const root=new URL('../../',import.meta.url),require=createRequire(import.meta.url);
const ts=require('typescript'),{transform}=createRequire(require.resolve('vite'))('esbuild');
const path='packages/contracts/src/runtime-method-features.generated.ts',base='docs/lane-requests/design/runtime-feature-literals/original/';
const read=p=>readFileSync(new URL(p,root),'utf8');
async function load(source){const {code}=await transform(source,{loader:'ts',format:'cjs',target:'chrome154'});const module={exports:{}};runInNewContext(code,{module,exports:module.exports});return module.exports.RuntimeMethodFeatures;}
test('all original method keys, order and actual feature values stay identical',async()=>{const a=await load(read(base+path)),b=await load(read(path));assert.deepEqual(Object.keys(b),Object.keys(a));assert.deepEqual(JSON.parse(JSON.stringify(b)),JSON.parse(JSON.stringify(a)));assert.equal(Object.keys(a).length,129);});
test('actual generator emits exactly the held generated source for the original ordered policy',async()=>{const policy=await load(read(base+path)),generator=read('scripts/gen-host-bindings.mjs');const body=generator.slice(generator.indexOf('const featureCounts ='),generator.indexOf('// ---- dev-only mock host'));const generated=Function('methodFeatures',body+'return runtimeMethodFeatures;')(policy);assert.equal(generated,read(path));const before=read(base+'scripts/gen-host-bindings.mjs');const a=before.slice(before.indexOf('const runtimeMethodFeatures ='),before.indexOf('// ---- dev-only mock host'));assert.equal(generator.replace(body,a),before);});
test('installed TypeScript retains every original per-method literal feature type',()=>{function types(relative){const file=new URL(relative,root).pathname,program=ts.createProgram([file],{noEmit:true,noResolve:true,skipLibCheck:true,target:ts.ScriptTarget.ESNext});const checker=program.getTypeChecker(),source=program.getSourceFile(file),symbol=checker.getExportsOfModule(checker.getSymbolAtLocation(source)).find(s=>s.name==='RuntimeMethodFeatures');return checker.getPropertiesOfType(checker.getTypeOfSymbolAtLocation(symbol,source)).map(p=>[p.name,checker.typeToString(checker.getTypeOfSymbolAtLocation(p,source))]);}assert.deepEqual(types(path),types(base+path));});
