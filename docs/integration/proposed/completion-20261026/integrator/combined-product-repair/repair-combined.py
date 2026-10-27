#!/usr/bin/env python3
"""Apply a frozen repair to only the affected existing approved code objects."""
import argparse, hashlib, importlib.util, json, os, plistlib, shutil, subprocess, sys
from pathlib import Path
sys.dont_write_bytecode = True
HERE = Path("/Users/rcourson/Documents/Vibe/web/docs/integration/proposed/completion-20261026/runtime/authority-review")
ROOT = Path('/Users/rcourson/Documents/Vibe/web')
APP = ROOT/'out/provided-candidate-completion-20261026-a1/Aux.app'
APPROVED = '20572af30ef6613f1fc8bced01edada6d52f4b3f7c1f21dd97fb610ec2b257f2'
MARKER = Path('Contents/Resources/aux/bundle.json')
RES = MARKER.parent
def require(value, message):
    if not value: raise RuntimeError(message)
def sha(path): return hashlib.sha256(Path(path).read_bytes()).hexdigest()
def read(path): return json.loads(Path(path).read_text())
def pin(item):
    path = Path(item['path'])
    require(path.is_file() and not path.is_symlink() and sha(path)==item['sha256'], 'Changed repair input: '+str(path))
    return path
def write_new(path, value):
    with Path(path).open('x') as stream: json.dump(value, stream, indent=2); stream.write('\n')
parser=argparse.ArgumentParser()
parser.add_argument('--plan', type=Path, required=True)
parser.add_argument('--plan-sha256', required=True)
args=parser.parse_args()
require(sha(args.plan)==args.plan_sha256, 'Exact bounded repair plan required')
plan=read(args.plan)
require(plan['format']=='aux.combined-product.same-scope-repair.v1' and plan['app']==str(APP)
        and plan['approvedReviewSha256']==APPROVED, 'Wrong app or repair scope')
pin(plan['executor']); require(Path(plan['executor']['path'])==Path(__file__).resolve(), 'Wrong executor')
review_path=HERE/'signing-execution-review.json'
require(sha(review_path)==APPROVED, 'Original approved review changed')
review=read(review_path)
approval=read(HERE/'owner-approval-a4.json')
require(approval['reviewSha256']==APPROVED and approval['ownerAnswer']=='Approve this exact local review', 'Exact approval missing')
previous=read(pin(plan['signedReceipt']))
require(previous['passed'] and (previous.get('parentReviewSha256')==APPROVED or previous['approvedReviewSha256']==APPROVED), 'Passed approved signing receipt required')
replacements=plan['replacements']
DAEMON = 'Contents/Resources/aux/apps/daemon/Aux Daemon.app/Contents/Resources/node-development/'
FRAMEWORK = 'Contents/Frameworks/Aux Framework.framework/Versions/155.0.8059.85/Aux Framework'
TABSEARCH = 'Contents/Resources/aux/apps/extension/dist/assets/tabsearch-3k_2hgil.js'
required = {DAEMON+'index.mjs', DAEMON+'aux-native-entry.mjs'}
BACKGROUND = 'Contents/Resources/aux/apps/extension/dist/background.js'
EXTENSION_MANIFEST = 'Contents/Resources/aux/apps/extension/dist/manifest.json'
SHORTCUT_CAPTURE = 'Contents/Resources/aux/apps/extension/dist/assets/use-shortcut-capture-DGr8Ws5Z.js'
SESSION_ROUTE = 'Contents/Resources/aux/apps/extension/dist/assets/_sessionId-ClN_BWh5.js'
DAEMON_EXECUTABLE = 'Contents/Resources/aux/apps/daemon/Aux Daemon.app/Contents/MacOS/aux-daemon'
# Plain-text script/skill leaves sealed by the daemon or outer signature; never code objects or seals.
RESOURCE_ROOTS = ('Contents/Resources/aux/apps/extension/dist/', 'Contents/Resources/aux/apps/daemon/Aux Daemon.app/Contents/Resources/static/skills/')
def resource_leaf(target):
    return target.startswith(RESOURCE_ROOTS) and target.endswith(('.js', '.md')) and '/_CodeSignature/' not in target and '..' not in Path(target).parts
