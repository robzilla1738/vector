"""Integrate the native session/default and guest-code retention corrections within the fixed owner authorization."""
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
SNAPSHOT = APP.parent.with_name(APP.parent.name + '-before-native-retention-a23')
BUILD_ROOT = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023')
BUILD = BUILD_ROOT / 'unsigned-browser-peer-concurrency-build-20261025-a63'
FRAMEWORK = 'Contents/Frameworks/Aux Framework.framework'
BINARY = FRAMEWORK + '/Versions/155.0.8059.85/Aux Framework'
MARKER = 'Contents/Resources/aux/bundle.json'
POLICY = 'Contents/Resources/aux/apps/daemon/Aux Daemon.app/Contents/Resources/AuxFreshBootstrapPolicy.json'


def main():
    owner_path = HERE / 'owner-signing-approval-a5.json'
    owner = p.read(owner_path)
    p.require(owner['ownerReply'] == 'Approve fix and bounded repair signing' and owner['app'] == str(APP), 'Exact owner authorization required')
    p.require(APP.resolve(strict=True) == APP and p.sha(APP / POLICY) == owner['fixedPolicySha256'], 'Fixed candidate/policy required')
    commands = subprocess.run(['/bin/ps', '-axo', 'pid=,comm='], capture_output=True, text=True, check=True).stdout
    p.require(not any(str(APP) + '/' in line for line in commands.splitlines()), 'Candidate must be stopped')
    before_path = HERE / 'actual-bounded-repair-a20.json'
    before = p.read(before_path)
    build = p.read(BUILD / 'receipt.json')
    p.require(before['passed'] and build['passed'] and build['allInspectedMachoUnsigned'], 'Verified predecessor/full unsigned build required')
    for name, digest in build['nativeInputPins']['files'].items():
        p.require(p.sha(Path(build['source']) / name) == digest, 'Compiled native source changed: ' + name)
    old_raw = p.read(BUILD_ROOT / 'unsigned-browser-stabilization-build-20261025-a60/app-inventory.json')
    new_raw = p.read(BUILD / 'app-inventory.json')
    old_map = {r['path']: r for r in old_raw}
    new_map = {r['path']: r for r in new_raw}
    p.require(set(old_map) == set(new_map) and [k for k in old_map if old_map[k] != new_map[k]] == [BINARY], 'Only framework payload may differ in native build')
    raw_app = Path(build['appPath'])
    p.require(p.sha(raw_app / BINARY) == new_map[BINARY]['sha256'], 'Compiled framework changed')
    p.require(p.inventory(APP) == before['files'], 'Predecessor candidate changed')
    p.require(not SNAPSHOT.exists(), 'Fresh failed-byte snapshot required')
    SNAPSHOT.mkdir()
    subprocess.run(['/bin/cp', '-cRpP', str(APP), str(SNAPSHOT / 'Aux.app')], check=True)
    p.require(p.inventory(SNAPSHOT / 'Aux.app') == before['files'], 'Snapshot differs')
    p.write_new(SNAPSHOT / 'receipt.json', dict(passed=True, exactPriorInventory=p.ref(before_path), inventorySha256=p.digest(before['files']), snapshotOnlyNotLaunchTarget=True, scopeDataCopied=False))
    shutil.copyfile(raw_app / BINARY, APP / BINARY)
    bundle = p.read(APP / MARKER)
    bundle['nativeSessionAndGuestIdentityRepair'] = dict(projection=p.ref(HERE / 'source-composition-a23.json'), build=p.ref(BUILD / 'receipt.json'), ownerAuthorization=p.ref(owner_path), runtimeAcceptance=False)
    (APP / MARKER).write_text(json.dumps(bundle, indent=2) + '\n')
    unsigned = p.inventory(APP)
    changed = {BINARY, MARKER}
    p.require([r for r in before['files'] if r['path'] not in changed] == [r for r in unsigned if r['path'] not in changed], 'Unrelated UI/daemon/helper resource changed')
    original_review = p.read(HERE / 'signing-review-a5.json')
    target_map = {r['codeObject']: r for r in original_review['verificationTargets']}
    targets = [dict(target_map[k], sha256=p.sha(APP / target_map[k]['executable'])) for k in (FRAMEWORK, '.')]
    p.require(all(t['codeObject'] in owner['boundedRepairAuthorization']['conditionalObjects'] for t in targets), 'Unapproved signing target')
    review_path = HERE / 'bounded-repair-review-a23.json'
    p.write_new(review_path, dict(format='aux.ordinary-fresh.bounded-repair.review.v1', iteration='a23', app=str(APP), scope=owner['scope'], ownerAuthorization=p.ref(owner_path), trigger='A20 real fresh-profile default hook was ineffective and actual macOS sample shows repeated whole-image Security validation on the UI-thread supervisor poll. Integrate native registered session default and retained genuine Security objects with exact held-file metadata; all validation calls/flags and explicit preferences remain.', snapshot=p.ref(SNAPSHOT / 'receipt.json'), unsignedInventorySha256=p.digest(unsigned), source=p.ref(HERE / 'source-composition-a23.json'), build=p.ref(BUILD / 'receipt.json'), targetsInSigningOrder=targets, identitySha1=owner['identitySha1'], team=owner['team'], policySha256=owner['fixedPolicySha256'], newEntitlements=False, newScope=False, uiPreserved=True, acceptedAppExcluded=True, newProvisioning=False, newOSGrants=False, release=False))
    output = HERE / 'actual-bounded-repair-a23.json'
    p.require(not output.exists(), 'Fresh execution receipt required')
    result = dict(format='aux.ordinary-fresh.bounded-repair.actual.v1', passed=False, iteration='a23', review=p.ref(review_path), app=str(APP), scope=owner['scope'], steps=[], appExecuted=False, release=False)
    try:
        for target in targets:
            p.require(p.sha(APP / target['executable']) == target['sha256'], 'Reviewed executable changed')
            command = ['/usr/bin/codesign', '--force', '--sign', owner['identitySha1'], '--options', 'runtime', '--timestamp=none', '--identifier', target['identifier']]
            if target['entitlements']:
                command.extend(['--entitlements', str(p.pin(target['entitlements']))])
            command.append(str(APP / target['codeObject']))
            run = subprocess.run(command, capture_output=True, text=True)
            result['steps'].append(dict(codeObject=target['codeObject'], exitCode=run.returncode, diagnostic=run.stderr[-2000:]))
            p.require(run.returncode == 0, 'Signing failed')
        for target in original_review['verificationTargets']:
            requirement = '=anchor apple generic and identifier "' + target['identifier'] + '" and certificate leaf[subject.OU] = "' + owner['team'] + '"'
            run = subprocess.run(['/usr/bin/codesign', '--verify', '--strict', '-R', requirement, str(APP / target['codeObject'])], capture_output=True, text=True)
            result['steps'].append(dict(verification=target['codeObject'], exitCode=run.returncode, diagnostic=run.stderr[-2000:]))
            p.require(run.returncode == 0, 'Signature verification failed')
        after = p.inventory(APP)
        expected = {r['path']: r for r in before['files']}
        differences = [r for r in after if r != expected.get(r['path'])]
        allowed = {BINARY, MARKER, 'Contents/MacOS/Aux'}
        prefixes = ['Contents/_CodeSignature/', FRAMEWORK + '/Versions/155.0.8059.85/_CodeSignature/']
        p.require(set(expected) == {r['path'] for r in after}, 'Resource added/removed')
        p.require(all(r['path'] in allowed or any(r['path'].startswith(k) for k in prefixes) for r in differences), 'Unreviewed resource changed')
        p.require(p.sha(APP / POLICY) == owner['fixedPolicySha256'], 'Policy/scope changed')
        result.update(passed=True, files=after, inventorySha256=p.digest(after), changedLeaves=differences, signedObjects=2, all17Verified=True, uiDaemonHelpersAndPolicyPreserved=True, runtimeAcceptance=False)
    finally:
        p.write_new(output, result)
    print(json.dumps(dict(passed=True, signedObjects=2, all17Verified=True, runtimeAcceptance=False)))


if __name__ == '__main__':
    main()
