#!/usr/bin/env python3
"""Apply a frozen repair to only the affected existing approved code objects."""
import argparse, hashlib, importlib.util, json, os, plistlib, shutil, subprocess, sys
from pathlib import Path
sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[2]
HERE = ROOT/'docs/integration/proposed/completion-20261026/runtime/authority-review'
# Approved reviews and receipts predate the repository rename; their recorded
# paths are re-rooted here. Every pinned file is still checked by SHA-256.
LEGACY_ROOT = '/Users/rcourson/Documents/Vibe/web'
APP = ROOT/'out/provided-candidate-completion-20261026-a1/Aux.app'
APPROVED = '20572af30ef6613f1fc8bced01edada6d52f4b3f7c1f21dd97fb610ec2b257f2'
MARKER = Path('Contents/Resources/aux/bundle.json')
RES = MARKER.parent
def require(value, message):
    if not value: raise RuntimeError(message)
def sha(path): return hashlib.sha256(Path(path).read_bytes()).hexdigest()
def relocate(value):
    if isinstance(value, str): return str(ROOT)+value[len(LEGACY_ROOT):] if value==LEGACY_ROOT or value.startswith(LEGACY_ROOT+'/') else value
    if isinstance(value, list): return [relocate(item) for item in value]
    if isinstance(value, dict): return {key: relocate(item) for key, item in value.items()}
    return value
def read(path): return relocate(json.loads(Path(path).read_text()))
def pin(item):
    path = Path(item['path'])
    require(path.is_file() and not path.is_symlink() and sha(path)==item['sha256'], 'Changed repair input: '+str(path))
    return path
# The owner-approved D7 amendment replaced the reviewed outer Info.plist; accept
# exactly that replacement, and only for the plist the review pinned.
INFO_PLIST_AMENDMENT = ROOT/'docs/integration/proposed/completion-20261026/runtime/authority-review/info-plist-amendment.json'
def pin_info_plist(item):
    path = Path(item['path'])
    if path.is_file() and sha(path) == item['sha256']: return pin(item)
    amendment = json.loads(INFO_PLIST_AMENDMENT.read_text())
    require(amendment['reviewPinned']['currentSha256'] == item['sha256'] and
            path.is_file() and not path.is_symlink() and sha(path) == amendment['proposedInfoPlist']['sha256'],
            'Changed repair input: '+str(path))
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
# The outer app's Info.plist may change only in the product version and copyright
# (owner decision D7, approved 2026-10-27); identifier, entitlements and signing stay as reviewed.
OUTER_INFO_PLIST = 'Contents/Info.plist'
PRODUCT_IDENTITY_KEYS = {'CFBundleShortVersionString', 'CFBundleVersion', 'NSHumanReadableCopyright'}
SHORTCUT_CAPTURE = 'Contents/Resources/aux/apps/extension/dist/assets/use-shortcut-capture-DGr8Ws5Z.js'
SESSION_ROUTE = 'Contents/Resources/aux/apps/extension/dist/assets/_sessionId-ClN_BWh5.js'
DAEMON_EXECUTABLE = 'Contents/Resources/aux/apps/daemon/Aux Daemon.app/Contents/MacOS/aux-daemon'
# Plain-text script/skill leaves sealed by the daemon or outer signature; never code objects or seals.
RESOURCE_ROOTS = ('Contents/Resources/aux/apps/extension/dist/', 'Contents/Resources/aux/apps/daemon/Aux Daemon.app/Contents/Resources/static/skills/')
def resource_leaf(target):
    # Scripts, skill text and static media (rebranded artwork) inside the existing resource roots.
    return target.startswith(RESOURCE_ROOTS) and target.endswith(('.js', '.md', '.webp', '.webm', '.png', '.avif')) and '/_CodeSignature/' not in target and '..' not in Path(target).parts
# Sealed by the Framework signature, so it may change only together with a Framework reseal.
FRAMEWORK_RESOURCES_PAK = 'Contents/Frameworks/Aux Framework.framework/Versions/155.0.8059.85/Resources/resources.pak'
FRAMEWORK_RESOURCES = 'Contents/Frameworks/Aux Framework.framework/Versions/155.0.8059.85/Resources/'
def framework_pak(target):
    # Every resource and locale pak is sealed by the Framework signature, like resources.pak.
    return target.startswith(FRAMEWORK_RESOURCES) and target.endswith('.pak') and '..' not in Path(target).parts and target.count('/') <= FRAMEWORK_RESOURCES.count('/') + 1
