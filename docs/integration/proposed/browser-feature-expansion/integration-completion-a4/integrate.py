"""Project reviewed physical interfaces and compile their real generated consumers."""
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[4]
ROOT = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
OUT = ROOT.parent / 'native-integration-completion-20261024-a4'
OVERLAY = Path('/private/tmp/aux-integration-completion-overlay-20261024-a4')
sha = lambda path: hashlib.sha256(Path(path).read_bytes()).hexdigest()


def main():
    OUT.mkdir(mode=0o700)
    OVERLAY.mkdir(mode=0o700)
    prior_path = HERE.parent / 'completion-batch-a3/source-composition.json'
    prior = json.loads(prior_path.read_text())
    selected = dict(prior['selectedFiles'])
    for name, row in selected.items():
        assert sha(row['path']) == row['sha256'] == sha(ROOT / name), name
    originals, inputs, units = {}, [], []
    folders = [HERE.parent / 'profile-initializer-placement-a1',
               HERE.parents[1] / 'standard-profile-isolation/native-profile-migration-controller-a4']
    for folder in folders:
        manifest = folder / 'source-plan.json'
        inputs.append({'path': str(manifest), 'sha256': sha(manifest)})
        for row in json.loads(manifest.read_text())['files']:
            name = row['path']
            assert name not in originals
            source = folder / 'source' / name
            assert sha(ROOT / name) == row['inputSha256'], name
            assert sha(source) == row['outputSha256'], name
            text = (ROOT / name).read_text()
            for anchor in row['anchors']:
                assert text.count(anchor['find']) == anchor['count'], name
                text = text.replace(anchor['find'], anchor['replace'], anchor['count'])
            assert text.encode() == source.read_bytes(), name
            originals[name] = row['inputSha256']
            selected[name] = {'path': str(source), 'sha256': row['outputSha256'],
                              'inputSha256': row['inputSha256'], 'changed': True}
            if name.endswith('.cc'):
                units.append(name)
    assert len(originals) == 11 and len(units) == 5
    for name, row in selected.items():
        if row['changed']:
            target = OVERLAY / name
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(row['path'], target)
            selected[name] = {**row, 'path': str(target)}
    composition = {'format': 'aux.integration-completion.native-composition.v1', 'passed': True,
                   'priorComposition': str(prior_path), 'priorCompositionSha256': sha(prior_path),
                   'manifests': inputs, 'laneFiles': units, 'selectedFiles': selected,
                   'overlay': str(OVERLAY), 'changedFileCount': sum(row['changed'] for row in selected.values()),
                   'selectedFileCount': len(selected), 'nativeCheckoutChanged': False,
                   'productExecuted': False, 'runtimeAcceptance': False, 'authorityWireVersion': 6}
    (HERE / 'source-composition.json').write_text(json.dumps(composition, indent=2) + '\n')
    previous_receipt = ROOT.parent / 'unsigned-feature-completion-browser-build-20261024-a3b/receipt.json'
    previous = json.loads(previous_receipt.read_text())
    assert previous['passed'] and previous['allInspectedMachoUnsigned']
    inventory = json.loads((previous_receipt.parent / 'app-inventory.json').read_text())
    app = Path(previous['appPath'])
    backup = OUT / 'previous-native-a3/Aux.app'
    backup.parent.mkdir()
    subprocess.run(['/bin/cp', '-cRpP', str(app), str(backup)], check=True)
    for row in inventory:
        for base in [app, backup]:
            path = base / row['path']
            if row['type'] == 'file':
                assert not path.is_symlink() and sha(path) == row['sha256']
            else:
                assert path.is_symlink() and os.readlink(path) == row['target']
    for name, expected in originals.items():
        target = OUT / 'before' / name
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(ROOT / name, target)
        assert sha(target) == expected
    record = {'format': 'aux.integration-completion.native-projection.actual.v1', 'passed': False,
              'predecessorNativeReceipt': str(previous_receipt), 'predecessorNativeReceiptSha256': sha(previous_receipt),
              'preservedNativeApp': str(backup), 'sourceBeforeImages': str(OUT / 'before'),
              'originals': originals, 'projected': [], 'ownerChangesReset': False,
              'productExecuted': False, 'acceptedAppReplaced': False}
    receipt = HERE / 'actual-projection-a1.json'
    try:
        for name, expected in originals.items():
            assert sha(ROOT / name) == expected and not (ROOT / name).is_symlink()
            row = selected[name]
            assert sha(row['path']) == row['sha256']
            shutil.copy2(row['path'], ROOT / name)
            assert sha(ROOT / name) == row['sha256']
            record['projected'].append(name)
            receipt.write_text(json.dumps(record, indent=2) + '\n')
        for name, row in selected.items():
            assert sha(ROOT / name) == row['sha256'], name
        record['passed'] = True
    finally:
        receipt.write_text(json.dumps(record, indent=2) + '\n')
    print(json.dumps({'projectionPassed': True, 'files': len(originals),
                      'changed': composition['changedFileCount'], 'selected': len(selected)}), flush=True)
    headers = ['gen/components/services/storage/public/mojom/' + name + '.mojom.h'
               for name in ['local_storage_control', 'session_storage_control']]
    command = [str(ROOT / 'third_party/ninja/ninja'), '-C', str(ROOT / 'out/AuxFast'), '-j4', *headers]
    generated = subprocess.run(command, capture_output=True)
    (OUT / 'generated.stdout').write_bytes(generated.stdout)
    (OUT / 'generated.stderr').write_bytes(generated.stderr)
    generation = {'passed': generated.returncode == 0, 'command': command, 'exitCode': generated.returncode,
                  'headers': {name: sha(ROOT / 'out/AuxFast' / name) for name in headers} if not generated.returncode else {},
                  'productExecuted': False, 'fullBrowserBuilt': False}
    (HERE / 'actual-generation-a1.json').write_text(json.dumps(generation, indent=2) + '\n')
    if generated.returncode:
        print(generated.stderr.decode(errors='replace')[-4000:])
        return generated.returncode
    return subprocess.call([sys.executable, str(HERE / 'compile.py')], cwd=REPO)


if __name__ == '__main__':
    raise SystemExit(main())
