// Final settings adapter, after navigation, theme and routing. All controls use
// the supplied settings owners; no CSS, replacement page, or optimistic saves.
export const FEATURE_SETTINGS_ASSETS = Object.freeze({
  appearance:'assets/appearance-Ceuw3-j6.js', general:'assets/general-3dgRbrRk.js',
});

export function createAuxFeatureSettingsSession(api, kind, onState, onError) {
  let live=true, busy=false, state=null, owner=null;
  const cleanup=kind==='cleanup';
  const read=async()=>{
    const next=await (cleanup?api.getOrganizationSettings():api.getFramePresentation());
    if(!next?.success) throw Error(next?.error||'Settings are unavailable.');
    if(cleanup) {
      if(typeof next.ownerGeneration!=='string'||!next.ownerGeneration||typeof next.revision!=='string'||!next.revision||
        typeof next.cleanup?.enabled!=='boolean'||!Number.isInteger(next.cleanup?.inactivityDays)||
        next.cleanup.inactivityDays<1||next.cleanup.inactivityDays>3650) throw Error('Invalid tab cleanup settings.');
      if(owner!==null&&owner!==next.ownerGeneration) throw Error('Profile changed. Reopen settings before making changes.');
      owner=next.ownerGeneration;
    } else if(['sidebarNavigation','minimal','peekLinks'].some(key=>typeof next[key]!=='boolean')) {
      throw Error('Browser presentation settings are unavailable in this build.');
    }
    if(live){state=next;onState(next);}
    return next;
  };
  const report=error=>{if(live)onError(error instanceof Error?error.message:String(error));};
  return {
    async load(){if(!live||busy)return;busy=true;try{return await read()}catch(error){report(error);throw error}finally{busy=false}},
    async save(patch){
      if(!live)throw Error('Settings were closed.');
      if(busy)throw Error('A settings update is already in progress.');
      if(!state)throw Error('Reload settings before saving.');
      busy=true;
      try{
        let request;
        if(cleanup){
          if(Object.keys(patch).some(key=>!['enabled','inactivityDays'].includes(key))||
            typeof patch.enabled!=='boolean'||!Number.isInteger(patch.inactivityDays)||
            patch.inactivityDays<1||patch.inactivityDays>3650)throw Error('Choose a whole number of days from 1 to 3650.');
          request={ownerGeneration:state.ownerGeneration,expectedRevision:state.revision,...patch};
        }else{
          if(!Object.keys(patch).length||Object.entries(patch).some(([key,value])=>
            !['sidebarNavigation','minimal','peekLinks'].includes(key)||typeof value!=='boolean'))throw Error('Invalid browser presentation setting.');
          request=patch;
        }
        const result=await(cleanup?api.setOrganizationCleanupPolicy(request):api.setFramePresentation(request));
        if(!result?.success){
          // Refresh the CAS revision, but never treat a refused commit as saved.
          try{await read()}catch{state=null}
          throw Error(result?.error||'Settings were not saved.');
        }
        // The native write callback is authoritative. Read its actual state;
        // do not substitute the requested value for an incomplete response.
        if(!live)return result;
        try{await read()}catch(error){state=null;throw error}
        return result;
      }catch(error){report(error);throw error}finally{busy=false}
    },
    close(){live=false;state=null;},
  };
}

function AuxFrameSettings() {
  const el=A.createElement,api=u(),[state,setState]=A.useState(null),[busy,setBusy]=A.useState(false),[error,setError]=A.useState('');
  const session=A.useRef(null),alive=A.useRef(false);
  A.useEffect(()=>{
    alive.current=true;
    const client=createAuxFeatureSettingsSession(api,'frame',setState,setError);session.current=client;
    client.load().catch(()=>{});
    return()=>{alive.current=false;client.close();session.current=null};
  },[api]);
  const update=async(key,value)=>{setBusy(true);setError('');try{await session.current.save({[key]:value})}catch{}finally{if(alive.current)setBusy(false)}};
  return el(A.Fragment,null,
    [['sidebarNavigation','Navigation in sidebar','Keep the address and navigation controls in the open sidebar.'],
     ['minimal','Minimal browser UI','Give the page more room while keeping the sidebar available.'],
     ['peekLinks','Open links in Peek','Preview ordinary links before moving them into a full tab.']].map(([key,title,description])=>
      el(h,{key},el(b,{title,description}),el(p,null,el(ze,{'aria-label':title,checked:state?.[key]??false,
        disabled:!state||busy,onCheckedChange:value=>update(key,value)})))),
    error&&el('p',{role:'alert',className:'text-sm text-red-500'},error));
}

