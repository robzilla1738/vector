#!/usr/bin/env python3
"""Prepare source-pinned session writer-close participant; never apply/build Chromium."""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess
import tempfile

HERE = Path(__file__).resolve().parent
sha = lambda raw: hashlib.sha256(raw).hexdigest()

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--artifact-root', required=True, type=Path)
    parser.add_argument('--output', required=True, type=Path)
    args = parser.parse_args()
    repo, output = args.artifact_root.resolve(), args.output.resolve()
    review = json.loads((HERE / 'manifest.json').read_text())
    subprocess.run(['python3', str(HERE / 'verify.py'), '--no-live-required'], check=True)
    parent_path = repo / review['parentComposition']
    parent_raw = (parent_path / 'manifest.json').read_bytes()
    assert sha(parent_raw) == review['parentCompositionSha256']
    assert sha((repo / 'scripts/extend-provided-native.py').read_bytes()) == review['extenderSha256']
    parent = json.loads(parent_raw)
    before = {item['path']: item for item in parent['files']}
    assert len(before) == len(parent['files']) == review['parentSourceCount'] == 777
    assert len(parent['binaryAssets']) == review['parentBinaryAssetCount'] == 23
    changes = [item for item in review['files'] if item['changed']]
    assert len(changes) == 8
    for item in changes:
        assert (before[item['path']]['outputSha256'] if item['path'] in before else None) == item['baselineSha256']
    with tempfile.TemporaryDirectory(prefix='aux-snapshot-compose-') as temporary:
        metadata = Path(temporary) / 'metadata.json'
        metadata.write_text(json.dumps({'version': 1, 'files': [
            {'path': item['path'], 'baselineSha256': item['baselineSha256'],
             'outputSha256': item['sourceSha256']} for item in changes]}, indent=2) + '\n')
        subprocess.run(['python3', str(repo / 'scripts/extend-provided-native.py'),
                        str(parent_path), '--staged-base', '--patch', str(HERE / 'native.patch'),
                        '--metadata', str(metadata), '--output', str(output)], check=True)
        (output / 'session-writer-close.patch').write_bytes((HERE / 'native.patch').read_bytes())
        (output / 'session-writer-close-metadata.json').write_bytes(metadata.read_bytes())
    result = json.loads((output / 'manifest.json').read_text())
    result['steps'][-1]['patch'] = str(output / 'session-writer-close.patch')
    after = {item['path']: item for item in result['files']}
    changes = {item['path']: item for item in changes}
    assert len(after) == len(result['files']) == 778
    for path, record in before.items():
        assert after[path]['sourceSha256'] == record['sourceSha256']
        assert after[path]['outputSha256'] == (changes[path]['sourceSha256'] if path in changes else record['outputSha256'])
    assert result['steps'][:-1] == parent['steps']
    assert result['binaryAssets'] == parent['binaryAssets']
    (output / 'manifest.json').write_text(json.dumps(result, indent=2) + '\n')
    receipt = {'format': 'aux.native.session-writer-close-composition.v1',
               'parentSourcesPreserved': 777, 'successorSources': 778,
               'unchangedBinaryAssets': 23, 'modifiedSources': 7, 'newHeaders': 1,
               'parentSha256': sha(parent_raw),
               'successorSha256': sha((output / 'manifest.json').read_bytes()),
               'appliedToNative': False, 'ChromiumTUCompiled': False,
               'allWriterCustodyClaimed': False, 'fsyncClaimed': False}
    (output / 'review-receipt.json').write_text(json.dumps(receipt, indent=2) + '\n')
    print(json.dumps(receipt, indent=2))

if __name__ == '__main__':
    main()
