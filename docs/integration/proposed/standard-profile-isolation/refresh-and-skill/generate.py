from pathlib import Path
import json,hashlib
here=Path(__file__).resolve().parent
root=Path('/Users/rcourson/Documents/Vibe/web')
source=Path('/private/tmp/aux-standard-daemon-projection-20261024-a1/index.mjs')
entry=source.parent/'projected-entry/aux-native-entry.mjs'
s=source.read_text();changes=[]
def add(old,new):
 assert old!=new and s.count(old)==1,(old[:120],s.count(old))
 changes.append(dict(find=old,replace=new,count=1))
def section(a,b):
 i=s.index(a);return s[i:s.index(b,i+len(a))]
helper=(here/'source/refresh-lifetimes.js').read_text()
a=section('async function auxRefreshProducer(provider,credential,signal){','\n\n/* aux-native-task-paths-v1:')
add(a,helper.rstrip())
add('import{AsyncLocalStorage}from"node:async_hooks";','import{AsyncLocalStorage}from"node:async_hooks";import{lookup as auxRefreshDnsLookup}from"node:dns";')
add('async function extractSkillArchive(Cn,ei){return auxBackgroundWriters().run(async()=>{auxBrokerBoundary().noteUntracked();','async function extractSkillArchive(Cn,ei){return auxBackgroundWriters().run(async()=>{')
for start,end in [
 ('async function postJson$1(', 'async function exchangeAuthorizationCode$3('),
 ('async function fetchJson(', 'async function startDeviceFlow('),
 ('async function fetchWithRateLimitRetry(', 'async function fetchGitHubCopilotModels('),
 ('async function refreshToken(', 'async function loginKimiCoding('),
 ('async function mintApiKey(', 'async function loginMeta('),
 ('async function refreshAccessToken(', 'async function startOpenAICodexDeviceAuth('),
 ('async function postForm(', 'function requestFailure('),
 ('async function postJson(', 'async function exchangeAuthorizationCode(')]:
 old=section(start,end);assert old.count('await fetch(')==1
 new=old.replace('await fetch(','await auxRefreshFetch(')
 if start=='async function postJson(':
  new=new.replace('async function postJson(Cn,ei){','async function postJson(Cn,ei,signal){').replace('signal:AbortSignal.timeout(3e4)','signal:signal?AbortSignal.any([signal,AbortSignal.timeout(3e4)]):AbortSignal.timeout(3e4)')
 add(old,new)
old=section('async function refreshAnthropicToken(Cn){','var CLIENT_ID$1,AUTHORIZE_URL$1')
new=old.replace('async function refreshAnthropicToken(Cn){','async function refreshAnthropicToken(Cn,signal){').replace('refresh_token:Cn}),ti=JSON.parse(ei)','refresh_token:Cn},signal),ti=JSON.parse(ei)')
add(old,new)
add('async refresh(Cn){return{type:`oauth`,...await refreshAnthropicToken(Cn.refresh)}}','async refresh(Cn,signal){return{type:`oauth`,...await refreshAnthropicToken(Cn.refresh,signal)}}')
old=section('async withLockAsync(Cn){if(process.platform===`darwin`&&this.path===ACCOUNTS_JSON_PATH)','}},InMemoryJsonStoreBackend=class')+'}'
add(old,'async withLockAsync(Cn){return auxCredentialStoreTransaction(this,Cn)}')
add('ei.fs.stat(ti.lockfilePath,(ni,ri)=>{let ii=ti.lastUpdate+ei.stale<Date.now();','ei.fs.stat(ti.lockfilePath,(ni,ri)=>{if(ti.released)return;let ii=ti.lastUpdate+ei.stale<Date.now();')
sha=lambda x:hashlib.sha256(x).hexdigest()
(here/'source/changes.json').write_text(json.dumps(changes,indent=2)+'\n')
outputs=[]
for kind,p in [('source',source),('entry',entry)]:
 before=p.read_text();after=before
 for e in changes:
  assert after.count(e['find'])==1
  after=after.replace(e['find'],e['replace'])
 outputs.append(dict(kind=kind,input=str(p),inputSha256=sha(before.encode()),outputSha256=sha(after.encode()),edits=len(changes)))
requirements=[]
for relative in ['docs/integration/proposed/standard-profile-isolation/descendant-custody/source/AuxTaskDescendantObserver.cc','docs/integration/proposed/standard-profile-isolation/descendant-custody/source/AuxTaskDescendantObserver.h','docs/integration/proposed/standard-profile-isolation/integration/native-build-a2.json','docs/integration/proposed/profile-isolation-continuation/build/evidence/archives.json']:
 p=root/relative;requirements.append(dict(path=relative,sha256=sha(p.read_bytes())))
manifest=dict(format='aux.refresh-skill.source.v1',daemonInputs=outputs,files=[dict(path='source/'+name,sha256=sha((here/'source'/name).read_bytes())) for name in ['changes.json','refresh-lifetimes.js','transform.mjs']],nativePairRequirements=requirements,freshObserverRequired=True,oldNativePairCompatible=False,sourceOnly=True,productExecuted=False,nativePaired=False)
(here/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(json.dumps(outputs))
