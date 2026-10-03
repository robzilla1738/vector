import { useEffect, useRef, useState } from "react";
import { BrowserHostMethods as HostMethods } from "@aux/contracts/browser-host-methods";
import { commandResult } from "../profiles/command-result";
import { bridge } from "../../bridge";
import { SettingsField, SettingsSection } from "../../settings/primitives";
import { errToast } from "../../store";
export function AppleScriptPreference() {
  const [value,setValue] = useState<{enabled:boolean;managed:boolean}>();
  const [busy,setBusy] = useState(false);
  const alive=useRef(false),generation=useRef({value:0}),pending=useRef(false);
  useEffect(()=>{const counter=generation.current;alive.current=true;const request=++generation.current.value;void bridge.javascriptAppleEvents().then(value=>{if(alive.current&&request===generation.current.value)setValue(value);}).catch(error=>{if(alive.current&&request===generation.current.value)errToast(error);});return()=>{alive.current=false;++counter.value;};},[]);
  return <SettingsSection name="Advanced"><SettingsField label="JavaScript from Apple Events" description="Allow local scripts to execute JavaScript in regular human tabs. Scripts can read and change page content. This is off by default and remains refused in private and agent-owned tabs." searchTerms={["AppleScript","execute","automation"]}><label><input type="checkbox" checked={value?.enabled??false} disabled={!value||value.managed||busy} onChange={event=>{if(pending.current)return;pending.current=true;const request=++generation.current.value;setBusy(true);void commandResult("set-javascript-apple-events",HostMethods.javascriptAppleEvents.result,{enabled:event.target.checked}).then(value=>{if(alive.current&&request===generation.current.value)setValue(value);}).catch(error=>{if(alive.current&&request===generation.current.value)errToast(error);}).finally(()=>{pending.current=false;if(alive.current&&request===generation.current.value)setBusy(false);});}}/>{value?.managed?"Managed by your organization":"Allow JavaScript from Apple Events"}</label></SettingsField></SettingsSection>;
}
