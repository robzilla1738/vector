async takeQueuedMessagesForSend(Cn){
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
