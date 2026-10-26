const changes=[
  [
    "function Qe(){const[auxFileState,",
    "function createAuxPaletteInvocation(){let epoch=0,edits=0,generation=null;return{begin(){generation=null;const token=++epoch,start=edits;return{current:()=>epoch===token,unedited:()=>epoch===token&&edits===start,accept(value){if(epoch===token)generation=value}}},invalidate(){++epoch;generation=null},edit(){++edits},allows(value){return generation!==null&&generation===value},capture(unedited=false){const token=epoch,start=edits;return()=>epoch===token&&(!unedited||edits===start)}}}\nfunction Qe(){const auxInvocation=(0,i.useRef)(null);if(!auxInvocation.current)auxInvocation.current=createAuxPaletteInvocation();const[auxFileState,"
  ],
  [
    "(0,i.useEffect)(()=>{let live=true;chrome.auxBrowserPreferences.getCommandContext().then(value=>{if(!live)return;if(!value.success)throw Error(value.error);auxNavSetContext(value);if(value.mode===\"navigate\"){t(value.activeUrl??\"\");a(value.activeUrl??\"\");requestAnimationFrame(()=>{T.current?.focus();T.current?.select()})}}).catch(error=>{if(live)auxNavSetError(error.message)});return()=>{live=false}},[]);",
    "(0,i.useLayoutEffect)(()=>{const invalidate=()=>{auxInvocation.current.invalidate();auxFileGuard.current.invalidate();auxNavBusy.current=false;auxNavSetContext(null)};const refresh=()=>{const attempt=auxInvocation.current.begin();auxFileGuard.current.invalidate();auxNavBusy.current=false;auxNavSetContext(null);auxSetFileState(null);auxSetProductivityReceipt(null);auxNavSetError(\"\");t(\"\");a(\"\");E(0);chrome.auxBrowserPreferences.getCommandContext().then(value=>{if(!attempt.current())return;if(!value.success)throw Error(value.error);attempt.accept(value.generation);auxNavSetContext(value);if(value.mode===\"navigate\"&&attempt.unedited()){t(value.activeUrl??\"\");a(value.activeUrl??\"\");requestAnimationFrame(()=>{if(attempt.unedited()){T.current?.focus();T.current?.select()}})}}).catch(error=>{if(attempt.current())auxNavSetError(error.message)})};window.addEventListener(\"aux-command-invocation\",refresh);window.addEventListener(\"aux-command-hidden\",invalidate);refresh();return()=>{window.removeEventListener(\"aux-command-invocation\",refresh);window.removeEventListener(\"aux-command-hidden\",invalidate);invalidate()}},[]);"
  ],
  [
    "async n=>{if(auxNavBusy.current)return;auxNavBusy.current=true;",
    "async n=>{if(auxNavBusy.current||!auxInvocation.current.allows(auxNavContext?.generation))return;const auxActionCurrent=auxInvocation.current.capture();auxNavBusy.current=true;"
  ],
  [
    ";if(result.receipt)auxSetProductivityReceipt(result.receipt);auxNavSuccess=!!result.close;",
    ";if(!auxActionCurrent())return;if(result.receipt)auxSetProductivityReceipt(result.receipt);auxNavSuccess=!!result.close;"
  ],
  [
    "}catch(error){auxNavSetError(error instanceof Error?error.message:String(error))}finally{auxNavBusy.current=false;if(auxNavSuccess)O()}",
    "}catch(error){if(auxActionCurrent())auxNavSetError(error instanceof Error?error.message:String(error))}finally{if(auxActionCurrent()){auxNavBusy.current=false;if(auxNavSuccess)O()}}"
  ],
  [
    "G=n=>{const o=n.currentTarget.value;t(o),",
    "G=n=>{auxInvocation.current.edit();const o=n.currentTarget.value;t(o),"
  ],
  [
    "const auxLive=await chrome.auxBrowserPreferences.getCommandContext();if(!auxLive.success",
    "const auxLive=await chrome.auxBrowserPreferences.getCommandContext();if(!auxActionCurrent())return;if(!auxLive.success"
  ],
  [
    "?.id:n.tabId;if(m!==void 0){const f=await chrome.tabs.get(m);typeof f.windowId",
    "?.id:n.tabId;if(!auxActionCurrent())return;if(m!==void 0){const f=await chrome.tabs.get(m);if(!auxActionCurrent())return;typeof f.windowId"
  ],
  [
    "M=(0,i.useCallback)(()=>{requestAnimationFrame(()=>{T.current?.focus(),T.current?.select()})},[])",
    "M=(0,i.useCallback)(()=>{const current=auxInvocation.current.capture(true);requestAnimationFrame(()=>{if(current()){T.current?.focus();T.current?.select()}})},[])"
  ]
];
export function transformAuxPaletteInvocation({relative,text}) {
 const anchors=[];if(relative!=="assets/tabsearch-3k_2hgil.js")return{text,anchors};
 for(const [find,replace] of changes){const count=text.split(find).length-1;if(count!==1)throw Error(`palette invocation: expected one anchor, got ${count}`);text=text.replace(find,replace);anchors.push({kind:"aux-palette-invocation",find,replace,count:1})}
 return{text,anchors};
}
