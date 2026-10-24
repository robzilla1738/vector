/** Extend the pinned CLI/daemon/agent bridge; never create a second listener or
 * an unauthenticated OS-launch escape hatch. Compose after Aux wire identity. */
export function applyAuxBrowserRouting({component, text}) {
  const anchors = [];
  if ((component === 'cli' && text.includes('function runAuxBrowserRoute(')) ||
      (['daemon','agent'].includes(component) && text.includes('Aux.routeBrowserLink')))
    throw new Error('Aux browser routing already applied');
  function edit(name, find, replacement) {
    const count = text.split(find).length - 1;
    if (count !== 1) throw new Error(`${name}: expected one supplied anchor, found ${count}`);
    text = text.replace(find, replacement);
    anchors.push({name, kind: 'integration', find, replace: replacement, count: 1});
  }
  if (component === 'cli') {
    edit('Aux browser open and routing commands', '\tconst accountCommand = program.command("account")', `
  program.command("open").description("Open a URL in Aux without starting an AI task")
    .argument("<url>").option("--profile <id-or-name>", "Exact profile id or unambiguous name")
    .option("--space <id-or-name>", "Space within the selected profile")
    .option("--json", "Print structured result").action((url, options) =>
      runAuxBrowserRoute("open", url, {...program.opts(), ...options}));
  const routeCommand = program.command("route").description("Inspect local browser routing");
  routeCommand.command("resolve").argument("<url>")
    .option("--profile <id-or-name>").option("--space <id-or-name>")
    .option("--json").action((url, options) =>
      runAuxBrowserRoute("resolve", url, {...program.opts(), ...options}));
  routeCommand.command("list").option("--profile <id-or-name>").option("--json")
    .action(options => runAuxBrowserRoute("list", undefined, {...program.opts(), ...options}));
\tconst accountCommand = program.command("account")`);
    edit('Aux authenticated browser routing action', 'const actions = {', `${cliAction}\nconst actions = {`);
  } else if (component === 'daemon') {
    const schema = 'object({method:literal(`Aux.routeBrowserLink`),params:object({operation:_enum([`open`,`resolve`,`list`]),url:string$3().max(16384).optional(),profile:string$3().max(256).optional(),space:string$3().max(256).optional()}).strict()})';
    edit('Aux browser routing bridge schema', 'Cn.extensionRequestSchema=discriminatedUnion(`method`,Ri)', `Ri.push(${schema});Cn.extensionRequestSchema=discriminatedUnion(\`method\`,Ri)`);
    edit('Aux account-scoped browser routing RPC', 'cliRouter=router({', `cliRouter=router({browserRoute:accountInstanceProcedure.input(object({operation:_enum([\`open\`,\`resolve\`,\`list\`]),url:string$3().max(16384).optional(),profile:string$3().max(256).optional(),space:string$3().max(256).optional()})).mutation(async({input:input,ctx:ctx})=>{
      let candidates=listCliBrowserProfiles(ctx.accountId), selector=input.profile, chosen;
      if(selector){let exact=candidates.find(p=>p.profileId===selector);let names=candidates.filter(p=>p.label===selector);chosen=exact??(names.length===1?names[0]:void 0);if(!chosen)throw new TRPCError({code:\`BAD_REQUEST\`,message:\`Profile missing or ambiguous; use aux host profiles\`});}
      const binding=await resolveCliBrowserBinding(ctx.accountId,chosen?.profileId);
      assertAccountInstance(AccountRegistry.getAccount(ctx.accountId),ctx.accountCreatedAt);
      const params={operation:input.operation,...input.url===void 0?{}:{url:input.url},...selector?{profile:binding.profileId}:{},...input.space?{space:input.space}:{}};
      return await sendCommandToExtension({method:\`Aux.routeBrowserLink\`,params},{accountId:ctx.accountId,profileId:binding.profileId,browserMode:\`default\`,windowId:binding.windowId,timeoutMs:20000});
    }),`);
  } else if (component === 'agent') {
    edit('Aux browser routing extension schema', 'e.extensionRequestSchema = Me("method", oo)', `oo.push(m({method:E("Aux.routeBrowserLink"),params:m({operation:p().refine(v=>["open","resolve","list"].includes(v)),url:p().max(16384).optional(),profile:p().max(256).optional(),space:p().max(256).optional()}).strict()}));e.extensionRequestSchema = Me("method", oo)`);
    edit('Aux native browser routing dispatch', '    case "Aux.resolveBindingWindow":', `    case "Aux.routeBrowserLink": {
      if (t.aborted) throw new Error("Browser routing cancelled");
      if (!r?.profileId || r.browserMode !== "default") throw new Error("Regular profile binding required");
      if (!chrome.auxBrowserPreferences?.routeBrowserLink) throw new Error("Browser routing unavailable in this build");
      return await chrome.auxBrowserPreferences.routeBrowserLink({...e.params, boundProfileId:r.profileId});
    }
    case "Aux.resolveBindingWindow":`);
  } else return {text, anchors};
  return {text, anchors};
}
const cliAction = String.raw`
async function runAuxBrowserRoute(operation, url, options) {
  if (options.host && options.host !== "local") throw new Error("Browser routing is local-only");
  if (url !== undefined) {
    let parsed; try { parsed = new URL(url); } catch { throw new Error("Invalid URL"); }
    if (!["http:", "https:"].includes(parsed.protocol) || parsed.username || parsed.password || url.length > 16384)
      throw new Error("Use an HTTP(S) URL without embedded credentials");
  }
  const daemon = createDaemonClient();
  const account = await resolveAccount(daemon.trpcClient, options.account);
  const result = await daemon.trpcClient.cli.browserRoute.mutate({accountId:account.accountId,
    operation, ...(url === undefined ? {} : {url}), ...(options.profile ? {profile:options.profile} : {}),
    ...(options.space ? {space:options.space} : {})});
  if (options.json) console.log(JSON.stringify(result, null, 2));
  else if (result.ok) console.log(operation === "open" ? "Opened in Aux" : JSON.stringify(result, null, 2));
  else console.error(result.error || "Browser routing refused");
  if (!result.ok) process.exitCode = 1;
  return result;
}
`;

