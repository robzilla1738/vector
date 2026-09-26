import { useEffect, useRef, useState } from 'react';
import { bridge, type HttpAuthRequest } from '../bridge';
import { isScrimOverlay } from '../chrome';
import { useStore } from '../store';

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
  const form=useRef<HTMLFormElement>(null);
  useEffect(()=>{
    const previous=document.activeElement as HTMLElement|null;
    const body=document.querySelector<HTMLElement>('.app-body');
    const wasInert=body?.inert;
    if(body)body.inert=true;
    let live=true;
    void bridge.overlay(true).then(()=>{if(live)return bridge.focusShell()}).then(()=>{
      if(live)form.current?.querySelector<HTMLInputElement>('input')?.focus();
    }).catch(()=>{});
    return ()=>{live=false;if(body)body.inert=!!wasInert;void bridge.overlay(isScrimOverlay(useStore.getState().overlay));if(previous?.isConnected)previous.focus()};
  },[]);
  async function respond(cancel=false){
    if(busy)return;
    setBusy(true);setError('');
    try{await bridge.respondHttpAuth(request.id,cancel?null:{username,password});setPassword('')}
    catch{setPassword('');setError('This sign-in request could not be completed. Reload the website to try again.');setBusy(false)}
  }
  return <div className="scrim-soft http-auth-scrim">
    <form className="sheet pop-in http-auth-prompt" role="dialog" aria-modal="true" aria-labelledby="http-auth-title" ref={form}
      onSubmit={event=>{event.preventDefault();void respond()}}
      onKeyDown={event=>{
        event.stopPropagation();
        if(event.key==='Escape'){event.preventDefault();void respond(true)}
        if(event.key==='Tab'){
          const controls=[...event.currentTarget.querySelectorAll<HTMLElement>('input:not(:disabled),button:not(:disabled)')];
          const first=controls[0],last=controls.at(-1);
          if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus()}
          else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus()}
        }
      }}>
      <h3 id="http-auth-title">{request.proxy?'Sign in to proxy':'Sign in to website'}</h3>
      <p className="http-auth-origin">{request.origin}</p>
      {request.realm&&<p className="hint">{request.realm}</p>}
      {request.retry&&<p role="alert">The previous credentials were not accepted. Try again.</p>}
      {!request.proxy&&request.origin.startsWith('http:')&&<p className="hint">This website uses an unencrypted HTTP connection.</p>}
      <label>Username<input className="field-input" autoComplete="off" disabled={busy} value={username} onChange={event=>setUsername(event.target.value)} maxLength={4096}/></label>
      <label>Password<input className="field-input" type="password" autoComplete="off" disabled={busy} value={password} onChange={event=>setPassword(event.target.value)} maxLength={4096}/></label>
      <p className="hint">Aux does not save these credentials. The browser may reuse them during this session.</p>
      {error&&<p role="alert">{error}</p>}
      <div className="sheet-acts"><button type="button" className="btn" disabled={busy} onClick={()=>void respond(true)}>Cancel</button><button className="btn primary" disabled={busy}>Sign in</button></div>
    </form>
  </div>;
}
