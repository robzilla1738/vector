import { staticHintProps } from "../../ui/class-props";
import { bridge, inMock, inNativeHost } from "../../bridge";
import { NativePreferenceControl } from "./native-preference-control";
type SpellCheck = { enabled:boolean;managed:boolean };
const read=()=>bridge.spellCheck();
const write=(enabled:boolean)=>bridge.spellCheck(enabled).then(value=>({ack:value,value}));
const writable=()=>true;
const hint=(value:SpellCheck)=>value.managed&&<span {...staticHintProps}>Managed by your organization</span>;
export function SpellCheckSetting({active}:{active:boolean}) {
  return <NativePreferenceControl active={active} available={inNativeHost||inMock} kind="spell-check" label="Check spelling as you type" reading="Reading spell check setting…" privateHint="Spell check follows the regular Profile and cannot be changed in Private mode." read={read} write={write} writable={writable} hint={hint}/>;
}
