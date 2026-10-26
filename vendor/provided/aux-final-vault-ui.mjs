import {createHash}from'node:crypto';import{readFileSync}from'node:fs';
const pins=JSON.parse(readFileSync(new URL('../../docs/integration/proposed/completion-20261026/integration/vault-ui/source-pins.json',import.meta.url),'utf8'));
const hash=text=>createHash('sha256').update(text).digest('hex');
export function transformAuxVaultUi({path,text,source}){
 const file=pins.files.find(row=>row.path===path);if(!file)return{text,anchors:[]};
 if(hash(source)!==file.sha256)throw Error('Vault UI original source changed.');
 const anchors=[];
 for(const rule of file.rules){if(text.split(rule.find).length-1!==rule.count)throw Error('Vault UI consumer drift: '+rule.scope);const offset=text.indexOf(rule.find);text=text.slice(0,offset)+rule.replace+text.slice(offset+rule.find.length);anchors.push({kind:'integration',...rule,offsetAtApplication:offset})}
 return{text,anchors};
}
export function auxReadArmoredRecoveryKey(text,normalize){
 const formats=[['BEGIN AUX RECOVERY KEY V2','END AUX RECOVERY KEY V2'],['BEGIN ASIDE RECOVERY KEY','END ASIDE RECOVERY KEY']];
 let found=null;
 for(const[start,end]of formats){
  const starts=(text.match(new RegExp(start,'gi'))??[]).length,ends=(text.match(new RegExp(end,'gi'))??[]).length;
  if(!starts&&!ends)continue;
  if(found!==null||starts!==1||ends!==1)throw Error('Paste exactly one complete recovery key block or its recovery phrase.');
  const match=text.match(new RegExp(start+'([\\s\\S]*?)'+end,'i'));
  if(!match?.[1]?.trim())throw Error('Recovery key block is incomplete. Paste the complete block or its recovery phrase.');
  found=normalize(match[1]);
 }
 if(found===null&&/BEGIN (?:AUX|ASIDE) RECOVERY KEY V\d+/i.test(text))throw Error('Unsupported recovery key file version. Use a supported block or its recovery phrase.');
 return found;
}
const recovery=JSON.parse(readFileSync(new URL('../../docs/integration/proposed/completion-20261026/integration/vault-ui/recovery-pins.json',import.meta.url),'utf8'));
export function transformAuxRecoveryTextV2({path,text,source}){
 if(path!==recovery.path)return{text,anchors:[]};
 if(hash(source)!==recovery.sha256)throw Error('Recovery text source changed.');
 const rules=[{scope:'write explicit Aux v2 plaintext armor headers',find:recovery.headers,replace:'m="BEGIN AUX RECOVERY KEY V2",h="END AUX RECOVERY KEY V2"'},
 {scope:'pair new armor reader with explicit known legacy plaintext reader',find:recovery.reader,replace:auxReadArmoredRecoveryKey.toString()+'\nfunction E(n){return auxReadArmoredRecoveryKey(n,c)}'}];
 const anchors=[];
 for(const rule of rules){if(text.split(rule.find).length-1!==1)throw Error('Recovery text writer/reader drift');const offset=text.indexOf(rule.find);text=text.slice(0,offset)+rule.replace+text.slice(offset+rule.find.length);anchors.push({kind:'integration',...rule,count:1,offsetAtApplication:offset})}
 return{text,anchors};
}
