import{readFileSync}from'node:fs';import{createHash}from'node:crypto';
export const runtime=readFileSync(new URL('./source/runtime.js',import.meta.url),'utf8');const sha=s=>createHash('sha256').update(s).digest('hex');
export function applyAuxFiniteWriters(source){const inputSha256=sha(source);if(inputSha256!=='5f99818131f693c82d572a8316755d79f7185c9929a362a8ede9bb58783fe4ce')throw Error('Unreviewed finite writer input');const changes=[];const replace=(name,a,b)=>{const count=source.split(a).length-1;if(count!==1)throw Error(name+': '+count);source=source.replace(a,b);changes.push({name,count})};
replace('finite helpers','// Inactive pinned daemon-only broker.',runtime+'\n// Inactive pinned daemon-only broker.');
replace('routine update unsubscribe','started$1=!0,EventBus.on(`session:updated`,','started$1=!0,auxManagedEvent(EventBus,`session:updated`,');
replace('routine delete unsubscribe','}),EventBus.on(`session:deleted`,async({data:{accountId:Cn,sessionId:ei}})=>','}),auxManagedEvent(EventBus,`session:deleted`,async({data:{accountId:Cn,sessionId:ei}})=>');
replace('model chain custody','listeners:/* @__PURE__ */ new Set},ei=this.#r(Cn).then(async ei=>','listeners:/* @__PURE__ */ new Set},ei=auxControlledModel(Cn.controller,()=>this.#r(Cn).then(async ei=>');
replace('model chain cleanup boundary','this.#t?.state===Cn&&(this.#t=void 0)});this.#t={state:Cn,promise:ei}','this.#t?.state===Cn&&(this.#t=void 0)}));this.#t={state:Cn,promise:ei}');
replace('startup orphan retry tracked','await ii(),setTimeout(()=>void ii(),ORPHAN_TAB_CLOSE_RETRY_MS)','await ii(),auxManagedTimeout(()=>ii(),ORPHAN_TAB_CLOSE_RETRY_MS)');
replace('routine migration lifetime','async function migrateRoutineV2Sessions(Cn){','async function migrateRoutineV2Sessions(Cn){return auxBrokerBoundary().awaited(()=>auxMigrateRoutineV2Sessions(Cn))}async function auxMigrateRoutineV2Sessions(Cn){');
return{source,inputSha256,outputSha256:sha(source),changes}}
