import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {runInNewContext} from 'node:vm';
const root=new URL('../../',import.meta.url),require=createRequire(import.meta.url),ts=require('typescript');
const {transform}=createRequire(require.resolve('vite'))('esbuild');
const base='docs/lane-requests/design/page-recovery-factor/original/',path='packages/contracts/src/commands.ts',read=p=>readFileSync(new URL(p,root),'utf8');
async function commands(source){const{code}=await transform(source,{loader:'ts',format:'cjs',target:'chrome154'});const module={exports:{}};runInNewContext(code,{module,exports:module.exports});return module.exports;}
test('every ordered command, metadata key and derived scoped row remains exact',async()=>{const a=await commands(read(base+path)),b=await commands(read(path));assert.equal(a.COMMANDS.length,402);assert.deepEqual(JSON.parse(JSON.stringify(b)),JSON.parse(JSON.stringify(a)));for(let i=0;i<a.COMMANDS.length;i++)assert.deepEqual(Object.keys(b.COMMANDS[i]),Object.keys(a.COMMANDS[i]));});
test('all original command and nested binding/window reference relationships remain exact',async()=>{const a=(await commands(read(base+path))).COMMANDS,b=(await commands(read(path))).COMMANDS;for(let i=0;i<a.length;i++)for(let j=0;j<a.length;j++)for(const field of [undefined,'windows','bindings'])assert.equal(field?b[i][field]===b[j][field]:b[i]===b[j],field?a[i][field]===a[j][field]:a[i]===a[j]);});
test('all original literal shell IDs and command types are preserved by installed TypeScript',()=>{function types(p){const file=new URL(p,root).pathname,program=ts.createProgram([file],{noEmit:true,target:ts.ScriptTarget.ESNext,module:ts.ModuleKind.NodeNext,moduleResolution:ts.ModuleResolutionKind.NodeNext,skipLibCheck:true}),checker=program.getTypeChecker(),source=program.getSourceFile(file);const symbol=checker.getExportsOfModule(checker.getSymbolAtLocation(source)).find(s=>s.name==='ShellCommandId');const type=checker.getDeclaredTypeOfSymbol(symbol);return type.types.map(t=>checker.typeToString(t)).sort();}assert.deepEqual(types(path),types(base+path));});
test('the entire original command source restores by expanding only closed literal groups',()=>{let s=read(path);s=s.replace(/^const G = .*\n/m,'');let groups=0;s=s.replace(/  \.\.\.G\((\w+), ("(?:[^"\\]|\\.)*"), \[\n([\s\S]*?)  \]\),\n/g,(_match,defaults,middle,rows)=>{groups++;const text=JSON.parse(middle);return rows.trimEnd().split('\n').map(row=>{const[a,b,label]=JSON.parse(row.trim().slice(0,-1));return '  S('+JSON.stringify(a+text+b)+', '+JSON.stringify(label)+', '+defaults+'),\n';}).join('');});assert.equal(groups,24);assert.equal(s,read(base+path));});
test('all original page ownership, native operations and recovery copy restore unchanged outside the factored buttons',()=>{
  const p='apps/shell/src/components/PageRecovery.tsx',before=read(base+p);let after=read(p);
  after=after.slice(0,after.indexOf('\nfunction RecoveryButton')).replace(', type ReactNode }',' }');
  const start=text=>text.indexOf('\n',text.indexOf('<div className="empty-actions">'))+1;
  const end=text=>text.indexOf('\n        </div>',start(text));
  after=after.slice(0,start(after))+before.slice(start(before),end(before))+after.slice(end(after));
  assert.equal(after,before);
});
