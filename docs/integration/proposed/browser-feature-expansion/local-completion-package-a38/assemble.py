"""Assemble one inactive candidate from the frozen browser, daemon and JS pair.

No signing, process launch, user-root initialization or credential operation.
"""
from pathlib import Path
import importlib.util
import json
import shutil
import subprocess
import sys
import tempfile

sys.dont_write_bytecode=True
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[4]
FEATURE=HERE.parent
H=FEATURE/'fresh-startup-milestone-a42'
spec=importlib.util.spec_from_file_location('package_helpers',HERE.parents[1]/'standard-profile-isolation/runtime-package-a1/runtime_package.py')
p=importlib.util.module_from_spec(spec);spec.loader.exec_module(p)
BASE=ROOT/'out/provided-candidate-fresh-browser-20261025-a45/Aux.app'
OUT=ROOT/'out/provided-candidate-local-completion-20261025-a38'
RES='Contents/Resources/aux/'
DAEMON=RES+'apps/daemon/Aux Daemon.app/Contents/'
MARKER=RES+'bundle.json'
MEMORY=DAEMON+'Resources/memory-helper/aux-memory'
POLICY=DAEMON+'Resources/AuxFreshBootstrapPolicy.json'
OLD_SIGNATURE=DAEMON+'_CodeSignature/CodeResources'

