#!/usr/bin/env python3
"""Prepare exact owned-helper follow-up without changing the native checkout."""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess
import tempfile

HERE = Path(__file__).resolve().parent
PARENT = Path('out/native-reuse-composition-aux-carrier-wait-traits')

def sha(raw):
    return hashlib.sha256(raw).hexdigest()

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--artifact-root', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    repo, output = args.artifact_root.resolve(), args.output.resolve()
    pins = json.loads((HERE / 'composition-inputs.json').read_text())
    for path, expected in pins['inputs'].items():
        if sha((repo / path).read_bytes()) != expected:
            raise ValueError('Composition dependency differs: ' + path)
    subprocess.run(['python3', str(HERE / 'verify.py'), '--live'], check=True)
    parent_raw = (repo / PARENT / 'manifest.json').read_bytes()
    parent = json.loads(parent_raw)
    if len(parent['files']) != pins['parentSourceCount'] or len(parent['binaryAssets']) != pins['parentBinaryAssetCount']:
        raise ValueError('Parent inventory count differs')
    before = {item['path']: item for item in parent['files']}
    if len(before) != len(parent['files']):
        raise ValueError('Duplicate predecessor source')
    native = Path(parent['sourceRoot']).resolve()
    if output.exists() or output == native or native in output.parents or output in native.parents:
        raise ValueError('Fresh output outside native checkout required')
    proposal = json.loads((HERE / 'manifest.json').read_text())
    changed = [item for item in proposal['files'] if item['changed']]
    if len(changed) != 5 or sum(item['baselineSha256'] is None for item in changed) != 2:
        raise ValueError('Expected exactly three source edits and two new headers')
    for item in changed:
        previous = before.get(item['path'])
        if (previous['outputSha256'] if previous else None) != item['baselineSha256']:
            raise ValueError('Predecessor output does not match proposal baseline: ' + item['path'])
    records = [{'path': item['path'], 'baselineSha256': item['baselineSha256'],
                'outputSha256': item['sourceSha256']} for item in changed]
    patch = (HERE / 'native.patch').read_bytes()
    with tempfile.TemporaryDirectory(prefix='aux-owned-helper-compose-') as directory:
        temporary = Path(directory)
        patch_path, metadata_path = temporary / 'owned-helpers.patch', temporary / 'metadata.json'
        patch_path.write_bytes(patch)
        metadata_path.write_text(json.dumps({'version': 1, 'files': records}, indent=2) + '\n')
        subprocess.run(['python3', str(repo / 'scripts/extend-provided-native.py'), str(repo / PARENT),
                        '--patch', str(patch_path), '--metadata', str(metadata_path), '--output', str(output)], check=True)
        (output / 'owned-helpers.patch').write_bytes(patch)
        (output / 'owned-helpers-metadata.json').write_bytes(metadata_path.read_bytes())
    result = json.loads((output / 'manifest.json').read_text())
    result['steps'][-1]['patch'] = str(output / 'owned-helpers.patch')
    after = {item['path']: item for item in result['files']}
    changed_by_path = {item['path']: item for item in changed}
    if len(after) != 774 or len(result['files']) != 774:
        raise ValueError('Successor must retain 772 sources and add two headers')
    for path, previous in before.items():
        expected = changed_by_path[path]['sourceSha256'] if path in changed_by_path else previous['outputSha256']
        if after[path]['sourceSha256'] != previous['outputSha256'] or after[path]['outputSha256'] != expected:
            raise ValueError('Parent source custody changed: ' + path)
    for item in changed:
        if item['baselineSha256'] is None and after[item['path']] != {
                'path': item['path'], 'sourceSha256': None, 'outputSha256': item['sourceSha256']}:
            raise ValueError('New header record differs')
    # The extender advances the applied baseline, retaining every exact asset.
    expected_assets = [dict(item, baselineSha256=item['replacementSha256'],
                           parentBaselineSha256=item['baselineSha256']) for item in parent['binaryAssets']]
    if result['binaryAssets'] != expected_assets or result['steps'][:-1] != parent['steps']:
        raise ValueError('Predecessor assets or historical steps changed')
    (output / 'manifest.json').write_text(json.dumps(result, indent=2) + '\n')
    receipt = {'format': 'aux.native.owned-helper-composition-review.v1',
               'parentCompositionSha256': sha(parent_raw),
               'successorCompositionSha256': sha((output / 'manifest.json').read_bytes()),
               'verifiedParentSources': 772, 'successorSources': 774,
               'binaryAssetsUnchanged': 23, 'modifiedExistingSources': 3, 'addedHeaders': 2,
               'appliedToNative': False, 'BrowserPlatformTUCompiled': False,
               'uiChanges': False, 'allWriterCustodyClaimed': False}
    (output / 'review-receipt.json').write_text(json.dumps(receipt, indent=2) + '\n')
    print(json.dumps(receipt, indent=2))

if __name__ == '__main__':
    main()
