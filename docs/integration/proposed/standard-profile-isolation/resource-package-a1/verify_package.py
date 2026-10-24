#!/usr/bin/env python3
"""Read-only exact successor association check; reuse completed copy/inventory proof."""
import hashlib
import json
from pathlib import Path

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[4]
BASE=ROOT/'out/provided-candidate-standard-profile-finish-20261024'
OUT=ROOT/'out/provided-candidate-standard-profile-resources-20261024'
RES='Contents/Resources/aux/'
DAEMON='apps/daemon/Aux Daemon.app/Contents/'
SOURCE=DAEMON+'Resources/node-development/index.mjs'
ENTRY=DAEMON+'Resources/node-development/aux-native-entry.mjs'
SKILL=DAEMON+'Resources/static/skills/builtin/chrome/SKILL.md'
ADDON=DAEMON+'Resources/native/provided-native.node'
UI=['apps/extension/dist/'+name for name in ['assets/-types-Wy38XkNB.js','assets/queries-ldd77hNk.js',
    'background.js','content/content.js','manifest.json']]
FLAGS=['testable','runtimeAuthorityGranted','appExecuted','productSigned','acceptedAppReplaced']


def read(path):return json.loads(Path(path).read_text())
def sha(path):return hashlib.sha256(Path(path).read_bytes()).hexdigest()
def digest(value):return hashlib.sha256(json.dumps(value,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def require(value,message):
    if not value:raise ValueError(message)


review_path=HERE/'review.json'
review=read(review_path)
result=read(OUT/'receipt.json')
actual=read(HERE/'actual-package.json')
require(sha(BASE/'receipt.json')==review['baselineReceipt']['sha256']==
    '098761236ab2507fccc0151d49f95b2f4646f69b4e26f1199badcae902853a6f','Exact actual predecessor required')
before=read(BASE/'receipt.json')
require(actual['passed'] is True and result['passed'] is True
    and actual['receipt']['sha256']==sha(OUT/'receipt.json')
    and result['reviewSha256']==sha(review_path),'Actual complete candidate/review association differs')
require(all(result[key] is False and actual[key] is False for key in FLAGS),'Unexpected activation/acceptance claim')
require(digest(result['files'])==result['inventorySha256']==actual['inventorySha256'],'Final inventory digest differs')
require(len(review['replacements'])==8 and {item['path'] for item in review['replacements']}==set(UI+[SOURCE,ENTRY,SKILL]),
    'Exact eight replacement destinations required')
require(review['removal']['path']==ADDON and result['exactResourceReplacements']==8
    and result['exactObsoleteAddonRemovals']==1,'Only the obsolete daemon addon may be removed')
old={item['path']:item for item in before['files']}
new={item['path']:item for item in result['files']}
require(len(new)==len(result['files'])==len(old)-1 and set(old)-set(new)=={RES+ADDON}
    and not set(new)-set(old),'Actual candidate coverage differs')
changes={name for name in set(old)&set(new) if old[name]!=new[name]}
require(changes=={RES+name for name in UI+[SOURCE,ENTRY,SKILL]}|{RES+'bundle.json'},'Unreviewed delivered delta')
for item in review['replacements']:
    name=RES+item['path']
    require(old[name]['type']==new[name]['type']=='file'
        and old[name]['mode']==new[name]['mode']==item['mode']
        and old[name]['sha256']==item['previousSha256'],'Replacement mode/predecessor differs')
    actual_file=OUT/'Aux.app'/name
    require(not actual_file.is_symlink() and actual_file.is_file()
        and actual_file.stat().st_mode&0o777==item['mode']
        and sha(actual_file)==new[name]['sha256']==item['input']['sha256'],'Actual changed resource differs')
require(not (OUT/'Aux.app'/RES/ADDON).exists(),'Obsolete daemon addon still exists')
pair_path=HERE/'source-pair.json'
pair=read(pair_path)
old_pair_path=HERE.parent/'package-v11/source-pair-final.json'
old_pair=read(old_pair_path)
old_bundle=read(BASE/'Aux.app'/RES/'bundle.json')
bundle_path=OUT/'Aux.app'/RES/'bundle.json'
bundle=read(bundle_path)
require(sha(old_pair_path)==old_bundle['successorIntegration']['sourcePairSha256'],
    'Original native/source association does not match the delivered predecessor')
require(pair['passed'] is True and pair['coldFeatureEnabled'] is False
    and pair['runtimeAuthorityGranted'] is False and pair['productExecuted'] is False
    and pair['nativeAbiChanged'] is False and pair['nativeHostApiChanged'] is False
    and pair['pairedModuleAbiChanged'] is False and pair['nativePairingPending'] is False,
    'Exact inactive unchanged-ABI source pair required')
require(sha(pair_path)==review['sourcePair']['sha256']==result['sourcePairSha256']
    and pair['predecessorSourcePairSha256']==sha(old_pair_path),'Current source pair association differs')
for role,relative in [('source',SOURCE),('entry',ENTRY),('daemon',DAEMON+'MacOS/aux-daemon'),
                      ('loader',DAEMON+'Resources/native/aux-owned-native.cjs'),
                      ('pty',DAEMON+'Resources/native/node-pty/prebuilds/darwin-arm64/pty.node')]:
    require(sha(OUT/'Aux.app'/RES/relative)==pair[role+'Sha256'],'Actual paired leaf differs: '+role)
    if role not in ['source','entry']:
        require(pair[role+'Sha256']==old_pair[role+'Sha256'],'Existing native boundary changed: '+role)
for name,item in new.items():
    if name.startswith(RES+'apps/cli/') and item['type']=='file':
        require(sha(OUT/'Aux.app'/name)==item['sha256']==old[name]['sha256'],'Actual CLI resource differs')
require(sha(bundle_path)==new[RES+'bundle.json']['sha256']
    and bundle['finalApp']==str(OUT/'Aux.app') and bundle['productionReady'] is False,'Actual marker differs')
require(bundle['nativeEntryProjection']['sourceSha256']==pair['sourceSha256']
    and bundle['nativeEntryProjection']['entryReceiptSha256']==pair['entryReceiptSha256']
    and bundle['successorIntegration']['sourcePairSha256']==sha(pair_path),'Current marker/source association differs')
require(bundle['resourceSuccessorIntegration']['review']['sha256']==sha(review_path)
    and all(bundle['resourceSuccessorIntegration'][key] is False for key in FLAGS),'Resource association changes authority')
projection=read(review['projection']['path'])
require(projection['sourceSha256']==pair['sourceSha256'] and projection['entrySha256']==pair['entrySha256']
    and projection['totalAnchorCountPerLeaf']==199,'Independent 199-anchor source projection differs')
report=dict(format='aux.resource-package.verification.actual.v1',passed=True,
    packageReceiptSha256=sha(OUT/'receipt.json'),reviewSha256=sha(review_path),sourcePairSha256=sha(pair_path),
    exactReplacements=8,exactRemovals=1,completePriorCopyAndInventoryProofReused=True,
    actualChangedLeavesAndNativePairAndCliRechecked=True,unrelatedNativeAndUiInventoryEntriesUnchanged=True,
    leaves=len(new),**{key:False for key in FLAGS})
with (HERE/'actual-verification-a1.json').open('x') as stream:stream.write(json.dumps(report,indent=2)+'\n')
print(json.dumps({'passed':True,'leaves':len(new),'exactReplacements':8,'exactRemovals':1,'appExecuted':False}))
