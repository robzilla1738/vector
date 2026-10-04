import { staticHintProps } from "../ui/class-props";
import { smallButtonProps } from "../ui/button-props";
import { errorMessage } from "../error-message";
import { useEffect, useRef, useState } from "react";
import { bridge } from "../bridge";

export function WebsiteSizes() {
  const [sites, setSites] = useState<{origin: string; percentage: number}[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const version = useRef(0);
  const pending=useRef(false);
  const deferredRefresh=useRef(false);
  const root=useRef<HTMLDivElement>(null);
  const searchInput=useRef<HTMLInputElement>(null);
  async function load() {
    if(pending.current){deferredRefresh.current=true;return;}
    const current = ++version.current;
    setLoading(true); setError("");
    try { const result = await bridge.siteZoom(); if (version.current === current) setSites(result); }
    catch (error) { if (version.current === current) setError(errorMessage(error)); }
    finally { if (version.current === current) setLoading(false); }
  }
  useEffect(() => { void load(); const off = bridge.onSiteZoomChanged(() => void load()); return () => { version.current++; off(); }; }, []);
  async function reset(origin: string) {
    if(pending.current)return;
    pending.current=true;
    const current=++version.current;
    setBusy(origin);setLoading(false);setError("");setNotice("");
    const trigger=document.activeElement instanceof HTMLElement?document.activeElement:null;
    try{
      const result=await bridge.siteZoom(origin);
      if(version.current===current){setSites(result);setNotice(`${origin} restored to 100%.`);}
    }catch(error){if(version.current===current)setError(errorMessage(error));}
    finally{
      pending.current=false;
      if(version.current===current){
        setBusy("");
        if(deferredRefresh.current){deferredRefresh.current=false;void load();}
        requestAnimationFrame(()=>{
          if(!root.current||document.activeElement!==document.body)return;
          if(trigger?.isConnected)trigger.focus();else (searchInput.current??root.current).focus();
        });
      }
    }
  }
  const matching = sites.filter(site => site.origin.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  return <div ref={root} tabIndex={-1} role="group" aria-label="Saved website sizes" className="website-sizes">
    <p {...staticHintProps}>Saved page sizes for this profile. Reset applies to open tabs too; cookies and website permissions stay unchanged.</p>
    {sites.length > 0 && <input ref={searchInput} aria-label="Search website sizes" placeholder="Find a website…" value={query} onChange={event => setQuery(event.target.value)} />}
    {loading && <output {...staticHintProps} data-block>Loading website sizes…</output>}
    {error && <p role="alert">{error} <button {...smallButtonProps} disabled={loading||!!busy} onClick={() => void load()}>Refresh sizes</button></p>}
    {notice && <output {...staticHintProps} data-block>{notice}</output>}
    {!loading && !error && !matching.length && <p {...staticHintProps}>{sites.length ? "No matching websites." : "Websites use the default size. Sizes you change appear here."}</p>}
    {matching.map(site => <div className="site-permission-row" key={site.origin}><span title={site.origin}>{site.origin}</span><span className="hint nums">{site.percentage}%</span><button {...smallButtonProps} aria-label={`Reset size for ${site.origin}`} disabled={!!busy} onClick={() => void reset(site.origin)}>{busy === site.origin ? "Resetting…" : "Reset"}</button></div>)}
  </div>;
}
