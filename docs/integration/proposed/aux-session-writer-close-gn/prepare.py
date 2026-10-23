#!/usr/bin/env python3
"""Register the owned-session admission header without modifying Chromium."""
import argparse
import hashlib
import json
from pathlib import Path
import runpy
import subprocess
import tempfile

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[3]
PARENT = REPO / 'out/native-reuse-composition-aux-session-writer-close'
PARENT_SHA = '014f0961182c8360133d484408e9b5ea4a03a419175d4252b2247b9df05e5097'
sha = lambda raw: hashlib.sha256(raw).hexdigest()

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', required=True, type=Path)
    args = parser.parse_args()
    parent_raw = (PARENT / 'manifest.json').read_bytes()
    assert sha(parent_raw) == PARENT_SHA
    parent = json.loads(parent_raw)
    assert len(parent['files']) == 778
    assert len(parent['binaryAssets']) == 23
    name = Path('components/sessions/BUILD.gn')
    record = next(item for item in parent['files'] if item['path'] == str(name))
    helper = runpy.run_path(str(REPO / 'scripts/extend-provided-native.py'))
    original = helper['read_source'](Path(parent['sourceRoot']), name)
    assert sha(original) == record['sourceSha256']
    parent_patch = (PARENT / 'combined.patch').read_bytes()
    assert sha(parent_patch) == parent['combinedPatchSha256']
    with tempfile.TemporaryDirectory(prefix='aux-session-writer-gn-') as temporary:
        copy = Path(temporary).resolve()
        helper['seed'](copy, {name: original})
        helper['git'](copy, ['--check', '--include=' + str(name)], parent_patch)
        helper['git'](copy, ['--include=' + str(name)], parent_patch)
        before = helper['read_source'](copy, name)
    assert sha(before) == record['outputSha256']
    anchor = '    "core/session_write_completion.h",\n'
    assert before.decode().count(anchor) == 1
    assert 'core/session_writer_admission.h' not in before.decode()
    after = before.decode().replace(anchor, anchor + '    "core/session_writer_admission.h",\n').encode()
    patch = helper['cumulative_patch']({name: before}, {name: after})
    metadata = json.dumps({'version': 1, 'files': [
        {'path': str(name), 'baselineSha256': sha(before), 'outputSha256': sha(after)}
    ]}, indent=2).encode() + b'\n'
    for path, value in [(HERE / 'registration.patch', patch), (HERE / 'metadata.json', metadata)]:
        if path.exists() and path.read_bytes() != value:
            raise ValueError('Refusing changed reviewed registration artifact')
        path.write_bytes(value)
    output = args.output.resolve()
    subprocess.run(['python3', str(REPO / 'scripts/extend-provided-native.py'),
                    str(PARENT), '--staged-base', '--patch', str(HERE / 'registration.patch'),
                    '--metadata', str(HERE / 'metadata.json'), '--output', str(output)], check=True)
    result_raw = (output / 'manifest.json').read_bytes()
    result = json.loads(result_raw)
    assert len(result['files']) == 778
    assert result['binaryAssets'] == parent['binaryAssets']
    assert result['steps'][:-1] == parent['steps']
    receipt = {'format': 'aux.native.session-writer-close-gn.v1',
               'parentSha256': PARENT_SHA, 'successorSha256': sha(result_raw),
               'sourceRecords': 778, 'binaryAssetsUnchanged': 23,
               'gnFilesChanged': 1, 'headersRegistered': 1,
               'appliedToNative': False, 'gnGenerated': False,
               'browserLinked': False, 'appActivated': False}
    (output / 'review-receipt.json').write_text(json.dumps(receipt, indent=2) + '\n')
    print(json.dumps(receipt, indent=2))

if __name__ == '__main__':
    main()
