"""Assemble the focused policy correction, retaining fifteen valid signatures."""
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
BASE = ROOT / 'out/provided-candidate-fresh-browser-20261024-a42'
OUT = ROOT / 'out/provided-candidate-fresh-browser-20261024-a43'
SNAPSHOT = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023')
BUILD = SNAPSHOT / 'unsigned-ordinary-fresh-browser-build-20261024-a43'
FRAMEWORK = 'Contents/Frameworks/Aux Framework.framework/Versions/155.0.8059.85/Aux Framework'


def main():
    p.require(not OUT.exists(), 'Fresh correction output required')
    build = p.read(BUILD / 'receipt.json')
    p.require(build['passed'] and build['allInspectedMachoUnsigned'], 'Complete unsigned correction build required')
    p.require(build['nativeInputPinsSha256'] == p.sha(HERE / 'full-native-input-pins-a3.json'), 'Correction pins changed')
    old_native = {row['path']: row for row in p.read(SNAPSHOT / 'unsigned-ordinary-fresh-browser-build-20261024-a42b/app-inventory.json')}
    new_native = {row['path']: row for row in p.read(BUILD / 'app-inventory.json')}
    p.require(old_native.keys() == new_native.keys(), 'Native coverage changed')
    differences = [name for name in old_native if old_native[name] != new_native[name]]
    p.require(differences == [FRAMEWORK], 'Only the corrected framework may change: ' + str(differences))
    signed = p.read(HERE / 'actual-local-signing-verification-a2.json')
    p.require(signed['passed'] and signed['suppliedUiPreserved'], 'Verified signed A42 predecessor required')
    temporary = Path(tempfile.mkdtemp(prefix='.aux-policy-fix-', dir=OUT.parent))
    app = temporary / 'Aux.app'
    subprocess.run(['/bin/cp', '-cRpP', str(BASE / 'Aux.app'), str(app)], check=True)
    source = Path(build['appPath']) / FRAMEWORK
    p.require(p.sha(source) == new_native[FRAMEWORK]['sha256'], 'Completed framework changed')
    shutil.copyfile(source, app / FRAMEWORK)
    marker_name = 'Contents/Resources/aux/bundle.json'
    marker = app / marker_name
    bundle = p.read(marker)
    bundle['finalApp'] = str(OUT / 'Aux.app')
    bundle['ordinaryStartupPolicyCorrection'] = dict(
        projection=p.ref(HERE / 'actual-policy-fix-projection-a3.json'),
        inputPins=p.ref(HERE / 'full-native-input-pins-a3.json'),
        fullBuild=p.ref(BUILD / 'receipt.json'), runtimeAcceptance=False)
    marker.write_text(json.dumps(bundle, indent=2) + '\n')
    after = p.inventory(app)
    excluded = {FRAMEWORK, marker_name}
    p.require([row for row in signed['files'] if row['path'] not in excluded] ==
              [row for row in after if row['path'] not in excluded], 'Unrelated signed code/UI/resources changed')
    receipt = dict(format='aux.ordinary-fresh.policy-correction.package.v1', passed=True,
        files=after, inventorySha256=p.digest(after), priorSignedReceipt=p.ref(HERE / 'actual-local-signing-verification-a2.json'),
        correctedFrameworkSha256=new_native[FRAMEWORK]['sha256'], nativeDifferences=differences,
        scope='/private/tmp/aux-fresh-browser-4qtjms51',
        suppliedUiPreserved=True, retainedValidSigningObjects=15,
        signingObjectsNeedingRepair=2, appExecuted=False, runtimeAcceptance=False,
        newProvisioning=False, newOSGrants=False, release=False)
    p.write_new(temporary / 'receipt.json', receipt)
    temporary.rename(OUT)
    prior = p.read(HERE / 'signing-review.json')
    targets = [row.copy() for row in prior['targetsInSigningOrder'] if row['codeObject'] in ['Contents/Frameworks/Aux Framework.framework', '.']]
    for row in targets:
        row['sha256'] = p.sha(OUT / 'Aux.app' / row['executable'])
    review = dict(format='aux.ordinary-fresh.policy-correction.signing-review.v1', approvalReady=True,
        app=str(OUT / 'Aux.app'), packageReceipt=p.ref(OUT / 'receipt.json'),
        applyScript=p.ref(HERE / 'sign-policy-fix-a3.py'), targetCount=2,
        targetsInSigningOrder=targets, verificationTargets=prior['targetsInSigningOrder'],
        identity=prior['identity'], identitySha1=prior['identitySha1'], team=prior['team'],
        certificateSha256=prior['certificateSha256'],
        scope=receipt['scope'], existingProfileUnchanged=True, daemonUnchanged=True,
        retainedValidSigningObjects=15, suppliedUiPreserved=True,
        proposedAction='Re-sign only the corrected framework and containing outer app, then resume the already-approved disposable checks.',
        newEntitlements=False, newProvisioning=False, newOSGrants=False,
        ownerStateExcluded=True, acceptedAppExcluded=True, signingPerformed=False, release=False)
    p.write_new(HERE / 'signing-review-a3.json', review)
    p.write_new(HERE / 'actual-package-a3.json', dict(passed=True,
        app=str(OUT / 'Aux.app'), receipt=p.ref(OUT / 'receipt.json'),
        leaves=len(after), inventorySha256=receipt['inventorySha256'],
        suppliedUiPreserved=True, retainedValidSigningObjects=15,
        signingReviewSha256=p.sha(HERE / 'signing-review-a3.json'), appExecuted=False))
    print(json.dumps(dict(passed=True, app=str(OUT / 'Aux.app'),
        signingReviewSha256=p.sha(HERE / 'signing-review-a3.json'), signingObjects=2, testable=False)))


if __name__ == '__main__':
    main()
