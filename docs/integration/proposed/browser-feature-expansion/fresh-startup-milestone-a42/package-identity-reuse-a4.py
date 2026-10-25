"""Pair the one-file daemon correction with A43 and a new empty scope."""
import importlib.util
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile

sys.dont_write_bytecode = True
HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[4]
spec = importlib.util.spec_from_file_location('package_helpers', HERE.parents[1] / 'standard-profile-isolation/runtime-package-a1/runtime_package.py')
p = importlib.util.module_from_spec(spec)
spec.loader.exec_module(p)
BASE = ROOT / 'out/provided-candidate-fresh-browser-20261024-a43'
OUT = ROOT / 'out/provided-candidate-fresh-browser-20261024-a44'
RES = 'Contents/Resources/aux/'
DAEMON = RES + 'apps/daemon/Aux Daemon.app'
BINARY = DAEMON + '/Contents/MacOS/aux-daemon'
POLICY = DAEMON + '/Contents/Resources/AuxFreshBootstrapPolicy.json'
MARKER = RES + 'bundle.json'


def main():
    p.require(not OUT.exists(), 'Fresh output required')
    before = p.read(HERE / 'actual-local-signing-a3.json')
    build = p.read(HERE / 'actual-daemon-identity-reuse-build-a4b.json')
    p.require(before['passed'] and build['passed'] and not build['codeSignatureLoadCommandPresent'], 'Verified predecessor and unsigned correction required')
    for name, digest in build['inputFiles'].items():
        p.require(p.sha(name) == digest, 'Compiled input changed: ' + name)
    binary = Path(build['binary'])
    p.require(p.sha(binary) == build['binarySha256'], 'Completed daemon changed')
    temporary = Path(tempfile.mkdtemp(prefix='.aux-identity-reuse-', dir=OUT.parent))
    app = temporary / 'Aux.app'
    subprocess.run(['/bin/cp', '-cRpP', str(BASE / 'Aux.app'), str(app)], check=True)
    shutil.copyfile(binary, app / BINARY)
    scope = Path(tempfile.mkdtemp(prefix='aux-fresh-browser-', dir='/private/tmp'))
    scope.chmod(0o700)
    for name in ['control', 'tasks', 'home', 'home/Library', 'home/Library/Application Support',
                 'home/Library/Caches', 'home/Library/Application Support/Aux',
                 'home/Library/Caches/Aux', 'home/Downloads']:
        (scope / name).mkdir(mode=0o700)
    policy = p.read(app / POLICY)
    p.require(policy['format'] == 'aux.fresh.bootstrap.policy.v8' and policy['accessGroup'] == '9F2JXY8TCK.dev.aux.local', 'Exact ordinary policy predecessor required')
    policy.update(canonicalPrivateParent=str(scope / 'control'), canonicalTaskParent=str(scope / 'tasks'))
    policy['browserStartup'].update(dataRoot=str(scope / 'home/Library/Application Support/Aux'),
                                   cacheRoot=str(scope / 'home/Library/Caches/Aux'))
    (app / POLICY).write_text(json.dumps(policy,indent=2,sort_keys=True) + '\n')
    bundle = p.read(app / MARKER)
    bundle['finalApp'] = str(OUT / 'Aux.app')
    bundle['ordinaryFreshIntegration'].update(scope=str(scope), runtimeAcceptance=False, signingApprovalRequired=True)
    bundle['ordinaryIdentityHandleReuse'] = dict(
        projection=p.ref(HERE / 'actual-identity-reuse-projection-a4b.json'),
        actualBuild=p.ref(HERE / 'actual-daemon-identity-reuse-build-a4b.json'),
        runtimeAcceptance=False, previousPartialScopeRetained='/private/tmp/aux-fresh-browser-4qtjms51')
    records = {row['path']:row for row in bundle['files']}
    for name in [BINARY, POLICY]:
        records[name.removeprefix(RES)].update(sha256=p.sha(app / name),changeKinds=['integration'])
    (app / MARKER).write_text(json.dumps(bundle,indent=2) + '\n')
    after = p.inventory(app)
    changed = {BINARY, POLICY, MARKER}
    p.require([row for row in before['files'] if row['path'] not in changed] ==
              [row for row in after if row['path'] not in changed], 'Browser/UI/unrelated resources or modes changed')
    result = dict(format='aux.ordinary-fresh.identity-reuse.package.v1',passed=True,
        files=after,inventorySha256=p.digest(after),scope=str(scope),policy=policy,
        priorSignedReceipt=p.ref(HERE / 'actual-local-signing-a3.json'),
        daemonBuild=p.ref(HERE / 'actual-daemon-identity-reuse-build-a4b.json'),
        changedLeaves=sorted(changed),suppliedUiAndNativeBrowserPreserved=True,
        retainedValidSigningObjects=15,signingObjectsNeedingRepair=2,
        previousPartialScopeRetained=True,oldStateReset=False,keychainAccessed=False,
        appExecuted=False,runtimeAcceptance=False,productSigned=False,newProvisioning=False,newOSGrants=False,release=False)
    p.write_new(temporary / 'receipt.json', result)
    temporary.rename(OUT)
    prior = p.read(HERE / 'signing-review.json')
    targets = [row.copy() for row in prior['targetsInSigningOrder'] if row['codeObject'] in [DAEMON,'.']]
    p.require([row['codeObject'] for row in targets] == [DAEMON,'.'], 'Only daemon and containing app allowed')
    for row in targets:
        row['sha256'] = p.sha(OUT / 'Aux.app' / row['executable'])
    review = dict(format='aux.ordinary-fresh.identity-reuse.signing-review.v1',approvalReady=True,
        app=str(OUT / 'Aux.app'),packageReceipt=p.ref(OUT / 'receipt.json'),
        applyScript=p.ref(HERE / 'sign-identity-reuse-a4.py'),targetCount=2,
        targetsInSigningOrder=targets,verificationTargets=prior['targetsInSigningOrder'],
        identity=prior['identity'],identitySha1=prior['identitySha1'],team=prior['team'],
        certificateSha256=prior['certificateSha256'],scope=str(scope),
        keychainAccessGroup='9F2JXY8TCK.dev.aux.local',existingProfileUnchanged=True,
        nativeBrowserAndFrameworkUnchanged=True,suppliedUiPreserved=True,retainedValidSigningObjects=15,
        signatureFlagsAndValidityCallsRetained=True,cachedAdmission=False,
        previousPartialScopeRetained='/private/tmp/aux-fresh-browser-4qtjms51',oldStateReset=False,
        proposedAction='Sign only the corrected daemon and outer app, initialize only the new fixed disposable scope and run the focused browser checks.',
        newEntitlements=False,newProvisioning=False,newOSGrants=False,ownerStateExcluded=True,
        acceptedAppExcluded=True,signingPerformed=False,appExecuted=False,notarization=False,release=False)
    p.write_new(HERE / 'signing-review-a4.json',review)
    p.write_new(HERE / 'actual-package-a4.json',dict(passed=True,app=str(OUT / 'Aux.app'),
        receipt=p.ref(OUT / 'receipt.json'),scope=str(scope),leaves=len(after),
        inventorySha256=result['inventorySha256'],signingReviewSha256=p.sha(HERE / 'signing-review-a4.json'),
        suppliedUiAndNativeBrowserPreserved=True,appExecuted=False))
    print(json.dumps(dict(passed=True,app=str(OUT / 'Aux.app'),scope=str(scope),
        signingReviewSha256=p.sha(HERE / 'signing-review-a4.json'),signingObjects=2,testable=False)))


if __name__ == '__main__':
    main()
