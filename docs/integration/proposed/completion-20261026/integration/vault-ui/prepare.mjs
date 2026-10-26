import { parse } from '/Users/rcourson/Documents/Vibe/web/node_modules/.pnpm/acorn@8.19.0/node_modules/acorn/dist/acorn.mjs';
import {readFileSync,writeFileSync}from'node:fs';import{createHash}from'node:crypto';
const base='/Users/rcourson/Documents/Vibe/web/out/provided-candidate-local-completion-20261025-a38/Aux.app/Contents/Resources/aux/apps/extension/dist/assets/';
const files=[];
function load(name){const source=readFileSync(base+name,'utf8'),ast=parse(source,{ecmaVersion:'latest',sourceType:'module'}),flat=ast.body.flatMap(n=>n.type==='VariableDeclaration'?n.declarations:[n]);return{source,ast,flat,name,rules:[]}}
function rule(file,scope,find,replace){if(file.source.split(find).length-1!==1)throw Error('One source anchor required: '+scope);file.rules.push({scope,find,replace,count:1})}
function named(file,name){const rows=file.flat.filter(n=>n.id?.name===name);if(rows.length!==1)throw Error('One declaration required: '+name);return rows[0]}
function nodeRule(file,scope,node,replace){rule(file,scope,file.source.slice(node.start,node.end),replace)}
let f=load('-context-CnivYB_B.js');rule(f,'default only to external password-manager choice','(0,e.useState)("aside")','(0,e.useState)("external")');files.push(f);
f=load('import-password-mvM-KsU6.js');const options=named(f,'y');nodeRule(f,'remove excluded built-in option, preserve original external option',options.init,'['+f.source.slice(options.init.elements[1].start,options.init.elements[1].end)+']');
let tooltip;function walk(node){if(!node||typeof node!=='object')return;if(Array.isArray(node)){node.forEach(walk);return;}if(node.type==='LogicalExpression'&&node.operator==='&&'&&node.left.type==='BinaryExpression'&&node.left.right.value==='aside')tooltip=node;for(const child of Object.values(node))if(child&&typeof child==='object')walk(child)}walk(f.ast);if(!tooltip)throw Error('Excluded option tooltip missing');nodeRule(f,'remove closed built-in option tooltip',tooltip,'null');
const flow=named(f,'Ie').init,declarations=flow.body.body.find(n=>n.type==='VariableDeclaration').declarations;
const get=name=>{const rows=declarations.filter(n=>n.id.type==='Identifier'&&n.id.name===name);if(rows.length!==1)throw Error('Expected existing external-flow owner '+name);return f.source.slice(rows[0].start,rows[0].end)};
const rawName=name=>declarations.find(n=>f.source.slice(n.id.start,n.id.end)===name);
const bindings=['{track:t}','i','g','a','l','{confirm:c}','[h,N]','_','k','m','S','M','f','A','T','K','R','B'].map(name=>name.startsWith('{')||name.startsWith('[')?(()=>{const n=rawName(name);if(!n)throw Error('External binding missing');return f.source.slice(n.start,n.end)})():get(name));
const q=declarations.find(n=>n.id.name==='Q');let externalDialog;function findDialog(n){if(!n||typeof n!=='object')return;if(Array.isArray(n)){n.forEach(findDialog);return;}if(n.type==='CallExpression'&&n.arguments[0]?.name==='fe')externalDialog=n;for(const v of Object.values(n))if(v&&typeof v==='object')findDialog(v)}findDialog(q.init);if(!externalDialog)throw Error('Original external dialog missing');
bindings.push('z=()=>{if(s===void 0){C.error("Could not continue right now.");return}t("onboarding.import-password.external-provider.open"),N(!0)}','Q=s!==void 0&&'+f.source.slice(externalDialog.start,externalDialog.end));
const replacement='({accountId:s,currentProfilePath:u})=>{const '+bindings.join(',')+';return{handleContinue:z,handleSkip:A,isContinueDisabled:s===void 0,isContinuePending:!1,setupDialogs:Q}}';
nodeRule(f,'preserve external connection/skip flow without excluded Vault RPC or setup/import wizards',flow,replacement);
rule(f,'onboarding external extension disclosure','Aux fills credentials directly into websites, ','Use your existing password manager through its browser extension. ');rule(f,'remove unsupported built-in secrecy guarantee','keeping them local and hidden from AI.','Review the extension’s permissions before connecting.');files.push(f);
f=load('password-LjdLcSRV.js');rule(f,'remove excluded settings provider RPC from active page','(0,e.jsx)(Ut,{children:(0,e.jsx)(mr,{connectOpen:s,onConnectOpenChange:a})})','(0,e.jsx)(mr,{connectOpen:s,onConnectOpenChange:a})');
const settings=named(f,'mr').init;let updated=f.source.slice(settings.start,settings.end);for(const[a,b]of[['const{settings:t}=I(),n=()=>a(!0);',''],['(0,e.jsx)(cr,{onConnectPasswordManager:n}),',''],[',t.useBuiltinPasswordManager&&(0,e.jsxs)(Rn,{children:[(0,e.jsx)(Tn,{}),(0,e.jsx)(qn,{}),(0,e.jsx)(Zn,{}),(0,e.jsx)(sr,{})]})','']]){if(updated.split(a).length!==2)throw Error('Settings source changed');updated=updated.replace(a,b)}
nodeRule(f,'render only existing external-manager section, not Vault setup/toggle/security panels',settings,updated);rule(f,'neutral legacy saved-password import notice','even when Aux Vault is locked or disabled. The original vault item will be kept for your other devices.','without enabling a built-in password manager. Existing source items are preserved.');files.push(f);
// External settings must not auto-import excluded Vault credentials on mount.
const settingsFile=files.at(-1),externalFlow=named(settingsFile,'Ft').init,locals=externalFlow.body.body.find(n=>n.type==='VariableDeclaration').declarations;
const dropped=new Set(['d','b']);
const kept=locals.filter(n=>!dropped.has(n.id.name)&&n.id.type!=='ObjectPattern').map(n=>settingsFile.source.slice(n.start,n.end));
// Keep the original profile/account destructuring, excluding only the mutation result.
kept.unshift(settingsFile.source.slice(locals[0].start,locals[0].end));
const returned=externalFlow.body.body.find(n=>n.type==='ReturnStatement').argument;
const finalRender=returned.type==='SequenceExpression'?returned.expressions.at(-1):returned;
let render=settingsFile.source.slice(finalRender.start,finalRender.end);
const legacyNotice='l.isError&&(0,e.jsxs)(R,{children:[(0,e.jsx)(E,{title:"Previous connections could not be imported"}),(0,e.jsx)(j,{variant:"ghost",onClick:b,children:"Retry"})]})';
if(render.split(legacyNotice).length!==2)throw Error('Legacy import notice changed');render=render.replace(legacyNotice,'null');
const legacyProp='hasLegacyPassword:l.data?.some(f=>f.providers.includes(w.provider))??!1,';
if(render.split(legacyProp).length!==2)throw Error('Legacy import property changed');render=render.replace(legacyProp,'');
nodeRule(settingsFile,'keep original external connections without automatic Vault credential migration/probe',externalFlow,'({connectOpen:s,onConnectOpenChange:a})=>{const '+kept.join(',')+';return '+render+'}');
f=load('conversation-D9Q3VEsl.js');
nodeRule(f,'cloud chat wrapper no longer starts excluded Vault polling/automatic seed',named(f,'As'),'function As({children:l}){return(0,t.jsx)(t.Fragment,{children:l})}');
nodeRule(f,'remove excluded cloud Vault lock control',named(f,'_s'),'function _s(){return null}');
nodeRule(f,'known legacy unlock requests fail visibly without collecting or transferring a password',named(f,'Pt'),'function Pt({prompt:s}){return(0,t.jsxs)("p",{className:"text-muted-foreground text-sm",children:[s," The built-in password manager is excluded from Aux. Use your existing browser extension."]})}');
const review=named(f,'Es');nodeRule(f,'retain generic cloud-request review without a Vault probe',review,'function Es(e){return e.suspended?(0,t.jsx)(ce,{to:"/u/$userId/tasks/$sessionId",params:{userId:String(e.accountId),sessionId:e.sessionId},search:{host:`cloud:${e.sessionId}`},children:"Review pending request in cloud chat"}):null}');
nodeRule(f,'remove now-closed Vault polling/unlock/seed/lock implementation',named(f,'De'),'');nodeRule(f,'remove now-closed Vault unlock form',named(f,'Oe'),'');rule(f,'remove unused Vault context declaration','var he=(0,p.createContext)(null);','');files.push(f);
const result={format:'aux.excluded-vault-ui.entry-closure.v1',files:files.map(({name,source,rules})=>({path:'assets/'+name,sha256:createHash('sha256').update(source).digest('hex'),rules})),ciphertextReadOrReinterpreted:false,oldRecordsRenamed:false};
writeFileSync(new URL('./source-pins.json',import.meta.url),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({files:files.length,anchors:files.reduce((sum,f)=>sum+f.rules.length,0)}));
