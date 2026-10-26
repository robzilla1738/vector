import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const source=fs.readFileSync(new URL('./owner.js',import.meta.url),'utf8');let current={createdAt:1,incarnationId:'original',mode:'local',authStatus:'ready'},attempt='unchanged',writes=0;
const owner={...current};const context=vm.createContext({AccountRegistry:{getAccount:()=>current},auxCaptureAgentStartAttempt:()=>attempt});const mark=vm.runInContext(source+';auxMarkUnstartedRunError',context);const entry={accountId:0,sessionId:'synthetic',agent:{changeStatus:status=>{assert.equal(status,'errored');writes++}}};
assert(mark(entry,owner,'unchanged'));assert.equal(writes,1);
for(const value of [undefined,'edited','new-transcript','running']){attempt=value;assert(!mark(entry,owner,'unchanged'))}
attempt='unchanged';current={...owner,incarnationId:'replacement'};assert(!mark(entry,owner,'unchanged'));assert.equal(writes,1);
console.log('Only unchanged original idle attempt records error; stale/new-run/account outcomes untouched.');
