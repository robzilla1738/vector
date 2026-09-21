import { useEffect, useRef, useState } from "react";
import { useStore } from "../store";
import { bridge } from "../bridge";

type Decisions = Record<string, Record<string, "allow" | "deny">>;
const labels: Record<string, string> = {
  media: "Camera and microphone", "media:audio": "Microphone", "media:video": "Camera", geolocation: "Location", notifications: "Notifications",
  "display-capture": "Screen capture", pointerLock: "Pointer lock", "idle-detection": "Idle detection",
  "clipboard-read": "Read clipboard", "clipboard-sanitized-write": "Write clipboard",
};

export function SitePermissions({ query = "" }: { query?: string }) {
  const pages = useStore(state => state.pages);
  const [selectedPage, setSelectedPage] = useState("");
  const openSites = pages.filter(page => page.backend === "vector" && /^https?:/.test(page.url) && URL.canParse(page.url))
    .filter((page, index, all) => all.findIndex(other => new URL(other.url).origin === new URL(page.url).origin) === index);
  const chosenPage = openSites.find(page => page.pageId === selectedPage) ?? openSites[0];
  const [decisions, setDecisions] = useState<Decisions>({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loadError,setLoadError]=useState("");
  const request=useRef(0);
  const pending=useRef(false);
  const root=useRef<HTMLDivElement>(null);
  async function load() {
    const version=++request.current;
    setLoading(true);setLoadError("");
    try { const result=await bridge.sitePermissions();if(version===request.current)setDecisions(result); }
    catch (error) { if(version===request.current)setLoadError(error instanceof Error ? error.message : String(error)); }
    finally { if(version===request.current)setLoading(false); }
  }
  useEffect(() => {
    void load();
    const refresh=()=>{if(!pending.current&&document.visibilityState!=="hidden")void load();};
    window.addEventListener("focus",refresh);
    document.addEventListener("visibilitychange",refresh);
    return()=>{++request.current;window.removeEventListener("focus",refresh);document.removeEventListener("visibilitychange",refresh);};
  }, []);
  async function action(id:string,work:()=>Promise<void>){
    if(pending.current)return;
    pending.current=true;++request.current;setLoading(false);
    setBusy(id);setError("");setNotice("");
    const trigger=document.activeElement instanceof HTMLElement?document.activeElement:null;
    try{await work();}
    catch(error){setError(error instanceof Error?error.message:String(error));}
    finally{
      pending.current=false;setBusy("");
      requestAnimationFrame(()=>{
        if(!root.current||document.activeElement!==document.body)return;
        if(trigger?.isConnected)trigger.focus();else root.current.querySelector<HTMLInputElement>('[aria-label="Search site permissions"]')?.focus();
      });
    }
  }
  const reset=(origin:string,permission?:string)=>action(origin,async()=>{
    if(!await bridge.clearSitePermission(origin,permission))throw new Error("The permission reset was not confirmed. Refresh permissions before trying again.");
    setDecisions(current=>{
      const next={...current};
      if(permission){
        next[origin]={...next[origin]};delete next[origin][permission];
        if(!Object.keys(next[origin]).length)delete next[origin];
      }else delete next[origin];
      return next;
    });
    setNotice("Decision reset. Reload this site to request access again. An active capture may continue until you stop it or close the tab.");
    await load();
  });
  const clearData=()=>chosenPage&&action(chosenPage.pageId,async()=>{
    if(await bridge.clearSiteData(chosenPage.pageId))setNotice("Cookies and stored website data cleared. Reload the site's open tabs. Cached files and permission decisions remain.");
  });
  const terms = `${search} ${/site|permission/i.test(query) ? "" : query}`.trim().toLowerCase();
  const sites = Object.entries(decisions).sort(([a], [b]) => a.localeCompare(b)).filter(([origin, permissions]) =>
    `${origin} ${Object.keys(permissions).map(key => labels[key] ?? key).join(" ")}`.toLowerCase().includes(terms));
  return <div ref={root} className="site-permissions">
    <p className="hint">Manage saved website access for the shared human and agent browsing profile. Resetting a decision makes the site ask again; it does not clear cookies or sign you out.</p>
    <section className="site-data-group" aria-label="Website data">
      <header><strong>Website data</strong></header>
      <p className="hint">Clear cookies and stored data for an open website. This can sign you out; cookies for related subdomains are included.</p>
      {chosenPage ? <div className="site-permission-row">
        <select aria-label="Website to clear" value={chosenPage.pageId} disabled={!!busy} onChange={event => setSelectedPage(event.target.value)}>{openSites.map(page => <option key={page.pageId} value={page.pageId}>{new URL(page.url).origin}</option>)}</select>
        <button className="btn sm" disabled={!!busy} onClick={() => void clearData()}>{busy===chosenPage.pageId?"Clearing…":"Clear website data…"}</button>
      </div> : <p className="hint">Open a website to manage its stored data.</p>}
    </section>
    <input aria-label="Search site permissions" placeholder="Search websites or permissions" value={search} onChange={event => setSearch(event.target.value)} />
    {loading && <p role="status">Loading site permissions…</p>}
    {error && <p role="alert">{error}</p>}
    {loadError && <div role="alert"><p>Couldn’t refresh permissions. {loadError}</p><button className="btn sm" disabled={loading||!!busy} onClick={() => void load()}>Refresh permissions</button></div>}
    {notice && <p className="hint" role="status">{notice}</p>}
    {!loading && !loadError && !sites.length && <p className="hint">{Object.keys(decisions).length ? "No matching websites." : "No saved website permissions. Websites ask when they need access."}</p>}
    {sites.map(([origin, permissions]) => <section className="site-permission-group" key={origin} aria-label={origin}>
      <header><strong>{origin}</strong><button className="btn sm" disabled={!!busy} onClick={() => void reset(origin)}>Reset site</button></header>
      {Object.entries(permissions).map(([permission, decision]) => <div className="site-permission-row" key={permission}>
        <span>{labels[permission] ?? permission}</span><span className="hint">{permission === "media" ? "Ask again" : decision === "allow" ? "Allowed" : "Blocked"}</span>
        <button className="btn sm" aria-label={`Reset ${labels[permission] ?? permission} for ${origin}`} disabled={!!busy} onClick={() => void reset(origin, permission)}>Reset</button>
      </div>)}
    </section>)}
  </div>;
}
