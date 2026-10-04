import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { createRequire } from 'node:module';
const root=new URL('../../',import.meta.url),require=createRequire(import.meta.url);
const {transform}=createRequire(require.resolve('vite'))('esbuild');
const beforePath='docs/lane-requests/design/host-error-constructors/original/packages/contracts/src/errors.ts';
const afterPath='packages/contracts/src/errors.ts';
const keys=['id','domain','retryable','payloadAllowlist','origin','userRecovery','modelGuidance','publicMessage'];
async function load(path){const {code}=await transform(readFileSync(new URL(path,root),'utf8'),{loader:'ts',format:'cjs',target:'chrome154'});const module={exports:{}};runInNewContext(code,{module,exports:module.exports,URL});return module.exports;}
const plain=value=>JSON.parse(JSON.stringify(value));
test('all original error rows retain ordered plain keys, exact policy/copy and fresh allowlists',async()=>{
  const a=await load(beforePath),b=await load(afterPath);
  assert.deepEqual(Object.keys(b),Object.keys(a));assert.deepEqual(Object.keys(b.AUX_ERROR_REGISTRY),Object.keys(a.AUX_ERROR_REGISTRY));
  const rows=Object.keys(a.AUX_ERROR_REGISTRY);assert.equal(rows.length,20);
  for(const code of rows){const x=a.AUX_ERROR_REGISTRY[code],y=b.AUX_ERROR_REGISTRY[code];assert.deepEqual(Object.keys(y),keys);assert.deepEqual(plain(y),plain(x));assert.equal(Object.getPrototypeOf(y).constructor.name,'Object');assert.equal(Object.getOwnPropertyDescriptors(y).id.writable,true);for(const other of rows)assert.equal(y.payloadAllowlist===b.AUX_ERROR_REGISTRY[other].payloadAllowlist,x.payloadAllowlist===a.AUX_ERROR_REGISTRY[other].payloadAllowlist);}
});
test('original AuxError public redaction, recovery advice, class behavior and fresh payloads remain exact',async()=>{
  const a=await load(beforePath),b=await load(afterPath);
  const details=[{id:'secret',pageId:'secret',revision:7,status:503,timeoutMs:20,matchCount:3,field:'token',origin:'https://example.test/',effect:'write',stage:'on',host:'chromium-fork',feature:'spaces',suspensionKind:'approval',secret:'password'}, {revision:NaN,status:-1,origin:'https://user:password@example.test/',effect:'wrong',stage:'wrong',host:'wrong',feature:'bad\nname',suspensionKind:'wrong'},[],null];
  for(const code of Object.keys(a.AUX_ERROR_REGISTRY)){
    assert.deepEqual(plain(b.errorAdvice(code)),plain(a.errorAdvice(code)));assert.deepEqual(Object.keys(b.errorAdvice(code)),['retryable','hint']);assert.notEqual(b.errorAdvice(code),b.errorAdvice(code));
    for(const detail of details){const x=new a.AuxError(code,'private diagnostic',detail),y=new b.AuxError(code,'private diagnostic',detail);assert.equal(y instanceof Error,false);assert.equal(y.name,x.name);assert.equal(y.message,x.message);assert.equal(y.detail,detail);assert.equal(b.isAuxError(y),true);assert.equal(b.isAuxError(x),false);assert.deepEqual(plain(y.toJSON()),plain(x.toJSON()));assert.notEqual(y.toJSON(),y.toJSON());assert.equal(JSON.stringify(y.toJSON()).includes('private diagnostic'),false);assert.equal(JSON.stringify(y.toJSON()).includes('password'),false);}
  }
  assert.deepEqual(plain(b.toErrorPayload(new Error('secret'))),plain(a.toErrorPayload(new Error('secret'))));
});
test('constructor inverse restores every original expression and all remaining error implementation bytes',()=>{
  const ts=require('typescript'),before=readFileSync(new URL(beforePath,root),'utf8');let after=readFileSync(new URL(afterPath,root),'utf8');
  const begin=after.indexOf('function errorDefinition<'),end=after.indexOf('/** Stable, exhaustive',begin);after=after.slice(0,begin)+after.slice(end);
  after=after.replace('const advice = (retryable: boolean, hint: string | null) => ({ retryable, hint });\n\n','');
  after=after.replace(/return advice\((true|false), ("[^"\n]*"|null)\);/g,'return { retryable: $1, hint: $2 };');
  const ast=ts.createSourceFile('errors.ts',after,ts.ScriptTarget.Latest,true),edits=[];
  function visit(node){
    if(ts.isCallExpression(node)&&['errorDefinition','runtimeError','browserError'].includes(node.expression.getText(ast))){
      const name=node.expression.getText(ast),args=[...node.arguments].map(n=>n.getText(ast));
      if(name!=='errorDefinition'){assert.equal(args.length,6);const kind=name==='runtimeError'?'runtime':'browser';args.splice(1,0,JSON.stringify(kind));args.splice(4,0,JSON.stringify(kind));}
      assert.equal(args.length,8);assert.match(args[0],/^[0-9]{4}$/);args[0]=JSON.stringify('AUX-E'+args[0]);
      edits.push([node.getStart(ast),node.end,'{ '+keys.map((key,i)=>key+': '+args[i]).join(', ')+' }']);
    }
    ts.forEachChild(node,visit);
  }
  visit(ast);assert.equal(edits.length,20);
  for(const [start,end,text]of edits.reverse())after=after.slice(0,start)+text+after.slice(end);assert.equal(after,before);
});
