import { parse } from '/Users/rcourson/Documents/Vibe/web/node_modules/.pnpm/acorn@8.19.0/node_modules/acorn/dist/acorn.mjs';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const root='/Users/rcourson/Documents/Vibe/web', base=root+'/out/provided-candidate-local-completion-20261025-a38/Aux.app/Contents/Resources/aux/apps/';
const originals=['index.mjs','aux-native-entry.mjs'].map(name=>({name,text:readFileSync(base+'daemon/Aux Daemon.app/Contents/Resources/node-development/'+name,'utf8')}));
const sha=text=>createHash('sha256').update(text).digest('hex');
const current=readFileSync(root+'/out/completion-20261026-paired-source-a7/aux-native-entry.mjs','utf8'),ast=parse(current,{ecmaVersion:'latest',sourceType:'module'}),flat=ast.body.flatMap(node=>node.type==='VariableDeclaration'?node.declarations:[node]);
const named=name=>{const matches=flat.filter(node=>node.id?.name===name);if(matches.length!==1)throw Error('One declaration required: '+name);return matches[0]};
const count=(text,name)=>(text.match(new RegExp('(?<![A-Za-z0-9_$])'+name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?![A-Za-z0-9_$])','g'))??[]).length;
const rules=[],dead=[];
const add=(scope,find,replace)=>{if(current.split(find).length!==2)throw Error('Current identity anchor drift: '+scope);for(const original of originals)if(original.text.split(find).length!==2)throw Error('Original identity anchor drift: '+scope);rules.push({scope,find,replace,count:1})};
for(const name of ['provePwmRecoveryAccess','resetPwmAccount','commitOnePasswordImport']){if(count(current,name)!==1)throw Error('Dead function acquired consumers: '+name);const node=named(name);add('remove consumer-free excluded product function '+name,current.slice(node.start,node.end),'');dead.push({name,expectedIdentifierOccurrences:1})}
const repl=named('init_password_manager'),binding=named('PasswordManagerRepl');
if(count(current,'PasswordManagerRepl')!==2||count(current,'init_password_manager')!==2)throw Error('Excluded Repl acquired new consumers');
add('remove excluded Repl initializer from full Repl initialization','init_onboarding(),init_password_manager(),init_extensions_cloud()','init_onboarding(),init_extensions_cloud()');
add('remove unreferenced PasswordManagerRepl declaration and module',current.slice(binding.start-1,repl.end),'');
dead.push({name:'PasswordManagerRepl',expectedIdentifierOccurrences:2},{name:'init_password_manager',expectedIdentifierOccurrences:2});
const onboarding=named('init_onboarding'),before=current.slice(onboarding.start,onboarding.end);
let after=before;
for(const [find,replace] of [
 ['init_detect_password_managers(),init_password_manager$1(),init_account_registry()','init_detect_password_managers(),init_account_registry()'],
 ['let[Cn,ei,ti,ni]=await Promise.all([analyzeUserApps({limit:SNAPSHOT_TOOL_LIMIT}),passwordManager.getAuthStatus(getProfilePwmAccountId(this.#e)),detectPasswordManagers(),detectAISubscription()])','let[Cn,ti,ni]=await Promise.all([analyzeUserApps({limit:SNAPSHOT_TOOL_LIMIT}),detectPasswordManagers(),detectAISubscription()])'],
 ['passwordManager:{isInitialized:ei.isInitialized,isLocked:ei.isLocked,external:ti}','passwordManager:{external:ti}'],
 ]){if(after.split(find).length!==2)throw Error('Onboarding source changed');after=after.replace(find,()=>replace)}
add('remove excluded Vault setup/auth dependency from onboarding snapshot',before,after);
add('remove built-in Vault setup prompt/gate','Cn.passwordManager.isInitialized?ei.push(`- Aux vault: set up${Cn.passwordManager.isLocked?` (currently locked)`:``}.`):ei.push(`- Aux vault: **not set up yet** — I can\'t sign into sites for you until this exists.`),','');
add('external password-manager snapshot does not promise Vault import','- Also found on this machine: ${ti} — importable.','- External password managers detected: ${ti}. Use their browser extensions; compatibility must be verified.');
add('remove excluded Vault origin from local UI CORS allow','if(Cn===AGENT_MANAGER_EXTENSION_ORIGIN||Cn===PASSWORD_MANAGER_EXTENSION_ORIGIN)return!0','if(Cn===AGENT_MANAGER_EXTENSION_ORIGIN)return!0');
add('remove excluded Vault origin from extension-only procedure allow','new Set([AGENT_MANAGER_EXTENSION_ORIGIN,PASSWORD_MANAGER_EXTENSION_ORIGIN])','new Set([AGENT_MANAGER_EXTENSION_ORIGIN])');
add('retain sensitive password-manager page exclusion with neutral privacy label','label:`Aux Vault`','label:`Protected password-manager page`');
add('neutral shared legacy synchronization diagnostic','Aux Vault was reset on another device. Unlock it with the new password.','Existing password-manager state was reset on another device. Unlock it with the new password.');
add('generic Aux agent for retained legacy breach check','"User-Agent":`Aux Vault`','"User-Agent":`Aux`');
add('new cloud-routine worker session directory identity v2','cwd:`/aside/routines/${ii.id}`','cwd:`/aux/routines/v2/${ii.id}`');
const content=readFileSync(base+'extension/dist/content/content.js','utf8'),policies=[['aside-gmail-compose-','aux-gmail-compose-v2-'],['aside-gdocs-driver','aux-gdocs-driver-v2'],['aside-sheets-paste','aux-sheets-paste-v2']];
for(const text of [...originals.map(row=>row.text),current])for(const[find]of policies)if(text.split(find).length!==2)throw Error('TrustedTypes paired counts changed');
const contentPolicyCounts=policies.map(([find])=>content.split(find).length-1);if(JSON.stringify(contentPolicyCounts)!=='[0,1,0]')throw Error('Content-script policy counts changed');
writeFileSync(new URL('./source-pins.json',import.meta.url),JSON.stringify({format:'aux.final-identity-v2.source-pins.v1',originals:originals.map(({name,text})=>({name,sha256:sha(text)})),currentPairReceipt:root+'/docs/integration/proposed/completion-20261026/integrator/paired-source-a7.json',contentOriginal:{path:'content/content.js',sha256:sha(content)},trustedTypesPolicies:policies,contentPolicyCounts,deadDeclarations:dead,rules,forbiddenVaultExtensionId:'nbpghnminpifekjbgjefioajhiilbfla',originalVaultStrings:13,protectedSharedLegacyFunctions:['assertPwmSyncReady','checkPasswordExposure'],originalRuntimeOrAddonBytesChanged:false},null,2)+'\n');
console.log(JSON.stringify({rules:rules.length,policies:policies.length,closedDeclarations:dead.length}));
