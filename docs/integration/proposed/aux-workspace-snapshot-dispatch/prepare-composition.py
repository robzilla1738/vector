#!/usr/bin/env python3
"""Prepare source-pinned scheduler participant; never apply/build Chromium."""
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
    subprocess.run(['python3', str(HERE / 'verify.py'), '--live'], check=True)
    parent_path = repo / review['parentComposition']
    parent_raw = (parent_path / 'manifest.json').read_bytes()
    assert sha(parent_raw) == review['parentCompositionSha256']
    assert sha((repo / 'scripts/extend-provided-native.py').read_bytes()) == review['extenderSha256']
    parent = json.loads(parent_raw)
    before = {item['path']: item for item in parent['files']}
    assert len(before) == len(parent['files']) == review['parentSourceCount'] == 774
    assert len(parent['binaryAssets']) == review['parentBinaryAssetCount'] == 23
    assert len(review['files']) == 3
    for item in review['files']:
        assert (before[item['path']]['outputSha256'] if item['path'] in before else None) == item['baselineSha256']
    with tempfile.TemporaryDirectory(prefix='aux-snapshot-compose-') as temporary:
        metadata = Path(temporary) / 'metadata.json'
        metadata.write_text(json.dumps({'version': 1, 'files': [
            {'path': item['path'], 'baselineSha256': item['baselineSha256'],
             'outputSha256': item['sourceSha256']} for item in review['files']]}, indent=2) + '\n')
        subprocess.run(['python3', str(repo / 'scripts/extend-provided-native.py'),
                        str(parent_path), '--patch', str(HERE / 'native.patch'),
                        '--metadata', str(metadata), '--output', str(output)], check=True)
        (output / 'workspace-snapshot.patch').write_bytes((HERE / 'native.patch').read_bytes())
        (output / 'workspace-snapshot-metadata.json').write_bytes(metadata.read_bytes())
    result = json.loads((output / 'manifest.json').read_text())
    result['steps'][-1]['patch'] = str(output / 'workspace-snapshot.patch')
    after = {item['path']: item for item in result['files']}
    changes = {item['path']: item for item in review['files']}
    assert len(after) == len(result['files']) == 775
    for path, record in before.items():
        assert after[path]['sourceSha256'] == record['outputSha256']
        assert after[path]['outputSha256'] == (changes[path]['sourceSha256'] if path in changes else record['outputSha256'])
    assert result['steps'][:-1] == parent['steps']
    assert result['binaryAssets'] == [dict(item, baselineSha256=item['replacementSha256'], parentBaselineSha256=item['baselineSha256']) for item in parent['binaryAssets']]
    (output / 'manifest.json').write_text(json.dumps(result, indent=2) + '\n')
    receipt = {'format': 'aux.native.workspace-snapshot-composition.v1',
               'parentSourcesPreserved': 774, 'successorSources': 775,
               'unchangedBinaryAssets': 23, 'modifiedSources': 2, 'newHeaders': 1,
               'parentSha256': sha(parent_raw),
               'successorSha256': sha((output / 'manifest.json').read_bytes()),
               'appliedToNative': False, 'ChromiumTUCompiled': False,
               'allWriterCustodyClaimed': False, 'storageDurabilityClaimed': False}
    (output / 'review-receipt.json').write_text(json.dumps(receipt, indent=2) + '\n')
    print(json.dumps(receipt, indent=2))

if __name__ == '__main__':
    main()
