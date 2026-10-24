// Extend the pinned supplied Appearance owner; preserve its dialogs, rows,
// controls and typography. Compose AFTER transformAuxNavigation.
export const THEME_APPEARANCE_ASSET = 'assets/appearance-Ceuw3-j6.js';

export function parseAuxThemeImport(text) {
  if (typeof text !== 'string' || new TextEncoder().encode(text).length > 4096)
    throw Error('Choose an Aux theme file smaller than 4 KiB.');
  const envelope = JSON.parse(text);
  if (!envelope || Array.isArray(envelope) || envelope.format !== 'aux-theme' ||
      envelope.version !== 1 || Object.keys(envelope).some(key => !['format','version','tokens'].includes(key)) ||
      !envelope.tokens || typeof envelope.tokens !== 'object' || Array.isArray(envelope.tokens))
    throw Error('This is not an Aux theme preset.');
  // Native validation is authoritative: unknown fields, CSS, assets and
  // out-of-range values cannot reach a color/material consumer.
  return envelope.tokens;
}

export function createAuxThemeSession(api, onState, onError) {
  let state = null, closed = false, chain = Promise.resolve();
  const methods = new Set(['previewTheme','applyTheme','resetTheme','saveThemePreset','deleteThemePreset','exportThemePreset']);
  const accept = result => {
    if (!result?.success) throw Error(result?.error || 'Could not update the theme.');
    if (result.revision) state = result;
    if (!closed && result.revision) onState(result);
    return result;
  };
  const enqueue = action => {
    const next = chain.then(action);
    chain = next.catch(() => {});
    next.catch(error => { if (!closed) onError(error.message); });
    return next;
  };
  return {
    load: () => enqueue(async () => closed ? null : accept(await api.getThemeState())),
    run: (method, input = {}) => enqueue(async () => {
      if (closed) return null;
      if (!methods.has(method) || !state) throw Error('Theme editor is not ready.');
      return accept(await api[method]({...input, revision:state.revision}));
    }),
    close: () => {
      if (closed) return chain;
      closed = true;
      // Drain prior preview calls before cancellation: a late response cannot
      // resurrect a preview after the dialog has closed.
      return enqueue(() => api.cancelTheme().then(accept));
    },
  };
}