export const ROUTING_SETTINGS_ASSET = 'assets/general-3dgRbrRk.js';
export function transformAuxRoutingSettings({relative,text}) {
  if (relative !== ROUTING_SETTINGS_ASSET) return {text,anchors:[]};
  const anchors=[];
  for(const [name,find,replace] of [
    ['Aux routing settings row','(0,A.jsx)(Ym,{}),(0,A.jsx)(Km,{})','(0,A.jsx)(Ym,{}),(0,A.jsx)(AuxRoutingSetting,{}),(0,A.jsx)(Km,{})'],
    ['Aux supplied routing editor','export{Gg as component};',`${AuxRoutingSetting.toString()}\n${AuxRoutingDialog.toString()}\nexport{Gg as component};`],
  ]) {
    if(text.split(find).length-1!==1) throw Error(`${name}: supplied anchor drift`);
    text=text.replace(find,replace);anchors.push({name,kind:'integration',find,replace,count:1});
  }
  return {text,anchors};
}
function AuxRoutingSetting() {
  const h=at.createElement,[open,setOpen]=at.useState(false);
  return h(at.Fragment,null,
    h(Bt,null,h(qt,{title:'Link routing',description:'Choose a profile and Space for sites you open from other apps.'}),
      h(pn,null,h(yt,{variant:'secondary',className:'click-depth-effect',onClick:()=>setOpen(true)},'Manage'))),
    open&&h(AuxRoutingDialog,{onClose:()=>setOpen(false)}));
}
function AuxRoutingDialog({onClose}) {
  const h=at.createElement,api=chrome.auxBrowserPreferences;
  const [state,setState]=at.useState(null),[draft,setDraft]=at.useState(null),[selected,setSelected]=at.useState(null);
  const [busy,setBusy]=at.useState(false),[error,setError]=at.useState(''),[url,setUrl]=at.useState(''),[testResult,setTestResult]=at.useState('');
  const alive=at.useRef(true);
  at.useEffect(()=>{alive.current=true;Promise.resolve().then(()=>api.getRoutingState()).then(value=>{
    if(!alive.current)return;if(!value?.ok)throw Error(value?.error||'Routing is unavailable');
    setState(value);setDraft(value.configuration);
  }).catch(e=>{if(alive.current)setError(e.message)});return()=>{alive.current=false}},[]);
  const dirty=state&&draft&&JSON.stringify(state.configuration)!==JSON.stringify(draft);
  const rule=draft?.rules.find(r=>r.id===selected),profiles=state?.profiles??[];
  const profile=profiles.find(p=>p.id===rule?.profileId);
  const update=patch=>setDraft(d=>({...d,rules:d.rules.map(r=>r.id===selected?{...r,...patch}:r)}));
  const select=(value,onChange,items,label)=>h(Dr,{value,disabled:busy,onValueChange:onChange},
    h(Ir,{'aria-label':label,className:'w-full'},h(Is,{placeholder:label})),
    h(Nr,null,items.map(item=>h(Oi,{key:item.id,value:item.id},item.name))));
  const field=(label,value,onChange,type='text')=>h('label',{className:'grid gap-1 text-sm'},label,
    h('input',{type,value,disabled:busy,className:'bg-surface-primary border-border rounded-lg border px-3 py-2',
      onChange:e=>onChange(e.target.value)}));
  const save=async()=>{
    setBusy(true);setError('');try{
      const value=await api.setRoutingRules({revision:state.configuration.revision,configuration:draft});
      if(!value?.ok)throw Error(value?.error||'Could not save link routing');
      if(alive.current){setState(value);setDraft(value.configuration);setTestResult('');}
    }catch(e){if(alive.current)setError(e.message)}finally{if(alive.current)setBusy(false)}
  };
  const testSaved=async()=>{
    setBusy(true);setError('');try{
      const value=await api.testRoutingUrl({url});
      if(!value?.ok)throw Error(value?.error||'Could not resolve this URL');
      const destination=profiles.find(p=>p.id===value.profileId);
      const name=destination?.name??'the selected profile';
      const space=destination?.spaces.find(s=>s.id===value.spaceId)?.name;
      const winner=state.configuration.rules.find(r=>r.id===value.ruleId);
      if(alive.current)setTestResult(value.handled?`Opens in ${name}${space?' · '+space:''}${winner?' · '+winner.host+winner.path:''}${value.spaceStatus==='requires-profile-load'?' · Space checked when profile opens':''}`:'No matching rule; uses the normal browser destination.');
    }catch(e){if(alive.current)setError(e.message)}finally{if(alive.current)setBusy(false)}
  };
  return h(Ec,{open:true,onOpenChange:open=>{if(!open&&!busy)onClose()}},h(yc,{className:'w-130! max-w-[calc(100vw-2rem)]! max-h-[85vh] overflow-auto',showCloseButton:!busy},
    h(go,null,h(vo,null,'Link routing'),h(mo,null,'Rules apply to new external links. Sign-in callbacks and links already navigating stay in their current profile. Higher priority wins, then the more specific path and host.')),
    error&&h('p',{role:'alert',className:'text-sm text-red-500'},error),
    !draft?h('p',{className:'text-muted-foreground text-sm'},error?'Routing is unavailable.':'Loading…'):h(at.Fragment,null,
      h('div',{className:'space-y-2'},draft.rules.map((r,index)=>h('div',{key:r.id,className:'flex items-center gap-2'},
        h(Ds,{checked:r.enabled,disabled:busy,'aria-label':`Enable rule for ${r.host||'new site'}`,onCheckedChange:enabled=>setDraft(d=>({...d,rules:d.rules.map(x=>x.id===r.id?{...x,enabled}:x)}))}),
        h(yt,{variant:selected===r.id?'secondary':'ghost',className:'min-w-0 flex-1 justify-start truncate',onClick:()=>setSelected(r.id)},r.host||'New site'),
        h(yt,{variant:'ghost',disabled:busy||index===0,'aria-label':'Move rule up',onClick:()=>setDraft(d=>{const rules=[...d.rules];[rules[index-1],rules[index]]=[rules[index],rules[index-1]];return{...d,rules}})},'↑'),
        h(yt,{variant:'ghost',disabled:busy,'aria-label':'Remove rule',onClick:()=>{setDraft(d=>({...d,rules:d.rules.filter(x=>x.id!==r.id)}));if(selected===r.id)setSelected(null)}},'Remove')))),
      h(yt,{variant:'secondary',disabled:busy||draft.rules.length>=200||!profiles.length,onClick:()=>{const id=crypto.randomUUID();setDraft(d=>({...d,rules:[...d.rules,{id,enabled:true,host:'',path:'',subdomains:false,priority:0,profileId:profiles[0].id,spaceId:''}]}));setSelected(id)}},'Add rule'),
      rule&&h('div',{className:'grid gap-3 py-3'},
        field('Site',rule.host,host=>update({host:host.trim().toLowerCase()})),
        h('div',{className:'flex items-center justify-between text-sm'},'Include subdomains',h(Ds,{checked:rule.subdomains,disabled:busy,onCheckedChange:subdomains=>update({subdomains})})),
        field('Path (optional)',rule.path,path=>update({path})),
        field('Priority',rule.priority,value=>update({priority:Number(value)}),'number'),
        h('label',{className:'grid gap-1 text-sm'},'Profile',select(rule.profileId,profileId=>update({profileId,spaceId:''}),profile?profiles:[...profiles,{id:rule.profileId,name:'Unavailable profile'}],'Profile')),
        h('label',{className:'grid gap-1 text-sm'},'Space',select(rule.spaceId||'__current__',spaceId=>update({spaceId:spaceId==='__current__'?'':spaceId}),[{id:'__current__',name:'Current Space'},...(profile?.spaces??[]),...rule.spaceId&&!(profile?.spaces??[]).some(s=>s.id===rule.spaceId)?[{id:rule.spaceId,name:'Unavailable Space'}]:[]],'Space'))),
      h('div',{className:'grid gap-2 border-t border-border pt-3'},field('Test saved rules',url,setUrl),
        h(yt,{variant:'secondary',disabled:busy||dirty||!url,onClick:testSaved},'Test URL'),
        dirty&&h('p',{className:'text-muted-foreground text-xs'},'Save your changes before testing.'),
        testResult&&h('p',{role:'status',className:'text-muted-foreground break-words text-sm'},testResult))),
    h(po,null,h(yt,{variant:'secondary',disabled:busy,onClick:onClose},'Close'),h(yt,{disabled:busy||!dirty,onClick:save},busy?'Working…':'Save'))));
}
