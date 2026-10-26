import fs from 'node:fs';import assert from 'node:assert/strict';
const plan=JSON.parse(fs.readFileSync(new URL('./proposal.json',import.meta.url))),rule=plan.rules[0];
const extra=rule.replace.slice(0,rule.replace.indexOf('let si='));
const code=extra.replace('this.#w(ri)','cleanup(ri)');
const check=new Function('ii','ai','oi','ri','ti','cleanup',code);
for(const status of ['idle','running','suspended','errored','interrupted','aborted'])for(const active of [false,true])for(const orphan of [false,true]){
 const socket={},frames=[],entry={fanout:{send:(target,frame)=>{assert.equal(target,socket);frames.push(frame)}}};let clean=0;
 check({status},active,orphan,entry,socket,value=>{assert.equal(value,entry);clean++});
 assert.equal(frames.length,status==='errored'&&!active&&!orphan?1:0);assert.equal(clean,frames.length);
 if(frames.length){assert.equal(frames[0].op,'error');assert.equal(frames[0].protocolVersion,1);assert.deepEqual(Object.keys(frames[0]).sort(),['message','op','protocolVersion']);assert.match(frames[0].message,/Retry this task/)}
}
console.log('Only inactive errored session publishes fixed safe error to original socket.');
