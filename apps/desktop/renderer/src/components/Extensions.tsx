import { useEffect, useRef, useState } from "react";
import { bridge, type BrowserExtension } from "../bridge";

export function Extensions() {
  const [items,setItems]=useState<BrowserExtension[]>([]);
  const [busy,setBusy]=useState(false);
  const [loading,setLoading]=useState(true);
  const [message,setMessage]=useState("");
  const [error,setError]=useState("");
  const [refresh,setRefresh]=useState(0);
  const pending=useRef(false);
  const revision=useRef(0);
  useEffect(()=>{
    let live=true;
    const load=()=>{
      if(pending.current)return;
      const request=++revision.current;
      setLoading(true);
      void bridge.extensions().then(next=>{if(live&&request===revision.current){setItems(next);setError("");}})
        .catch(reason=>{if(live&&request===revision.current)setError(String(reason));})
        .finally(()=>{if(live&&request===revision.current)setLoading(false);});
    };
    load();window.addEventListener("focus",load);
    return()=>{live=false;window.removeEventListener("focus",load);};
  },[refresh]);
  async function action(work:()=>Promise<void>) {
    if(pending.current)return;
    pending.current=true;++revision.current;setBusy(true);setLoading(false);setError("");setMessage("");
    try{await work();}catch(reason){setError(reason instanceof Error?reason.message:String(reason));}
    finally{
      // Failed loads update the installed row too, so Retry stays discoverable.
      try{setItems(await bridge.extensions());}catch(reason){setError(current=>current||String(reason));}
      pending.current=false;setBusy(false);
    }
  }
  return <section className="field extensions-settings" aria-label="Extensions">
    <div className="drawer-section">Extensions</div>
    <p>Add an unpacked Chrome extension to this profile. Extensions run in regular windows only.</p>
    <div className="extension-toolbar"><button className="btn" disabled={busy} onClick={()=>void action(async()=>{
      const installed=await bridge.installUnpackedExtension();
      if(installed)setMessage(`${installed.name} installed.`);
    })}>Install unpacked extension…</button>
      <button className="btn sm ghost" disabled={busy||loading} onClick={()=>setRefresh(value=>value+1)}>Refresh</button>
    </div>
    <details className="extension-compatibility"><summary>Compatibility and updates</summary>
      <p className="hint">Aux currently supports part of the Chrome extension API. Chrome Web Store installation, automatic updates, native messaging and password-manager integration are not supported as a complete experience yet.</p>
      <p className="hint">Aux uses its own copy of the selected folder. Choose Update to replace that copy after reviewing its declared access. Changes to the original folder do not apply automatically. Disabling and removal persist after restart.</p>
    </details>
    {error&&<p className="hint err" role="alert">{error}</p>}
    {message&&<output className="hint" data-block>{message}</output>}
    <div role="group" className="extension-list" aria-label="Installed extensions" aria-busy={loading||busy}>
      {loading&&!items.length?<output className="hint" data-block>Loading extensions…</output>:!items.length&&!error&&<p className="hint">No extensions installed. Add one when you need it.</p>}
      {items.map(extension=><article className="extension-row" key={`${extension.source}:${extension.key}`} aria-label={extension.name}>
        <div className="extension-copy">
          <div><strong>{extension.name}</strong><span className="extension-version">{extension.version}</span></div>
          <span className="hint">{extension.loaded?"Enabled":extension.error?"Couldn’t load":extension.enabled?"Not loaded":"Disabled"}{!extension.managed?" · Added through launch configuration":""}</span>
          {extension.error&&<details className="extension-details"><summary>Load details</summary><p className="hint err">{extension.error}</p></details>}
          <details className="extension-details"><summary>Declared access</summary><p className="hint extension-permissions">{extension.permissions.length?extension.permissions.join(", "):"No permissions declared."}</p></details>
        </div>
        {extension.managed&&<div className="extension-actions">
          {extension.enabled&&!extension.loaded&&<button className="btn sm" disabled={busy} onClick={()=>void action(async()=>{
            await bridge.setExtensionEnabled(extension.key,true);setMessage(`${extension.name} loaded.`);
          })}>Retry</button>}
          <button className="btn sm" disabled={busy} onClick={()=>void action(async()=>{
            const next=await bridge.setExtensionEnabled(extension.key,!extension.enabled);setMessage(`${next.name} ${next.enabled?"enabled":"disabled"}.`);
          })}>{extension.enabled?"Disable":"Enable"}</button>
          <button className="btn sm ghost" disabled={busy} onClick={()=>void action(async()=>{
            const updated=await bridge.updateUnpackedExtension(extension.key);
            if(updated)setMessage(`${updated.name} updated to ${updated.version}.${updated.enabled ? " Reload affected pages if needed." : " It remains disabled."}`);
          })}>Update…</button>
          <button className="btn sm ghost" disabled={busy} onClick={()=>void action(async()=>{
            if(await bridge.removeExtension(extension.key))setMessage(`${extension.name} removed.`);
          })}>Remove</button>
        </div>}
      </article>)}
    </div>
  </section>;
}
