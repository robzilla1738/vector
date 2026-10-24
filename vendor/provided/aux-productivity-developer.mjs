export function developerSections(context,query,sections){
 if(context?.mode!=='commands'||!context.developer?.success)return sections;
 const items=[...(context.developer.captureAvailable?[{id:'aux-developer-capture',kind:'aux-developer-capture',title:'Screenshot',subtitle:'Capture this page or select an area'}]:[]),...(context.developer.devToolsAvailable?[{id:'aux-developer-tools',kind:'aux-developer-tools',title:'Developer tools',subtitle:'Inspect the active page'}]:[]),{id:'aux-developer-extensions',kind:'aux-developer-extensions',title:'Manage extensions',subtitle:context.developer.developerMode?'Developer mode is on — load only extensions you trust':'Chrome-compatible extensions for this profile'}].filter(item=>!query.trim()||`${item.title} ${item.subtitle}`.toLowerCase().includes(query.trim().toLowerCase()));
 return items.length?[{id:'aux-developer',title:'Page tools',items},...sections]:sections;
}
export async function runDeveloperCommand(api,tabs,context,item){
 const checked=result=>{if(!result?.success)throw Error(result?.error??'This page action is unavailable.');return result};
 const request={generation:context.generation};
 if(item.kind==='aux-developer-tools'){checked(await api.openDeveloperTools(request));return;}
 if(item.kind==='aux-developer-extensions'){checked(await api.openExtensionManager(request));return;}
 if(item.kind==='aux-developer-capture'){
  const target=checked(await api.getPageCaptureTarget(request));
  if(!Number.isInteger(target.tabId)||!target.documentId)throw Error('The selected page changed.');
  await tabs.sendMessage(target.tabId,{type:'capture:open'},{documentId:target.documentId});return;
 }
 throw Error('Unsupported page action.');
}
function replace(text,find,next,anchors,kind){const count=text.split(find).length-1;if(count!==1)throw Error(`${kind}: expected one anchor, got ${count}`);anchors.push({find,replace:next,kind,count:1});return text.replace(find,next)}
export function transformAuxDeveloperUi({relative,text}){
 const anchors=[],change=(find,next,kind)=>{text=replace(text,find,next,anchors,kind)};
 if(relative==='assets/tabsearch-3k_2hgil.js'){
  change('function Qe(){const[auxFileState,',`${developerSections.toString()}\n${runDeveloperCommand.toString()}\nfunction Qe(){const[auxFileState,`,'aux-developer-command-helpers');
  change('mediaSections(auxNavContext,r,navigationSections(auxNavContext,r,Pe($,r)))','developerSections(auxNavContext,r,mediaSections(auxNavContext,r,navigationSections(auxNavContext,r,Pe($,r))))','aux-developer-existing-command-rows');
  change('let auxNavSuccess=false;try{if(n.kind==="aux-pip")','let auxNavSuccess=false;try{if(n.kind?.startsWith("aux-developer-")){await runDeveloperCommand(chrome.auxBrowserPreferences,chrome.tabs,auxNavContext,n);auxNavSuccess=true;return}if(n.kind==="aux-pip")','aux-developer-actual-target-actions');
 }
 if(relative==='assets/general-3dgRbrRk.js'){
  const component='function AuxDeveloperSettings(){const api=chrome.auxBrowserPreferences,cache=Bn(),key=["aux","developer"],available=!!api?.getDeveloperSettings,{data:state}=en({queryKey:key,enabled:available,queryFn:async()=>{const result=await api.getDeveloperSettings();if(!result.success)throw Error(result.error);return result}}),mutation=Fn({mutationFn:async enabled=>{const result=await api.setDeveloperMode({enabled});if(!result.success)throw Error(result.error);return result},onSuccess:result=>cache.setQueryData(key,result),onError:error=>Dn.error(error.message)});return(0,A.jsxs)(un,{children:[(0,A.jsxs)(Bt,{children:[(0,A.jsx)(qt,{title:"Developer mode",description:state?.managed?"Managed by your administrator":"Enable unpacked extension tools. Only load extensions you trust."}),(0,A.jsx)(pn,{children:(0,A.jsx)(Ds,{checked:state?.developerMode??false,disabled:!state?.canChange||mutation.isPending,onCheckedChange:value=>mutation.mutate(value)})})]}),(0,A.jsxs)(Bt,{children:[(0,A.jsx)(qt,{title:"Extensions",description:"Manage extension permissions or load your own extension."}),(0,A.jsx)(pn,{children:(0,A.jsx)(yt,{variant:"outline",disabled:!available,onClick:async()=>{try{const result=await api.openExtensionManager({});if(!result.success)throw Error(result.error)}catch(error){Dn.error(error.message)}},children:"Manage extensions"})})]})]})}';
  change('var Xm=()',`${component}var Xm=()`,'aux-developer-reused-settings-components');
  change('(0,A.jsx)(jm,{})]}),','(0,A.jsx)(jm,{})]}),(0,A.jsx)(AuxDeveloperSettings,{}),','aux-developer-settings-mount');
 }
 return{text,anchors};
}
