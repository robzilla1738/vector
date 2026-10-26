"""Pair the approved path-only rebuild and re-sign the same three objects."""
from pathlib import Path
import importlib.util
import json
import shutil
import subprocess
import sys

sys.dont_write_bytecode = True
HERE = Path(__file__).resolve().parent
PACKAGE = HERE.parent
ROOT = PACKAGE.parents[4]
spec = importlib.util.spec_from_file_location('package_helpers', ROOT / 'docs/integration/proposed/standard-profile-isolation/runtime-package-a1/runtime_package.py')
p = importlib.util.module_from_spec(spec)
spec.loader.exec_module(p)

def main():
    approval = p.read(HERE / 'owner-approval.json')
    p.require(p.sha(HERE / 'review.json') == approval['reviewSha256'], 'Approved review changed')
    review = p.read(HERE / 'review.json')
    original = p.read(PACKAGE / 'signing-review.json')
    previous = p.read(HERE / 'actual-integration-signing-a12.json')
    p.require(previous['passed'] and previous['verifiedObjects'] == 19, 'Verified signed predecessor required')
    app = Path(original['app'])
    p.require(p.inventory(app) == previous['files'], 'Signed predecessor changed')
    browser = p.read(HERE / 'actual-browser-build-a11.json')
    daemon = p.read(HERE / 'daemon-build/memory-ancestor-metadata-a11/actual-build.json')
    p.require(browser['passed'] and daemon['passed'], 'Actual paired builds must pass')
    source_plan_path = ROOT / 'docs/integration/proposed/browser-feature-expansion/productivity-memory-terminal-close-a49/source-plan.json'
    source_plan = p.read(source_plan_path)
    changes = []
    for row in source_plan['files']:
        p.require(p.sha(row['input']) == row['inputSha256'], 'Paired source preimage changed')
        text = Path(row['input']).read_text()
        for anchor in row['anchors']:
            p.require(text.count(anchor['before']) == anchor['count'], 'Source anchor count changed')
            text = text.replace(anchor['before'], anchor['after'])
        p.require(text.encode() == Path(row['output']).read_bytes(), 'Source patch replay differs')
        changes.append(dict(path=row['output'], sha256=row['outputSha256'],
                            executable=str(Path(row['input']).relative_to(app)), unsigned=True))
    for row in changes:
        p.require(row['unsigned'] and p.sha(row['path']) == row['sha256'], 'Frozen unsigned replacement changed')
    snapshot = app.parent / 'before-disposable-location-a13'
    p.require(not snapshot.exists(), 'Fresh recoverable snapshot required')
    snapshot.mkdir(mode=0o700)
    subprocess.run(['/bin/cp', '-cRpP', str(app), str(snapshot / 'Aux.app')], check=True)
    # The pre-mutation complete inventory above binds the copied snapshot; APFS
    # clone preserves bytes without another unchanged whole-package hash pass.
    plan = dict(format='aux.fixed-location.integration.v1', previousInventorySha256=previous['inventorySha256'],
                approvedReview=p.ref(HERE / 'review.json'), executor=p.ref(__file__), preserved=str(snapshot / 'Aux.app'),
                replacements=changes, signingObjects=[name for name in review['signingObjects'] if not name.endswith('.framework')], sourceAdaptation=p.ref(source_plan_path), release=False)
    p.write_new(HERE / 'integration-plan-a13.json', plan)
    for row in changes:
        target = app / row['executable']
        mode = target.stat().st_mode & 0o7777
        shutil.copyfile(row['path'], target)
        target.chmod(mode)
    resource = 'Contents/Resources/aux/'
    marker = app / resource / 'bundle.json'
    bundle = p.read(marker)
    bundle['localCompletionIntegration'].update(
        nativeBrowser=p.ref(HERE / 'actual-browser-build-a11.json'),
        daemon=p.ref(HERE / 'daemon-build/memory-ancestor-metadata-a11/actual-build.json'),
        fixedDisposableNamespace=review['proposedNamespace'],
        fixedDisposableLocationReviewSha256=p.sha(HERE / 'review.json'), runtimeAcceptance=False, memoryTerminalCloseAdaptation=p.ref(source_plan_path))
    targets = [row for row in original['targetsInSigningOrder'] if row['codeObject'] in review['signingObjects'] and row['identifier'] != 'dev.aux.browser.framework']
    p.require(len(targets) == 2, 'Only daemon and outer-app signatures may change')
    steps = []
    result = dict(passed=False, steps=steps, app=str(app), appExecuted=False, runtimeAcceptance=False,
                  release=False, newEntitlements=False, originalFolderAccessed=False)
    try:
        for row in targets:
            if row['codeObject'] == '.':
                records = {item['path']: item for item in bundle['files']}
                prefix = 'apps/daemon/Aux Daemon.app/'
                for path in sorted((app / resource / prefix).rglob('*')):
                    if not path.is_file() or path.is_symlink():
                        continue
                    name = str(path.relative_to(app / resource))
                    p.require(name in records, 'Unexpected new daemon resource')
                    records[name]['sha256'] = p.sha(path)
                bundle['files'] = list(records.values())
                marker.write_text(json.dumps(bundle, indent=2) + '\n')
            command = ['/usr/bin/codesign', '--force', '--sign', review['identitySha1'],
                       '--options', 'runtime', '--timestamp=none', '--identifier', row['identifier']]
            if row['entitlements']:
                command += ['--entitlements', str(p.pin(row['entitlements']))]
            command.append(str(app / row['codeObject']))
            done = subprocess.run(command, capture_output=True, text=True)
            steps.append(dict(codeObject=row['codeObject'], command=command, exitCode=done.returncode, diagnostic=done.stderr[-2000:]))
            p.require(done.returncode == 0, 'Approved local re-sign failed')
        for row in original['targetsInSigningOrder']:
            requirement = '=anchor apple generic and identifier "' + row['identifier'] + '" and certificate leaf[subject.OU] = "' + original['team'] + '"'
            done = subprocess.run(['/usr/bin/codesign', '--verify', '--strict', '-R', requirement, str(app / row['codeObject'])], capture_output=True, text=True)
            steps.append(dict(verification=row['codeObject'], exitCode=done.returncode, diagnostic=done.stderr[-2000:]))
            p.require(done.returncode == 0, 'Candidate signature verification failed')
        after = p.inventory(app)
        old = {row['path']: row for row in previous['files']}
        changed = [row for row in after if row != old.get(row['path'])]
        allowed = {row['executable'] for row in targets} | {row['executable'] for row in changes} | {resource + 'bundle.json',
            'Contents/_CodeSignature/CodeResources',
            'Contents/Frameworks/Aux Framework.framework/Versions/155.0.8059.85/_CodeSignature/CodeResources',
            resource + 'apps/daemon/Aux Daemon.app/Contents/_CodeSignature/CodeResources'}
        p.require(all(row['path'] in allowed for row in changed), 'Unreviewed candidate bytes changed')
        p.require(set(old) == {row['path'] for row in after}, 'Unexpected resource addition/removal')
        result.update(passed=True, files=after, inventorySha256=p.digest(after), changedLeaves=changed,
                      verifiedObjects=19, resignedObjects=2, retainedSignatures=17, uiResourcesPreserved=True)
    finally:
        p.write_new(HERE / 'actual-integration-signing-a13.json', result)
    print(json.dumps({key: result[key] for key in ['passed', 'verifiedObjects', 'resignedObjects', 'uiResourcesPreserved', 'runtimeAcceptance']}))

if __name__ == '__main__':
    main()
