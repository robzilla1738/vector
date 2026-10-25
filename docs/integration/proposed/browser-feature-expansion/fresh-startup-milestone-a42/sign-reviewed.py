"""Apply the exact reviewed local signatures only after explicit owner approval."""
import importlib.util
import json
from pathlib import Path
import shutil
import subprocess
import sys

sys.dont_write_bytecode = True
HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('package_helpers', HERE.parents[1] / 'standard-profile-isolation/runtime-package-a1/runtime_package.py')
p = importlib.util.module_from_spec(spec)
spec.loader.exec_module(p)


def main():
    if len(sys.argv) != 3 or sys.argv[1] != '--owner-approved-review-sha256':
        raise SystemExit('Explicit owner approval and exact review SHA256 required; no action taken.')
    review_path = HERE / 'signing-review.json'
    p.require(p.sha(review_path) == sys.argv[2], 'Exact owner-reviewed manifest required')
    r = p.read(review_path)
    p.require(r['approvalReady'] and r['targetCount'] == 17 and not r['signingPerformed'], 'Exact unsigned17-object review required')
    p.pin(r['applyScript'])
    app = Path(r['app'])
    p.require(app.resolve(strict=True) == app and app.name == 'Aux.app' and
              app.parent.name == 'provided-candidate-fresh-browser-20261024-a42', 'Only inactive A42 candidate allowed')
    receipt = p.read(p.pin(r['packageReceipt']))
    p.require(p.inventory(app) == receipt['files'] and receipt['inventorySha256'] == r['candidateInventorySha256'], 'Candidate differs from review')
    profile = p.pin({key: r['existingPublicProfile'][key] for key in ['path', 'sha256']})
    identity = subprocess.run(['/usr/bin/security', 'find-identity', '-v', '-p', 'codesigning'], capture_output=True, text=True, check=True)
    p.require(r['identitySha1'] in identity.stdout, 'Reviewed existing identity unavailable')
    output = HERE / 'actual-local-signing-a1.json'
    p.require(not output.exists(), 'Fresh execution receipt required')
    bundle_path = app / 'Contents/Resources/aux/bundle.json'
    bundle = p.read(bundle_path)
    records = {row['path']: row for row in bundle['files']}
    steps = []
    result = dict(format='aux.ordinary-fresh.local-signing.actual.v1', passed=False,
        approvedReviewSha256=p.sha(review_path), app=str(app), steps=steps,
        appExecuted=False, provisioning=False, notarization=False, release=False)
    try:
        destination = app / r['existingPublicProfile']['target']
        p.require(not destination.exists(), 'Unexpected embedded profile refused')
        shutil.copyfile(profile, destination)
        destination.chmod(0o644)
        for target in r['targetsInSigningOrder']:
            p.require(p.sha(app / target['executable']) == target['sha256'], 'Reviewed executable changed')
            if target['codeObject'] == '.':
                # Resource hosts are ordinary sealed resources in the outer app.
                # Refresh hashes after daemon signing, before sealing the outer app.
                daemon_prefix = 'Contents/Resources/aux/apps/daemon/Aux Daemon.app/'
                for path in sorted((app / daemon_prefix).rglob('*')):
                    if not path.is_file() or path.is_symlink():
                        continue
                    relative = str(path.relative_to(app / 'Contents/Resources/aux'))
                    if relative in records:
                        records[relative]['sha256'] = p.sha(path)
                    else:
                        record = dict(path=relative, type='file', mode=path.stat().st_mode & 0o7777,
                            sha256=p.sha(path), changeKinds=['integration'], source='approved local-development signing')
                        bundle['files'].append(record)
                        records[relative] = record
                bundle_path.write_text(json.dumps(bundle, indent=2) + '\n')
            command = ['/usr/bin/codesign', '--force', '--sign', r['identitySha1'],
                       '--options', 'runtime', '--timestamp=none', '--identifier', target['identifier']]
            if target['entitlements']:
                command.extend(['--entitlements', str(p.pin(target['entitlements']))])
            command.append(str(app / target['codeObject']))
            completed = subprocess.run(command, capture_output=True, text=True)
            steps.append(dict(codeObject=target['codeObject'], command=command,
                exitCode=completed.returncode, diagnostic=completed.stderr[-2000:]))
            p.require(completed.returncode == 0, 'Local signing failed: ' + target['codeObject'])
        for target in r['targetsInSigningOrder']:
            requirement = 'anchor apple generic and identifier "' + target['identifier'] + '" and certificate leaf[subject.OU] = "' + r['team'] + '"'
            command = ['/usr/bin/codesign', '--verify', '--strict', '-R', requirement, str(app / target['codeObject'])]
            completed = subprocess.run(command, capture_output=True, text=True)
            steps.append(dict(verification=target['codeObject'], exitCode=completed.returncode,
                              diagnostic=completed.stderr[-2000:]))
            p.require(completed.returncode == 0, 'Signature validation failed: ' + target['codeObject'])
        after = p.inventory(app)
        before = {row['path']: row for row in receipt['files']}
        changed = [row for row in after if row != before.get(row['path'])]
        allowed = {row['executable'] for row in r['targetsInSigningOrder']} | {
            'Contents/Resources/aux/bundle.json', r['existingPublicProfile']['target']}
        signature_prefixes = []
        for target in r['targetsInSigningOrder']:
            owner = target['codeObject']
            if owner == '.':
                signature_prefixes.append('Contents/_CodeSignature/')
            elif owner.endswith('.app'):
                signature_prefixes.append(owner + '/Contents/_CodeSignature/')
            elif owner.endswith('.framework'):
                signature_prefixes.append(owner + '/Versions/155.0.8059.85/_CodeSignature/')
        p.require(all(row['path'] in allowed or any(row['path'].startswith(prefix) for prefix in signature_prefixes) for row in changed), 'Unreviewed resource changed')
        after_paths = {row['path'] for row in after}
        p.require(all(name in after_paths for name in before), 'An existing resource was removed')
        result.update(passed=True, files=after, inventorySha256=p.digest(after), changedLeaves=changed,
                      suppliedUiPreserved=True, runtimeAcceptance=False)
    finally:
        p.write_new(output, result)
    print(json.dumps(dict(passed=result['passed'], signedObjects=17, runtimeAcceptance=False)))


if __name__ == '__main__':
    main()
