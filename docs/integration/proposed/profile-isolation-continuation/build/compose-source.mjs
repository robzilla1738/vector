import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {applyAuxNativeTaskPaths,auxNativeTaskPathInputs} from '../task-paths/transform.mjs';
import {applyAuxBrokerWrites} from '../broker-writes/transform.mjs';

// Source association only. The original cold refusal deliberately stays first.
const hash=value=>createHash('sha256').update(value).digest('hex');
const destination=resolve(process.argv[2]);
mkdirSync(destination,{mode:0o700}); // refuse to reuse an existing output
const original=readFileSync(auxNativeTaskPathInputs.source,'utf8');
const prefix='/* aux-cold-entry-admission-v1 */\nthrow Object.assign(new Error("Aux state identity generation 2 is quarantined; migration admission is not implemented."), {code:"AUX_STATE_IDENTITY_QUARANTINED"});\n';
if(!original.startsWith(prefix))throw Error('Original cold refusal changed');
const tasks=applyAuxNativeTaskPaths(original);
const broker=applyAuxBrokerWrites(tasks.text);
if(!broker.source.startsWith(prefix))throw Error('Transforms changed original cold refusal');
const final=prefix+'\n'+broker.prelude+'\n'+broker.source.slice(prefix.length);
const output=join(destination,'index.mjs');
writeFileSync(output,final,{mode:0o600,flag:'wx'});
const syntax=spawnSync(process.execPath,['--check',output],{encoding:'utf8'});
writeFileSync(join(destination,'syntax.log'),syntax.stdout+syntax.stderr,{flag:'wx'});
const receipt={format:'aux.profile-isolation.composed-source.v1',
  passed:syntax.status===0,sourceSha256:hash(original),taskOutputSha256:hash(tasks.text),
  brokerOutputSha256:hash(broker.source),preludeSha256:hash(broker.prelude),
  composedSha256:hash(final),taskRuleCount:tasks.anchors.length,brokerRules:broker.changes,
  syntaxExitCode:syntax.status,sourcePreserved:hash(readFileSync(auxNativeTaskPathInputs.source))===hash(original),
  coldRefusalPreserved:final.startsWith(prefix),daemonExecuted:false,uiChanged:false,
  acceptedAppChanged:false,protectedStartupReady:false,
  recipeSha256:hash(readFileSync(fileURLToPath(import.meta.url)))};
writeFileSync(join(destination,'results.json'),JSON.stringify(receipt,null,2)+'\n',{flag:'wx'});
if(!receipt.passed||!receipt.sourcePreserved)process.exit(1);
console.log('PASS sequential task/broker composition and syntax; immutable cold refusal retained, no execution');
