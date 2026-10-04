import { staticHintProps } from "../ui/class-props";
import { smallButtonProps, smallGhostButtonProps } from "../ui/button-props";
import { errorMessage } from "../error-message";
import { useEffect, useRef, useState } from "react";
import { ActionMenu, Badge, ListRow } from "../ui";
import { BrowserHostMethods as HostMethods } from "@aux/contracts/browser-host-methods";
import { executeCommand } from "../commands";
import { commandResult } from "../features/profiles/command-result";
import { SPACE_COLORS } from "../workspace";
import { bridge, inNativeHost, type BrowserProfile } from "../bridge";

export function BrowserProfiles() {
  const [profiles,setProfiles]=useState<BrowserProfile[]>([]);
  const [editing,setEditing]=useState<string|null>(null);
  const alive=useRef(false);
  const mutation=useRef({value:0});
  useEffect(()=>{const counter=mutation.current;alive.current=true;return()=>{alive.current=false;++counter.value;};},[]);
  const [name,setName]=useState("");
  const [busy,setBusy]=useState(false);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const [message,setMessage]=useState("");
  const pending=useRef(false);
  const listRequest=useRef({value:0});
  const [refresh,setRefresh]=useState(0);
  useEffect(()=>{
    if(!inNativeHost||bridge.privateMode)return;
    let live=true;
    const counter=listRequest.current;
    const load=()=>{
      if(pending.current)return;
      const request=++listRequest.current.value;
      void bridge.browserProfiles().then(items=>{if(live&&request===listRequest.current.value&&!pending.current){setProfiles(items);setError("");}})
        .catch(reason=>{if(live&&request===listRequest.current.value&&!pending.current)setError(String(reason));})
        .finally(()=>{if(live&&request===listRequest.current.value)setLoading(false);});
    };
    const focus=()=>{if(document.visibilityState!=="hidden")load();};
    load();window.addEventListener("focus",focus);document.addEventListener("visibilitychange",focus);
    return()=>{live=false;++counter.value;window.removeEventListener("focus",focus);document.removeEventListener("visibilitychange",focus);};
  },[refresh]);
  async function action(work:(valid:()=>boolean)=>Promise<void>){
    if(pending.current)return;pending.current=true;++listRequest.current.value;setBusy(true);setError("");setMessage("");
    const request=++mutation.current.value;const valid=()=>alive.current&&request===mutation.current.value;
    try{await work(valid);}catch(reason){if(valid())setError(errorMessage(reason));}
    finally{if(valid()){pending.current=false;setBusy(false);}}
  }
  const openProfile=(profile:BrowserProfile)=>void action(async(valid)=>{
    if(!await commandResult("open-browser-profile",HostMethods.openBrowserProfile.result,{profileId:profile.id}))throw new Error("This profile could not be opened.");
    if(!valid())return;setMessage(`Opening ${profile.name} in a separate window…`);
  });
  const deleteProfile = async (profile: BrowserProfile) => {
    await action(async(valid)=>{
      const result=await executeCommand("delete-browser-profile",{payload:{profileId:profile.id}});
      if(!valid()||result===false)return;
      setProfiles(HostMethods.deleteBrowserProfile.result.parse(result));
      setMessage(`${profile.name} and its browsing data were deleted.`);
    });
  };
  const profileRow=(profile:BrowserProfile)=><div className="browser-profile-item" key={profile.id}>
    <ListRow title={profile.name} description={profile.current?"Current Profile":profile.archived?"Archived · data kept on this Mac":"Separate sign-ins and browsing data"} leading={<span className="browser-profile-avatar" aria-hidden="true">{profile.name.slice(0,1).toLocaleUpperCase()}</span>} selected={profile.current} disabled={busy||profile.current||profile.archived} onOpen={()=>openProfile(profile)} trailing={<>
      {profile.current ? <Badge label="Current"/> : !profile.archived && <button {...smallButtonProps} disabled={busy} onClick={()=>openProfile(profile)}>Open</button>}
      <ActionMenu label={`Actions for ${profile.name} Profile`} actions={[
        {label:"Rename",disabled:busy,onSelect:()=>{setEditing(profile.id);setName(profile.name);}},
        ...(!profile.current && profile.id!=="default" ? [
          {label:profile.archived?"Restore":"Archive",disabled:busy,onSelect:()=>void action(async(valid)=>{const items=await commandResult("archive-browser-profile",HostMethods.archiveBrowserProfile.result,{profileId:profile.id,archived:!profile.archived});if(!valid())return;setProfiles(items);if(editing===profile.id)setEditing(null);setMessage(profile.archived?`${profile.name} restored.`:`${profile.name} archived. Its data and any open windows are kept.`);})},
          {label:"Delete…",disabled:busy,danger:true,onSelect:()=>void deleteProfile(profile)},
        ]:[]),
      ]}/>
      <select aria-label={`Color for ${profile.name}`} disabled={busy} value={profile.color ?? "blue"} onChange={event=>void action(async(valid)=>{if (!await commandResult("set-profile-appearance",HostMethods.setBrowserProfileAppearance.result,{profileId:profile.id,color: SPACE_COLORS.find(color=>color===event.target.value) ?? "blue", icon: profile.icon ?? "person"})) throw new Error("Profile appearance could not be saved."); if(!valid())return;const items=await bridge.browserProfiles();if(valid())setProfiles(items);})}>{SPACE_COLORS.map(color=><option key={color}>{color}</option>)}</select>
      <select aria-label={`Icon for ${profile.name}`} disabled={busy} value={profile.icon ?? "person"} onChange={event=>void action(async(valid)=>{if (!await commandResult("set-profile-appearance",HostMethods.setBrowserProfileAppearance.result,{profileId:profile.id,color: profile.color ?? "blue", icon: event.target.value})) throw new Error("Profile appearance could not be saved."); if(!valid())return;const items=await bridge.browserProfiles();if(valid())setProfiles(items);})}>{["person","work","home","code","travel","study"].map(icon=><option key={icon}>{icon}</option>)}</select>
    </>}/>
  </div>;
  if(!inNativeHost||bridge.privateMode)return null;
  return <div className="browser-profiles">
    <p {...staticHintProps}>Profiles keep website sign-ins, tabs, history, chats, memory and connections separate. Spaces organize work inside a profile and share its sign-ins.</p>
    <p {...staticHintProps}>Model connections and agent work belong to this Profile. Set up each Profile’s model connection in Settings › Models.</p>
    {profiles.find(profile=>profile.current)?.spaces?.length ? <section aria-label="Spaces in this Profile"><h3>Spaces in this Profile</h3><ul>{profiles.find(profile=>profile.current)?.spaces?.map(space=><li key={space.id}><button {...smallGhostButtonProps} data-space={space.color} disabled={busy} onClick={()=>void action(async()=>{const current=profiles.find(profile=>profile.current);if(!current||!await commandResult("focus-profile-space",HostMethods.focusBrowserProfileSpace.result,{profileId:current.id,spaceId:space.id}))throw new Error("This Space could not be focused.");})}>{space.name}</button></li>)}</ul></section>:null}
    {loading&&<output {...staticHintProps} data-block>Loading profiles…</output>}
    {profiles.filter(profile=>!profile.archived||profile.current).map(profileRow)}
    {editing!==null?<form className="browser-profile-editor" onSubmit={event=>{event.preventDefault();void action(async(valid)=>{
      if(editing==="new"){
        const profile=await commandResult("create-browser-profile",HostMethods.createBrowserProfile.result,{name});
        if(!valid())return;
        setProfiles(items=>[...items.filter(item=>item.id!==profile.id),profile]);
        setEditing(null);setName("");
        try{
          if(!await commandResult("open-browser-profile",HostMethods.openBrowserProfile.result,{profileId:profile.id}))throw new Error("The window did not open.");
        }catch(reason){
          throw new Error(`“${profile.name}” was created. Use Open to try launching it again. ${errorMessage(reason)}`);
        }
        if(!valid())return;setMessage(`Opening ${profile.name}. Sign in to websites and set up connections in its own window.`);
      }else{const items=await commandResult("rename-browser-profile",HostMethods.renameBrowserProfile.result,{profileId:editing,name});if(!valid())return;setProfiles(items);setEditing(null);setName("");}
    });}}>
      <input className="field-input" aria-label="Profile name" placeholder="Work, Personal…" autoFocus maxLength={60} disabled={busy} value={name} onChange={event=>setName(event.target.value)}/>
      <button {...smallButtonProps} disabled={busy||!name.trim()}>{busy?(editing==="new"?"Creating…":"Saving…"):(editing==="new"?"Create and open":"Save")}</button>
      <button {...smallGhostButtonProps} type="button" disabled={busy} onClick={()=>setEditing(null)}>Cancel</button>
    </form>:<button {...smallButtonProps} disabled={busy||loading} onClick={()=>{setEditing("new");setName("");}}>New profile</button>}
    {profiles.some(profile=>profile.archived&&!profile.current)&&<details className="browser-profile-archive">
      <summary>Archived profiles</summary>
      <p {...staticHintProps}>Archiving hides a profile from this list. Browsing data stays on this Mac, and open windows keep working.</p>
      {profiles.filter(profile=>profile.archived&&!profile.current).map(profileRow)}
    </details>}
    {error&&<div role="alert"><p className="hint err">{error}</p><button {...smallGhostButtonProps} disabled={busy} onClick={()=>void action(async(valid)=>{const items=await commandResult("refresh-browser-profiles",HostMethods.browserProfiles.result);if(valid()){setProfiles(items);setRefresh(value=>value+1);}})}>Refresh profiles</button></div>}
    {message&&<output {...staticHintProps} data-block>{message}</output>}
  </div>;
}
