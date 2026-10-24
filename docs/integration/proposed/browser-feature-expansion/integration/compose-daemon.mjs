// Adapt the exact current source pair; this does not execute either entry.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {transformAuxBrowserFeatureDaemon} from '../../../../../vendor/provided/aux-browser-feature-composition.mjs';
import {providedStageInputs} from '../../../../../scripts/lib/provided-stage-inputs.mjs';
const root=process.cwd(), base=path.join(root,'docs/integration/proposed/profile-isolation-protected-startup/integration/source-pair.json');
const pair=JSON.parse(await fs.readFile(base)),output=path.resolve(process.argv[2]);
await fs.mkdir(output);
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const report={format:'aux.browser-features.daemon-source-composition.v1',predecessorSourcePair:base,predecessorSourcePairSha256:sha(await fs.readFile(base)),passed:false,files:[],coldFeatureEnabled:false,runtimeAuthorityGranted:false,productExecuted:false};
report.adapterInputs=await Promise.all(providedStageInputs.map(async name=>({path:name,sha256:sha(await fs.readFile(path.join(root,name)))})));
try{
 for(const name of ['source','entry']){
  const bytes=await fs.readFile(pair[name]);if(sha(bytes)!==pair[name+'Sha256'])throw Error('Source pair changed: '+name);
  const text=bytes.toString(),result=transformAuxBrowserFeatureDaemon({component:'daemon',text});
  let replay=text;for(const edit of result.anchors){if(replay.split(edit.find).length-1!==edit.count)throw Error('Count drift: '+edit.name);replay=replay.split(edit.find).join(edit.replace)}
  if(replay!==result.text)throw Error('Unreported daemon mutation');
  const target=path.join(output,name==='source'?'index.mjs':'aux-native-entry.mjs');await fs.writeFile(target,replay,{mode:0o600});
  const syntax=spawnSync(process.execPath,['--check',target],{encoding:'utf8'});if(syntax.status)throw Error('Syntax: '+syntax.stderr);
  report.files.push({kind:name,input:pair[name],beforeSha256:sha(bytes),output:target,afterSha256:sha(replay),anchors:result.anchors});
 }
 for(const input of report.adapterInputs)if(sha(await fs.readFile(path.join(root,input.path)))!==input.sha256)throw Error('Adapter changed during composition: '+input.path);
 report.passed=true;
}catch(error){report.error=String(error);throw error}finally{await fs.writeFile(path.join(output,'composition.json'),JSON.stringify(report,null,2)+'\n')}
console.log(JSON.stringify({passed:report.passed,files:report.files.length,receipt:path.join(output,'composition.json')}));
