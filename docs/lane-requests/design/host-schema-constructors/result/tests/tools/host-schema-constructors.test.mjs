import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { createRequire } from 'node:module';
const root = new URL('../../', import.meta.url);
const require = createRequire(import.meta.url);
const {transform}=createRequire(require.resolve('vite'))('esbuild');
const contractsRequire=createRequire(new URL('packages/contracts/dist/browser-host-methods.js',root));
const {z}=createRequire(new URL('packages/contracts/package.json',root))('zod');
async function tables(relative, trace) {
  const {code}=await transform(readFileSync(new URL(relative,root),'utf8'),{loader:'ts',format:'cjs',target:'chrome154'});
  const module={exports:{}};
  const read = trace ? name => {
    const exports = contractsRequire(name);
    if(name !== 'zod') return exports;
    return {...exports,z:{...exports.z,
      object(...args){trace.push(['object',Object.keys(args[0])]);const schema=exports.z.object(...args);const strict=schema.strict;schema.strict=function(...args){trace.push(['strict']);return strict.apply(this,args)};return schema},
      tuple(...args){trace.push(['tuple',args[0].map(item=>item._zod.def.type)]);return exports.z.tuple(...args)},
    }};
  } : contractsRequire;
  runInNewContext(code,{module,exports:module.exports,require:read});return module.exports;
}
const beforePath='docs/lane-requests/design/host-schema-constructors/original/packages/contracts/src/browser-host-methods.ts';
function schemaDescription(schema) {
  try{return {json:z.toJSONSchema(schema)}}catch(error){return {unsupported:error.message}}
}
test('every actual method/event stays ordered with identical policy and installed Zod schema',async()=>{
  const before=await tables(beforePath),after=await tables('packages/contracts/src/browser-host-methods.ts');
  assert.deepEqual(Object.keys(after),Object.keys(before));
  for (const table of ['BrowserHostMethods','HostEvents']) {
    assert.deepEqual(Object.keys(after[table]),Object.keys(before[table]));
    for (const id of Object.keys(before[table])) {
      const a=before[table][id],b=after[table][id];assert.deepEqual(Object.keys(b),Object.keys(a));
      for(const key of Object.keys(a)) {
        if(a[key]?._zod){assert.deepEqual(schemaDescription(b[key]),schemaDescription(a[key]),id+'.'+key)}
        else assert.equal(b[key],a[key],id+'.'+key);
      }
    }
  }
});
test('real strict validation, optional tuple arity, fresh schema identity and metadata remain intact',async()=>{
  const {BrowserHostMethods:a}=await tables(beforePath),{BrowserHostMethods:b}=await tables('packages/contracts/src/browser-host-methods.ts');
  for(const table of [a,b]){
    assert.equal(table.capabilities.args.safeParse([]).success,true);
    assert.equal(table.capabilities.args.safeParse(['foreign']).success,false);
    const profile={id:'p',name:'Profile',current:true};
    assert.deepEqual(table.browserProfiles.result.parse([profile]),[profile]);
    assert.equal(table.browserProfiles.result.safeParse([{...profile,unknown:true}]).success,false);
    assert.equal(table.browserProfiles.result.safeParse([{...profile,current:'true'}]).success,false);
    assert.equal(table.showOriginal.args.safeParse(['page']).success,true);
    assert.equal(table.showOriginal.args.safeParse([]).success,false);
    assert.notEqual(table.removeFilterSource.args,table.setFilterSourceEnabled.args);
    const isolated=table.removeFilterSource.args.describe('original consumer metadata');
    assert.equal(isolated.description,'original consumer metadata');assert.equal(table.removeFilterSource.args.description,undefined);
  }
});
test('closed source factoring retains all original argument expressions and factory order',()=>{
  const before=readFileSync(new URL(beforePath,root),'utf8');let after=readFileSync(new URL('packages/contracts/src/browser-host-methods.ts',root),'utf8');
  after=after.replace('const strictObject = <Shape extends z.ZodRawShape>(shape: Shape) => z.object(shape).strict();\nconst tuple = z.tuple;\n','');
  // Installed parser identifies each original exact object call; reverse only its callee and suffix.
  const ts=require('typescript');const ast=ts.createSourceFile('before.ts',before,ts.ScriptTarget.Latest,true);const calls=[];
  function visit(node){if(ts.isCallExpression(node)&&ts.isPropertyAccessExpression(node.expression)&&node.expression.name.text==='strict'&&node.arguments.length===0){const object=node.expression.expression;if(ts.isCallExpression(object)&&ts.isPropertyAccessExpression(object.expression)&&object.expression.expression.getText(ast)==='z'&&object.expression.name.text==='object'&&object.arguments.length===1){calls.push(object.arguments[0].getText(ast));}}ts.forEachChild(node,visit);}visit(ast);
  assert.equal(calls.length,90);assert.equal((after.match(/\btuple\(/g)||[]).length,111);
  after=after.replace(/\btuple\(/g,'z.tuple(');
  // Nested argument text transforms too; use parser to undo all generated calls without guessing parentheses.
  const result=ts.createSourceFile('after.ts',after,ts.ScriptTarget.Latest,true),edits=[];
  function undo(node){if(ts.isCallExpression(node)&&ts.isIdentifier(node.expression)&&node.expression.text==='strictObject'){edits.push([node.expression.getStart(result),node.expression.end,'z.object']);edits.push([node.end,node.end,'.strict()']);}ts.forEachChild(node,undo);}undo(result);
  for(const [start,end,text]of edits.sort((a,b)=>b[0]-a[0]))after=after.slice(0,start)+text+after.slice(end);
  assert.equal(after,before);
});

test('actual installed factory invocation order and every original shared-schema relationship stay identical',async()=>{
  const left=[],right=[];
  const a=await tables(beforePath,left),b=await tables('packages/contracts/src/browser-host-methods.ts',right);
  assert.deepEqual(JSON.parse(JSON.stringify(right)),JSON.parse(JSON.stringify(left)));
  const schemas=table=>Object.values(table.BrowserHostMethods).flatMap(method=>[method.args,method.result]);
  const x=schemas(a),y=schemas(b);
  for(let i=0;i<x.length;i++)for(let j=0;j<x.length;j++)assert.equal(y[i]===y[j],x[i]===x[j]);
});
