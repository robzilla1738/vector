"""Pair the entry-buffer fix with signed A44, keeping its admitted scope."""
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
BASE = ROOT / 'out/provided-candidate-fresh-browser-20261024-a44'
OUT = ROOT / 'out/provided-candidate-fresh-browser-20261025-a45'
RES = 'Contents/Resources/aux/'
DAEMON = RES + 'apps/daemon/Aux Daemon.app'
BINARY = DAEMON + '/Contents/MacOS/aux-daemon'
POLICY = DAEMON + '/Contents/Resources/AuxFreshBootstrapPolicy.json'
MARKER = RES + 'bundle.json'


def main():
    p.require(not OUT.exists(), 'Fresh output required')
    before = p.read(HERE / 'actual-local-signing-a4.json')
    build = p.read(HERE / 'actual-daemon-entry-lifetime-build-a5.json')
    p.require(before['passed'] and build['passed'] and not build['codeSignatureLoadCommandPresent'], 'Verified signed predecessor and unsigned correction required')
    for name, digest in build['inputFiles'].items():
        p.require(p.sha(name) == digest, 'Compiled input changed: ' + name)
    binary = Path(build['binary'])
    p.require(p.sha(binary) == build['binarySha256'], 'Completed daemon changed')
    temporary = Path(tempfile.mkdtemp(prefix='.aux-entry-lifetime-', dir=OUT.parent))
    app = temporary / 'Aux.app'
    subprocess.run(['/bin/cp', '-cRpP', str(BASE / 'Aux.app'), str(app)], check=True)
    shutil.copyfile(binary, app / BINARY)
    bundle = p.read(app / MARKER)
    bundle['finalApp'] = str(OUT / 'Aux.app')
    bundle['ordinaryEntryBufferLifetime'] = dict(
        projection=p.ref(HERE / 'actual-entry-lifetime-projection-a5.json'),
        actualBuild=p.ref(HERE / 'actual-daemon-entry-lifetime-build-a5.json'),
        runtimeAcceptance=False)
    records = {row['path']: row for row in bundle['files']}
    records[BINARY.removeprefix(RES)].update(sha256=p.sha(app / BINARY), changeKinds=['integration'])
    (app / MARKER).write_text(json.dumps(bundle, indent=2) + '\n')
    after = p.inventory(app)
    changed = {BINARY, MARKER}
    p.require([row for row in before['files'] if row['path'] not in changed] ==
              [row for row in after if row['path'] not in changed], 'Browser/UI/policy/unrelated bytes or modes changed')
    scope = bundle['ordinaryFreshIntegration']['scope']
    p.require(scope == '/private/tmp/aux-fresh-browser-c5mop317', 'Only the admitted approved disposable scope allowed')
    result = dict(format='aux.ordinary-fresh.entry-lifetime.package.v1', passed=True,
        files=after, inventorySha256=p.digest(after), scope=scope,
        priorSignedReceipt=p.ref(HERE / 'actual-local-signing-a4.json'),
        daemonBuild=p.ref(HERE / 'actual-daemon-entry-lifetime-build-a5.json'),
        changedLeaves=sorted(changed), suppliedUiNativeBrowserAndPolicyPreserved=True,
        retainedValidSigningObjects=15, signingObjectsNeedingRepair=2,
        oldStateReset=False, keychainAccessed=False, appExecuted=False, runtimeAcceptance=False,
        productSigned=False, newProvisioning=False, newOSGrants=False, release=False)
    p.write_new(temporary / 'receipt.json', result)
    temporary.rename(OUT)
    prior = p.read(HERE / 'signing-review.json')
    targets = [row.copy() for row in prior['targetsInSigningOrder'] if row['codeObject'] in [DAEMON, '.']]
    p.require([row['codeObject'] for row in targets] == [DAEMON, '.'], 'Only daemon and outer app allowed')
    for row in targets:
        row['sha256'] = p.sha(OUT / 'Aux.app' / row['executable'])
    review = dict(format='aux.ordinary-fresh.entry-lifetime.signing-review.v1', approvalReady=True,
        app=str(OUT / 'Aux.app'), packageReceipt=p.ref(OUT / 'receipt.json'),
        applyScript=p.ref(HERE / 'sign-entry-lifetime-a5.py'), targetCount=2,
        targetsInSigningOrder=targets, verificationTargets=prior['targetsInSigningOrder'],
        identity=prior['identity'], identitySha1=prior['identitySha1'], team=prior['team'],
        certificateSha256=prior['certificateSha256'], scope=scope,
        keychainAccessGroup='9F2JXY8TCK.dev.aux.local', existingProfileUnchanged=True,
        policyUnchanged=True, nativeBrowserAndFrameworkUnchanged=True, suppliedUiPreserved=True,
        retainedValidSigningObjects=15, oldStateReset=False,
        proposedAction='Sign corrected daemon and outer app, then resume focused checks in the same admitted disposable scope.',
        optionalBoundedRepairAuthorization=dict(
            purpose='Finish this existing fresh-browser startup/test milestone only; stop after delivering its checklist.',
            app=str(OUT / 'Aux.app'), scope=scope, identitySha1=prior['identitySha1'],
            conditionalObjects=[DAEMON, 'Contents/Frameworks/Aux Framework.framework', '.'],
            objectIdentifiers=['dev.aux.browser.daemon', 'dev.aux.browser.framework', 'dev.aux.browser'],
            conditions=['Change only for a demonstrated failure in the existing startup/profile components.',
                'Preserve failed candidate bytes and exact inventories before each repair.',
                'Record exact source patches, build receipts, file hashes and minimal signing targets before applying signatures.',
                'Use the existing profile and the same entitlements only; no additional code objects or scopes.',
                'Preserve the accepted app and current UI; no new feature batch, task architecture, legacy migration or advanced recovery.',
                'Request separate approval for any wider signing/access scope.'],
            newProvisioning=False, newOSGrants=False, ownerStateExcluded=True,
            credentialDeletion=False, notarization=False, distribution=False, release=False),
        newEntitlements=False, newProvisioning=False, newOSGrants=False, ownerStateExcluded=True,
        acceptedAppExcluded=True, signingPerformed=False, appExecuted=False, notarization=False, release=False)
    p.write_new(HERE / 'signing-review-a5.json', review)
    p.write_new(HERE / 'actual-package-a5.json', dict(passed=True, app=str(OUT / 'Aux.app'),
        receipt=p.ref(OUT / 'receipt.json'), scope=scope, leaves=len(after),
        inventorySha256=result['inventorySha256'], signingReviewSha256=p.sha(HERE / 'signing-review-a5.json'),
        suppliedUiNativeBrowserAndPolicyPreserved=True, appExecuted=False))
    print(json.dumps(dict(passed=True, app=str(OUT / 'Aux.app'), scope=scope,
        signingReviewSha256=p.sha(HERE / 'signing-review-a5.json'), signingObjects=2, testable=False)))


if __name__ == '__main__':
    main()
