from pathlib import Path
import json,hashlib
root=Path(__file__).parent
src=Path('/private/tmp/aux-standard-daemon-projection-20261024-a2/index.mjs').read_text()
changes=[]
def add(a,b):
 assert src.count(a)==1,(a[:120],src.count(a))
 changes.append({'find':a,'replace':b,'count':1})
add("function auxStopRefreshProducers(){for(const controller of auxRefreshControllers)controller.abort(Error('Aux is shutting down'))}","function auxStopRefreshProducers(){for(const controller of auxRefreshControllers)controller.abort(Error('Aux is shutting down'));return auxInteractiveOAuth.stop()}")
# The helper is inserted by transform after the existing I/O context declaration.
add('function auxKnownRefreshProvider(provider) {','/* AUX_INTERACTIVE_OAUTH_HELPER */\nfunction auxKnownRefreshProvider(provider) {')
add('async authorize(Cn,ei,ti=`global`){this.cleanupExpiredFlows();','async authorize(Cn,ei,ti=`global`){return auxInteractiveOAuth.run(()=>this.auxAuthorize(Cn,ei,ti))}async auxAuthorize(Cn,ei,ti=`global`){this.cleanupExpiredFlows();')
add('loginPromise:Promise.resolve(),abortController:ii};if(Cn===`meta-muse`)', 'loginPromise:Promise.resolve(),abortController:ii};auxInteractiveOAuth.register(si,()=>{if(si.openAICodex)return auxChatGPT().daemonClient().cancel(si.id)});if(Cn===`meta-muse`)')
add('si.loginPromise=this.credentials.login(Cn,{prompt:async ei=>{', 'si.loginPromise=auxInteractiveOAuth.login(si,()=>this.credentials.login(Cn,{prompt:async ei=>{')
add('signal:ii.signal}).then(()=>{si.status=`completed`})','signal:ii.signal})).then(()=>{si.status=`completed`})')
add('async callback(Cn,ei){let ti=this.getFlow(Cn);','async callback(Cn,ei){return auxInteractiveOAuth.run(()=>this.auxCallback(Cn,ei))}async auxCallback(Cn,ei){let ti=this.getFlow(Cn);')
add('async focusWindow(Cn){let ei=this.getFlow(Cn);','async focusWindow(Cn){return auxInteractiveOAuth.run(()=>this.auxFocusWindow(Cn))}async auxFocusWindow(Cn){let ei=this.getFlow(Cn);')
a=src[src.index('async function startCallbackServer$1('):src.index('async function postJson$1(')]
b=a.replace('startCallbackServer$1(Cn){','startCallbackServer$1(Cn,signal){').replace('let{createServer:ei}=await getNodeApis();','signal.throwIfAborted();let{createServer:ei}=await getNodeApis();signal.throwIfAborted();')
tail='ai.on(`error`,Cn=>{ni(Cn)}),ai.listen(CALLBACK_PORT$3,CALLBACK_HOST$1,()=>{ti({server:ai,redirectUri:REDIRECT_URI$3,cancelWait:()=>{ri?.(null)},waitForCode:()=>ii})})'
assert b.count(tail)==1
b=b.replace(tail,'let lifecycle=auxOwnOAuthCallbackServer(ai,signal,()=>auxBrokerBoundary().noteUntracked());lifecycle.listen(CALLBACK_PORT$3,CALLBACK_HOST$1).then(()=>ti({server:ai,redirectUri:REDIRECT_URI$3,cancelWait:()=>{ri?.(null)},waitForCode:()=>ii,close:()=>lifecycle.close()}),ni)')
add(a,b)
a=src[src.index('async function loginAnthropic('):src.index('async function refreshAnthropicToken$1(')]
b=a.replace('loginAnthropic(Cn){let','loginAnthropic(Cn){Cn.signal.throwIfAborted();let').replace('startCallbackServer$1(ei)','startCallbackServer$1(ei,Cn.signal)').replace('ii=()=>ni.cancelWait();','ii=()=>{ri.abort();ni.cancelWait()};').replace('let ai,oi,si,ci;try{','let ai,oi,si,ci,li;try{Cn.signal.throwIfAborted();').replace('let li=Cn.prompt(', 'li=Cn.prompt(').replace('}),ui=await ni.waitForCode();','});let ui=await ni.waitForCode();').replace('return Cn.notify({type:`progress`','Cn.signal.throwIfAborted();return Cn.notify({type:`progress`').replace('}),exchangeAuthorizationCode$3(ai,oi,ei,REDIRECT_URI$3,Cn.signal)','}),await exchangeAuthorizationCode$3(ai,oi,ei,REDIRECT_URI$3,Cn.signal)')
tail='finally{Cn.signal.removeEventListener(`abort`,ii),ri.abort(),ni.server.close()}'
assert b.count(tail)==1
b=b.replace(tail,'finally{ri.abort();try{await li}finally{try{await ni.close()}finally{Cn.signal.removeEventListener(`abort`,ii)}}}')
assert a!=b
add(a,b)
for start,end in [('async function startDeviceAuthorization$1(', 'function parseTokenResponse$1('),('async function pollForToken(', 'function isRetryableRefreshFailure(')]:
 a=src[src.index(start):src.index(end,src.index(start))]
 assert a.count('await fetch(')==1
 add(a,a.replace('await fetch(','await auxRefreshFetch('))
(root/'source/anchors.json').write_text(json.dumps(changes,indent=2)+'\n')
print(len(changes))
