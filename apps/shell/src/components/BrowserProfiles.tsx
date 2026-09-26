import { useEffect, useRef, useState } from "react";
import { ActionMenu, ListRow, StatusBadge } from "./ui";
import { bridge, inNativeHost, type BrowserProfile } from "../bridge";

export function BrowserProfiles() {
  const [profiles,setProfiles]=useState<BrowserProfile[]>([]);
  const [editing,setEditing]=useState<string|null>(null);
  const [confirming,setConfirming]=useState<string|null>(null);
  const [name,setName]=useState("");
  const [busy,setBusy]=useState(false);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const [message,setMessage]=useState("");
  const pending=useRef(false);
  const listRequest=useRef(0);
  const [refresh,setRefresh]=useState(0);
  useEffect(()=>{
    if(!inNativeHost||bridge.privateMode)return;
    let live=true;
    const load=()=>{
      if(pending.current)return;
      const request=++listRequest.current;
      void bridge.browserProfiles().then(items=>{if(live&&request===listRequest.current&&!pending.current){setProfiles(items);setError("");}})
        .catch(reason=>{if(live&&request===listRequest.current&&!pending.current)setError(String(reason));})
        .finally(()=>{if(live&&request===listRequest.current)setLoading(false);});
    };
    const focus=()=>{if(document.visibilityState!=="hidden")load();};
    load();window.addEventListener("focus",focus);document.addEventListener("visibilitychange",focus);
    return()=>{live=false;++listRequest.current;window.removeEventListener("focus",focus);document.removeEventListener("visibilitychange",focus);};
  },[refresh]);
  async function action(work:()=>Promise<void>){
    if(pending.current)return;pending.current=true;++listRequest.current;setBusy(true);setError("");setMessage("");
    try{await work();}catch(reason){setError(reason instanceof Error?reason.message:String(reason));}
    finally{pending.current=false;setBusy(false);}
  }
  const openProfile=(profile:BrowserProfile)=>void action(async()=>{
    if(!await bridge.openBrowserProfile(profile.id))throw new Error("This profile could not be opened.");
    setMessage(`Opening ${profile.name} in a separate window…`);
  });
  const profileRow=(profile:BrowserProfile)=><div className="browser-profile-item" key={profile.id}>
    <ListRow title={profile.name} description={profile.current?"Current Profile":profile.archived?"Archived · data kept on this Mac":"Separate sign-ins and browsing data"} leading={<span className="browser-profile-avatar" aria-hidden="true">{profile.name.slice(0,1).toLocaleUpperCase()}</span>} selected={profile.current} disabled={busy||profile.current||profile.archived} onOpen={()=>openProfile(profile)} trailing={<>
      {profile.current ? <StatusBadge label="Current"/> : !profile.archived && <button className="btn sm" disabled={busy} onClick={()=>openProfile(profile)}>Open</button>}
      <ActionMenu label={`Actions for ${profile.name} Profile`} actions={[
        {label:"Rename",disabled:busy,onSelect:()=>{setEditing(profile.id);setName(profile.name);}},
        ...(!profile.current && profile.id!=="default" ? [
          {label:profile.archived?"Restore":"Archive",disabled:busy,onSelect:()=>void action(async()=>{setProfiles(await bridge.archiveBrowserProfile(profile.id,!profile.archived));if(editing===profile.id)setEditing(null);setMessage(profile.archived?`${profile.name} restored.`:`${profile.name} archived. Its data and any open windows are kept.`);})},
          {label:"Delete…",disabled:busy,danger:true,onSelect:()=>setConfirming(profile.id)},
        ]:[]),
      ]}/>
    </>}/>
    {confirming===profile.id && <section className="browser-profile-confirmation" aria-label={`Delete ${profile.name} Profile`}><strong>Delete “{profile.name}”?</strong><p>This permanently removes its sign-ins, tabs, history, chats, memory and connections on this Mac. This cannot be undone.</p><div className="row"><button className="btn sm danger" disabled={busy} onClick={()=>void action(async()=>{setProfiles(await bridge.deleteBrowserProfile(profile.id));setConfirming(null);setMessage(`${profile.name} and its browsing data were deleted.`);})}>Delete permanently</button><button className="btn sm ghost" disabled={busy} onClick={()=>setConfirming(null)}>Keep Profile</button></div></section>}
  </div>;
  if(!inNativeHost||bridge.privateMode)return null;
  return <div className="browser-profiles">
    <p className="hint">Profiles keep website sign-ins, tabs, history, chats, memory and connections separate. Spaces organize work inside a profile and share its sign-ins.</p>
    {loading&&<output className="hint" data-block>Loading profiles…</output>}
    {profiles.filter(profile=>!profile.archived||profile.current).map(profileRow)}
    {editing!==null?<form className="browser-profile-editor" onSubmit={event=>{event.preventDefault();void action(async()=>{
      if(editing==="new"){
        const profile=await bridge.createBrowserProfile(name);
        setProfiles(items=>[...items.filter(item=>item.id!==profile.id),profile]);
        setEditing(null);setName("");
        try{
          if(!await bridge.openBrowserProfile(profile.id))throw new Error("The window did not open.");
        }catch(reason){
          throw new Error(`“${profile.name}” was created. Use Open to try launching it again. ${reason instanceof Error?reason.message:String(reason)}`);
        }
        setMessage(`Opening ${profile.name}. Sign in to websites and set up connections in its own window.`);
      }else{setProfiles(await bridge.renameBrowserProfile(editing,name));setEditing(null);setName("");}
    });}}>
      <input className="field-input" aria-label="Profile name" placeholder="Work, Personal…" autoFocus maxLength={60} disabled={busy} value={name} onChange={event=>setName(event.target.value)}/>
      <button className="btn sm" disabled={busy||!name.trim()}>{busy?(editing==="new"?"Creating…":"Saving…"):(editing==="new"?"Create and open":"Save")}</button>
      <button className="btn sm ghost" type="button" disabled={busy} onClick={()=>setEditing(null)}>Cancel</button>
    </form>:<button className="btn sm" disabled={busy||loading} onClick={()=>{setEditing("new");setName("");}}>New profile</button>}
    {profiles.some(profile=>profile.archived&&!profile.current)&&<details className="browser-profile-archive">
      <summary>Archived profiles</summary>
      <p className="hint">Archiving hides a profile from this list. Browsing data stays on this Mac, and open windows keep working.</p>
      {profiles.filter(profile=>profile.archived&&!profile.current).map(profileRow)}
    </details>}
    {error&&<div role="alert"><p className="hint err">{error}</p><button className="btn sm ghost" disabled={busy} onClick={()=>setRefresh(value=>value+1)}>Refresh profiles</button></div>}
    {message&&<output className="hint" data-block>{message}</output>}
  </div>;
}
