"""Read-only completion after the signing verifier's requirement-syntax error."""
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
r = p.read(HERE / 'signing-review.json')
execution = p.read(HERE / 'actual-local-signing-a1.json')
signed = [step for step in execution['steps'] if 'codeObject' in step]
p.require(len(signed) == 17 and all(step['exitCode'] == 0 for step in signed), 'All17 reviewed signing commands must have succeeded')
app = Path(r['app'])
checks = []
for target in r['targetsInSigningOrder']:
    requirement = '=anchor apple generic and identifier "' + target['identifier'] + '" and certificate leaf[subject.OU] = "' + r['team'] + '"'
    command = ['/usr/bin/codesign', '--verify', '--strict', '-R', requirement, str(app / target['codeObject'])]
    completed = subprocess.run(command, capture_output=True, text=True)
    checks.append(dict(codeObject=target['codeObject'], exitCode=completed.returncode,
                       diagnostic=completed.stderr[-2000:]))
    p.require(completed.returncode == 0, 'Signature validation failed: ' + target['codeObject'])
print('All17 exact signatures verify; checking resource preservation. No further signing.', flush=True)
after = p.inventory(app)
receipt = p.read(p.pin(r['packageReceipt']))
before = {row['path']: row for row in receipt['files']}
changed = [row for row in after if row != before.get(row['path'])]
allowed = {row['executable'] for row in r['targetsInSigningOrder']} | {
    'Contents/Resources/aux/bundle.json', r['existingPublicProfile']['target']}
prefixes = []
for target in r['targetsInSigningOrder']:
    owner = target['codeObject']
    if owner == '.':
        prefixes.append('Contents/_CodeSignature/')
    elif owner.endswith('.app'):
        prefixes.append(owner + '/Contents/_CodeSignature/')
    elif owner.endswith('.framework'):
        prefixes.append(owner + '/Versions/155.0.8059.85/_CodeSignature/')
p.require(all(row['path'] in allowed or any(row['path'].startswith(prefix) for prefix in prefixes) for row in changed), 'Unreviewed resource changed')
after_paths = {row['path'] for row in after}
p.require(all(name in after_paths for name in before), 'Existing resource removed')
p.write_new(HERE / 'actual-local-signing-verification-a2.json', dict(
    format='aux.ordinary-fresh.local-signing.verified.v1', passed=True,
    approvedReviewSha256=p.sha(HERE / 'signing-review.json'),
    precedingExecution=p.ref(HERE / 'actual-local-signing-a1.json'),
    verifierCorrection='Prefix inline requirements with =; no signature or product bytes changed by this verifier.',
    checks=checks, files=after, inventorySha256=p.digest(after), changedLeaves=changed,
    suppliedUiPreserved=True, runtimeAcceptance=False, additionalSigning=False,
    appExecuted=False, provisioning=False, notarization=False, release=False))
print(json.dumps(dict(passed=True, verifiedObjects=17, suppliedUiPreserved=True)))
