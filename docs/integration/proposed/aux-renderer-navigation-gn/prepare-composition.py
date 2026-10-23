#!/usr/bin/env python3
"""Compose reviewed renderer admission and its native owner without applying."""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[3]


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def metadata(records):
    return {'version': 1, 'files': [{
        'path': item['path'],
        'baselineSha256': item['inputSha256'],
        'outputSha256': item['outputSha256'],
    } for item in records]}


def extend(parent, patch, record, output, staged=False):
    command = [
        'python3', str(REPO / 'scripts/extend-provided-native.py'), str(parent),
        '--patch', str(patch), '--metadata', str(record), '--output', str(output),
    ]
    if staged:
        command.append('--staged-base')
    subprocess.run(command, check=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    output = args.output.resolve()
    assert not output.exists()
    pins = json.loads((HERE / 'inputs.json').read_text())
    parent = Path(pins['parentManifest'])
    assert sha(parent.read_bytes()) == pins['parentManifestSha256']
    native = Path(pins['nativeSourceRoot'])
    lane_inputs = REPO / pins['laneInputs']
    assert sha(lane_inputs.read_bytes()) == pins['laneInputsSha256']
    lane = lane_inputs.parent
    renderer = json.loads(lane_inputs.read_text())
    subprocess.run(['python3', str(lane / 'verify.py')], check=True)

    for item in pins['files']:
        before = (native / item['path']).read_bytes()
        assert sha(before) == item['inputSha256'], item['path']
        after = before.decode()
        for edit in item['edits']:
            assert after.count(edit['find']) == edit['count'] == 1
            after = after.replace(edit['find'], edit['replace'])
        source = (HERE / 'source' / item['path']).read_bytes()
        assert after.encode() == source
        assert sha(source) == item['outputSha256']
    assert sha((HERE / 'followup.patch').read_bytes()) == pins['patchSha256']
    changed = [item['path'] for item in renderer['files'] + pins['files']]
    assert len(changed) == len(set(changed)) == 9
    assert not any('/views/' in path for path in changed)

    output.mkdir(parents=True)
    lane_metadata = output / 'renderer-metadata.json'
    lane_metadata.write_text(json.dumps(metadata(renderer['files']), indent=2) + '\n')
    renderer_output = output / 'renderer'
    extend(parent.parent, lane / 'followup.patch', lane_metadata, renderer_output)
    owner_metadata = output / 'owner-metadata.json'
    owner_metadata.write_text(json.dumps(metadata(pins['files']), indent=2) + '\n')
    owner_output = output / 'owner'
    extend(renderer_output, HERE / 'followup.patch', owner_metadata, owner_output,
           staged=True)

    original = json.loads(parent.read_text())
    final_path = owner_output / 'manifest.json'
    final = json.loads(final_path.read_text())
    assert len(final['files']) == 798 and len(final['binaryAssets']) == 23
    assert final['binaryAssets'] == original['binaryAssets']
    final_records = {item['path']: item for item in final['files']}
    for item in renderer['files'] + pins['files']:
        assert final_records[item['path']]['outputSha256'] == item['outputSha256']
    review = {
        'format': 'aux.renderer-navigation.gn-owner.review.v1',
        'parentManifestSha256': pins['parentManifestSha256'],
        'laneInputsSha256': pins['laneInputsSha256'],
        'composition': str(owner_output),
        'compositionSha256': sha(final_path.read_bytes()),
        'sourceRecords': len(final['files']), 'assets': len(final['binaryAssets']),
        'changedSources': changed, 'applied': False, 'compiled': False,
        'viewsOrArtworkChanged': False, 'state2Authorized': False,
        'wholeProfileCustodyClaimed': False,
    }
    (HERE / 'composition-review.json').write_text(json.dumps(review, indent=2) + '\n')
    print(json.dumps(review))


if __name__ == '__main__':
    main()
