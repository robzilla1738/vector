#!/usr/bin/env python3
"""Register the two reviewed headers in a dry native composition only."""
import argparse
import hashlib
import json
from pathlib import Path
import runpy
import subprocess
import tempfile

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[3]
PARENT = REPO / 'out/native-reuse-composition-aux-session-write-completion'
PARENT_SHA = 'b5f03a24aeeb931f9cf248334dbcd24e1e15e0316cb86cc76b0b42b6e6235298'
sha = lambda raw: hashlib.sha256(raw).hexdigest()

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', required=True, type=Path)
    args = parser.parse_args()
    output = args.output.resolve()
    raw = (PARENT / 'manifest.json').read_bytes()
    assert sha(raw) == PARENT_SHA
    parent = json.loads(raw)
    helper = runpy.run_path(str(REPO / 'scripts/extend-provided-native.py'))
    native = Path(parent['sourceRoot'])
    inputs = {Path(item['path']): helper['read_source'](native, Path(item['path']))
              for item in parent['files']}
    assert len(inputs) == 776
    for item in parent['files']:
        value = inputs[Path(item['path'])]
        assert (sha(value) if value is not None else None) == item['sourceSha256']
    gn = Path('components/sessions/BUILD.gn')
    assert gn not in inputs
    inputs[gn] = helper['read_source'](native, gn)
    parent_patch = (PARENT / 'combined.patch').read_bytes()
    assert sha(parent_patch) == parent['combinedPatchSha256']
    with tempfile.TemporaryDirectory(prefix='aux-session-gn-') as temporary:
        copy = Path(temporary).resolve()
        helper['seed'](copy, inputs)
        helper['apply'](copy, parent_patch)
        edits = [
            (Path('chrome/browser/ui/BUILD.gn'),
             '      "aux_profile_switch_session_rebuild.h",\n',
             '      "aux_profile_switch_session_rebuild.h",\n      "aux_workspace_snapshot_dispatch.h",\n'),
            (gn, '    "core/session_types.h",\n',
             '    "core/session_types.h",\n    "core/session_write_completion.h",\n'),
        ]
        before, after, metadata = {}, {}, []
        for name, anchor, replacement in edits:
            value = helper['read_source'](copy, name)
            text = value.decode()
            assert text.count(anchor) == 1
            header = ('aux_workspace_snapshot_dispatch.h' if name != gn
                      else 'core/session_write_completion.h')
            assert header not in text
            changed = text.replace(anchor, replacement).encode()
            before[name], after[name] = value, changed
            metadata.append({'path': str(name), 'baselineSha256': sha(value),
                             'outputSha256': sha(changed)})
        # Existing public dependency exposes the shared session headers; no
        # new target dependency or altered visibility is needed.
        assert 'public_deps = [\n      ":shared",' in before[gn].decode()
        patch = helper['cumulative_patch'](before, after)
    if output.exists():
        raise ValueError('A fresh output is required')
    with tempfile.TemporaryDirectory(prefix='aux-session-gn-metadata-') as temporary:
        patch_path = Path(temporary) / 'headers.patch'
        metadata_path = Path(temporary) / 'metadata.json'
        patch_path.write_bytes(patch)
        metadata_path.write_text(json.dumps({'version': 1, 'files': metadata}, indent=2) + '\n')
        subprocess.run(['python3', str(REPO / 'scripts/extend-provided-native.py'),
                        str(PARENT), '--staged-base', '--patch', str(patch_path),
                        '--metadata', str(metadata_path), '--output', str(output)], check=True)
        (output / 'headers.patch').write_bytes(patch)
        (output / 'headers-metadata.json').write_bytes(metadata_path.read_bytes())
    manifest_path = output / 'manifest.json'
    result = json.loads(manifest_path.read_text())
    result['steps'][-1]['patch'] = str(output / 'headers.patch')
    assert len(result['files']) == 777
    assert result['steps'][:-1] == parent['steps']
    assert result['binaryAssets'] == parent['binaryAssets']
    manifest_path.write_text(json.dumps(result, indent=2) + '\n')
    receipt = {'format': 'aux.native.session-write-gn.v1',
               'parentSha256': PARENT_SHA, 'parentSources': 776,
               'successorSources': 777, 'gnFilesChanged': 2,
               'headersRegistered': 2, 'binaryAssetsUnchanged': 23,
               'successorSha256': sha(manifest_path.read_bytes()),
               'appliedToNative': False, 'gnGenerated': False,
               'browserLinked': False, 'appActivated': False}
    (output / 'review-receipt.json').write_text(json.dumps(receipt, indent=2) + '\n')
    print(json.dumps(receipt, indent=2))

if __name__ == '__main__':
    main()
