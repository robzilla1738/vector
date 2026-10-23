#!/usr/bin/env python3
"""Combine the reviewed native participants without applying or building them."""
import argparse
import hashlib
import json
from pathlib import Path
import runpy
import subprocess
import tempfile

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[3]
sha = lambda raw: hashlib.sha256(raw).hexdigest()

def replace_once(text, before, after):
    if text.count(before) != 1:
        raise ValueError('Native GN registration anchor differs')
    return text.replace(before, after)

def extend(parent, patch, metadata, output):
    before = json.loads((parent / 'manifest.json').read_text())
    subprocess.run(['python3', str(REPO / 'scripts/extend-provided-native.py'),
                    str(parent), '--staged-base', '--patch', str(patch),
                    '--metadata', str(metadata), '--output', str(output)], check=True)
    after = json.loads((output / 'manifest.json').read_text())
    allowed = {item['path']: item for item in json.loads(metadata.read_text())['files']}
    old = {item['path']: item for item in before['files']}
    new = {item['path']: item for item in after['files']}
    assert set(new) == set(old) | set(allowed)
    for name, record in old.items():
        assert new[name]['sourceSha256'] == record['sourceSha256']
        assert new[name]['outputSha256'] == (allowed[name]['outputSha256']
                if name in allowed else record['outputSha256'])
    assert after['binaryAssets'] == before['binaryAssets']
    assert after['steps'][:-1] == before['steps']
    return output

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    output = args.output.resolve()
    if output.exists():
        raise ValueError('A fresh composition directory is required')
    pins = json.loads((HERE / 'inputs.json').read_text())
    parent = REPO / pins['parent']
    parent_raw = (parent / 'manifest.json').read_bytes()
    assert sha(parent_raw) == pins['parentSha256']
    assert sha((REPO / 'scripts/extend-provided-native.py').read_bytes()) == pins['extenderSha256']
    assert len(json.loads(parent_raw)['files']) == 779
    worker = REPO / 'docs/integration/proposed/aux-service-worker-start-admission'
    profile = REPO / 'docs/integration/proposed/aux-async-profile-creation-admission'
    assert sha((worker / 'manifest.json').read_bytes()) == pins['workerManifestSha256']
    assert sha((profile / 'inputs.json').read_bytes()) == pins['profileInputsSha256']
    native = Path(json.loads(parent_raw)['sourceRoot'])
    for item in pins['gnNativeInputs']:
        assert sha((native / item['path']).read_bytes()) == item['sha256']
    for item in pins['sources']:
        assert sha((HERE / 'source' / item['path']).read_bytes()) == item['sha256']
    output.mkdir(parents=True)
    for name, directory, manifest_name, patch_name in [
        ('workers', worker, 'manifest.json', 'native.patch'),
        ('profiles', profile, 'inputs.json', 'followup.patch'),
    ]:
        records = json.loads((directory / manifest_name).read_text())['files']
        metadata = {'version': 1, 'files': [{
            'path': item['path'],
            'baselineSha256': item['baselineSha256'] if name == 'workers' else item['inputSha256'],
            'outputSha256': item['sourceSha256'] if name == 'workers' else item['outputSha256'],
        } for item in records]}
        metadata_path = output / (name + '-metadata.json')
        metadata_path.write_text(json.dumps(metadata, indent=2) + '\n')
        parent = extend(parent, directory / patch_name, metadata_path, output / name)

    combined = json.loads((parent / 'manifest.json').read_text())
    by_path = {item['path']: item for item in combined['files']}
    helper = runpy.run_path(str(REPO / 'scripts/extend-provided-native.py'))
    gn_names = [item['path'] for item in pins['gnNativeInputs']]
    before, after = {}, {}
    with tempfile.TemporaryDirectory(prefix='aux-owned-browser-gn-') as temporary:
        copy = Path(temporary).resolve()
        for name in gn_names:
            original = (native / name).read_bytes()
            helper['seed'](copy, {Path(name): original})
        patch = (parent / 'combined.patch').read_bytes()
        assert sha(patch) == combined['combinedPatchSha256']
        includes = ['--include=' + name for name in gn_names]
        helper['git'](copy, ['--check', *includes], patch)
        helper['git'](copy, includes, patch)
        for name in gn_names:
            before[Path(name)] = (copy / name).read_bytes()
            if name in by_path:
                assert sha(before[Path(name)]) == by_path[name]['outputSha256']
            after[Path(name)] = before[Path(name)]

    ui = Path('chrome/browser/ui/BUILD.gn')
    anchor = '      "aux_workspace_snapshot_dispatch.h",\n'
    text = replace_once(after[ui].decode(), anchor, anchor +
            '      "aux_session_writer_participant.h",\n')
    anchor = '    sources += get_target_outputs(":webui_name_variants")\n'
    text = replace_once(text, anchor, anchor +
            '\n    if (enable_aux_browser && is_mac && enable_extensions) {\n'
            '      sources += [\n'
            '        "aux_owned_browser_quiesce.cc",\n'
            '        "aux_owned_browser_quiesce.h",\n'
            '      ]\n'
            '    }\n')
    anchor = '    "//chrome/browser/aux:platform",\n'
    assert '"//chrome/browser/profiles:profile_manager"' not in text
    after[ui] = replace_once(text, anchor, anchor +
            '    "//chrome/browser/profiles:profile_manager",\n').encode()
    profiles_gn = Path('chrome/browser/profiles/BUILD.gn')
    text = after[profiles_gn].decode()
    start = text.index('source_set("profile_manager") {')
    end = text.index('\nsource_set(', start + 1)
    target = text[start:end]
    revised = replace_once(target, '  deps = [\n',
            '  if (enable_aux_browser && is_mac) {\n'
            '    sources += [\n'
            '      "aux_async_profile_creation_admission.cc",\n'
            '      "aux_async_profile_creation_admission.h",\n'
            '    ]\n'
            '  }\n\n  deps = [\n')
    after[profiles_gn] = replace_once(text, target, revised).encode()
    extensions_gn = Path('extensions/browser/BUILD.gn')
    anchor = '    "service_worker/service_worker_keepalive.h",\n'
    after[extensions_gn] = replace_once(after[extensions_gn].decode(), anchor,
            anchor + '    "service_worker/service_worker_start_admission.h",\n').encode()
    for item in pins['sources']:
        name = Path(item['path'])
        before[name] = None
        after[name] = (HERE / 'source' / name).read_bytes()
    patch_path, metadata_path = output / 'owner.patch', output / 'owner-metadata.json'
    patch_path.write_bytes(helper['cumulative_patch'](before, after))
    metadata_path.write_text(json.dumps({'version': 1, 'files': [{
        'path': str(name), 'baselineSha256': sha(raw) if raw is not None else None,
        'outputSha256': sha(after[name]),
    } for name, raw in sorted(before.items())]}, indent=2) + '\n')
    final = extend(parent, patch_path, metadata_path, output / 'owner')
    final_raw = (final / 'manifest.json').read_bytes()
    final_manifest = json.loads(final_raw)
    changes = [item['path'] for item in final_manifest['files']
               if item['sourceSha256'] != item['outputSha256']]
    assert not any('/views/' in name or name.endswith(('.css', '.svg', '.png'))
                   for name in changes)
    assert all(item['baselineSha256'] == item['replacementSha256']
               for item in final_manifest['binaryAssets'])
    receipt = {'format': 'aux.owned-browser-quiesce.composition.v1',
               'composition': str(final), 'manifestSha256': sha(final_raw),
               'sourceRecords': len(final_manifest['files']),
               'binaryAssetsUnchanged': len(final_manifest['binaryAssets']),
               'changedSources': changes, 'appliedToNative': False,
               'compiled': False, 'wholeProfileCustodyClaimed': False}
    (output / 'review-receipt.json').write_text(json.dumps(receipt, indent=2) + '\n')
    print(json.dumps(receipt, indent=2))

if __name__ == '__main__':
    main()
