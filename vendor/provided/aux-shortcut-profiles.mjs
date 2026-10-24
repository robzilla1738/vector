// Supplied shortcut editor extension; no replacement settings page or styles.
export const SHORTCUT_PROFILE_ASSETS=Object.freeze({page:'assets/appearance-C03x8vQf.js',capture:'assets/use-shortcut-capture-DGr8Ws5Z.js'});
export const AUX_FEATURE_SHORTCUTS=Object.freeze([
  ['minimal',34120,'Toggle minimal UI'],['sidebarNavigation',34121,'Toggle navigation in sidebar'],
  ['newSpace',34122,'New Space'],['nextSpace',34123,'Next Space'],['previousSpace',34124,'Previous Space'],
  ['newFolder',34125,'New folder'],['pinCurrent',34126,'Pin current tab'],['keepInSpace',34127,'Keep tab in Space'],
  ['archiveCurrent',34128,'Archive current tab'],['unloadCurrentView',34129,'Unload current tab view'],
  ['nextPane',34130,'Next pane'],['previousPane',34131,'Previous pane'],['splitHorizontal',34132,'Split horizontally'],
  ['splitVertical',34133,'Split vertically'],['unsplit',34134,'Remove split'],['quickWindow',34135,'Quick window'],
  ['screenshot',34136,'Take screenshot'],['pictureInPicture',34137,'Picture in picture'],
  ['developerMode',34138,'Toggle developer mode'],['themeEditor',34139,'Edit theme'],
]);
export function parseAuxShortcutProfile(text){
  if(typeof text!=='string'||new TextEncoder().encode(text).length>65536)throw Error('Choose an Aux shortcuts file smaller than 64 KiB.');
  const value=JSON.parse(text);
  if(!value||Array.isArray(value)||Object.keys(value).some(k=>!['format','version','platform','mappings'].includes(k))||
    value.format!=='aux-shortcuts'||value.version!==1||value.platform!=='mac'||!value.mappings||Array.isArray(value.mappings)||
    typeof value.mappings!=='object'||Object.keys(value.mappings).length>128||Object.entries(value.mappings).some(([id,chord])=>
      !/^[1-9]\d{0,5}$/.test(id)||id==='34069'||typeof chord!=='string'||chord.length>96))throw Error('This is not a supported Aux browser shortcuts file.');
  return value;
}
export function createAuxShortcutProfileSession(api,onState,onError){
  let state=null,owner=null,live=true,busy=false;
  function accept(value){
    if(!value?.success)throw Error(value?.error||'Shortcut settings are unavailable.');
    if(typeof value.ownerGeneration!=='string'||!value.ownerGeneration||typeof value.revision!=='string'||!value.revision||!Array.isArray(value.bindings))throw Error('Invalid shortcut state.');
    if(owner!==null&&owner!==value.ownerGeneration){state=null;throw Error('Profile changed. Reopen shortcut settings.');}
    if(live){owner=value.ownerGeneration;state=value;onState(value);}return value;
  }
  async function run(operation,mappings){
    if(!live)throw Error('Shortcut settings were closed.');
    if(busy)throw Error('A shortcut operation is already in progress.');
    busy=true;
    try{
      if(operation==='load')return accept(await api.getShortcutProfile());
      if(!state)throw Error('Reload shortcut settings before continuing.');
      if(operation==='export'){
        const result=await api.exportShortcutProfile();
        if(!live)return null;
        if(!result?.success)throw Error(result?.error||'Could not export shortcuts.');
        if(result.ownerGeneration!==owner||result.revision!==state.revision)throw Error('Shortcuts changed. Reload before exporting.');
        parseAuxShortcutProfile(JSON.stringify(result.configuration));return result.configuration;
      }
      const request={ownerGeneration:owner,revision:state.revision,...operation==='import'?{mappings}:{}};
      const result=await(operation==='import'?api.importShortcutProfile(request):api.resetShortcutProfile(request));
      if(!live)return null;
      if(!result?.success){
        // Do not auto-adopt a conflicting revision for a second click. Explicit
        // Reload requires reviewing the prospective table again.
        state=null;throw Error(result?.error||'Shortcuts were not changed.');
      }
      return accept(result);
    }catch(error){if(live)onError(error.message);throw error}finally{busy=false}
  }
  return{load:()=>run('load'),export:()=>run('export'),apply:mappings=>run('import',mappings),reset:()=>run('reset'),close(){live=false;state=null}};
}
function AuxShortcutProfiles({onUpdated}){
  const el=P.createElement,[state,setState]=P.useState(null),[proposal,setProposal]=P.useState(null),
    [busy,setBusy]=P.useState(false),[error,setError]=P.useState(''),[open,setOpen]=P.useState(false);
  const session=P.useRef(null),file=P.useRef(null),alive=P.useRef(false),selection=P.useRef(0);
  P.useEffect(()=>{
    alive.current=true;const client=createAuxShortcutProfileSession(chrome.auxBrowserPreferences,setState,setError);session.current=client;
    client.load().catch(()=>{});return()=>{alive.current=false;selection.current++;client.close();session.current=null};
  },[]);
  const action=async operation=>{setBusy(true);setError('');try{await operation()}catch(e){if(alive.current)setError(e.message)}finally{if(alive.current)setBusy(false)}};
  const reload=()=>action(async()=>{selection.current++;await session.current.load();if(alive.current){setProposal(null);onUpdated()}});
  const exportFile=()=>action(async()=>{
    const value=await session.current.export();if(!alive.current||!value)return;
    const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)+'\n'],{type:'application/json'}));
    const link=document.createElement('a');link.href=url;link.download='aux-shortcuts.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),0);
  });
  const pick=async event=>{
    const chosen=event.target.files?.[0];event.target.value='';if(!chosen)return;
    const token=++selection.current;setError('');
    try{if(chosen.size>65536)throw Error('Choose an Aux shortcuts file smaller than 64 KiB.');
      const parsed=parseAuxShortcutProfile(await chosen.text());if(!alive.current||selection.current!==token)return;
      const known=new Set(state?.bindings.map(x=>String(x.commandId))??[]);
      if(Object.keys(parsed.mappings).some(id=>!known.has(id)))throw Error('This file contains shortcuts unavailable in this build.');
      setProposal({kind:'import',mappings:parsed.mappings});setOpen(true);
    }catch(e){if(alive.current&&selection.current===token)setError(e.message)}
  };
  const apply=()=>action(async()=>{
    selection.current++;
    const result=await(proposal.kind==='reset'?session.current.reset():session.current.apply(proposal.mappings));
    if(alive.current&&result){setProposal(null);setOpen(false);onUpdated();}
  });
  const rows=proposal&&state?.bindings.map(binding=>({...binding,next:proposal.kind==='reset'?binding.defaultSerializedShortcut:
    proposal.mappings[String(binding.commandId)]??binding.defaultSerializedShortcut})).filter(binding=>binding.next!==binding.serializedShortcut);
  return el(S,null,
    el(H,null,el(b,{title:'Browser shortcut profiles',description:'Import, export or reset in-app shortcuts. The global Mini popup shortcut is managed separately.'}),
      el(G,{className:'max-w-none items-center gap-2'},
        el(y,{variant:'ghost',size:'sm',disabled:busy||!state,onClick:exportFile},'Export'),
        el(y,{variant:'ghost',size:'sm',disabled:busy||!state,onClick:()=>file.current?.click()},'Import'),
        el(y,{variant:'ghost',size:'sm',disabled:busy||!state,onClick:()=>{selection.current++;setProposal({kind:'reset'});setOpen(true);setError('')}},'Reset all'))),
    el('input',{ref:file,type:'file',accept:'.json,application/json',hidden:true,onChange:pick}),
    error&&el('div',{role:'alert',className:'text-destructive text-sm'},error,
      el(y,{variant:'ghost',size:'sm',disabled:busy,onClick:reload},'Reload')),
    open&&proposal&&el(P.Fragment,null,
      el(b,{title:proposal.kind==='reset'?'Reset browser shortcuts?':'Review shortcut import',description:'Only these in-app mappings change. Native conflicts are checked together before applying.'}),
      rows?.map(row=>el(H,{key:row.commandId},el(b,{title:Object.values(I).find(x=>x.commandId===row.commandId)?.title??`Command ${row.commandId}`}),
        el(G,{className:'max-w-none items-center gap-2'},el(w,null,row.shortcut||'Not set'),' → ',el(w,null,row.next||'Not set')))),
      el(H,null,el(b,{title:rows?.length?`${rows.length} shortcuts will change`:'No changes'}),el(G,{className:'max-w-none items-center gap-2'},
        el(y,{variant:'ghost',size:'sm',disabled:busy,onClick:()=>{selection.current++;setOpen(false);setProposal(null)}},'Cancel'),
        el(y,{variant:'secondary',size:'sm',disabled:busy||!rows?.length,onClick:apply},busy?'Applying…':'Apply')))));
}
export function transformAuxShortcutProfiles({relative,text}){
  const anchors=[];
  const edit=(find,replace,name)=>{const count=text.split(find).length-1;if(count!==1)throw Error(`${name}: expected one pinned anchor, got ${count}`);text=text.replace(find,replace);anchors.push({name,kind:'integration',find,replace,count:1});};
  if(relative===SHORTCUT_PROFILE_ASSETS.capture){
    const entries=AUX_FEATURE_SHORTCUTS.map(([key,commandId,title])=>`${key}:${JSON.stringify({commandId,title,key:'',description:'Assign a shortcut to this browser command.'})},`).join('');
    edit('p={newTab:',`p={${entries}newTab:`,'Aux unbound feature command catalog');
    edit('const a=`${t}+${r}`,s=E(a,e);','const a=r?`${t}+${r}`:"",s=a?E(a,e):"";','Aux unbound shortcut fallback');
    edit('if(a.some(n=>n.commandId!==i&&n.serializedShortcut===u))','if(u&&a.some(n=>n.commandId!==i&&n.serializedShortcut===u))','Aux unbound reset collision check');
  }
  if(relative===SHORTCUT_PROFILE_ASSETS.page){
    edit('children:[O(),(0,e.jsx)(S,','children:[O(),(0,e.jsx)(AuxShortcutProfiles,{onUpdated:R}),(0,e.jsx)(S,','Aux shortcut profile editor row');
    edit('export{we as component};',`${parseAuxShortcutProfile.toString()}\n${createAuxShortcutProfileSession.toString()}\n${AuxShortcutProfiles.toString()}\nexport{we as component};`,'Aux shortcut profile editor state');
  }
  return{text,anchors};
}
