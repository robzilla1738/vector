// Exact closed-schema source proof; no crypto, native or account operation.
import { parse } from '/Users/rcourson/Documents/Vibe/web/node_modules/.pnpm/acorn@8.19.0/node_modules/acorn/dist/acorn.mjs';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const path='/Users/rcourson/Documents/Vibe/web/out/provided-candidate-local-completion-20261025-a38/Aux.app/Contents/Resources/aux/apps/extension/dist/assets/-types-Wy38XkNB.js';
const source=readFileSync(path,'utf8'),ast=parse(source,{ecmaVersion:'latest',sourceType:'module'}),names=new Set(['I','_','B','E','Y']);
const statement=ast.body.find(node=>node.type==='VariableDeclaration'&&node.declarations.some(row=>row.id.name==='I'));
if(!statement||statement.kind!=='var')throw Error('Original schema declaration changed');
const removed=statement.declarations.filter(row=>names.has(row.id.name));
if(removed.length!==5)throw Error('Exact five legacy-schema declarations required');
const outside=[];
function walk(node,parent,key){
 if(!node||typeof node!=='object')return;if(Array.isArray(node)){for(const child of node)walk(child,parent,key);return;}
 if(node.type==='Identifier'&&names.has(node.name)&&!removed.some(row=>node.start>=row.start&&node.end<=row.end)){
  const notReference=parent&&((parent.type==='ImportSpecifier'&&key==='imported')||(parent.type==='ExportSpecifier'&&key==='exported')||(parent.type==='MemberExpression'&&key==='property'&&!parent.computed)||(parent.type==='Property'&&key==='key'&&!parent.computed&&!parent.shorthand));
  if(!notReference)outside.push({name:node.name,position:node.start});
 }
 for(const[k,v]of Object.entries(node))if(v&&typeof v==='object')walk(v,node,k);
}
walk(ast);if(outside.length)throw Error('Legacy schema has active consumers: '+JSON.stringify(outside));
const find=source.slice(statement.start,statement.end),replace='var '+statement.declarations.filter(row=>!names.has(row.id.name)).map(row=>source.slice(row.start,row.end)).join(',')+';';
const pins={format:'aux.closed-legacy-recovery-ui.v1',path:'assets/-types-Wy38XkNB.js',originalSha256:createHash('sha256').update(source).digest('hex'),closedBindings:removed.map(row=>({name:row.id.name,source:source.slice(row.start,row.end)})),externalIdentifierReferences:outside,exports:ast.body.filter(node=>node.type==='ExportNamedDeclaration').flatMap(node=>node.specifiers.map(row=>({local:row.local.name,exported:row.exported.name}))),rule:{scope:'remove unexported unused legacy AUK recovery/setup schema graph',find,replace,count:1},cryptoFormatRenamed:false,ciphertextReadOrReinterpreted:false};
writeFileSync(new URL('./source-pins.json',import.meta.url),JSON.stringify(pins,null,2)+'\n');
console.log(JSON.stringify({closedBindings:5,externalReferences:outside.length,exportCount:pins.exports.length}));
