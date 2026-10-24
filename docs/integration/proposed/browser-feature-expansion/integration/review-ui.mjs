// Compose only pinned static product resources. Never execute the product code.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {transformAuxBrowserFeatureUi} from '../../../../../vendor/provided/aux-browser-feature-composition.mjs';
const [source,output]=process.argv.slice(2).map(p=>path.resolve(p));
if(!source||!output)throw Error('source and fresh output required');
await fs.mkdir(output);
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const report={format:'aux.browser-features.supplied-ui-composition.v1',source,output,changed:[],checked:0,productExecuted:false,runtimeAccepted:false};
async function walk(relative=''){
 for(const entry of await fs.readdir(path.join(source,relative),{withFileTypes:true})){
  const name=path.join(relative,entry.name),input=path.join(source,name);
  if(entry.isSymbolicLink())throw Error('Unexpected UI source link: '+name);
  if(entry.isDirectory()){await walk(name);continue}
  if(!name.endsWith('.js'))continue;
  const bytes=await fs.readFile(input),text=bytes.toString();report.checked++;
  const result=transformAuxBrowserFeatureUi({relative:name,text});
  let replayed=text;
  for(const edit of result.anchors){if(replayed.split(edit.find).length-1!==edit.count)throw Error('Replay count: '+name);replayed=replayed.split(edit.find).join(edit.replace)}
  if(replayed!==result.text)throw Error('Replay differs: '+name);
  if(replayed===text)continue;
  const target=path.join(output,name);await fs.mkdir(path.dirname(target),{recursive:true});await fs.writeFile(target,replayed);
  const check=spawnSync(process.execPath,['--check',target],{encoding:'utf8'});
  if(check.status!==0)throw Error('Transformed syntax: '+name+'\n'+check.stderr);
  report.changed.push({path:name,beforeSha256:sha(bytes),afterSha256:sha(replayed),anchors:result.anchors});
 }
}
try{await walk();report.passed=true}catch(error){report.passed=false;report.error=String(error);throw error}finally{await fs.writeFile(path.join(output,'composition.json'),JSON.stringify(report,null,2)+'\n')}
console.log(JSON.stringify({passed:report.passed,checked:report.checked,changed:report.changed.length,receipt:path.join(output,'composition.json')}));
