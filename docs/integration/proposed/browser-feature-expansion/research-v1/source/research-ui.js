function auxResearchBindingIdentity(binding){return JSON.stringify([binding?.profileId,binding?.windowId,binding?.anchorTargetId,binding?.browserMode??'default'])}
function auxReadResearchIntent(source,accountId,model,onCreated){
 const editor=globalThis.__auxNewTabEditor,selected=source==='new-tab'&&editor?.mode==='ask'?editor.auxResearchIntent:null;
 if(!selected)return null;
 if(onCreated!==undefined||selected.accountId!==accountId||selected.provider!==model.provider||selected.modelId!==model.modelId)
  throw Error('Research context changed. Select Research again.');
 const query=editor.getSnapshot().plainText.trim();
 if(!query||query.length>2000)throw Error('Enter a research query of up to 2,000 characters.');
 return {selected,query,binding:selected.binding};
}
function auxAssertResearchIntent(intent,binding){
 if(!intent)return;
 if(globalThis.__auxNewTabEditor?.auxResearchIntent!==intent.selected||auxResearchBindingIdentity(binding)!==intent.binding)
  throw Error('The originating research window changed. Your prompt is preserved.');
}
export function AuxResearchControl(){
 const {accountId}=ge(),client=Ce(),cache=_e(),model=(0,g.useContext)(_o)?.value;
 const [state,setState]=(0,g.useState)({available:false,reason:'Checking research availability…'});
 const [selected,setSelected]=(0,g.useState)(false);
 const key=JSON.stringify([accountId,model?.provider,model?.modelId]);
 (0,g.useEffect)(()=>{
  let cancelled=false;const editor=globalThis.__auxNewTabEditor;
  if(editor)editor.auxResearchIntent=null;setSelected(false);setState({available:false,reason:'Checking research availability…'});
  (async()=>{
   if(!Number.isInteger(accountId)||!model?.provider||!model?.modelId)throw Error('Connect your provider in Settings > Models.');
   const binding=await cl();
   if(!binding)throw Error('Research needs an attached Aux browser window.');
   const capability=await cache.fetchQuery({...client.sessions.researchCapability.queryOptions({accountId,browserBinding:binding,model}),staleTime:0});
   if(cancelled)return;
   const current=await cl();if(cancelled)return;
   if(auxResearchBindingIdentity(current)!==auxResearchBindingIdentity(binding))throw Error('The browser window changed. Choose Research again.');
   setState({...capability,key,binding:auxResearchBindingIdentity(binding)});
  })().catch(error=>{if(!cancelled)setState({available:false,key,reason:error instanceof Error?error.message:'Research is unavailable.'})});
  return()=>{cancelled=true;if(editor)editor.auxResearchIntent=null};
 },[key,client,cache]);
 const enabled=state.available===true&&state.key===key;
 return (0,a.jsx)(J,{variant:'ghost',size:'sm',shape:'pill',className:'text-muted-foreground',disabled:!enabled,title:state.reason,'aria-label':'Research the web using your selected provider','aria-pressed':selected,onClick:()=>{
  const editor=globalThis.__auxNewTabEditor;if(!editor||!enabled)return;
  const next=!selected;editor.auxResearchIntent=next?{accountId,provider:model.provider,modelId:model.modelId,binding:state.binding}:null;
  setSelected(next);
 },children:selected?'Research on':'Research'});
}
