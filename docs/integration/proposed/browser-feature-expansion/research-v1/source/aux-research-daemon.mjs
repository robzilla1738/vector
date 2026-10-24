import {readFileSync} from 'node:fs';
export const researchRuntimeSource=readFileSync(new URL('./research-runtime.js',import.meta.url),'utf8');
const route='createAndPrompt:accountProcedure.input(createSessionInputSchema.extend({message:custom()})).mutation(async({ctx:Cn,input:ei})=>{let{message:ti,...ni}=ei,ri=null;try{let ei=await createSession$1(Cn.accountId,ni);return ri=ei.id,await GlobalAgentSessionServer.startRun(Cn.accountId,ei.id,Cn=>Cn.prompt(ti)),SessionStore.get(Cn.accountId,ei.id)??ei}catch(ei){throw logger.alert(`[Sessions] createAndPrompt failed`,{accountId:Cn.accountId,sessionId:ri,error:ei}),ei}})';
const replacement='createAndPrompt:accountProcedure.input(createSessionInputSchema.extend({message:custom(),research:object({kind:literal(`web-search`),query:string$3().trim().min(1).max(2000)}).strict().optional()})).mutation(async({ctx:Cn,input:ei})=>{let{message:ti,research:auxResearch,...ni}=ei,ri=null;try{if(auxResearch){const capability=await auxResearchCapability(Cn.accountId,Cn.account,{model:ni.model??settings(Cn.accountId).get(`defaultModel`),browserBinding:ni.browserBinding});if(!capability.available)throw Error(capability.reason)}let ei=await createSession$1(Cn.accountId,ni);return ri=ei.id,await GlobalAgentSessionServer.startRun(Cn.accountId,ei.id,Cn=>auxResearch?auxRunResearchSession(Cn,ti,auxResearch):Cn.prompt(ti)),SessionStore.get(Cn.accountId,ei.id)??ei}catch(ei){throw logger.alert(`[Sessions] createAndPrompt failed`,{accountId:Cn.accountId,sessionId:ri,error:ei}),ei}})';
export function transformAuxResearchDaemon(text){
 const suffix=text.slice(-160);
 if(text.includes('function auxRunResearchSession('))throw Error('Research adapter already applied');
 const changes=[
  {find:'sessionsRouter=router({',replace:'sessionsRouter=router({researchCapability:accountProcedure.input(object({browserBinding:browserBindingSchema,model:object({provider:string$3().min(1).max(256),modelId:string$3().min(1).max(512)}).passthrough()})).query(({ctx,input})=>auxResearchCapability(ctx.accountId,ctx.account,input)),',count:1},
  {find:route,replace:replacement,count:1},
  {find:suffix,replace:suffix+'\n'+researchRuntimeSource+'\n',count:1},
 ];
 for(const change of changes){if(text.split(change.find).length-1!==1)throw Error('Research daemon source anchor drift');text=text.replace(change.find,change.replace)}
 return {text,changes};
}