def main():
    p.require(not OUT.exists(),'Fresh output required')
    predecessor=p.read(H/'actual-bounded-repair-a25.json')
    p.require(predecessor['passed'] and predecessor['inventorySha256']=='25af5a816007facfd05c0b3352c87976816b697308f42c103ff7a00c11ca5f5d', 'Exact A25 predecessor required')
    before=p.inventory(BASE)
    p.require(before==predecessor['files'],'Running A25 package changed')
    browser_ref=FEATURE/'local-completion-integration-a34/actual-full-build.json'
    browser=p.read(browser_ref);p.require(browser['passed'] and browser['unsigned'],'Frozen unsigned browser required')
    native=Path(browser['snapshot'])
    build_path=Path(browser['fullBuildReceipt']);build=p.read(build_path)
    p.require(p.sha(build_path)==browser['fullBuildReceiptSha256'] and build['passed'],'Actual full browser build changed')
    rows=p.read(build_path.parent/'app-inventory.json')
    native_rows=[{key:('link' if key=='type' and value=='symlink' else value) for key,value in row.items() if key!='bytes'} for row in rows]
    p.require(p.inventory(native)==native_rows,'Frozen native browser changed')
    daemon_path=FEATURE/'local-daemon-memory-integration-a37/actual-build.json'
    daemon=p.read(daemon_path);p.require(daemon['passed'] and not daemon['codeSignatureLoadCommandPresent'],'Memory-enabled unsigned daemon required')
    p.require(p.sha(daemon['binary'])==daemon['binarySha256'],'Completed daemon changed')
    source_path=HERE/'actual-source-pair.json';source=p.read(source_path)
    p.require(source['passed'] and not source['productExecuted'] and not source['uiChanged'],'Exact source/entry/shim composition required')
    for row in source['files']+source['provenance']:
        p.require(p.sha(row['path'])==row['sha256'],'Source pairing/provenance changed: '+row['path'])
    old={row['path']:row for row in before}
    temporary=Path(tempfile.mkdtemp(prefix='.aux-completion-a38-',dir=OUT.parent))
    app=temporary/'Aux.app'
    subprocess.run(['/bin/cp','-cRpP',str(native),str(app)],check=True)
    p.require(not (app/RES).exists(),'Raw native app unexpectedly contains supplied resources')
    subprocess.run(['/bin/cp','-cRpP',str(BASE/RES),str(app/RES)],check=True)
    bundle=p.read(app/MARKER)
    records={row['path']:row for row in bundle['files']}
    changes=[]
    def replace(name,input_path,expected):
        target=app/name
        p.require(target.is_file() and not target.is_symlink() and p.sha(input_path)==expected,'Pinned replacement required: '+name)
        previous=p.sha(target);mode=target.stat().st_mode&0o7777
        shutil.copyfile(input_path,target);target.chmod(mode)
        record=records[name.removeprefix(RES)]
        p.require(record['sha256']==previous,'Resource metadata predecessor differs: '+name)
        record.update(sha256=expected,changeKinds=['integration'])
        changes.append(dict(path=name,previousSha256=previous,input=p.ref(input_path)))
    replace(DAEMON+'MacOS/aux-daemon',Path(daemon['binary']),daemon['binarySha256'])
    for row in source['files']:
        name=Path(row['path']).name
        relative=DAEMON+'Resources/'+('native/' if name=='aux-chatgpt.cjs' else 'node-development/')+name
        replace(relative,Path(row['path']),row['sha256'])
    cli=browser['nativeCli'];p.require(p.sha(cli['path'])==cli['sha256'],'Frozen native CLI changed')
    replace(RES+'apps/cli/Aux CLI.app/Contents/MacOS/aux-cli',Path(cli['path']),cli['sha256'])
    # This generated signature belongs to the replaced daemon executable. It
    # must not masquerade as a valid signature in the unsigned successor.
    signature=app/OLD_SIGNATURE
    p.require(signature.is_file() and not signature.is_symlink(),'Expected predecessor daemon signature resource')
    signature.unlink();signature.parent.rmdir();records.pop(OLD_SIGNATURE.removeprefix(RES))
    policy=dict(format='aux.fresh.bootstrap.policy.v9',role='daemon',
        accessGroup='9F2JXY8TCK.dev.aux.local',authoritySelection='aux.fresh.authority.host-availability.v1',
        nativeHostLayout='embedded-daemon',taskLayout='aux.native.task-control-split.v1',
        storageLocation=dict(format='aux.current-os-user-location.v1'))
    (app/POLICY).write_text(json.dumps(policy,indent=2,sort_keys=True)+'\n')
    records[POLICY.removeprefix(RES)].update(sha256=p.sha(app/POLICY),changeKinds=['integration'])
    seed=[row for row in bundle['files'] if row.get('sha256')=='b4c7d12efa87ed88515092527c7d1e7d9b43e605f39f03543e2b0e8e7005b3c0']
    p.require(len(seed)==1,'Exactly one pinned memory runtime seed required')
    seed_path=app/RES/seed[0]['path'];p.require(p.sha(seed_path)==seed[0]['sha256'],'Original memory seed changed')
    (app/MEMORY).parent.mkdir(mode=0o755)
    shutil.copyfile(seed_path,app/MEMORY);(app/MEMORY).chmod(0o700)
    records[MEMORY.removeprefix(RES)]=dict(path=MEMORY.removeprefix(RES),type='file',
        sha256=p.sha(app/MEMORY),mode=0o700,source=seed[0]['path'],changeKinds=['integration'])
    # A signed-image digest cannot be invented before signing. The exact
    # sealed helper launch policy is generated only after approved signing.
    p.require(not (app/(DAEMON+'Resources/AuxMemoryHelperLaunchPolicy.json')).exists(),'No pre-existing helper launch policy may be adopted')
    bundle['files']=list(records.values())
    bundle.update(finalApp=str(OUT/'Aux.app'),nativeStartupMode='ordinary-user-v1',productionReady=False)
    bundle['localCompletionIntegration']=dict(format='aux.local-completion.v1',
        nativeBrowser=p.ref(browser_ref),daemon=p.ref(daemon_path),sourcePair=p.ref(source_path),
        storageLocationFormat='aux.current-os-user-location.v1',legacyProfilesAccepted=False,
        privilegedTasksEnabled=False,memoryHelperPolicyPending=True,runtimeAcceptance=False)
    (app/MARKER).write_text(json.dumps(bundle,indent=2)+'\n')
    after=p.inventory(app);current={row['path']:row for row in after}
    for record in bundle['files']:
        row=current.get(RES+record['path']);kind='link' if record['type']=='symlink' else record['type']
        p.require(row and row['type']==kind and ('mode' not in record or row['mode']==record['mode']), 'Resource kind/mode metadata differs')
        p.require(row.get('sha256')==record.get('sha256') if kind=='file' else row['target']==record.get('linkTarget',record.get('target')),'Resource hash/link metadata differs')
    changed={row['path'] for row in changes}|{MARKER,POLICY,OLD_SIGNATURE,MEMORY}
    # Every supplied UI/style/asset/runtime leaf outside the explicit delta
    # remains exact. Raw native/signature differences are inventoried separately.
    p.require([row for row in before if row['path'].startswith(RES) and row['path'] not in changed]==
              [row for row in after if row['path'].startswith(RES) and row['path'] not in changed], 'Unrelated supplied resources or UI changed')
    result=dict(format='aux.local-completion.unsigned-package.v1',passed=True,
        app=str(OUT/'Aux.app'),files=after,inventorySha256=p.digest(after),replacements=changes,
        policy=policy,policySha256=p.sha(app/POLICY),memoryHelperSourceSha256=p.sha(seed_path),
        memoryHelperPolicyPending=True,uiPreserved=True,legacyProfilesAccepted=False,
        privilegedTasksEnabled=False,testable=False,appExecuted=False,productSigned=False,
        acceptedAppReplaced=False,ownerStateAccessed=False,release=False)
    p.write_new(temporary/'receipt.json',result)
    temporary.rename(OUT)
    p.write_new(HERE/'actual-package.json',dict(passed=True,app=result['app'],
        receipt=p.ref(OUT/'receipt.json'),inventorySha256=result['inventorySha256'],
        leafCount=len(after),uiPreserved=True,memoryHelperPolicyPending=True,
        testable=False,appExecuted=False,signing=False,release=False))
    print(json.dumps({key:result[key] for key in ['passed','app','inventorySha256','uiPreserved','testable','appExecuted']}))

if __name__=='__main__':main()
