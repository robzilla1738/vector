/** Associate a checked composed source with the existing native-entry projection.
 * Produces isolated dormant bytes only; does not modify an app or authorize IO.
 */
import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {projectFinalLocalNativeEntry} from '../../aux-final-local-entry-package/source/project.mjs';
import {AUX_COLD_ENTRY_REFUSAL} from '../../../../../vendor/provided/aux-cold-entry-admission.mjs';

const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const root=fileURLToPath(new URL('../../../../../',import.meta.url));
const [sourcePath, sourceReceiptPath, outputPath]=process.argv.slice(2);
if(!sourcePath||!sourceReceiptPath||!outputPath)throw Error('Source, successful composition receipt and fresh output required');
const source=readFileSync(resolve(sourcePath));
const receipt=JSON.parse(readFileSync(resolve(sourceReceiptPath),'utf8'));
if(receipt.passed!==true||receipt.coldRefusalPreserved!==true||receipt.composedSha256!==sha(source))throw Error('Exact checked refused source required');
if(!source.toString().startsWith(AUX_COLD_ENTRY_REFUSAL))throw Error('Ordinary cold refusal changed');
const pinPath=join(root,'docs/integration/proposed/aux-final-local-entry-package/inputs.json');
const historical=JSON.parse(readFileSync(pinPath));
const original=readFileSync(join(root,historical.originalDaemon));
if(sha(original)!==historical.originalDaemonSha256)throw Error('Original source binary changed');
const projected=projectFinalLocalNativeEntry(original,source,{
 inputIndexSha256:sha(source),inputIndexBytes:source.length,
 originalDaemonSha256:historical.originalDaemonSha256,
});
const loader=readFileSync(join(root,historical.loader.path));
if(sha(loader)!==historical.loader.sha256)throw Error('Paired native loader changed');
const output=resolve(outputPath);mkdirSync(output,{mode:0o700});
const entry=join(output,'aux-native-entry.mjs');writeFileSync(entry,projected,{flag:'wx',mode:0o600});
writeFileSync(join(output,'aux-owned-native.cjs'),loader,{flag:'wx',mode:0o600});
const check=spawnSync(process.execPath,['--check',entry],{encoding:'utf8'});
writeFileSync(join(output,'syntax.log'),check.stdout+check.stderr,{flag:'wx'});
const result={format:'aux.profile-isolation.dormant-entry.v1',passed:check.status===0,
 sourceSha256:sha(source),sourceReceiptSha256:sha(readFileSync(resolve(sourceReceiptPath))),
 entrySha256:sha(projected),loaderSha256:sha(loader),entryBytes:projected.length,
 historicalProjectionPinsSha256:sha(readFileSync(pinPath)),syntaxExitCode:check.status,
 ordinarySourceUnchanged:sha(readFileSync(resolve(sourcePath)))===sha(source),
 defaultEntryRefusalPreserved:true,dormant:true,executed:false,appChanged:false,
 runtimeAuthorityGranted:false,packaged:false};
writeFileSync(join(output,'results.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'});
if(!result.passed||!result.ordinarySourceUnchanged)process.exit(1);
console.log('PASS exact dormant native-entry projection and syntax; ordinary refusal retained, no execution');
