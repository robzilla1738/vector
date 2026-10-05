import { staticFieldInputProps } from "../ui/class-props";
import { staticHintProps } from "../ui/class-props";
import { useEffect, useRef, useState } from 'react';
import { bridge, type HttpAuthRequest } from '../bridge';
import { isScrimOverlay } from '../chrome';
import { useStore } from '../store';
import { Dialog } from '../ui';
import {
  nativeButtonTypeProps as auxNativeButtonTypeProps,
} from "../ui/native-attribute-props";
import { staticButtonProps as auxClassButtonProps, staticPrimaryButtonProps as auxClassPrimaryButtonProps } from "../ui/class-props";
import { nativeAlertRoleProps, nativeAutocompleteOffProps } from "../ui/native-attribute-props";

export function HttpAuthPrompt() {
  const [requests,setRequests]=useState<HttpAuthRequest[]>([]);
  useEffect(()=>{
    let live=true, sequence=0;
    const load=()=>{const current=++sequence;void bridge.httpAuthRequests().then(items=>{if(live&&current===sequence)setRequests(items)}).catch(()=>{if(live&&current===sequence)setRequests([])});};
    const unsubscribe=bridge.onHttpAuthChanged(load);load();
    return ()=>{live=false;unsubscribe()};
  },[]);
  return requests[0] ? <Credentials key={requests[0].id} request={requests[0]}/> : null;
}

function Credentials({request}:{request:HttpAuthRequest}) {
  const [username,setUsername]=useState('');
  const [password,setPassword]=useState('');
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);
  const usernameInput=useRef<HTMLInputElement>(null);
  useEffect(()=>{
    let live=true;
    void bridge.overlay(true).then(()=>{if(live)return bridge.focusShell()}).then(()=>{
      if(live)usernameInput.current?.focus();
    }).catch(()=>{});
    return ()=>{live=false;void bridge.overlay(isScrimOverlay(useStore.getState().overlay))};
  },[]);
  async function respond(cancel=false){
    if(busy)return;
    setBusy(true);setError('');
    try{
      const handled=await bridge.respondHttpAuth(request.id,cancel?null:{username,password});
      setPassword('');
      if(!handled)throw new Error('Authentication request was not handled');
    }
    catch{setPassword('');setError('This sign-in request could not be completed. Reload the website to try again.');setBusy(false)}
  }
  return <Dialog label={request.proxy?'Sign in to proxy':'Sign in to website'} onClose={()=>void respond(true)} className="aux-dialog-surface http-auth-prompt">
    <form
      onSubmit={event=>{event.preventDefault();void respond()}}
      onKeyDown={event=>event.stopPropagation()}>
      <h3 id="http-auth-title">{request.proxy?'Sign in to proxy':'Sign in to website'}</h3>
      <p className="http-auth-origin">{request.origin}</p>
      {request.realm&&<p {...staticHintProps}>{request.realm}</p>}
      {request.retry&&<p {...nativeAlertRoleProps}>The previous credentials were not accepted. Try again.</p>}
      {!request.proxy&&request.origin.startsWith('http:')&&<p {...staticHintProps}>This website uses an unencrypted HTTP connection.</p>}
      <label>Username<input ref={usernameInput} {...staticFieldInputProps} {...nativeAutocompleteOffProps} disabled={busy} value={username} onChange={event=>setUsername(event.target.value)} maxLength={4096}/></label>
      <label>Password<input {...staticFieldInputProps} type="password" {...nativeAutocompleteOffProps} disabled={busy} value={password} onChange={event=>setPassword(event.target.value)} maxLength={4096}/></label>
      <p {...staticHintProps}>Aux does not save these credentials. The browser may reuse them during this session.</p>
      {error&&<p {...nativeAlertRoleProps}>{error}</p>}
      <div className="sheet-acts"><button {...auxNativeButtonTypeProps} {...auxClassButtonProps} disabled={busy} onClick={()=>void respond(true)}>Cancel</button><button {...auxClassPrimaryButtonProps} disabled={busy}>Sign in</button></div>
    </form>
  </Dialog>;
}