ENUMERATED = required|{FRAMEWORK, TABSEARCH, BACKGROUND, EXTENSION_MANIFEST, SHORTCUT_CAPTURE, SESSION_ROUTE, DAEMON_EXECUTABLE}
actual_targets = {item['target'] for item in replacements}
require(len(actual_targets)==len(replacements) and required <= actual_targets and all(t in ENUMERATED or resource_leaf(t) for t in actual_targets), 'Only enumerated existing leaves may change')
for item in replacements:
    pin(item['input'])
    if item['target'] == EXTENSION_MANIFEST:
        old_manifest=read(APP/EXTENSION_MANIFEST);new_manifest=read(pin(item['input']))
        old_version=old_manifest.pop('version');new_version=new_manifest.pop('version')
        require(old_manifest==new_manifest and tuple(map(int,new_version.split('.'))) > tuple(map(int,old_version.split('.'))), 'Only a strictly newer bundled extension version is allowed')
def require_stopped():
    # Process metadata only, never profile contents or arguments in receipts.
    output=subprocess.check_output(['/bin/ps','-axo','pid=,comm='],text=True)
    running=[]
    for line in output.splitlines():
        parts=line.strip().split(None,1)
        if len(parts)==2 and (parts[1].startswith(str(APP)+'/') or
                             parts[1].startswith(str(APP.relative_to(ROOT))+'/')):
            running.append(int(parts[0]))
    require(not running, 'Candidate still running; refusing repair (PIDs '+str(running)+')')
require_stopped()
for item in plan['sourceEvidence']: pin(item)
helper=pin(review['inventoryHelper'])
spec=importlib.util.spec_from_file_location('ordinary_repair_inventory',helper)
p=importlib.util.module_from_spec(spec);spec.loader.exec_module(p)
before=p.inventory(APP)
require(before==previous['files'] and p.digest(before)==previous['inventorySha256'], 'Signed candidate changed')
rows={row['path']:row for row in before}
targets=[row for row in review['targetsInSigningOrder'] if row['codeObject'].endswith('.framework') or row['codeObject'].endswith('/Aux Daemon.app') or row['codeObject']=='.']
require(len(targets)==3 and targets[0]['executable']==FRAMEWORK and targets[1]['codeObject'].endswith('/Aux Daemon.app') and targets[2]['codeObject']=='.', 'Only original framework, daemon, outer targets in original order')
framework,daemon,outer=targets
require(DAEMON_EXECUTABLE not in actual_targets or daemon['executable']==DAEMON_EXECUTABLE, 'Daemon executable must be the original signed daemon target')
if FRAMEWORK not in actual_targets:
    targets=[daemon,outer]
for item in replacements:
    require(rows[item['target']]['sha256']==item['beforeSha256'], 'Changed diagnostic preimage')
for row in targets:
    if row['entitlements']: pin(row['entitlements'])
    if row.get('infoPlist'): pin(row['infoPlist'])
for item in review['preservedExactLeaves']:
    if not item['path'].endswith(('aux-pdf.node','aux-macos-utilities.node')): pin(item)
pin(review['publicProfileActual'])
work=APP.parent/plan['receiptDirectory']
require(work.parent==APP.parent and not work.exists() and not work.is_symlink(), 'Fresh confined repair directory required')
work.mkdir(mode=0o700)
result={'format':'aux.combined-product.same-scope-repair-result.v1','approvedReviewSha256':APPROVED,
        'app':str(APP),'plan':{'path':str(args.plan.resolve()),'sha256':args.plan_sha256},
        'beforeInventorySha256':p.digest(before),'steps':[],'passed':False,'appExecuted':False,
        'newOSPermissions':False,'provisioning':False,'notarization':False,'release':False,'cloudChanges':False}
def run(command, kind):
    done=subprocess.run(command,capture_output=True)
    result['steps'].append({'kind':kind,'command':command,'exitCode':done.returncode,
                            'stdout':done.stdout.decode(errors='replace')[-4000:],
                            'stderr':done.stderr.decode(errors='replace')[-4000:]})
    require(done.returncode==0,'Repair signing/verification failed: '+kind)
    return done
def sign_verify(row):
    command=['/usr/bin/codesign','--force','--sign',review['identitySha1'],'--options','runtime','--timestamp=none','--identifier',row['identifier']]
    if row['entitlements']: command+=['--entitlements',row['entitlements']['path']]
    command.append(str(APP/row['codeObject']))
    require(command==row['command'],'Changed approved signing command')
    run(command,'sign '+row['identifier'])
    requirement='=anchor apple generic and identifier = "'+row['identifier']+'" and certificate leaf[subject.OU] = "'+review['team']+'"'
    run(['/usr/bin/codesign','--verify','--strict','-R',requirement,str(APP/row['codeObject'])],'verify '+row['identifier'])
    raw=run(['/usr/bin/codesign','--display','--entitlements',':-',str(APP/row['codeObject'])],'entitlements '+row['identifier']).stdout.strip()
    expected=plistlib.loads(pin(row['entitlements']).read_bytes()) if row['entitlements'] else {}
    require((plistlib.loads(raw) if raw else {})==expected,'Actual entitlements changed')