function AuxCleanupSetting() {
  const el=at.createElement,[open,setOpen]=at.useState(false);
  return el(at.Fragment,null,el(Bt,null,
    el(qt,{title:'Tab cleanup',description:'Choose whether inactive, unpinned tabs are cleaned up automatically.'}),
    el(pn,null,el(yt,{variant:'secondary',className:'click-depth-effect',onClick:()=>setOpen(true)},'Manage'))),
    open&&el(AuxCleanupDialog,{onClose:()=>setOpen(false)}));
}
function AuxCleanupDialog({onClose}) {
  const el=at.createElement,[state,setState]=at.useState(null),[enabled,setEnabled]=at.useState(false),
    [days,setDays]=at.useState('30'),[busy,setBusy]=at.useState(false),[error,setError]=at.useState(''),[saved,setSaved]=at.useState(false);
  const session=at.useRef(null),alive=at.useRef(false),initialized=at.useRef(false);
  at.useEffect(()=>{
    alive.current=true;
    const client=createAuxFeatureSettingsSession(chrome.auxBrowserPreferences,'cleanup',value=>{
      setState(value);if(!initialized.current){initialized.current=true;setEnabled(value.cleanup.enabled);setDays(String(value.cleanup.inactivityDays));}
    },setError);session.current=client;client.load().catch(()=>{});
    return()=>{alive.current=false;client.close();session.current=null};
  },[]);
  const number=Number(days),valid=/^\d+$/.test(days)&&Number.isInteger(number)&&number>=1&&number<=3650;
  const dirty=state&&(enabled!==state.cleanup.enabled||number!==state.cleanup.inactivityDays);
  const save=async()=>{
    setBusy(true);setError('');setSaved(false);
    try{await session.current.save({enabled,inactivityDays:number});if(alive.current)setSaved(true)}catch{}
    finally{if(alive.current)setBusy(false)}
  };
  return el(Ec,{open:true,onOpenChange:open=>{if(!open&&!busy)onClose()}},
    el(yc,{className:'w-130! max-w-[calc(100vw-2rem)]! max-h-[85vh] overflow-auto',showCloseButton:!busy},
      el(go,null,el(vo,null,'Tab cleanup'),el(mo,null,'Cleanup is off by default. Pinned tabs stay available. Active work and protected tabs are kept.')),
      error&&el('p',{role:'alert',className:'text-sm text-red-500'},error),
      !state?el('p',{className:'text-muted-foreground text-sm'},error?'Settings are unavailable.':'Loading…'):
        el(at.Fragment,null,
          el(Bt,null,el(qt,{title:'Clean up inactive tabs'}),el(pn,null,el(Ds,{'aria-label':'Clean up inactive tabs',checked:enabled,disabled:busy,
            onCheckedChange:value=>{setEnabled(value);setSaved(false)}}))),
          el('label',{className:'grid gap-1 text-sm'},'Days without activity',
            el('input',{type:'number',min:1,max:3650,step:1,value:days,disabled:busy,
              className:'bg-surface-primary border-border rounded-lg border px-3 py-2',
              onChange:event=>{setDays(event.target.value);setSaved(false)}})),
          !valid&&el('p',{role:'alert',className:'text-sm text-red-500'},'Enter a whole number from 1 to 3650.'),
          saved&&el('p',{role:'status',className:'text-muted-foreground text-sm'},'Saved.')),
      el(po,null,el(yt,{variant:'secondary',disabled:busy,onClick:onClose},'Close'),
        el(yt,{disabled:busy||!dirty||!valid,onClick:save},busy?'Saving…':'Save'))));
}

export function transformAuxBrowserFeatureSettings({relative,text}) {
  const anchors=[];
  const edit=(find,replacement,name)=>{
    const count=text.split(find).length-1;
    if(count!==1)throw Error(`${name}: expected one pinned anchor, got ${count}`);
    text=text.replace(find,replacement);anchors.push({name,kind:'integration',find,replace:replacement,count:1});
  };
  if(relative===FEATURE_SETTINGS_ASSETS.appearance){
    edit('(0,e.jsx)(AuxThemeEditorSetting,{}),(0,e.jsx)(ha,{})',
      '(0,e.jsx)(AuxThemeEditorSetting,{}),(0,e.jsx)(AuxFrameSettings,{}),(0,e.jsx)(ha,{})','Aux frame settings rows');
    edit('export{la as a,',`${createAuxFeatureSettingsSession.toString()}\n${AuxFrameSettings.toString()}\nexport{la as a,`,'Aux frame settings state');
  }
  if(relative===FEATURE_SETTINGS_ASSETS.general){
    edit('(0,A.jsx)(AuxRoutingSetting,{}),(0,A.jsx)(Km,{})',
      '(0,A.jsx)(AuxRoutingSetting,{}),(0,A.jsx)(AuxCleanupSetting,{}),(0,A.jsx)(Km,{})','Aux tab cleanup row');
    edit('export{Gg as component};',`${createAuxFeatureSettingsSession.toString()}\n${AuxCleanupSetting.toString()}\n${AuxCleanupDialog.toString()}\nexport{Gg as component};`,'Aux tab cleanup state');
  }
  return {text,anchors};
}
