#!/usr/bin/env python3
"""Compose a correction from the actual applied baseline, never staged forcing."""
import argparse
import json
from pathlib import Path
import subprocess

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[3]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    output = args.output.resolve()
    assert not output.exists()
    pins = json.loads((HERE / 'inputs.json').read_text())
    subprocess.run(['python3', str(HERE / 'verify.py')], check=True)

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
        'python3', str(REPO / 'scripts/extend-provided-native.py'),
        str(Path(pins['parentManifest']).parent),
        '--patch', str(HERE / 'followup.patch'),
        '--metadata', str(metadata_path),
        '--output', str(output),
    ], check=True)

    manifest = json.loads((output / 'manifest.json').read_text())
    assert len(manifest['files']) == 791 and len(manifest['binaryAssets']) == 23
    assert manifest['parentCompositionSha256'] == pins['parentManifestSha256']
    print('PASS: unapplied 791-source /23-asset corrective composition; '
          'actual applied base verified without --staged-base')


if __name__ == '__main__':
    main()
