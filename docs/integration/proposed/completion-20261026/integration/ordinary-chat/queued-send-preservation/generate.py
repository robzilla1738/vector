from pathlib import Path
import hashlib,json
h=Path(__file__).resolve().parent
method="""async takeQueuedMessagesForSend(Cn){
 const saved=structuredClone(this.#d),current=auxQueuedSendOwner(this,()=>this.#te());
 if(!current())throw Error('The original pending task changed.');
 const selected=this.#Ie(Cn,this.#d);if(!selected)return null;
 const before=JSON.stringify(this.#d);
 try{await auxValidateReferenceMessages(this.browser,this.#d.slice(selected.start,selected.end))}
 catch(error){if(current()&&JSON.stringify(this.#d)===before&&SessionStore.get(this.accountId,this.session.id)?.status==='idle')this.changeStatus('errored');throw error}
 if(!current()||JSON.stringify(this.#d)!==before||JSON.stringify(SessionStore.get(this.accountId,this.session.id)?.queuedMessages)!==before)throw Error('The pending message changed during validation.');
 const messages=this.takeQueuedMessages(Cn);if(!messages)return null;
 const after=JSON.stringify(this.#d);let restored=false;
 return {messages,restore:()=>{
  if(restored||!current()||JSON.stringify(this.#d)!==after||JSON.stringify(SessionStore.get(this.accountId,this.session.id)?.queuedMessages)!==after)return false;
  this.#Ve(saved);if(SessionStore.get(this.accountId,this.session.id)?.status==='idle')this.changeStatus('errored');restored=true;return true;
 }};
}
"""
old='async#_(Cn,ei,ti,ni){let ri=Cn.agent.takeQueuedMessages(ei);if(ri){if(ti&&Cn.agent.agent.state.isStreaming){await this.#v(Cn,ri,ni);return}if(Cn.agent.agent.state.isStreaming){await Cn.agent.steer(ri,ni);return}Cn.runningPromise&&await Cn.runningPromise,await this.startRun(Cn.accountId,Cn.sessionId,async Cn=>{if(ti){await Cn.interruptSteer(ri,ni);return}await Cn.steer(ri,ni)})}}'
new="""async#_(Cn,ei,ti,ni){
 if(Cn.runningPromise&&!Cn.agent.agent.state.isStreaming)await Cn.runningPromise;
 const transfer=await Cn.agent.takeQueuedMessagesForSend(ei);if(!transfer)return;
 const ri=transfer.messages;
 try{
  if(ti&&Cn.agent.agent.state.isStreaming){await this.#v(Cn,ri,ni);return}
  if(Cn.agent.agent.state.isStreaming){await Cn.agent.steer(ri,ni);return}
  await this.startRun(Cn.accountId,Cn.sessionId,async Cn=>{
   try{if(ti){await Cn.interruptSteer(ri,ni);return}await Cn.steer(ri,ni)}
   catch(error){transfer.restore();throw error}
  });
 }catch(error){transfer.restore();throw error}
}"""
rules=[('takeQueuedMessages(Cn){',method+'takeQueuedMessages(Cn){'),(old,new),('function auxCaptureAgentStartAttempt(accountId, sessionId) {',(h/'owner.js').read_text()+'\nfunction auxCaptureAgentStartAttempt(accountId, sessionId) {')]
sha=lambda b:hashlib.sha256(b).hexdigest()
for mode in ['current','future']:
 rows=[]
 for name in ['index.mjs','aux-native-entry.mjs']:
  p=Path('/private/tmp/aux-unstarted-run-error-20261026-a1-'+mode)/name;s=p.read_text()
  for a,b in rules:assert s.count(a)==1;s=s.replace(a,b)
  rows.append({'path':str(p),'name':name,'beforeSha256':sha(p.read_bytes()),'afterSha256':sha(s.encode())})
 (h/('proposal.json' if mode=='current' else 'future-proposal.json')).write_text(json.dumps({'format':'aux.queued-send-preservation.v1','resources':rows,'rules':[{'find':a,'replace':b,'count':1}for a,b in rules]},indent=2)+'\n')
prep=(h.parent/'direct-fixed-dispatch/prepare.py').read_text().replace('aux.direct-fixed-dispatch-preparation.v1','aux.queued-send-preservation-preparation.v1');(h/'prepare.py').write_text(prep);(h/'prepare-future.py').write_text(prep.replace("'proposal.json'","'future-proposal.json'"))
(h/'method.js').write_text(method)
