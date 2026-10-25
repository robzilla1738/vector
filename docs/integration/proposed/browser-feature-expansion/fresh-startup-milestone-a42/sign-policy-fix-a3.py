"""Re-sign only the two corrected objects after a separate exact approval."""
import importlib.util
import json
from pathlib import Path
import subprocess
import sys

sys.dont_write_bytecode = True
HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('package_helpers', HERE.parents[1] / 'standard-profile-isolation/runtime-package-a1/runtime_package.py')
p = importlib.util.module_from_spec(spec)
spec.loader.exec_module(p)


def main():
    if len(sys.argv) != 3 or sys.argv[1] != '--owner-approved-review-sha256':
        raise SystemExit('Separate exact owner approval required; no action taken.')
    review = HERE / 'signing-review-a3.json'
    p.require(p.sha(review) == sys.argv[2], 'Exact reviewed correction required')
    r = p.read(review)
    p.pin(r['applyScript'])
    p.require(r['targetCount'] == 2 and [row['codeObject'] for row in r['targetsInSigningOrder']] ==
        ['Contents/Frameworks/Aux Framework.framework', '.'], 'Only corrected framework and outer app allowed')
    app = Path(r['app'])
    p.require(app.resolve(strict=True) == app and app.parent.name == 'provided-candidate-fresh-browser-20261024-a43', 'Only inactive A43 candidate allowed')
    before = p.read(p.pin(r['packageReceipt']))
    p.require(p.inventory(app) == before['files'], 'Correction candidate changed')
    output = HERE / 'actual-local-signing-a3.json'
    p.require(not output.exists(), 'Fresh execution receipt required')
    steps = []
    result = dict(format='aux.ordinary-fresh.policy-correction.signing-actual.v1', passed=False,
        approvedReviewSha256=p.sha(review), app=str(app), steps=steps,
        appExecuted=False, newProvisioning=False, newOSGrants=False, release=False)
    try:
        for target in r['targetsInSigningOrder']:
            p.require(p.sha(app / target['executable']) == target['sha256'], 'Reviewed code changed')
            command = ['/usr/bin/codesign', '--force', '--sign', r['identitySha1'], '--options', 'runtime',
                       '--timestamp=none', '--identifier', target['identifier']]
            if target['entitlements']:
                command.extend(['--entitlements', str(p.pin(target['entitlements']))])
            command.append(str(app / target['codeObject']))
            completed = subprocess.run(command, capture_output=True, text=True)
            steps.append(dict(codeObject=target['codeObject'], command=command,
                exitCode=completed.returncode, diagnostic=completed.stderr[-2000:]))
            p.require(completed.returncode == 0, 'Correction signing failed')
        for target in r['verificationTargets']:
            requirement = '=anchor apple generic and identifier "' + target['identifier'] + '" and certificate leaf[subject.OU] = "' + r['team'] + '"'
            completed = subprocess.run(['/usr/bin/codesign', '--verify', '--strict', '-R', requirement,
                str(app / target['codeObject'])], capture_output=True, text=True)
            steps.append(dict(verification=target['codeObject'], exitCode=completed.returncode,
                diagnostic=completed.stderr[-2000:]))
            p.require(completed.returncode == 0, 'Correction signature verification failed')
        after = p.inventory(app)
        old = {row['path']: row for row in before['files']}
        allowed = {row['executable'] for row in r['targetsInSigningOrder']}
        prefixes = ['Contents/_CodeSignature/', 'Contents/Frameworks/Aux Framework.framework/Versions/155.0.8059.85/_CodeSignature/']
        changed = [row for row in after if row != old.get(row['path'])]
        p.require(all(row['path'] in allowed or any(row['path'].startswith(prefix) for prefix in prefixes) for row in changed), 'Unreviewed resource changed')
        p.require(set(old).issubset({row['path'] for row in after}), 'Existing resource removed')
        result.update(passed=True, files=after, inventorySha256=p.digest(after),
            changedLeaves=changed, suppliedUiPreserved=True, runtimeAcceptance=False)
    finally:
        p.write_new(output, result)
    print(json.dumps(dict(passed=True, signedObjects=2, all17Verified=True, runtimeAcceptance=False)))


if __name__ == '__main__':
    main()
