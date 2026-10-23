#!/usr/bin/env python3
"""Prepare the exact out-of-line style correction on the applied native base."""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[3]


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    output = args.output.resolve()
    assert not output.exists()
    pins = json.loads((HERE / 'inputs.json').read_text())
    parent = Path(pins['parentManifest'])
    assert sha(parent.read_bytes()) == pins['parentManifestSha256']
    native = Path(pins['sourceRoot'])
    for item in pins['files']:
        original = (native / item['path']).read_bytes()
        successor = (HERE / 'source' / item['path']).read_bytes()
        assert sha(original) == item['inputSha256'], item['path']
        assert original.decode().count(item['find']) == item['count']
        assert original.decode().replace(item['find'], item['replace']).encode() == successor
        assert sha(successor) == item['outputSha256']
    assert sha((HERE / 'followup.patch').read_bytes()) == pins['patchSha256']
    metadata = {'version': 1, 'files': [{
        'path': item['path'],
        'baselineSha256': item['inputSha256'],
        'outputSha256': item['outputSha256'],
    } for item in pins['files']]}
    output.parent.mkdir(parents=True, exist_ok=True)
    metadata_path = output.parent / (output.name + '-metadata.json')
    assert not metadata_path.exists()
    metadata_path.write_text(json.dumps(metadata, indent=2) + '\n')
    subprocess.run([
        'python3', str(REPO / 'scripts/extend-provided-native.py'), str(parent.parent),
        '--patch', str(HERE / 'followup.patch'),
        '--metadata', str(metadata_path), '--output', str(output),
    ], check=True)
    successor = json.loads((output / 'manifest.json').read_text())
    assert len(successor['files']) == 792 and len(successor['binaryAssets']) == 23
    assert successor['parentCompositionSha256'] == pins['parentManifestSha256']
    print('PASS: exact two-anchor out-of-line default; unapplied 792-source /23-asset '
          'successor on verified applied base')


if __name__ == '__main__':
    main()
