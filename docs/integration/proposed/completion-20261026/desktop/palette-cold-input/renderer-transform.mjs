const changes=[
  [
    "function Qe(){const auxInvocation=",
    "function Qe(){const auxInputTransfer=(0,i.useRef)(false);const[auxNativeInput,auxSetNativeInput]=(0,i.useState)(null),[auxNativeSubmit,auxSetNativeSubmit]=(0,i.useState)(false);const auxInvocation="
  ],
  [
    "auxNavSetContext(null)};const refresh=",
    "auxNavSetContext(null);auxInputTransfer.current=false;auxSetNativeInput(null);auxSetNativeSubmit(false)};const refresh="
  ],
  [
    "attempt.accept(value.generation);auxNavSetContext(value);if(value.mode",
    "auxNavSetContext(value);if(value.nativeInput?.active){auxInputTransfer.current=true;auxSetNativeInput(value.nativeInput);t(value.nativeInput.text);a(value.nativeInput.text);return}attempt.accept(value.generation);auxSetNativeInput(null);if(value.mode"
  ],
  [
    "if(event.shown)refresh();else invalidate()",
    "if(event.shown)refresh(!event.inputPending);else invalidate()"
  ],
  [
    "if(reset){t(\"\");a(\"\");E(0)}",
    "if(reset){t(\"\");a(\"\");E(0);auxSetNativeSubmit(false)}"
  ],
  [
    "M=(0,i.useCallback)(()=>{const current=auxInvocation.current.capture(true);",
    "M=(0,i.useCallback)(()=>{if(auxInputTransfer.current)return;const current=auxInvocation.current.capture(true);"
  ],
  [
    "J=c?.query===r&&c.revision===l;return(0,s.jsxs)(\"main\",",
    "J=c?.query===r&&c.revision===l;(0,i.useLayoutEffect)(()=>{if(!auxNativeInput||!auxNavContext?.success)return;const current=auxInvocation.current.capture();const input=T.current;if(!input||auxNativeInput.composing)return;input.focus();input.setSelectionRange(Math.min(auxNativeInput.selectionStart,auxNativeInput.selectionEnd),Math.max(auxNativeInput.selectionStart,auxNativeInput.selectionEnd),auxNativeInput.selectionStart>auxNativeInput.selectionEnd?\"backward\":\"forward\");chrome.auxBrowserPreferences.getCommandContext({generation:auxNavContext.generation,inputRevision:auxNativeInput.revision}).then(value=>{if(!current())return;if(!value.success||value.generation!==auxNavContext.generation)throw Error(\"Command input changed; reopen the command bar\");if(value.nativeInput?.active){auxInputTransfer.current=true;auxSetNativeInput(value.nativeInput);t(value.nativeInput.text);a(value.nativeInput.text);return}if(!value.nativeInput?.accepted)return;auxInputTransfer.current=false;const attempt=auxInvocation.current.begin();attempt.accept(value.generation);auxSetNativeInput(null);auxSetNativeSubmit(!!value.nativeInput.submit);auxNavSetContext(value)}).catch(error=>{if(current())auxNavSetError(error.message)})},[auxNativeInput,auxNavContext]);(0,i.useEffect)(()=>{if(auxNativeSubmit&&auxInvocation.current.allows(auxNavContext?.generation)&&h.length){auxSetNativeSubmit(false);A(h[x]??h[0])}},[auxNativeSubmit,auxNavContext,A,h,x]);return(0,s.jsxs)(\"main\","
  ]
];
export function transformAuxPaletteColdInput({relative,text}) {const anchors=[];if(relative!=="assets/tabsearch-3k_2hgil.js")return{text,anchors};for(const [find,replace] of changes){const count=text.split(find).length-1;if(count!==1)throw Error(`cold input: expected one anchor, got ${count}`);text=text.replace(find,replace);anchors.push({kind:"aux-palette-cold-input",find,replace,count:1})}return{text,anchors}}
