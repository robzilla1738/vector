"""Assemble one current linked tuple, preserving the accepted app and UI."""
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
SCOPE = HERE.parents[1] / 'standard-profile-isolation'
spec = importlib.util.spec_from_file_location('package_helpers', SCOPE / 'runtime-package-a1/runtime_package.py')
p = importlib.util.module_from_spec(spec)
spec.loader.exec_module(p)
BASE = ROOT / 'out/provided-candidate-desktop-completion-20261024-a3'
OUT = ROOT / 'out/provided-candidate-converged-local-20261024-a40'
RES = 'Contents/Resources/aux/'
DAEMON = RES + 'apps/daemon/Aux Daemon.app/Contents/'
CLI = RES + 'apps/cli/Aux CLI.app/Contents/MacOS/aux-cli'


def main():
    p.require(not OUT.exists(), 'Fresh output required')
    base = p.read(BASE / 'receipt.json')
    p.require(p.sha(BASE / 'receipt.json') == 'ee76d98d8a18d4a1d885ebf8eb7020adc61344604416675c6f854f70ed95f211', 'Exact A3 predecessor required')
    before = p.inventory(BASE / 'Aux.app')
    p.require(base['passed'] and before == base['files'] and p.digest(before) == base['inventorySha256'], 'Predecessor differs')
    old = {row['path']: row for row in before}
    completion_path = HERE.parent / 'native-phase-integration-a24/full-build-completion-a1.json'
    completion = p.read(completion_path)
    build_path = Path(completion['nativeBuildReceipt'])
    p.require(p.sha(build_path) == completion['nativeBuildReceiptSha256'], 'Native receipt differs')
    build = p.read(build_path)
    p.require(build['passed'] and build['allInspectedMachoUnsigned'] and build['machoCount'] == 16 and not build['coldFeatureEnabled'], 'Exact completed unsigned A24 required')
    native = Path(completion['preservedNativeApp'])
    native_inventory_path = build_path.parent / 'app-inventory.json'
    p.require(p.sha(native_inventory_path) == build['appInventoryFileSha256'], 'Native inventory receipt differs')
    native_rows = [{key: ('link' if key == 'type' and value == 'symlink' else value)
                    for key, value in row.items() if key != 'bytes'}
                   for row in p.read(native_inventory_path)]
    p.require(p.inventory(native) == native_rows, 'Frozen A24 native app differs')
    stage_path = HERE / 'actual-ui-stage-a1.json'
    stage = p.read(stage_path)
    p.require(stage['passed'] and stage['agentRevision'] == 33 and stage['stylesAssetsFontsModesAndOtherBytesPreserved'], 'Current UI stage required')
    stage_root = Path(stage['output'])
    p.require(p.sha(stage_root / 'manifest.json') == stage['stageManifestSha256'], 'UI manifest differs')
    ui = p.inventory(stage_root / 'agent')
    ui_prefix = RES + 'apps/extension/dist/'
    p.require({row['path'] for row in ui} == {name.removeprefix(ui_prefix) for name in old if name.startswith(ui_prefix)}, 'UI coverage changed')
    projection_path = HERE.parent / 'productivity-adapter-pairing-a2/actual-projection.json'
    projection = p.read(projection_path)
    p.require(projection['passed'] and projection['independentEntryMatchesProjection'] and projection['allOtherLatestSourceBytesPreserved'], 'Cumulative source pair required')
    for relative, key in [('Resources/node-development/index.mjs', 'sourceSha256'),
                          ('Resources/node-development/aux-native-entry.mjs', 'entrySha256'),
                          ('Resources/native/aux-owned-native.cjs', 'loaderSha256')]:
        p.require(p.sha(BASE / 'Aux.app' / (DAEMON + relative)) == projection[key], 'Current source/entry/loader pair differs')
    link_path = SCOPE / 'ui-journal-readonly-inventory-a26/actual-daemon-link-a1.json'
    link_inputs = SCOPE / 'ui-journal-readonly-inventory-a26/actual-daemon-link-inputs-a1.json'
    link = p.read(link_path)
    daemon = Path(link['output']) / 'Aux Daemon'
    p.require(link['passed'] and not link['codeSignatureLoadCommandPresent'] and not link['productExecuted'] and
              p.sha(daemon) == link['binarySha256'] and p.sha(link_inputs) == link['inputManifestSha256'], 'Actual A26 daemon differs')
    cli_path = HERE.parent / 'cli-unsigned-integration-a20/preserved-cli-artifact.json'
    cli = p.read(cli_path)
    p.require(cli['passed'] and not cli['productSigned'] and not cli['productExecuted'] and p.sha(Path(cli['artifact'])) == cli['sha256'], 'Actual native CLI differs')
    replacements = []

    def replace(relative, source, expected):
        row = old[relative]
        p.require(row['type'] == 'file' and p.sha(source) == expected, 'Regular pinned replacement required: ' + relative)
        if row['sha256'] != expected:
            replacements.append(dict(path=relative, previousSha256=row['sha256'], input=p.ref(source), mode=row['mode']))

    for row in native_rows:
        p.require(row['path'] in old and old[row['path']]['mode'] == row['mode'] and old[row['path']]['type'] == row['type'], 'Native coverage/mode changed')
        if row['type'] == 'link':
            p.require(old[row['path']] == row, 'Native link changed')
        else:
            replace(row['path'], native / row['path'], row['sha256'])
    for row in ui:
        p.require(old[ui_prefix + row['path']]['mode'] == row['mode'], 'UI mode changed')
        replace(ui_prefix + row['path'], stage_root / 'agent' / row['path'], row['sha256'])
    replace(DAEMON + 'MacOS/aux-daemon', daemon, link['binarySha256'])
    replace(CLI, Path(cli['artifact']), cli['sha256'])
    p.require(len({row['path'] for row in replacements}) == len(replacements), 'Duplicate replacement')
    p.require(all(row['path'].endswith('.js') or row['path'].endswith('/manifest.json') for row in replacements if row['path'].startswith(ui_prefix)), 'UI styles/assets/fonts cannot change')
    inputs = [p.ref(path) for path in [__file__, BASE / 'receipt.json', completion_path, build_path,
              native_inventory_path, stage_path, stage_root / 'manifest.json', projection_path,
              link_path, link_inputs, cli_path, SCOPE / 'runtime-package-a1/runtime_package.py']]
    inputs += [row['input'] for row in replacements]
    limitations = [
        'Launcher refuses state identity v2 pending native acceptance; no acceptance marker is fabricated.',
        'Protected native startup is compiled off; ordinary fallback Node entry remains quarantined.',
        'Fresh profile feature admission and native CLI listener are unavailable on that startup route.',
        'Products remain unsigned; native CLI also requires actual code identity validation.',
        'Advanced migration/restart recovery and task-capability proposals are not selected.',
        'Actual app journeys and visual comparison remain unverified.'
    ]
    review = dict(format='aux.converged-local.package.review.v1', replacements=replacements, inputs=inputs,
                  nativeBuild=p.ref(build_path), uiStage=p.ref(stage_path), daemonLink=p.ref(link_path),
                  cliLink=p.ref(cli_path), sourceProjection=p.ref(projection_path), authorityWireVersion=6,
                  coldFeatureEnabled=False, knownLimitations=limitations, **{key: False for key in p.FLAGS})
    p.write_new(HERE / 'package-review.json', review)
    temporary = Path(tempfile.mkdtemp(prefix='.aux-converged-local-', dir=OUT.parent))
    try:
        app = temporary / 'Aux.app'
        subprocess.run(['/bin/cp', '-cRpP', str(BASE / 'Aux.app'), str(app)], check=True)
        for row in replacements:
            target = app / row['path']
            p.require(target.is_file() and not any(parent.is_symlink() for parent in [target, *target.parents] if parent != app) and p.sha(target) == row['previousSha256'], 'Copied predecessor differs')
            shutil.copyfile(p.pin(row['input']), target)
            target.chmod(row['mode'])
        marker = app / RES / 'bundle.json'
        bundle = p.read(marker)
        records = {row['path']: row for row in bundle['files']}
        for row in replacements:
            if row['path'].startswith(RES):
                record = records[row['path'].removeprefix(RES)]
                p.require(record['sha256'] == row['previousSha256'], 'Metadata predecessor differs')
                record.update(sha256=row['input']['sha256'], changeKinds=['integration'])
        bundle.update(finalApp=str(OUT / 'Aux.app'), productionReady=False)
        bundle['convergedLocalIntegration'] = dict(review=p.ref(HERE / 'package-review.json'),
            authorityWireVersion=6, coldFeatureEnabled=False, runtimeAcceptance=False,
            knownLimitations=limitations, **{key: False for key in p.FLAGS})
        marker.write_text(json.dumps(bundle, indent=2) + '\n')
        after = p.inventory(app)
        changed = {row['path'] for row in replacements} | {RES + 'bundle.json'}
        p.require(len(after) == len(before) and [row for row in before if row['path'] not in changed] ==
                  [row for row in after if row['path'] not in changed], 'Unrelated UI/runtime/resource bytes changed')
        actual = {row['path']: row for row in after}
        for row in replacements:
            p.require(actual[row['path']] == dict(path=row['path'], type='file', sha256=row['input']['sha256'], mode=row['mode']), 'Replacement differs')
        for row in bundle['files']:
            leaf = actual.get(RES + row['path'])
            kind = 'link' if row['type'] == 'symlink' else row['type']
            p.require(leaf and leaf['type'] == kind and ('mode' not in row or leaf['mode'] == row['mode']) and
                      (leaf.get('sha256') == row.get('sha256') if kind == 'file' else leaf['target'] == row.get('linkTarget', row.get('target'))), 'Resource metadata differs')
        for item in inputs:
            p.pin(item)
        result = dict(format='aux.converged-local.package.actual.v1', passed=True, files=after,
            inventorySha256=p.digest(after), review=p.ref(HERE / 'package-review.json'), replacements=len(replacements),
            stylesAssetsFontsAndUnrelatedResourcesPreserved=True, runtimeAcceptance=False,
            knownLimitations=limitations, **{key: False for key in p.FLAGS})
        p.write_new(temporary / 'receipt.json', result)
        temporary.rename(OUT)
        p.write_new(HERE / 'actual-package-a1.json', dict(passed=True, app=str(OUT / 'Aux.app'),
            receipt=p.ref(OUT / 'receipt.json'), inventorySha256=result['inventorySha256'], leaves=len(after),
            replacements=len(replacements), runtimeAcceptance=False, **{key: False for key in p.FLAGS}))
        print(json.dumps(dict(passed=True, app=str(OUT / 'Aux.app'), leaves=len(after), replacements=len(replacements), testable=False)))
    except Exception as error:
        p.write_new(temporary / 'failure.json', dict(passed=False, error=str(error), productExecuted=False))
        raise


if __name__ == '__main__':
    main()
