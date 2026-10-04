// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { defaultSelectionCaptureSettings } from "@aux/contracts";
import { Settings } from "./Settings";
import { bridge } from "../bridge";
import { useStore } from "../store";
import { invokeScopedControl } from "../scoped-control-commands";
vi.mock("../use-feature", async (original) => ({...await original<typeof import("../use-feature")>(),useFeature:()=>false}));
vi.mock("../features/registry",async(original)=>({...await original<typeof import("../features/registry")>(),featureSettingsAvailable:()=>false,FeatureSettings:()=>null}));
vi.mock('./MemorySettings',()=>({MemorySettings:()=>null}));
vi.mock('./ExternalAgents',()=>({ExternalAgents:()=>null}));
vi.mock('./PluginsPanel',()=>({PluginsPanel:()=>null}));
vi.mock('./Extensions',()=>({Extensions:()=>null}));
vi.mock('./VaultSettings',()=>({VaultSettings:()=>null}));
vi.mock('./CalendarConnections',()=>({CalendarConnections:()=>null}));
vi.mock('./OutboundMcpSettings',()=>({OutboundMcpSettings:()=>null}));
vi.mock('./ReviewedConnectors',()=>({ReviewedConnectors:()=>null}));
vi.mock('../settings/sections/Appearance',()=>({AppearanceSettings:()=>null}));
vi.mock('../settings/sections/Agents',()=>({AgentsSettings:()=>null}));
vi.mock('../settings/sections/PrivacySecurity',()=>({PrivacySecuritySettings:()=>null}));
vi.mock('../settings/sections/PasswordsAutofill',()=>({PasswordsAutofillSettings:()=>null}));
vi.mock('../settings/sections/Models',()=>({ModelsSettings:()=>null}));
vi.mock('../settings/sections/UsageBudgets',()=>({UsageBudgetsSettings:()=>null}));
vi.mock('../settings/sections/Automations',()=>({AutomationsSettings:()=>null}));
vi.mock('../settings/sections/Workspaces',()=>({WorkspacesSettings:()=>null}));
vi.mock('../settings/sections/QuickAsk',()=>({QuickAskSettings:()=>null}));
vi.mock('../settings/sections/ArchivedChats',()=>({ArchivedChatsSettings:()=>null}));
vi.mock('../settings/sections/Profiles',()=>({ProfilesSettings:()=>null}));
// Only an unrelated consumer is replaced; actual Settings and SelectionCapture
// execute the original store.call -> bridge.invoke settings.set producer.
vi.mock('../settings/sections/General',()=>({GeneralSettings:({active,onSave}:{active:boolean;onSave(patch:Record<string,unknown>):Promise<boolean>})=>active?<button onClick={()=>void onSave({defaultPageZoom:110})}>Save unrelated preference</button>:null}));
let host:HTMLDivElement,root:ReturnType<typeof createRoot>,originalState:ReturnType<typeof useStore.getState>;
const originalBridge={windowId:bridge.windowId,windowKind:bridge.windowKind,privateMode:bridge.privateMode};
const originalPath=window.location.href;
const toast=vi.fn();
const held=<T,>()=>{let resolve!:(value:T)=>void,reject!:(reason:unknown)=>void;const promise=new Promise<T>((a,b)=>{resolve=a;reject=b;});return {promise,resolve,reject};};
const button=(name:string)=>[...host.querySelectorAll<HTMLButtonElement>('button')].find(node=>node.textContent?.trim()===name)!;
const template=()=>host.querySelector<HTMLTextAreaElement>('[aria-label="Action 1 template"]')!;
async function render(){await act(async()=>root.render(<Settings/>));}
async function write(value:string){await act(async()=>{Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value')!.set!.call(template(),value);template().dispatchEvent(new Event('input',{bubbles:true}));});}
async function save(){let completion!:Promise<unknown>;await act(async()=>{button('Save Selection & Capture').focus();completion=invokeScopedControl('save-selection-capture-settings') as Promise<unknown>;});return {completion};}
beforeEach(()=>{
 vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT',true);
 vi.stubGlobal('ResizeObserver',class{observe(){}disconnect(){}});
 vi.stubGlobal('requestAnimationFrame',(fn:FrameRequestCallback)=>{fn(0);return 1;});
 vi.spyOn(HTMLElement.prototype,'getClientRects').mockReturnValue([{width:160,height:36}]as unknown as DOMRectList);
 originalState=useStore.getState();toast.mockReset();
 useStore.setState({connected:true,settingsCategory:'Selection & Capture',settings:{selectionCapture:defaultSelectionCaptureSettings()},toast});
 bridge.windowId='original';bridge.windowKind='normal';bridge.privateMode=false;
 window.history.replaceState(null,'','/settings/selection-capture');
 host=document.createElement('div');document.body.append(host);root=createRoot(host);
});
afterEach(async()=>{await act(async()=>root.unmount());host.remove();Object.assign(bridge,originalBridge);useStore.setState(originalState,true);window.history.replaceState(null,'',originalPath);vi.restoreAllMocks();vi.unstubAllGlobals();vi.useRealTimers();});
it('suppresses actual parent error publication after committed Private roundtrip while preserving false ACK',async()=>{
 const old=held<unknown>();const invoke=vi.spyOn(bridge,'invoke').mockImplementation(()=>old.promise);
 await render();await write('Original protected draft {text}');const {completion}=await save();
 expect(invoke.mock.calls).toEqual([['settings.set',{selectionCapture:expect.objectContaining({revision:0})}]]);
 bridge.privateMode=true;await render();bridge.privateMode=false;await render();await write('Replacement draft {text}');
 await act(async()=>old.reject(new Error('Original protected producer diagnostic')));
 expect(await completion).toBe(false);expect(toast).not.toHaveBeenCalled();expect(template().value).toBe('Replacement draft {text}');
 expect(host.textContent).not.toContain('Original protected producer diagnostic');expect(host.querySelector('.saved')).toBe(null);
});
it('preserves original current parent toast/false ACK and real registered recovery',async()=>{
 const old=held<unknown>();const invoke=vi.spyOn(bridge,'invoke').mockImplementationOnce(()=>old.promise).mockResolvedValue(null);
 await render();await write('Current retained draft {text}');const {completion}=await save();
 await act(async()=>old.reject(new Error('Original active backend error')));
 expect(await completion).toBe(false);expect(toast).toHaveBeenCalledWith('Original active backend error','error',undefined);
 expect(template().value).toBe('Current retained draft {text}');expect(host.textContent).toContain('Your edits are still here');
 const fresh=await save();expect(await fresh.completion).toBe(true);expect(host.querySelector('.saved')?.textContent).toContain('Saved');
 expect(invoke).toHaveBeenCalledTimes(2);
});
it('retains original successful transport ACK without parent Saved publication into a replacement window',async()=>{
 const old=held<unknown>();vi.spyOn(bridge,'invoke').mockImplementation(()=>old.promise);
 await render();await write('Original pending draft {text}');const {completion}=await save();
 bridge.windowId='replacement';await render();await write('Replacement editable draft {text}');
 await act(async()=>old.resolve(null));expect(await completion).toBe(true);
 expect(host.querySelector('.saved')).toBe(null);expect(host.textContent).not.toContain('Saved for this Profile');expect(template().value).toBe('Replacement editable draft {text}');
});
it('keeps newer opted Saved publication when the original opted timer expires',async()=>{
 vi.useFakeTimers();vi.spyOn(bridge,'invoke').mockResolvedValue(null);
 await render();await write('First saved draft {text}');let result=await save();expect(await result.completion).toBe(true);
 await act(async()=>vi.advanceTimersByTime(600));await write('Second saved draft {text}');result=await save();expect(await result.completion).toBe(true);
 await act(async()=>vi.advanceTimersByTime(600));expect(host.querySelector('.saved')?.textContent).toContain('Saved');
 await act(async()=>vi.advanceTimersByTime(600));expect(host.querySelector('.saved')).toBe(null);
});
it('does not publish parent diagnostics after the actual Settings/Selection mount retires',async()=>{
 const old=held<unknown>();vi.spyOn(bridge,'invoke').mockImplementation(()=>old.promise);
 await render();await write('Original retiring draft {text}');const {completion}=await save();
 await act(async()=>root.render(<textarea aria-label='Replacement chat draft'/>));
 await act(async()=>old.reject(new Error('Retired parent transport')));expect(await completion).toBe(false);expect(toast).not.toHaveBeenCalled();
 expect(host.querySelector('textarea')?.getAttribute('aria-label')).toBe('Replacement chat draft');
});
it('preserves the unrelated original shared setter error publication and false recovery policy',async()=>{
 const invoke=vi.spyOn(bridge,'invoke').mockRejectedValue(new Error('Unrelated original producer error'));
 await render();await act(async()=>button('General').click());await act(async()=>button('Save unrelated preference').click());
 expect(invoke.mock.calls).toEqual([['settings.set',{defaultPageZoom:110}]]);expect(toast).toHaveBeenCalledWith('Unrelated original producer error','error',undefined);expect(host.querySelector('.saved')).toBe(null);
});
