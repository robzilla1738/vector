"""Emit a verified replacement plan; never assemble/sign/launch an app."""
from pathlib import Path
import argparse,hashlib,json,stat
p=argparse.ArgumentParser()
p.add_argument('--repository',type=Path,required=True)
for role in ['browser','daemon','resources','ui']:
 p.add_argument('--'+role+'-receipt',type=Path,required=True)
p.add_argument('--relocation-receipt',type=Path,required=True)
p.add_argument('--bootstrap-policy',type=Path,required=True)
p.add_argument('--computer-use-policy',type=Path,required=True)
p.add_argument('--output',type=Path,required=True)
a=p.parse_args();repo=a.repository.resolve(strict=True)
accepted=repo/'out/provided-candidate-local-completion-20261025-a38/Aux.app'
final=repo/'out/provided-candidate-completion-20261026-a1/Aux.app'
if final.exists() or final.is_symlink():raise ValueError('Preserve existing output; exact fresh successor must be absent')
sha=lambda data:hashlib.sha256(data).hexdigest()
def regular(path):
 path=Path(path)
 if not stat.S_ISREG(path.lstat().st_mode):raise ValueError('Regular pinned input required: '+str(path))
 return path.read_bytes()
receipts={};pins=[]
for role in ['browser','daemon','resources','ui','relocation']:
 path=getattr(a,role+'_receipt').resolve(strict=True);raw=regular(path);receipts[role]=json.loads(raw);pins.append({'path':str(path),'sha256':sha(raw)})
browser,daemon,resources,ui,relocation=[receipts[k] for k in ['browser','daemon','resources','ui','relocation']]
if browser.get('format')!='aux.completion.browser-build.v1' or browser.get('passed') is not True:raise ValueError('Actual successful browser receipt required')
if daemon.get('format')!='aux.completion.daemon-build.v1' or daemon.get('passed') is not True:raise ValueError('Actual successful coherent daemon receipt required')
if resources.get('format')!='aux.final-composed-resources.v2':raise ValueError('Complete paired+background resource receipt v2 required; earlier incomplete composition is rejected')
if ui.get('format')!='aux.completion.ui-source.v1' or ui.get('passed') is not True:raise ValueError('Actual composed UI receipt required')
if relocation.get('proposedApp')!=str(final) or relocation.get('format')!='aux.successor.runtime-relocation.v1':raise ValueError('Exact native/resource relocation successor required')
actions=[{'operation':'clone-tree-preserving-links','source':browser['app'],'destination':str(final),'condition':'fresh destination; preserve all browser resource packs and nested framework layout'}, {'operation':'clone-tree-preserving-links','source':str(accepted/'Contents/Resources/aux'),'destination':str(final/'Contents/Resources/aux'),'condition':'copied static package only; no state, profile or credentials'}]
def replace(source,relative,expected,role):
 source=Path(source).resolve(strict=True);raw=regular(source)
 if sha(raw)!=expected:raise ValueError('Artifact pin changed: '+str(source))
 target=Path(relative)
 if target.is_absolute() or '..' in target.parts:raise ValueError('Relative confined destination required')
 actions.append({'operation':'replace-regular-file','source':str(source),'destination':str(final/target),'relative':str(target),'sha256':expected,'bytes':len(raw),'role':role})
for row in browser['artifacts']:
 if sha(regular(row['path']))!=row['sha256']:raise ValueError('Frozen browser artifact changed')
cli=browser['nativeCli'];replace(cli['path'],'Contents/Resources/aux/apps/cli/Aux CLI.app/Contents/MacOS/aux-cli',cli['sha256'],'native CLI')
replace(daemon['binary'],'Contents/Resources/aux/apps/daemon/Aux Daemon.app/Contents/MacOS/aux-daemon',daemon['binarySha256'],'coherent final daemon')
resource_dest={'index.mjs':'Contents/Resources/aux/apps/daemon/Aux Daemon.app/Contents/Resources/node-development/index.mjs','aux-native-entry.mjs':'Contents/Resources/aux/apps/daemon/Aux Daemon.app/Contents/Resources/node-development/aux-native-entry.mjs','background.js':'Contents/Resources/aux/apps/extension/dist/background.js'}
if {row['name'] for row in resources['files']}!=set(resource_dest):raise ValueError('Both daemon leaves and Agent background required')
for row in resources['files']:replace(row['outputPath'],resource_dest[row['name']],row['outputSha256'],'final complete resources')
for row in ui['files']:replace(row['output'],row['path'],row['outputSha256'],'paired supplied UI')
for row in relocation['replacements']:
 original=Path(row['input'])
 if str(original)==relocation['recipeJoin']['oldInclude']:continue # Compiled source only, never packaged as a runtime substitute.
 try:target=str(original.relative_to(accepted))
 except ValueError:raise ValueError('Unsupported relocation input outside accepted static app')
 if not (target.startswith('Contents/Resources/aux/agent-runtime/') or target.startswith('Contents/Resources/aux/apps/daemon/Aux Daemon.app/Contents/Resources/native/')):raise ValueError('Unsupported relocation destination')
 replace(row['output'],target,row['outputSha256'],'paired runtime relocation')
policy=json.loads(regular(a.bootstrap_policy))
if policy.get('format')!='aux.fresh.bootstrap.policy.v10':raise ValueError('Explicit fixed-image v10 policy required; no v9 migration')
for source,name in [(a.bootstrap_policy,'AuxFreshBootstrapPolicy.json'),(a.computer_use_policy,'AuxComputerUseHelperLaunchPolicy.json')]:
 replace(source,'Contents/Resources/aux/apps/daemon/Aux Daemon.app/Contents/Resources/'+name,sha(regular(source)),'fixed role launch resource; not signing/activation proof')
if json.loads(regular(a.computer_use_policy)).get('format')!='aux.computer-use.fixed-helper-launch.v1':raise ValueError('Exact fixed CU policy required')
result={'format':'aux.completion.successor-assembly-plan.v1','acceptedApp':str(accepted),'proposedApp':str(final),'freshNamespace':'Aux Browser Completion 20261026','receiptPins':pins,'orderedActions':actions,'metadataUpdates':['bundle.json finalApp and only active delivered file rows/hash/size; preserve historical source manifests and lineage','append final source/native/UI/runtime receipt hashes and policies; fullIdentityComplete/runtimeAccepted/productionReady false','fresh successor complete package inventory/provenance after all declared replacements; do not reuse A38 signatures or historical digest as current verification'],'explicitPostAssemblyGates':['one changed-file and native/resource cohort verification against this plan','current nested executable/library signature requirements and entitlements are separately reviewed, not inherited from A38','no signing, OS grants or launch authorized by this plan','never copy A38 support/cache/profile/key/provider state; fresh namespace only','verify current startup/browser policy and daemon both use matching v10 policy and fixed addon bytes','actual J1-J4 remain pending until successor observed'],'assembled':False,'signed':False,'executed':False,'runtimeAccepted':False}
with a.output.open('x') as stream:json.dump(result,stream,indent=2);stream.write('\n')
print(json.dumps({'plan':str(a.output.resolve()),'actions':len(actions),'assembled':False}))
