import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import vm from 'node:vm';
const root=path.resolve(import.meta.dirname,'../../../..');
const require=createRequire(path.join(root,'package.json'));
const ts=require('typescript');
const packet=import.meta.dirname,rel='packages/contracts/src/commands.ts';
const before=fs.readFileSync(path.join(packet,'before',rel),'utf8');
const after=fs.readFileSync(path.join(packet,'after',rel),'utf8');
const added=['open-task-resource','rename-task-resource','save-task-resource-label','cancel-task-resource-label','set-task-resource-access','remove-task-resource-reference','attach-task-resource-page','add-task-resource-url'];
function load(source){const result={};vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports:result});return result;}
const old=load(before),next=load(after),retained=next.COMMANDS.filter(row=>!added.includes(row.id));
function ledger(rows){const seen=new Map();function visit(value){if(value===undefined)return{$undefined:true};if(value===null||typeof value!=='object')return value;if(seen.has(value))return{$reference:seen.get(value)};const id=seen.size;seen.set(value,id);return Array.isArray(value)?{$array:value.map(visit)}:{$keys:Object.keys(value),$values:Object.values(value).map(visit)};}return rows.map(visit);}
assert.equal(JSON.stringify(old.COMMANDS),JSON.stringify(retained));
assert.equal(JSON.stringify(ledger(old.COMMANDS)),JSON.stringify(ledger(retained)));
assert.equal(JSON.stringify(next.COMMANDS.filter(row=>added.includes(row.id)).map(row=>row.id)),JSON.stringify(added));
for(const id of added){const row=next.COMMANDS.find(row=>row.id===id);assert.equal(row.dispatch,'scoped');assert.equal(row.palette,false);assert.equal(JSON.stringify(row.windows),'["normal"]');assert.equal(next.SCOPED_COMMANDS.find(row=>row.id===id),row);}
const insertion=after.slice(before.indexOf('  ...G(searchEngineControl, "-task-history", ['),after.indexOf('  ...G(searchEngineControl, "-task-history", ['));
assert.equal(after.replace(insertion,''),before);
console.log(JSON.stringify({originalCommands:old.COMMANDS.length,afterCommands:next.COMMANDS.length,added,originalOrderedValuesAndKeys:'PASS',originalReferenceAliasLedger:'PASS',exactAdditiveSourceInverse:'PASS'},null,2));