// This component is injected beside the supplied component declarations. Its
// identifiers deliberately reuse the pinned Appearance imports below.
function AuxThemeEditorDialog({onClose}) {
  const [state,setState] = A.useState(null), [draft,setDraft] = A.useState(null);
  const {setTheme} = te(), themeQueryClient = f();
  const [error,setError] = A.useState(''), [busy,setBusy] = A.useState(false);
  const [name,setName] = A.useState(''), file = A.useRef(null);
  const session = A.useRef(null), draftRef = A.useRef(null), previewTimer = A.useRef(null);
  const dirty = A.useRef(false), alive = A.useRef(true);
  A.useEffect(() => {
    alive.current = true;
    const client = createAuxThemeSession(chrome.auxBrowserPreferences,
      next => { if (alive.current) setState(next); },
      message => { if (alive.current) setError(message); });
    session.current = client;
    client.load().then(next => { if (alive.current && next) { setDraft(next.tokens); draftRef.current = next.tokens; } }).catch(() => {});
    const lease = setInterval(() => {
      if (dirty.current && draftRef.current) client.run('previewTheme',{tokens:draftRef.current}).catch(() => {});
    },30000);
    return () => {
      alive.current = false;
      clearInterval(lease); clearTimeout(previewTimer.current);
      client.close().catch(() => {});
    };
  },[]);
  const change = next => {
    setError(''); setDraft(next); draftRef.current = next; dirty.current = true;
    clearTimeout(previewTimer.current);
    previewTimer.current = setTimeout(() => {
      session.current.run('previewTheme',{tokens:next}).catch(() => {});
    },140);
  };
  const field = (key,value) => {
    const next = {...draft};
    if (value === null) delete next[key]; else next[key] = value;
    if (key === 'tint') {
      if (value === null) delete next.tintStrength;
      else next.tintStrength = next.tintStrength ?? 0.15;
    }
    change(next);
  };
  const run = async (method,input = {},finish = false) => {
    clearTimeout(previewTimer.current); setError(''); setBusy(true);
    try {
      const result = await session.current.run(method,input);
      if (!alive.current || !result) return;
      if (method === 'applyTheme' || method === 'resetTheme') {
        dirty.current = false; setDraft(result.tokens); draftRef.current = result.tokens;
        setTheme(['system','light','dark'][result.nativeScheme] ?? 'system');
        themeQueryClient.invalidateQueries({queryKey:O});
      }
      if (finish) onClose();
      return result;
    } catch { return null; }
    finally { if (alive.current) setBusy(false); }
  };
  const color = (key,title,description) => (0,e.jsxs)(h,{children:[
    (0,e.jsx)(b,{title,description}),
    (0,e.jsxs)(p,{children:[
      (0,e.jsx)('input',{type:'color','aria-label':title,value:draft?.[key]??'#808080',disabled:busy||!draft,onChange:event=>field(key,event.target.value)}),
      (0,e.jsx)(N,{variant:'ghost',size:'sm',disabled:busy||!draft?.[key],onClick:()=>field(key,null),children:'Inherit'})]})]});
  const select = (key,title,description,options) => (0,e.jsxs)(h,{children:[
    (0,e.jsx)(b,{title,description}),
    (0,e.jsx)(p,{children:(0,e.jsxs)(_,{value:draft?.[key]??'default',disabled:busy||!draft,onValueChange:value=>field(key,value==='default'?null:value),children:[
      (0,e.jsx)(E,{className:'w-full',children:(0,e.jsx)(P,{placeholder:'Default'})}),
      (0,e.jsx)(k,{children:options.map(([value,label])=>(0,e.jsx)(y,{value,children:label},value))})]})})]});
  const exportFile = async () => {
    const result = await run('exportThemePreset',{tokens:draft});
    if (!result?.preset) return;
    const url = URL.createObjectURL(new Blob([JSON.stringify(result.preset,null,2)],{type:'application/json'}));
    const link = document.createElement('a'); link.href=url; link.download='aux-theme.json';
    document.body.appendChild(link); link.click(); link.remove(); setTimeout(()=>URL.revokeObjectURL(url),1000);
  };
  const importFile = async event => {
    const chosen = event.target.files?.[0]; event.target.value=''; if (!chosen) return;
    try {
      if (chosen.size>4096) throw Error('Choose an Aux theme file smaller than 4 KiB.');
      const tokens = parseAuxThemeImport(await chosen.text());
      const result = await run('previewTheme',{tokens});
      if (result) { dirty.current=true; setDraft(result.effectiveTokens); draftRef.current=result.effectiveTokens; }
    } catch (failure) { if (alive.current) setError(failure.message); }
  };
  return (0,e.jsxs)(Oe,{className:'sm:max-w-md',showCloseButton:!busy,'aria-describedby':undefined,children:[
    (0,e.jsx)(Ve,{children:(0,e.jsx)(Re,{children:'Theme editor'})}),
    (0,e.jsxs)('div',{className:'flex flex-col gap-4',children:[
      error&&(0,e.jsx)('p',{role:'alert',className:'text-sm text-muted-foreground',children:error}),
      state?.highContrast&&(0,e.jsx)('p',{className:'text-sm text-muted-foreground',children:'Your system contrast settings take priority over custom colors.'}),
      state?.reducedTransparency&&(0,e.jsx)('p',{className:'text-sm text-muted-foreground',children:'Reduce Transparency is enabled. Glass remains opaque.'}),
      select('scheme','Color scheme','Use the same native light and dark modes.',[['default','Current setting'],['system','System'],['light','Light'],['dark','Dark']]),
      color('accent','Accent','The accent used by native browser controls.'),
      color('background','Background','Browser chrome color. Page content keeps its own colors.'),
      color('tint','Backdrop tint','A subtle tint on the existing sidebar material.'),
      draft?.tint&&(0,e.jsxs)(h,{children:[(0,e.jsx)(b,{title:'Tint intensity',description:'Keep the underlying material visible.'}),(0,e.jsx)(p,{children:(0,e.jsx)('input',{type:'range',min:0,max:0.4,step:0.01,value:draft.tintStrength??0.15,'aria-label':'Tint intensity',disabled:busy,onChange:event=>field('tintStrength',Number(event.target.value))})})]}),
      select('material','Material','Adjust existing glass without changing the layout.',[['default','Default'],['clear','Clear'],['soft','Soft'],['opaque','Opaque']]),
      (0,e.jsxs)(h,{children:[(0,e.jsx)(b,{title:'Saved presets',description:'Only stored in this profile.'}),(0,e.jsx)(p,{children:(0,e.jsxs)(_,{value:'choose',disabled:busy||!state?.presets?.length,onValueChange:id=>{const preset=state.presets.find(item=>item.id===id);if(preset)change(preset.tokens)},children:[(0,e.jsx)(E,{className:'w-full',children:(0,e.jsx)(P,{placeholder:'Choose a preset'})}),(0,e.jsxs)(k,{children:[(0,e.jsx)(y,{value:'choose',disabled:true,children:'Choose a preset'}),...(state?.presets??[]).map(item=>(0,e.jsx)(y,{value:item.id,children:item.name},item.id))]})]})})]}),
      (0,e.jsx)('input',{value:name,maxLength:64,'aria-label':'Preset name',placeholder:'Preset name',className:'border-input bg-transparent rounded-md border px-3 py-2 text-sm',disabled:busy,onChange:event=>setName(event.target.value)}),
      (0,e.jsxs)('div',{className:'flex gap-2',children:[
        (0,e.jsx)(N,{variant:'secondary',disabled:busy||!draft||!name.trim(),onClick:()=>run('saveThemePreset',{name:name.trim(),tokens:draft}),children:'Save preset'}),
        (0,e.jsx)(N,{variant:'outline',disabled:busy||!draft,onClick:exportFile,children:'Export'}),
        (0,e.jsx)(N,{variant:'outline',disabled:busy||!draft,onClick:()=>file.current?.click(),children:'Import'}),
        (0,e.jsx)('input',{type:'file',accept:'.json,application/json',hidden:true,ref:file,onChange:importFile})]}),
      ...(state?.presets??[]).map(item=>(0,e.jsxs)('div',{className:'flex items-center justify-between gap-2',children:[(0,e.jsx)('span',{className:'text-sm',children:item.name}),(0,e.jsx)(N,{variant:'ghost',size:'sm',disabled:busy,onClick:()=>run('deleteThemePreset',{id:item.id}),children:'Remove'})]},item.id))]}),
    (0,e.jsxs)(Ae,{children:[
      (0,e.jsx)(N,{variant:'ghost',disabled:busy||!state,onClick:()=>run('resetTheme'),children:'Reset to default'}),
      (0,e.jsx)(N,{variant:'secondary',disabled:busy,onClick:onClose,children:'Cancel'}),
      (0,e.jsx)(N,{disabled:busy||!draft,onClick:()=>run('applyTheme',{tokens:draft},true),children:'Apply'})]})]});
}

