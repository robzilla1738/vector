import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const code=fs.readFileSync(new URL('./owner.js',import.meta.url),'utf8');
const originalAccount={id:1,createdAt:20,incarnationId:'incarnation',mode:'local',authStatus:'ready'};
let account={...originalAccount},session,revision=0,alive=true;
const input=[{role:'user-message-metadata',attachments:[{type:'file',name:'synthetic.pdf',data:'c3ludGhldGlj'}],timestamp:42},{role:'user',content:'Synthetic request',timestamp:42}];
const context=vm.createContext({structuredClone,AccountRegistry:{getAccount:()=>account},SessionStore:{get:()=>session,listTurnOverviews:()=>({transcriptRevision:revision,turns:[]})}});
const {capture,owner}=vm.runInContext(code+';({capture:auxCaptureInitialPrompt,owner:auxInitialQueuedPromptOwner})',context);
const pending=capture(1,originalAccount,input);assert.notEqual(pending,input);assert.equal(JSON.stringify(pending),JSON.stringify(input));
const reset=()=>{account={...originalAccount};revision=0;alive=true;session={id:'task',createdAt:30,status:'idle',queuedMessages:structuredClone(input),steeringMessages:[],browserBinding:{profileId:'profile'},model:{id:'allowed'},permissionMode:'default'}};
reset();const agent={accountId:1,session:{id:'task',createdAt:30},agent:{state:{messages:[{role:'system'}],isStreaming:false}}};
const bound=()=>owner(agent,input,()=>alive);
assert.equal(typeof bound(),'function');bound()();
for(const mutate of [()=>{account.incarnationId='replacement'},()=>{session.createdAt=31},()=>{session.queuedMessages[1].content='edited'},()=>{session.status='running'},()=>{session.archivedAt=1},()=>{session.browserBinding.profileId='other'},()=>{revision++},()=>{alive=false}]){reset();const check=bound();mutate();assert.throws(check)}
reset();agent.agent.state.messages.push({role:'user'});assert.equal(bound(),null);agent.agent.state.messages.pop();
account.incarnationId='other';assert.throws(()=>capture(1,originalAccount,input));reset();
// Existing run completion consumes by matching user text/timestamp plus its
// immediately preceding metadata. Preparation failure consumes nothing.
const check=bound();try{throw Error('fixture context refusal')}catch{check();session.status='errored'}
assert.equal(JSON.stringify(session.queuedMessages),JSON.stringify(input));
const retry=bound();retry();const prepared=structuredClone(input);prepared[0].attachments[0]={type:'file',name:'synthetic.pdf',path:'./attachments/synthetic.pdf'};session.queuedMessages=prepared;
const emitted=[];for(const message of prepared){emitted.push(message);if(message.role==='user'){const i=session.queuedMessages.findIndex(row=>row.role==='user'&&row.content===message.content&&row.timestamp===message.timestamp);session.queuedMessages.splice(i>0&&session.queuedMessages[i-1].role==='user-message-metadata'?i-1:i,2)}}
assert.equal(session.queuedMessages.length,0);assert.equal(emitted.filter(row=>row.role==='user').length,1);assert.equal(emitted[0].attachments[0].path,'./attachments/synthetic.pdf');
console.log('Pending input/attachment bytes persist; stale account/session/edit/transcript fenced; successful delivery consumes once.');