try:
    subprocess.run(['/bin/cp','-cRpP',str(APP),str(work/'before-repair.app')],check=True)
    require(p.inventory(work/'before-repair.app')==before,'Recoverable signed backup differs')
    require(sha(args.plan)==args.plan_sha256 and sha(review_path)==APPROVED,'Frozen repair plan changed')
    pin(plan['executor']); require_stopped()
    require(p.inventory(APP)==before, 'Candidate changed during backup')
    for item in replacements:
        source=pin(item['input']);target=APP/item['target'];temporary=target.with_name(target.name+'.combined-product-repair')
        require(not target.is_symlink() and not temporary.exists() and sha(target)==item['beforeSha256'], 'Regular unchanged resource required')
        shutil.copyfile(source,temporary);temporary.chmod(rows[item['target']]['mode'])
        require(sha(temporary)==item['input']['sha256'], 'Diagnostic resource copy differs')
        os.replace(temporary,target)
    if FRAMEWORK in actual_targets: sign_verify(framework)
    sign_verify(daemon)
    marker=APP/MARKER;bundle=read(marker);records={row['path']:row for row in bundle['files']}
    actual=p.inventory(APP/RES)
    require(set(records)=={row['path'] for row in actual if row['path']!='bundle.json'},'Unexpected packaged resource coverage change')
    for leaf in actual:
        if leaf['path']=='bundle.json': continue
        row=records[leaf['path']];require(row['mode']==leaf['mode'],'Packaged permissions changed')
        if leaf['type']=='file': row.update(sha256=leaf['sha256'],bytes=(APP/RES/leaf['path']).stat().st_size)
        else: require(row['linkTarget']==leaf['target'],'Packaged symlink changed')
    bundle['files']=list(records.values())
    bundle['currentCompletionIntegration'].update(combinedProductRepair=result['plan'],activeManifestSha256=p.digest(bundle['files']),
        wholeAppInventoryReceipt=str(work/'receipt.json'),appExecuted=False,runtimeAccepted=False)
    temporary=marker.with_name(marker.name+'.combined-product-repair')
    write_new(temporary,bundle);temporary.chmod(rows[str(MARKER)]['mode']);os.replace(temporary,marker)
    sign_verify(outer)
    after=p.inventory(APP);old={row['path']:row for row in before};new={row['path']:row for row in after}
    allowed={*(row['executable'] for row in targets),str(MARKER),*(x['target'] for x in replacements)}
    prefixes=['Contents/_CodeSignature/',str(Path(daemon['codeObject'])/'Contents/_CodeSignature')+'/']
    if FRAMEWORK in actual_targets:
        prefixes.append(str(Path(framework['executable']).parent/'_CodeSignature')+'/')
    valid=lambda name:name in allowed or any(name.startswith(prefix) for prefix in prefixes)
    changed=[row for row in after if old.get(row['path'])!=row];removed=sorted(set(old)-set(new))
    require(all(valid(row['path']) for row in changed) and all(valid(name) for name in removed),'Unrelated signed-package bytes changed')
    for item in review['preservedExactLeaves']:
        if not item['path'].endswith(('aux-pdf.node','aux-macos-utilities.node')): pin(item)
    pin(review['publicProfileActual']);pin(plan['executor'])
    for item in plan['sourceEvidence']: pin(item)
    require(sha(args.plan)==args.plan_sha256 and sha(review_path)==APPROVED,'Frozen review/repair changed')
    result.update(passed=True,files=after,inventorySha256=p.digest(after),changedLeaves=changed,removedLeaves=removed,
                  signedObjects=[row['codeObject'] for row in targets],unrelatedCandidateLeavesPreserved=True,
                  retainedSignedAddonsAndMemoryPreserved=True,CUlaunchPolicyPending=False,sourceBuildReceipt=plan['sourceEvidence'][0])
except Exception as error:
    result['error']=str(error)
    raise
finally:
    write_new(work/'receipt.json',result)
print(json.dumps({'passed':True,'receipt':str(work/'receipt.json'),'inventorySha256':result['inventorySha256'],'signedObjects':len(targets)}))
