#!/usr/bin/env python3
"""Compose reviewed worker/app writers and their native owner, without applying."""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[3]

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def extend(parent, lane, records, output):
    metadata = output.parent / (output.name + '-metadata.json')
    metadata.write_text(json.dumps({'version': 1, 'files': [{
        'path': row['path'], 'baselineSha256': row['inputSha256'],
        'outputSha256': row['outputSha256'],
    } for row in records]}, indent=2) + '\n')
    subprocess.run(['python3', str(REPO / 'scripts/extend-provided-native.py'),
                    str(parent), '--patch', str(lane / 'followup.patch'),
                    '--metadata', str(metadata), '--output', str(output),
                    '--staged-base'], check=True)

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    output = args.output.resolve()
    assert not output.exists()
    pins = json.loads((HERE / 'inputs.json').read_text())
    parent = Path(pins['parentManifest'])
    assert sha(parent) == pins['parentManifestSha256']
    prior = REPO / 'docs/integration/proposed/aux-renderer-navigation-gn'
    for row in pins['files']:
        before = (prior / 'source' / row['path']).read_text()
        assert hashlib.sha256(before.encode()).hexdigest() == row['inputSha256']
        after = before
        for edit in row['edits']:
            assert after.count(edit['find']) == edit['count'] == 1
            after = after.replace(edit['find'], edit['replace'])
        source = HERE / 'source' / row['path']
        assert source.read_text() == after and sha(source) == row['outputSha256']
    assert sha(HERE / 'followup.patch') == pins['patchSha256']
    output.mkdir(parents=True)
    current = parent.parent
    all_rows = []
    for label, key in [('worker', 'laneInputs'), ('app', 'appInputs')]:
        path = REPO / pins[key]
        assert sha(path) == pins[key + 'Sha256']
        lane = path.parent
        subprocess.run(['python3', str(lane / 'verify.py')], check=True)
        rows = json.loads(path.read_text())['files']
        target = output / label
        extend(current, lane, rows, target)
        current = target
        all_rows += rows
    target = output / 'owner'
    extend(current, HERE, pins['files'], target)
    all_rows += pins['files']
    final_path = target / 'manifest.json'
    final = json.loads(final_path.read_text())
    original = json.loads(parent.read_text())
    assert len(final['files']) == 808 and len(final['binaryAssets']) == 23
    assert final['binaryAssets'] == original['binaryAssets']
    records = {row['path']: row for row in final['files']}
    for row in all_rows:
        assert records[row['path']]['outputSha256'] == row['outputSha256']
        assert '/views/' not in row['path']
    review = {
        'format': 'aux.worker-app.gn-owner.review.v1',
        'composition': str(target), 'compositionSha256': sha(final_path),
        'sourceRecords': len(final['files']), 'assets': len(final['binaryAssets']),
        'changedSources': [row['path'] for row in all_rows],
        'applied': False, 'compiled': False, 'appRuntimeAccepted': False,
        'viewsOrArtworkChanged': False, 'state2Authorized': False,
        'wholeProfileCustodyClaimed': False,
        'workerCallbacksProveStorageOrThreadExit': False,
    }
    (HERE / 'composition-review.json').write_text(json.dumps(review, indent=2) + '\n')
    print(json.dumps(review))

if __name__ == '__main__':
    main()