function AuxThemeEditorSetting() {
  const [open,setOpen] = A.useState(false);
  const available = typeof globalThis.chrome?.auxBrowserPreferences?.getThemeState === 'function';
  return (0,e.jsxs)(De,{open,onOpenChange:setOpen,children:[
    (0,e.jsxs)(h,{children:[(0,e.jsx)(b,{title:'Theme editor',description:'Preview colors and glass, and save presets for this profile.'}),
      (0,e.jsx)(p,{children:(0,e.jsx)(N,{variant:'outline',disabled:!available,onClick:()=>setOpen(true),children:'Customize'})})]}),
    open&&(0,e.jsx)(AuxThemeEditorDialog,{onClose:()=>setOpen(false)})]});
}

export function transformAuxThemeEditor({relative,text}) {
  if (relative !== THEME_APPEARANCE_ASSET) return {text,anchors:[]};
  const anchors=[];
  const replace=(find,replacement,kind)=>{
    const count=text.split(find).length-1;
    if(count!==1) throw Error(`${kind}: expected one pinned anchor, got ${count}`);
    text=text.replace(find,replacement); anchors.push({kind,find,replace:replacement,count:1});
  };
  replace('export{la as a,',[
    parseAuxThemeImport.toString(),createAuxThemeSession.toString(),
    AuxThemeEditorDialog.toString(),AuxThemeEditorSetting.toString(),
    'export{la as a,',
  ].join('\n'),'aux-theme-editor-declarations');
  replace('(0,e.jsx)(AuxFullUrlSetting,{}),(0,e.jsx)(ha,{})',
    '(0,e.jsx)(AuxFullUrlSetting,{}),(0,e.jsx)(AuxThemeEditorSetting,{}),(0,e.jsx)(ha,{})',
    'aux-theme-editor-appearance-row');
  return {text,anchors};
}