ENUMERATED = required|{FRAMEWORK, TABSEARCH, BACKGROUND, EXTENSION_MANIFEST, SHORTCUT_CAPTURE, SESSION_ROUTE, DAEMON_EXECUTABLE, FRAMEWORK_RESOURCES_PAK, OUTER_INFO_PLIST}
CLI_APP = 'Contents/Resources/aux/apps/cli/Aux CLI.app'
# Legacy supplied-addon path. The selected native route owns installation
# authority, so neither leaf is reachable; removal reseals the CLI object with
# its exact approved command, in the original signing order.
DAEMON_APP = 'Contents/Resources/aux/apps/daemon/Aux Daemon.app'
# The historical Keychain interposer and its loaders: the shipped native peer refuses
# DYLD_INSERT_LIBRARIES, and no code path loads the guard or probes.
LEGACY_NATIVE_GUARD = {'Contents/Resources/aux/native/libaux-native-boundary.dylib',
    *(app+'/Contents/Resources/native/'+leaf for app in (CLI_APP, DAEMON_APP)
      for leaf in ('aux-native.cjs', 'aux-native-guard.node', 'native-load-only-probe.cjs', 'native-load-diagnostic.cjs'))}
REMOVABLE = {CLI_APP+'/Contents/Resources/native/provided-native.node', 'Contents/Resources/aux/native/aux-native-carrier'} | LEGACY_NATIVE_GUARD
removals = plan.get('removals', [])
require(all(item['target'] in REMOVABLE for item in removals) and len({item['target'] for item in removals})==len(removals), 'Only enumerated legacy leaves may be removed')
cli_changes = any(item['target'].startswith(CLI_APP+'/') for item in removals)
actual_targets = {item['target'] for item in replacements}
require(not any(framework_pak(t) for t in actual_targets) or FRAMEWORK in actual_targets, 'Framework resources change only with a Framework reseal')
require(len(actual_targets)==len(replacements) and required <= actual_targets and all(t in ENUMERATED or resource_leaf(t) or framework_pak(t) for t in actual_targets), 'Only enumerated existing leaves may change')
for item in replacements:
    pin(item['input'])
    if item['target'] == OUTER_INFO_PLIST:
        old_plist=plistlib.loads((APP/OUTER_INFO_PLIST).read_bytes());new_plist=plistlib.loads(Path(item['input']['path']).read_bytes())
        changed_keys={key for key in old_plist.keys()|new_plist.keys() if old_plist.get(key)!=new_plist.get(key)}
        require(changed_keys <= PRODUCT_IDENTITY_KEYS, 'Info.plist may change only its product version and copyright')
    if item['target'] == EXTENSION_MANIFEST:
        old_manifest=read(APP/EXTENSION_MANIFEST);new_manifest=read(pin(item['input']))
        old_version=old_manifest.pop('version');new_version=new_manifest.pop('version')
        # Web-accessible entries may only be removed: access narrows, never widens.
        old_access=old_manifest.pop('web_accessible_resources',[]);new_access=new_manifest.pop('web_accessible_resources',[])
        require(all(entry in old_access for entry in new_access), 'Bundled extension may only drop web-accessible entries')
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
selected=[row for row in review['targetsInSigningOrder'] if row['codeObject'].endswith('.framework') or row['codeObject']==CLI_APP or row['codeObject'].endswith('/Aux Daemon.app') or row['codeObject']=='.']
require(len(selected)==4 and selected[0]['executable']==FRAMEWORK and selected[1]['codeObject']==CLI_APP and selected[2]['codeObject'].endswith('/Aux Daemon.app') and selected[3]['codeObject']=='.', 'Only original framework, CLI, daemon, outer targets in original order')
framework,cli,daemon,outer=selected
targets=[framework,cli,daemon,outer] if cli_changes else [framework,daemon,outer]
require(DAEMON_EXECUTABLE not in actual_targets or daemon['executable']==DAEMON_EXECUTABLE, 'Daemon executable must be the original signed daemon target')
if FRAMEWORK not in actual_targets:
    targets.remove(framework)
for item in removals:
    require(rows[item['target']]['type']=='file' and rows[item['target']]['sha256']==item['beforeSha256'], 'Changed removal preimage')
for item in replacements:
    require(rows[item['target']]['sha256']==item['beforeSha256'], 'Changed diagnostic preimage')
for row in targets:
    if row['entitlements']: pin(row['entitlements'])
    if row.get('infoPlist'): pin_info_plist(row['infoPlist'])
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
    for item in removals:
        target=APP/item['target']
        require(not target.is_symlink() and target.is_file() and sha(target)==item['beforeSha256'], 'Regular unchanged removal required')
        target.unlink()
    if FRAMEWORK in actual_targets: sign_verify(framework)
    if cli_changes: sign_verify(cli)
    sign_verify(daemon)
    marker=APP/MARKER;bundle=read(marker);records={row['path']:row for row in bundle['files']}
    for item in removals:
        relative=str(Path(item['target']).relative_to(RES));require(relative in records,'Removed leaf missing from packaged records');del records[relative]
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
    allowed={*(row['executable'] for row in targets),str(MARKER),*(x['target'] for x in replacements),*(x['target'] for x in removals)}
    prefixes=['Contents/_CodeSignature/',str(Path(daemon['codeObject'])/'Contents/_CodeSignature')+'/']
    if cli_changes:
        prefixes.append(CLI_APP+'/Contents/_CodeSignature/')
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
