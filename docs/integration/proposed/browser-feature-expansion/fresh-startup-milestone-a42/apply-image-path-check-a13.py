"""Apply one documented repair within the owner's fixed signing authorization."""
import importlib.util
import json
from pathlib import Path
import shutil
import subprocess
import sys

sys.dont_write_bytecode = True
HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[4]
spec = importlib.util.spec_from_file_location('package_helpers', HERE.parents[1] / 'standard-profile-isolation/runtime-package-a1/runtime_package.py')
p = importlib.util.module_from_spec(spec)
spec.loader.exec_module(p)
APP = ROOT / 'out/provided-candidate-fresh-browser-20261025-a45/Aux.app'
SNAPSHOT = ROOT / 'out/provided-candidate-fresh-browser-20261025-a45-before-image-a13'
RES = 'Contents/Resources/aux/'
DAEMON = RES + 'apps/daemon/Aux Daemon.app'
BINARY = DAEMON + '/Contents/MacOS/aux-daemon'
POLICY = DAEMON + '/Contents/Resources/AuxFreshBootstrapPolicy.json'
MARKER = RES + 'bundle.json'


def main():
    owner_path = HERE / 'owner-signing-approval-a5.json'
    owner = p.read(owner_path)
    p.require(owner['ownerReply'] == 'Approve fix and bounded repair signing' and
        owner['app'] == str(APP) and owner['scope'] == '/private/tmp/aux-fresh-browser-c5mop317', 'Exact bounded owner authorization required')
    p.require(APP.resolve(strict=True) == APP and p.sha(APP / POLICY) == owner['fixedPolicySha256'], 'Candidate or policy scope changed')
    commands = subprocess.run(['/bin/ps','-axo','pid=,comm='],capture_output=True,text=True,check=True).stdout
    p.require(not any(str(APP) + '/' in line for line in commands.splitlines()), 'Candidate must be stopped before repair')
    before_path = HERE / 'actual-bounded-repair-a12b.json'
    before = p.read(before_path)
    build_path = HERE / 'actual-daemon-image-path-check-build-a13.json'
    build = p.read(build_path)
    p.require(before['passed'] and build['passed'] and not build['codeSignatureLoadCommandPresent'], 'Verified predecessor and full unsigned daemon build required')
    for name,digest in build['inputFiles'].items():
        p.require(p.sha(name) == digest, 'Compiled source/object changed: ' + name)
    binary = Path(build['binary'])
    p.require(p.sha(binary) == build['binarySha256'], 'Compiled daemon changed')
    p.require(not SNAPSHOT.exists(), 'Fresh immutable preimage required')
    SNAPSHOT.mkdir()
    subprocess.run(['/bin/cp','-cRpP',str(APP),str(SNAPSHOT / 'Aux.app')],check=True)
    snapshot_inventory = p.inventory(SNAPSHOT / 'Aux.app')
    p.require(snapshot_inventory == before['files'], 'Pre-repair candidate changed')
    p.write_new(SNAPSHOT / 'receipt.json',dict(passed=True,
        inventorySha256=p.digest(snapshot_inventory),exactPriorInventory=p.ref(before_path),
        snapshotOnlyNotLaunchTarget=True,scopeDataCopied=False))
    shutil.copyfile(binary,APP / BINARY)
    bundle = p.read(APP / MARKER)
    records = {row['path']:row for row in bundle['files']}
    records[BINARY.removeprefix(RES)]['sha256'] = p.sha(APP / BINARY)
    bundle['nativeImagePathCheckRepair'] = dict(
        projection=p.ref(HERE / 'actual-image-path-check-projection-a13.json'),
        build=p.ref(build_path),
        ownerAuthorization=p.ref(owner_path),runtimeAcceptance=False)
    (APP / MARKER).write_text(json.dumps(bundle,indent=2) + '\n')
    unsigned = p.inventory(APP)
    changed = {BINARY,MARKER}
    p.require([row for row in before['files'] if row['path'] not in changed] ==
        [row for row in unsigned if row['path'] not in changed], 'Unrelated browser/UI/policy resource changed')
    original_review = p.read(HERE / 'signing-review-a5.json')
    targets = [dict(row,sha256=p.sha(APP / row['executable'])) for row in original_review['targetsInSigningOrder']]
    p.require([row['codeObject'] for row in targets] == [DAEMON,'.'], 'Only two required signing targets allowed')
    p.require(all(row['codeObject'] in owner['boundedRepairAuthorization']['conditionalObjects'] for row in targets), 'Target exceeds owner authorization')
    review = dict(format='aux.ordinary-fresh.bounded-repair.review.v1',iteration='a13',
        app=str(APP),scope=owner['scope'],ownerAuthorization=p.ref(owner_path),
        trigger='A12b still exceeds startup budget; actual OS sample shows Foundation directory-inference URLs for all loaded images dominating repeated guards. Replace only lexical path checks, retaining all real census/signature/FD checks.',
        snapshot=p.ref(SNAPSHOT / 'receipt.json'),unsignedInventorySha256=p.digest(unsigned),
        source=p.ref(HERE / 'actual-image-path-check-projection-a13.json'),build=p.ref(build_path),
        targetsInSigningOrder=targets,identitySha1=owner['identitySha1'],team=owner['team'],
        policySha256=owner['fixedPolicySha256'],newEntitlements=False,newScope=False,
        acceptedAppExcluded=True,sourceOnlyExistingStartupComponent=True,
        uiPreserved=True,newProvisioning=False,newOSGrants=False,release=False)
    review_path = HERE / 'bounded-repair-review-a13.json'
    p.write_new(review_path,review)
    result = dict(format='aux.ordinary-fresh.bounded-repair.actual.v1',passed=False,
        iteration='a13',review=p.ref(review_path),app=str(APP),scope=owner['scope'],steps=[],
        appExecuted=False,newProvisioning=False,newOSGrants=False,release=False)
    output = HERE / 'actual-bounded-repair-a13.json'
    p.require(not output.exists(), 'Fresh execution receipt required')
    try:
        for target in targets:
            p.require(p.sha(APP / target['executable']) == target['sha256'], 'Reviewed repair code changed')
            if target['codeObject'] == '.':
                records[BINARY.removeprefix(RES)]['sha256'] = p.sha(APP / BINARY)
                for path in (APP / DAEMON / 'Contents/_CodeSignature').rglob('*'):
                    if path.is_file() and not path.is_symlink():
                        relative = str(path.relative_to(APP / 'Contents/Resources/aux'))
                        p.require(relative in records,'Unexpected signature leaf')
                        records[relative]['sha256'] = p.sha(path)
                (APP / MARKER).write_text(json.dumps(bundle,indent=2) + '\n')
            command = ['/usr/bin/codesign','--force','--sign',owner['identitySha1'],'--options','runtime',
                '--timestamp=none','--identifier',target['identifier']]
            if target['entitlements']:
                command.extend(['--entitlements',str(p.pin(target['entitlements']))])
            command.append(str(APP / target['codeObject']))
            run = subprocess.run(command,capture_output=True,text=True)
            result['steps'].append(dict(codeObject=target['codeObject'],command=command,exitCode=run.returncode,diagnostic=run.stderr[-2000:]))
            p.require(run.returncode == 0,'Repair signing failed')
        for target in original_review['verificationTargets']:
            requirement = '=anchor apple generic and identifier "' + target['identifier'] + '" and certificate leaf[subject.OU] = "' + owner['team'] + '"'
            run = subprocess.run(['/usr/bin/codesign','--verify','--strict','-R',requirement,str(APP / target['codeObject'])],capture_output=True,text=True)
            result['steps'].append(dict(verification=target['codeObject'],exitCode=run.returncode,diagnostic=run.stderr[-2000:]))
            p.require(run.returncode == 0,'Signature verification failed')
        after = p.inventory(APP)
        allowed = {BINARY,MARKER,'Contents/MacOS/Aux'}
        prefixes = ['Contents/_CodeSignature/',DAEMON + '/Contents/_CodeSignature/']
        expected = {row['path']:row for row in before['files']}
        differences = [row for row in after if row != expected.get(row['path'])]
        p.require(all(row['path'] in allowed or any(row['path'].startswith(prefix) for prefix in prefixes) for row in differences), 'Unreviewed resource changed')
        p.require(set(expected).issubset({row['path'] for row in after}), 'Resource removed')
        p.require(p.sha(APP / POLICY) == owner['fixedPolicySha256'], 'Policy/scope changed')
        result.update(passed=True,files=after,inventorySha256=p.digest(after),changedLeaves=differences,
            signedObjects=2,all17Verified=True,uiBrowserFrameworkAndPolicyPreserved=True,runtimeAcceptance=False)
    finally:
        p.write_new(output,result)
    print(json.dumps(dict(passed=True,signedObjects=2,all17Verified=True,
        failedBytesPreserved=str(SNAPSHOT),runtimeAcceptance=False)))


if __name__ == '__main__':
    main()
