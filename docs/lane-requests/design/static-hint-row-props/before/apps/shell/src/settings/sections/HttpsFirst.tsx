import { bridge, inNativeHost } from "../../bridge";
import { NativePreferenceControl } from "./native-preference-control";
type HttpsUpgrade = { enabled:boolean;available:boolean;managed:boolean };
const read=()=>bridge.httpsUpgrade();
async function write(enabled:boolean,current:()=>boolean) {
  const ack=await bridge.setHttpsUpgrade(enabled);
  if(ack!==enabled)throw new Error("Chromium did not save the HTTPS-first setting.");
  if(!current())return {ack};
  const value=await bridge.httpsUpgrade();
  return {ack,value};
}
const writable=(value:HttpsUpgrade)=>value.available;
const hint=(value:HttpsUpgrade)=>!value.available&&<span className="hint">{value.managed?"Disabled by your organization":"Unavailable in this browser build"}</span>;
export function HttpsFirstSetting({active}:{active:boolean}) {
  return <NativePreferenceControl active={active} available={inNativeHost} kind="https-first" label="Automatically upgrade eligible HTTP pages" reading="Reading HTTPS-first setting…" privateHint="HTTPS-first follows the regular Profile and cannot be changed in Private mode." read={read} write={write} writable={writable} hint={hint}/>;
}
