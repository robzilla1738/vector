import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
const pins=new Set(['3bfa93416fc399e2c48ce0e7ed27fdea7bf283e9f7f821ca82f97ff5ac39f081','dc4d57bf49beac888e4e75cc4429d537e806a76fd7b5b70fd521c36510049909']);
export const brokerPrelude=readFileSync(new URL('./source/broker-runtime.js',import.meta.url),'utf8');
export function applyAuxBrokerWrites(source){
 const sha=createHash('sha256').update(source).digest('hex');
 if(!pins.has(sha))throw Error('Unreviewed broker input '+sha);
 const changes=[];
 const replace=(name,before,after)=>{const count=source.split(before).length-1;if(count!==1)throw Error(name+' expected one actual source seam, got '+count);source=source.replace(before,after);changes.push({name,count});};
 replace('finite atomic JSON primitive','function atomicWriteFileSync(Cn,ei){let ti=', 'function atomicWriteFileSync(Cn,ei){return auxBrokerBoundary().sync(()=>auxAtomicWriteFileSyncBody(Cn,ei))}function auxAtomicWriteFileSyncBody(Cn,ei){let ti=');
 replace('SQLite constructor','function openStateDatabase(Cn){let ei=new DatabaseSync(Cn);','function openStateDatabase(Cn){let ei=auxBrokerBoundary().database(()=>new DatabaseSync(Cn));');
 replace('detached migration uncertainty','tryMigrateStateDb(Cn).catch(ei=>logger.alert(`[StateDB] Failed to recreate state.db schema`,{accountId:Cn,error:ei}))','(auxBrokerBoundary().noteUntracked(),tryMigrateStateDb(Cn)).catch(ei=>logger.alert(`[StateDB] Failed to recreate state.db schema`,{accountId:Cn,error:ei}))');
 replace('protected HTTP native admission','if(!ni&&!await verifyDaemonAuthHttpRequest(Cn.req.raw))return Cn.json({error:{code:`UNAUTHORIZED`,message:`Missing or invalid daemon Authorization.`}},401);','if(!ni&&!await verifyDaemonAuthHttpRequest(Cn.req.raw))return Cn.json({error:{code:`UNAUTHORIZED`,message:`Missing or invalid daemon Authorization.`}},401);if(!ni)auxBrokerBoundary().assertOwner();');
 replace('actual account procedure','use(async({input:Cn,ctx:ei,next:ti})=>{let ni=AccountRegistry.getAccount(Cn.accountId);','use(async({input:Cn,ctx:ei,next:ti})=>{auxBrokerBoundary().assertOwner();let ni=AccountRegistry.getAccount(Cn.accountId);');
 replace('resolved WS account admission','return ti.ok?(Cn.set(`accountId`,ti.accountId),ei()):Cn.json({error:ti.error},ti.error.code===`NOT_FOUND`?404:400)','return ti.ok?(auxBrokerBoundary().assertOwner(),Cn.set(`accountId`,ti.accountId),ei()):Cn.json({error:ti.error},ti.error.code===`NOT_FOUND`?404:400)');
 replace('agent WS open custody','GlobalAgentSessionServer.connect(ei,ti,oi,ni).catch','(auxBrokerBoundary().assertOwner(),auxBrokerBoundary().noteUntracked(),GlobalAgentSessionServer.connect(ei,ti,oi,ni)).catch');
 replace('agent WS message custody','GlobalAgentSessionServer.handleCommand(ti,ai,oi.command,oi.commandId,ei).catch','(auxBrokerBoundary().assertOwner(),auxBrokerBoundary().noteUntracked(),GlobalAgentSessionServer.handleCommand(ti,ai,oi.command,oi.commandId,ei)).catch');
 replace('graceful shutdown closes new writes','ii=()=>{if(ni)return;ni=!0;let Cn=()=>{shutdownPostHog()','ii=()=>{if(ni)return;auxBrokerBoundary().close();ni=!0;let Cn=()=>{shutdownPostHog()');
 // Prelude is returned separately; root inserts AFTER immutable cold refusal.
 return {source,prelude:brokerPrelude,changes,inputSha256:sha,outputSha256:createHash('sha256').update(source).digest('hex')};
}
