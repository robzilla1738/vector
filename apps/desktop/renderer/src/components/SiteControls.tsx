import { useEffect, useRef, useState } from "react";
import { bridge, type BrowserSiteInfo } from "../bridge";
import { useStore } from "../store";
import { I } from "./icons";

const labels:Record<string,string>={
  "media:audio":"Microphone","media:video":"Camera",media:"Camera and microphone",
  geolocation:"Location",notifications:"Notifications","display-capture":"Screen capture",
  pointerLock:"Pointer lock","idle-detection":"Idle detection","clipboard-read":"Read clipboard",
  "clipboard-sanitized-write":"Write clipboard",
};

export function SiteControls(){
  const pageId=useStore(state=>state.activePageId);
  const setOverlay=useStore(state=>state.setOverlay);
  const [info,setInfo]=useState<BrowserSiteInfo|null>(null);
  const [busy,setBusy]=useState("");
  const [notice,setNotice]=useState("");
  const [error,setError]=useState("");
  const closeRef=useRef<HTMLButtonElement>(null);
  const close=()=>{setOverlay(null);window.setTimeout(()=>{const buttons=[...document.querySelectorAll<HTMLButtonElement>('[aria-label="Site controls"]')];buttons.find(button=>button.offsetParent!==null)?.focus();},120);};
  const load=async()=>{if(!pageId)return;setError("");try{setInfo(await bridge.siteInfo(pageId));}catch(reason){setError(reason instanceof Error?reason.message:String(reason));}};
  useEffect(()=>{void load();requestAnimationFrame(()=>closeRef.current?.focus());},[pageId]);
  const reset=async(permission?:string)=>{if(!info)return;setBusy(permission??"all");setNotice("");setError("");try{await bridge.clearSitePermission(info.origin,permission);await load();setNotice(permission?`${labels[permission]??permission} will ask again.`:"This site will ask for access again.");}catch(reason){setError(reason instanceof Error?reason.message:String(reason));}finally{setBusy("");}};
  const clear=async()=>{if(!info)return;setBusy("data");setNotice("");setError("");try{if(await bridge.clearSiteData(info.pageId)){await load();setNotice("Cookies and stored website data cleared. Reload the site to finish signing out.");}}catch(reason){setError(reason instanceof Error?reason.message:String(reason));}finally{setBusy("");}};
  const security=info?.security==="secure"?{icon:I.lock,title:"Connection is secure",detail:"This page was loaded over an encrypted HTTPS connection."}:info?.security==="local"?{icon:I.globe,title:"Local connection",detail:"This page is on this Mac or a local network address and is not encrypted."}:{icon:I.alert,title:"Connection is not secure",detail:"Information sent to this page is not encrypted."};
  return <div className="site-controls-scrim" role="presentation" onMouseDown={event=>{if(event.target===event.currentTarget)close();}}>
    <section className="site-controls-card pop-in" role="dialog" aria-modal="true" aria-labelledby="site-controls-title">
      <header><div className={`site-security-icon ${info?.security??""}`}>{security.icon}</div><div><h2 id="site-controls-title">{info?.origin??"Site controls"}</h2><p>{security.title}</p></div><button ref={closeRef} className="icon-btn" aria-label="Close site controls" onClick={close}>{I.close}</button></header>
      {error&&<div className="site-controls-error" role="alert"><span>{error}</span><button className="btn sm" onClick={()=>void load()}>Try again</button></div>}
      {!info&&!error&&<p className="site-controls-loading" role="status">Loading site details…</p>}
      {info&&<>
        <div className="site-security-copy"><strong>{security.title}</strong><span>{security.detail}</span></div>
        <section className="site-controls-group" aria-labelledby="site-data-title"><div><span className="site-row-icon">{I.cookie}</span><div><strong id="site-data-title">Cookies and site data</strong><span>{info.cookieCount===1?"1 cookie":`${info.cookieCount} cookies`} currently visible to this page</span></div><button className="btn sm" disabled={!!busy} onClick={()=>void clear()}>Clear…</button></div></section>
        <section className="site-controls-group" aria-labelledby="site-access-title"><div className="site-group-heading"><div><strong id="site-access-title">Site access</strong><span>Saved for this website</span></div>{Object.keys(info.permissions).length>0&&<button className="btn sm" disabled={!!busy} onClick={()=>void reset()}>Reset all</button>}</div>
          {Object.entries(info.permissions).length?Object.entries(info.permissions).map(([permission,decision])=><div className="site-permission-compact" key={permission}><span>{labels[permission]??permission}</span><span className={`site-decision ${decision}`}>{decision==="allow"?"Allowed":"Blocked"}</span><button className="btn sm" aria-label={`Reset ${labels[permission]??permission}`} disabled={!!busy} onClick={()=>void reset(permission)}>Reset</button></div>):<p className="site-empty-access">No saved access decisions. Aux will ask before this site uses sensitive capabilities.</p>}
        </section>
        {notice&&<p className="site-controls-notice" role="status">{notice}</p>}
      </>}
    </section>
  </div>;
}
