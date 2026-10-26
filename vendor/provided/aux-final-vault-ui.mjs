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
 const lines=text.split(/\r?\n/),headers=[];
 for(let index=0;index<lines.length;index++){
  const line=lines[index].trim().replace(/^-+\s*/,'').replace(/\s*-+$/,'').trim().toUpperCase();
  let known=false;
  for(let format=0;format<formats.length;format++)for(let kind=0;kind<2;kind++)if(line===formats[format][kind]){headers.push({index,format,kind});known=true}
  if(!known&&/^(?:BEGIN|END)\s+(?:AUX|ASIDE)\s+RECOVERY\s+KEY/.test(line))throw Error('Unsupported recovery key file version. Use a supported block or its recovery phrase.');
 }
 if(!headers.length)return null;
 if(headers.length!==2||headers[0].kind!==0||headers[1].kind!==1||headers[0].format!==headers[1].format||headers[0].index>=headers[1].index)
  throw Error('Paste exactly one complete recovery key block or its recovery phrase.');
 const body=lines.slice(headers[0].index+1,headers[1].index).join('\n');
 if(!body.trim())throw Error('Recovery key block is incomplete. Paste the complete block or its recovery phrase.');
 return normalize(body);
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
