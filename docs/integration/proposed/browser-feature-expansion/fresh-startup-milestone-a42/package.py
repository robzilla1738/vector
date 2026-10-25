"""Pair the ordinary browser, main-only daemon and unchanged supplied UI."""
import importlib.util
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile

sys.dont_write_bytecode = True
HERE = Path(__file__).resolve().parent
REPO = HERE.parents[4]
spec = importlib.util.spec_from_file_location('package_helpers', HERE.parents[1] / 'standard-profile-isolation/runtime-package-a1/runtime_package.py')
p = importlib.util.module_from_spec(spec)
spec.loader.exec_module(p)
policy_spec = importlib.util.spec_from_file_location('ordinary_policy', HERE / 'prepare-policy.py')
policy_module = importlib.util.module_from_spec(policy_spec)
policy_spec.loader.exec_module(policy_module)
BASE = REPO / 'out/provided-candidate-converged-local-20261024-a40'
OUT = REPO / 'out/provided-candidate-fresh-browser-20261024-a42'
RES = 'Contents/Resources/aux/'
DAEMON = RES + 'apps/daemon/Aux Daemon.app/Contents/'
BUILD = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/unsigned-ordinary-fresh-browser-build-20261024-a42b/receipt.json')


def main():
    p.require(not OUT.exists(), 'Fresh output required')
    p.require(p.sha(BASE / 'receipt.json') == '541925afc00948ee3ef45f7669699cccb215f76c1802b2720ed140daa1ee18e7', 'Exact A40 baseline required')
    baseline = p.read(BASE / 'receipt.json')
    before = p.inventory(BASE / 'Aux.app')
    p.require(baseline['passed'] and before == baseline['files'], 'Baseline changed')
    old = {row['path']: row for row in before}
    build = p.read(BUILD)
    p.require(build['passed'] and build['allInspectedMachoUnsigned'] and build['coldFeatureEnabled'] and
              build['ordinaryFreshNativeStartup'] and not build['privilegedTasksEnabled'], 'Complete ordinary unsigned browser required')
    pins = HERE / 'full-native-input-pins-a2.json'
    p.require(p.sha(pins) == build['nativeInputPinsSha256'], 'Native pin association differs')
    for name, expected in p.read(pins)['files'].items():
        p.require(p.sha(Path(build['source']) / name) == expected, 'Native source changed: ' + name)
    native = Path(build['appPath'])
    native_rows = [{key: ('link' if key == 'type' and value == 'symlink' else value)
                    for key, value in row.items() if key != 'bytes'}
                   for row in p.read(BUILD.parent / 'app-inventory.json')]
    p.require(p.inventory(native) == native_rows, 'Completed native app changed')
    link_path = HERE / 'actual-daemon-build-a4.json'
    link = p.read(link_path)
    p.require(link['passed'] and not link['codeSignatureLoadCommandPresent'] and not link['supervisedTasksEnabled'], 'Main-only native daemon required')
    source_receipt = HERE.parents[1] / 'standard-profile-isolation/ordinary-fresh-browser-startup-a1/source-controls-receipt.json'
    source_pair = p.read(source_receipt)
    p.require(source_pair['baseAnchorCount'] == 217 and source_pair['anchorCountPerLeaf'] == 11 and
              source_pair['allPredecessorBytesPreservedOutsideAnchors'], 'Cumulative source/entry pair required')
    replacements = []

    def replace(relative, source, expected):
        row = old[relative]
        p.require(row['type'] == 'file' and p.sha(source) == expected, 'Pinned regular replacement required')
        if row['sha256'] != expected:
            replacements.append(dict(path=relative, previousSha256=row['sha256'], input=p.ref(source), mode=row['mode']))

    for row in native_rows:
        p.require(old[row['path']]['type'] == row['type'] and old[row['path']]['mode'] == row['mode'], 'Native coverage/type/mode changed')
        if row['type'] == 'file':
            replace(row['path'], native / row['path'], row['sha256'])
        else:
            p.require(row == old[row['path']], 'Native link changed')
    replace(DAEMON + 'MacOS/aux-daemon', Path(link['binary']), link['binarySha256'])
    for row in source_pair['files']:
        name = Path(row['output']).name
        relative = DAEMON + 'Resources/node-development/' + name
        p.require(old[relative]['sha256'] == row['inputSha256'], 'Source/entry predecessor changed')
        replace(relative, Path(row['output']), row['outputSha256'])
    p.require(all(not row['path'].startswith(RES + 'apps/extension/') for row in replacements), 'Supplied UI cannot change')
    inputs = [p.ref(path) for path in [__file__, HERE / 'prepare-policy.py', BASE / 'receipt.json',
              BUILD, BUILD.parent / 'app-inventory.json', pins, link_path, source_receipt]]
    inputs += [row['input'] for row in replacements]
    review = dict(format='aux.ordinary-fresh.package.review.v1', inputs=inputs, replacements=replacements,
        nativeStartupMode='ordinary-fresh-v1', privilegedTasksEnabled=False,
        legacyProfilesAccepted=False, signingApprovalRequired=True, acceptedAppReplaced=False)
    p.write_new(HERE / 'package-review.json', review)
    temporary = Path(tempfile.mkdtemp(prefix='.aux-fresh-browser-', dir=OUT.parent))
    app = temporary / 'Aux.app'
    subprocess.run(['/bin/cp', '-cRpP', str(BASE / 'Aux.app'), str(app)], check=True)
    for row in replacements:
        target = app / row['path']
        p.require(target.is_file() and not target.is_symlink() and p.sha(target) == row['previousSha256'], 'Copied predecessor changed')
        shutil.copyfile(p.pin(row['input']), target)
        target.chmod(row['mode'])
    prepared = policy_module.prepare_policy(app)
    policy_relative = DAEMON + 'Resources/AuxFreshBootstrapPolicy.json'
    marker = app / RES / 'bundle.json'
    bundle = p.read(marker)
    records = {row['path']: row for row in bundle['files']}
    for row in replacements:
        if row['path'].startswith(RES):
            record = records[row['path'].removeprefix(RES)]
            p.require(record['sha256'] == row['previousSha256'], 'Resource metadata predecessor differs')
            record.update(sha256=row['input']['sha256'], changeKinds=['integration'])
    bundle['files'].append(dict(path=policy_relative.removeprefix(RES), type='file', mode=0o644,
        sha256=p.sha(app / policy_relative), changeKinds=['integration'], source='generated ordinary startup policy'))
    bundle.update(finalApp=str(OUT / 'Aux.app'), productionReady=False,
                  nativeStartupMode='ordinary-fresh-v1', daemonRuntime='provided-sea')
    bundle['ordinaryFreshIntegration'] = dict(review=p.ref(HERE / 'package-review.json'),
        authorityWireVersion=6, privilegedTasksEnabled=False, legacyProfilesAccepted=False,
        scope=prepared['scope'], runtimeAcceptance=False, signingApprovalRequired=True)
    marker.write_text(json.dumps(bundle, indent=2) + '\n')
    after = p.inventory(app)
    changed = {row['path'] for row in replacements} | {RES + 'bundle.json', policy_relative}
    p.require([row for row in before if row['path'] not in changed] ==
              [row for row in after if row['path'] not in changed], 'Unrelated app/UI/resource bytes changed')
    actual = {row['path']: row for row in after}
    for row in bundle['files']:
        leaf = actual.get(RES + row['path'])
        kind = 'link' if row['type'] == 'symlink' else row['type']
        p.require(leaf and leaf['type'] == kind and ('mode' not in row or leaf['mode'] == row['mode']) and
                  (leaf.get('sha256') == row.get('sha256') if kind == 'file' else leaf['target'] == row.get('linkTarget', row.get('target'))), 'Resource metadata differs')
    for item in inputs:
        p.pin(item)
    result = dict(format='aux.ordinary-fresh.package.actual.v1', passed=True, files=after,
        inventorySha256=p.digest(after), replacements=replacements, scope=prepared['scope'], policy=prepared['policy'],
        suppliedUiAndUnrelatedResourcesPreserved=True, runtimeAcceptance=False,
        privilegedTasksEnabled=False, legacyProfilesAccepted=False, **{key: False for key in p.FLAGS})
    p.write_new(temporary / 'receipt.json', result)
    temporary.rename(OUT)
    p.write_new(HERE / 'actual-package-a1.json', dict(passed=True, app=str(OUT / 'Aux.app'),
        receipt=p.ref(OUT / 'receipt.json'), inventorySha256=result['inventorySha256'], leaves=len(after),
        scope=prepared['scope'], runtimeAcceptance=False, **{key: False for key in p.FLAGS}))
    print(json.dumps(dict(passed=True, app=str(OUT / 'Aux.app'), leaves=len(after), scope=prepared['scope'], testable=False)))


if __name__ == '__main__':
    main()
