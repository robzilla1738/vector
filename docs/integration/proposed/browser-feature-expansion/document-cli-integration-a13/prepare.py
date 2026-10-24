"""Flatten narrow native document facts, UTF16 consumption and CLI corrections."""
import hashlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
SCOPE = HERE.parents[1] / 'standard-profile-isolation'
sha = lambda p: hashlib.sha256(Path(p).read_bytes()).hexdigest()
selected, originals, anchors, manifests = {}, {}, {}, []
controller = 'chrome/browser/aux/ui_storage_migration_controller.cc'
for folder_name in ['native-document-token-join-a11', 'ui-native-wire-controller-a12',
                    'native-document-token-bridge-a11b', 'cli-native-owner-compile-fix-a1']:
    folder = SCOPE / folder_name
    manifest = folder / 'source-plan.json'
    plan = json.loads(manifest.read_text())
    manifests.append({'path': str(manifest), 'sha256': sha(manifest)})
    for row in plan['files']:
        name = row['path']
        if folder_name == 'native-document-token-join-a11' and name != controller:
            continue
        if name not in selected:
            target = ROOT / name
            assert (sha(target) if target.exists() else None) == row['inputSha256'], name
            originals[name] = row['inputSha256']
            selected[name] = target.read_text() if target.exists() else ''
            anchors[name] = []
        else:
            assert hashlib.sha256(selected[name].encode()).hexdigest() == row['inputSha256'], name
        source = folder / 'source' / name
        assert sha(source) == row['outputSha256']
        if row['inputSha256'] is not None:
            data = selected[name]
            for anchor in row['anchors']:
                assert data.count(anchor['find']) == anchor['count'], name
                data = data.replace(anchor['find'], anchor['replace'], anchor['count'])
            assert data.encode() == source.read_bytes(), name
            anchors[name].extend(row['anchors'])
        selected[name] = source.read_text()
bridge = json.loads((SCOPE / 'native-document-token-bridge-a11b/source-plan.json').read_text())
for row in bridge['requiredUnchangedNativeOwners']:
    assert sha(ROOT / row['path']) == row['requiredOriginalSha256'], row['path']
for name, find, replace in [
    ('content/public/browser/BUILD.gn', '    "browser_accessibility_state.h",',
     '    "aux_ui_migration_document.h",\n    "browser_accessibility_state.h",'),
    ('content/browser/BUILD.gn', '    "renderer_host/render_frame_host_impl.cc",',
     '    "renderer_host/aux_ui_migration_document.cc",\n    "renderer_host/render_frame_host_impl.cc",')]:
    target = ROOT / name
    data = target.read_text()
    assert data.count(find) == 1
    originals[name] = sha(target)
    anchors[name] = [{'find': find, 'replace': replace, 'count': 1}]
    selected[name] = data.replace(find, replace, 1)
files = []
for name, data in selected.items():
    out = HERE / 'source' / name
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(data)
    files.append({'path': name, 'inputSha256': originals[name], 'outputSha256': sha(out),
                  'anchors': anchors[name]})
assert len(files) == 9
plan = {'format': 'aux.document-cli.integration-source.v1', 'files': files,
        'manifests': manifests, 'unchangedNativeOwners': bridge['requiredUnchangedNativeOwners'],
        'nativeCheckoutChanged': False, 'newVirtualsIntroduced': False,
        'productExecuted': False, 'runtimeAcceptance': False}
(HERE / 'source-plan.json').write_text(json.dumps(plan, indent=2) + '\n')
print(json.dumps({'files': len(files), 'controllerSha256': sha(HERE / 'source' / controller)}))
