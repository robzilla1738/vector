from pathlib import Path
import json,hashlib
H=Path(__file__).resolve().parent
helper=(H/'owner.js').read_text()
rules=[
('let ei=await createSession$1(Cn.accountId,ni);return ri=ei.id,','let ei=await createSession$1(Cn.accountId,{...ni,queuedMessages:auxCaptureInitialPrompt(Cn.accountId,Cn.account,ti)});return ri=ei.id,'),
('let ei=await this.#_e(Cn);await this.#ne(ei)}async#ne(Cn){','const auxQueued=auxInitialQueuedPromptOwner(this,Cn,()=>this.#te());let ei;try{ei=await this.#_e(Cn)}catch(error){if(auxQueued){auxQueued();this.changeStatus(`errored`)}throw error}if(auxQueued){auxQueued();this.#E=!1;this.#Ve(ei)}await this.#ne(ei)}async#ne(Cn){'),
('let Cn=[...this.#d],ei=last(this.agent.state.messages);if(ei?.role===`assistant`){if(Cn.length===0)', 'let Cn=[...this.#d],ei=last(this.agent.state.messages);if(Cn.length&&!this.agent.state.messages.some(message=>[\'user\',\'assistant\',\'toolResult\',\'user-message-metadata\',\'compaction\'].includes(message.role))){await this.prompt(Cn);return}if(ei?.role===`assistant`){if(Cn.length===0)'),
('This task stopped before completing. Your saved messages are preserved. Retry this task after checking its model, tools and selected page.', 'This task stopped before completing. Check the pending message and attachments, then retry after checking its model, tools and selected page.'),
('function auxCaptureAgentStartAttempt(accountId, sessionId) {',helper+'\nfunction auxCaptureAgentStartAttempt(accountId, sessionId) {')]
sha=lambda b:hashlib.sha256(b).hexdigest()
for mode in ['current','future']:
 rows=[]
 for name in ['index.mjs','aux-native-entry.mjs']:
  p=Path('/private/tmp/aux-reconnect-run-error-20261026-a1-'+mode)/name;s=p.read_text()
  for old,new in rules:assert s.count(old)==1,(mode,old[:80],s.count(old));s=s.replace(old,new)
  rows.append({'path':str(p),'name':name,'beforeSha256':sha(p.read_bytes()),'afterSha256':sha(s.encode())})
 (H/('proposal.json' if mode=='current' else 'future-proposal.json')).write_text(json.dumps({'format':'aux.initial-prompt-preservation.v1','rules':[{'find':a,'replace':b,'count':1}for a,b in rules],'resources':rows},indent=2)+'\n')
prep=(H.parent/'direct-fixed-dispatch/prepare.py').read_text().replace('aux.direct-fixed-dispatch-preparation.v1','aux.initial-prompt-preservation-preparation.v1');(H/'prepare.py').write_text(prep);(H/'prepare-future.py').write_text(prep.replace("'proposal.json'","'future-proposal.json'"))
