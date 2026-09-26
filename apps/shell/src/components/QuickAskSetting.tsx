import { useEffect, useState } from "react";
import { bridge, inNativeHost } from "../bridge";
import { errToast } from "../store";
import { useShortcutLabels } from "../use-shortcut-label";
import "./QuickAskSetting.css";

type Status={enabled:boolean;registered:boolean;error:string};
export function QuickAskSetting() {
  const key = useShortcutLabels();
  const [status,setStatus]=useState<Status|null>(null),[error,setError]=useState(""),[busy,setBusy]=useState(false);
  useEffect(()=>{let live=true;void bridge.quickAskShortcut().then(value=>{if(live)setStatus(value);}).catch(reason=>{if(live)setError(String(reason));});return()=>{live=false;};},[]);
  async function change(enabled:boolean) {
    setBusy(true);setError("");
    try{setStatus(await bridge.quickAskShortcut(enabled));}catch(reason){setError(reason instanceof Error?reason.message:String(reason));}finally{setBusy(false);}
  }
  return <div className="quick-ask-setting">
    <button className="btn sm" disabled={!inNativeHost} onClick={()=>void bridge.quickAsk("open").catch(errToast)}>Open Quick Ask</button>
    <p className="hint">A compact chat that expands into a full browser window. Your draft stays with it.</p>
    {status&&<label className="memory-use-toggle"><input type="checkbox" disabled={busy||!inNativeHost} checked={status.enabled} onChange={event=>void change(event.target.checked)}/><span>Open from any app with {key("quick-ask")}<small>Optional · available while Aux is running. Other apps and their contents are not captured.</small></span></label>}
    {(error||status?.error)&&<p className="field-error" role="alert">{error||status?.error} <button className="btn sm ghost" disabled={busy} onClick={()=>void change(true)}>Try again</button></p>}
    {!inNativeHost&&<p className="hint">Available in the Aux desktop app.</p>}
  </div>;
}
