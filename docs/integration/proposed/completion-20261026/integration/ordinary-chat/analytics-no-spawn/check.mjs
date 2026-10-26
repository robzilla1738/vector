import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const plan=JSON.parse(fs.readFileSync(new URL('./proposal.json',import.meta.url)));
for(const row of plan.resources){
 const before=fs.readFileSync(row.path,'utf8'),rule=plan.rules[0];
 assert.equal(before.split(rule.find).length-1,1);
 const after=before.replace(rule.find,rule.replace);
 const begin=after.indexOf('async function getSystemInfo()');
 const end=after.indexOf('var execAsync,$,',begin);
 assert(begin>=0&&end>begin);
 let spawned=0;
 const context=vm.createContext({process:{platform:'darwin'},$:()=>{spawned++;throw Error('spawn forbidden')}});
 const result=await vm.runInContext(after.slice(begin,end)+';getSystemInfo()',context);
 assert.equal(JSON.stringify(result),'{}');assert.equal(spawned,0);
}
console.log('Optional macOS analytics system metadata: no process invocation.');
