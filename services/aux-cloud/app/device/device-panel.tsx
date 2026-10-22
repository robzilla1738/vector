'use client';
import { useAuth, useUser } from '@clerk/nextjs';
import { useCallback, useEffect, useRef, useState } from 'react';

type Pending={requestId:string;deviceName:string;createdAt:number;expiresAt:number};
type Lookup={id:string;deviceName:string;email:string;accountId:string};
export function DevicePanel(){
  const {getToken,userId,isLoaded,isSignedIn}=useAuth();
  const {user}=useUser();
  const [pending,setPending]=useState<Pending[]>([]),[selected,setSelected]=useState(''),[code,setCode]=useState('');
  const [lookup,setLookup]=useState<Lookup|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
  const identity=useRef(userId),epoch=useRef(0);
  identity.current=userId;
  const request=useCallback(async(path:string,body:unknown,owner:string)=>{
    const token=await getToken();
    if(!token||identity.current!==owner)throw new Error('Your account changed. Start again.');
    const response=await fetch(`/api/v1/auth/device-code/${path}`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify(body),cache:'no-store'});
    const data=await response.json().catch(()=>null);
    if(identity.current!==owner)throw new Error('Your account changed. Start again.');
    if(!response.ok)throw new Error(typeof data?.error==='string'?data.error:'Could not complete the request. Please try again.');
    return data;
  },[getToken]);
  const load=useCallback(async(owner:string)=>{
    const current=++epoch.current;
    setBusy(true);setError('');
    try{
      const result=await request('pending',{},owner);
      if(current===epoch.current&&identity.current===owner)setPending(result.requests);
    }catch(cause){if(current===epoch.current&&identity.current===owner)setError(cause instanceof Error?cause.message:'Could not load device requests.');}
    finally{if(current===epoch.current&&identity.current===owner)setBusy(false);}
  },[request]);
  useEffect(()=>{
    ++epoch.current;setPending([]);setSelected('');setCode('');setLookup(null);setError('');setNotice('');
    if(isLoaded&&isSignedIn&&userId)void load(userId);
    return()=>{++epoch.current;};
  },[isLoaded,isSignedIn,userId,load]);
  function resetSelection(value:string){setSelected(value);setCode('');setLookup(null);setError('');setNotice('');}
  async function verify(){
    if(!userId||busy)return;
    const owner=userId,current=++epoch.current;
    setBusy(true);setLookup(null);setError('');setNotice('');
    try{
      const result=await request('lookup',{id:selected,userCode:code},owner) as Lookup;
      if(current===epoch.current&&identity.current===owner)setLookup(result);
    }catch(cause){if(current===epoch.current&&identity.current===owner)setError(cause instanceof Error?cause.message:'Could not verify this request.');}
    finally{if(current===epoch.current&&identity.current===owner)setBusy(false);}
  }
  async function decide(decision:'approve'|'deny'){
    if(!lookup||!userId||busy)return;
    const owner=userId,verified=lookup,current=++epoch.current;
    setBusy(true);setError('');setNotice('');
    try{
      await request('decide',{id:verified.id,userCode:code,accountId:verified.accountId,decision},owner);
      if(current!==epoch.current||identity.current!==owner)return;
      setPending(rows=>rows.filter(row=>row.requestId!==verified.id));setSelected('');setCode('');setLookup(null);
      setNotice(decision==='approve'?'Device approved. Return to the Aux CLI to finish sign-in.':'Device request rejected.');
    }catch(cause){if(current===epoch.current&&identity.current===owner){setLookup(null);setError(cause instanceof Error?cause.message:'Could not update this request.');}}
    finally{if(current===epoch.current&&identity.current===owner)setBusy(false);}
  }
  if(!isLoaded)return <p>Loading your account…</p>;
  if(!isSignedIn)return <p>Sign in again to connect a device.</p>;
  return <>
    <section aria-busy={busy}>
      <h2>Pending requests</h2>
      <p>Signed in as <strong>{user?.primaryEmailAddress?.emailAddress||'your Aux account'}</strong>.</p>
      <button type="button" disabled={busy} onClick={()=>userId&&void load(userId)}>Refresh requests</button>
      {pending.length===0?<p>No pending requests. Start <code>aux login</code> on the device you want to connect, then refresh.</p>:<div role="radiogroup" aria-label="Choose the device you started sign-in on">{pending.map(row=><label key={row.requestId} style={{display:'block',margin:'16px 0'}}>
        <input type="radio" name="device-request" value={row.requestId} checked={selected===row.requestId} disabled={busy} onChange={()=>resetSelection(row.requestId)}/>{' '}
        <strong>{row.deviceName}</strong><span> · expires {new Date(row.expiresAt).toLocaleTimeString()}</span>
      </label>)}</div>}
    </section>
    {selected&&<section>
      <h2>Check the code</h2>
      <p>Enter the code displayed by the Aux CLI on your device. Never enter a code someone else sent you.</p>
      <form onSubmit={event=>{event.preventDefault();void verify();}}>
        <label htmlFor="device-code">Device code</label>{' '}
        <input id="device-code" value={code} maxLength={32} autoComplete="off" autoCapitalize="characters" spellCheck={false} disabled={busy} placeholder="ABCDE-12345" onChange={event=>{setCode(event.target.value);setLookup(null);setError('');setNotice('');}}/>{' '}
        <button type="submit" disabled={busy||!code.trim()}>Check request</button>
      </form>
    </section>}
    {lookup&&<section aria-label="Review device approval">
      <h2>Approve this device?</h2>
      <dl><dt>Account</dt><dd>{lookup.email}</dd><dt>Device</dt><dd>{lookup.deviceName}</dd><dt>Code</dt><dd><code>{code.toUpperCase()}</code></dd></dl>
      <p>This device will be able to access your Aux account and use its cloud services. Continue only if you started this sign-in.</p>
      <button type="button" disabled={busy} onClick={()=>void decide('approve')}>Approve device</button>{' '}
      <button type="button" disabled={busy} onClick={()=>void decide('deny')}>Reject request</button>
    </section>}
    {error&&<p role="alert">{error}</p>}{notice&&<p role="status">{notice}</p>}
  </>;
}
