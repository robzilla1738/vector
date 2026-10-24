from pathlib import Path
import json
r=Path(__file__).parent
p=Path('/private/tmp/aux-standard-daemon-projection-20261024-a3/index.mjs').read_text()
changes=[]
def add(a,b):
 assert p.count(a)==1,(a[:100],p.count(a))
 changes.append(dict(find=a,replace=b,count=1))
add('function auxInteractiveProviderCandidate(id) {','/* AUX_CLAUDE_CODE_LOGIN_HELPER */\nfunction auxInteractiveProviderCandidate(id) {')
add('entry===kimiCodeProvider || entry===xaiGrokOAuthProvider','entry===kimiCodeProvider || entry===xaiGrokOAuthProvider || entry===claudeCodeOAuthProvider')
add('provider===kimiCodingOAuth && provider.login===loginKimiCoding ||','provider===kimiCodingOAuth && provider.login===loginKimiCoding ||\n        auxReviewedClaudeCodeLogin(provider) ||')
a=p[p.index('function waitForCallbackCode('):p.index('async function generatePkce()',p.index('function waitForCallbackCode('))]
handler=a[a.index('ui=(ei,ti)=>')+3:a.index(',di=')]
manual=a[a.index(',di=')+4:a.index(',fi=')]
b='''async function waitForCallbackCode(Cn,ei){let si,ci=new Promise(resolve=>{let done=false;si=value=>{if(!done){done=true;resolve(value)}}}),ui='''+handler+''',di='''+manual+''';return auxStartClaudeCallbackGroup({createServer,handler:ui,hosts:CALLBACK_HOSTS$1,port:CALLBACK_PORT$1,signal:ei,resolveCode:si,waitForCode:()=>ci,redirectUri:REDIRECT_URI,manualPrompt:di,ownServer:auxOwnOAuthCallbackServer,unknown:()=>auxBrokerBoundary().noteUntracked()})}'''
add(a,b)
a=p[p.index('async function exchangeAuthorizationCode(Cn,ei,ti,ni)'):p.index('async function refreshAnthropicToken(Cn,signal)',p.index('async function exchangeAuthorizationCode(Cn,ei,ti,ni)'))]
b=a.replace('(Cn,ei,ti,ni){','(Cn,ei,ti,ni,signal){').replace('code_verifier:ti}),ii=', 'code_verifier:ti},signal),ii=')
add(a,b)
start=p.index('claudeCodeOAuthProvider={');a=p[start:p.index('function buildKimiCodeProviderConfig()',start)]
b=a.replace('async login(Cn){let','async login(Cn){Cn.signal.throwIfAborted();let')
old='let si=new AbortController,ci=Cn.signal?AbortSignal.any([Cn.signal,si.signal]):si.signal,li=await Promise.race([ni.waitForCode().then(Cn=>({type:`callback`,callback:Cn})),ni.manualPrompt?Cn.prompt({type:`manual_code`,...ni.manualPrompt,signal:ci}).then(Cn=>({type:`manual`,input:Cn})):new Promise(()=>{})]).finally(()=>{si.abort()});'
new='let li=await auxWaitClaudeCodeInput(ni,ni.manualPrompt?signal=>Cn.prompt({type:`manual_code`,...ni.manualPrompt,signal}):undefined,Cn.signal);'
assert b.count(old)==1;b=b.replace(old,new)
b=b.replace('placeholder:ni.manualPrompt?.placeholder??REDIRECT_URI}', 'placeholder:ni.manualPrompt?.placeholder??REDIRECT_URI,signal:Cn.signal}')
b=b.replace('if(!ri||!ii)throw', 'Cn.signal.throwIfAborted();if(!ri||!ii)throw')
b=b.replace('await exchangeAuthorizationCode(ri,ii,ei,ai)', 'await exchangeAuthorizationCode(ri,ii,ei,ai,Cn.signal)')
b=b.replace('finally{for(let Cn of ni.servers??[])Cn.close()}', 'finally{await ni.close()}')
assert b.endswith('}}}));');b=b[:-4]+';auxClaudeCodeLoginIdentity.set(claudeCodeOAuthProvider.oauth,claudeCodeOAuthProvider.oauth.login)}));'
add(a,b)
(r/'source/anchors.json').write_text(json.dumps(changes,indent=2)+'\n');print(len(changes))
