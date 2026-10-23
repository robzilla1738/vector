#!/usr/bin/env python3
from pathlib import Path

import argparse, json, hashlib, subprocess, tempfile

PROPOSAL_ROOT = Path(__file__).resolve().parent
sha256 = lambda item: hashlib.sha256(item).hexdigest()
manifest = json.loads((PROPOSAL_ROOT / 'manifest.json').read_text())

parser = argparse.ArgumentParser()
parser.add_argument('--artifact-root', type=Path, required=True)
parser.add_argument('--output', type=Path, required=True)
arguments = parser.parse_args()
artifact_root = arguments.artifact_root.resolve()
parent_root = artifact_root / manifest['parentComposition']
parent_bytes = (parent_root / 'manifest.json').read_bytes()
assert sha256(parent_bytes) == manifest['parentCompositionSha256']
parent_manifest = json.loads(parent_bytes)
assert len(parent_manifest['files']) == 778 and len(parent_manifest['binaryAssets']) == 23
assert (
    sha256((artifact_root / 'scripts/extend-provided-native.py').read_bytes())
    == manifest['extenderSha256']
)
subprocess.run(['python3', str(PROPOSAL_ROOT / 'verify.py')], check=True)

with tempfile.TemporaryDirectory(prefix='aux-worker-compose-') as temporary_directory:
    metadata_path = Path(temporary_directory) / 'metadata.json'
    metadata_path.write_text(
        json.dumps(
            {
                'version': 1,
                'files': [
                    {
                        'path': item['path'],
                        'baselineSha256': item['baselineSha256'],
                        'outputSha256': item['sourceSha256'],
                    }
                    for item in manifest['files']
                ],
            },
            indent=2,
        ) + '\n'
    )
    subprocess.run(
        [
            'python3', str(artifact_root / 'scripts/extend-provided-native.py'),
            str(parent_root), '--staged-base',
            '--patch', str(PROPOSAL_ROOT / 'native.patch'),
            '--metadata', str(metadata_path),
            '--output', str(arguments.output.resolve()),
        ],
        check=True,
    )
    (arguments.output / 'service-worker-start-admission.patch').write_bytes(
        (PROPOSAL_ROOT / 'native.patch').read_bytes()
    )
    (arguments.output / 'service-worker-start-admission-metadata.json').write_bytes(
        metadata_path.read_bytes()
    )

manifest_path = arguments.output / 'manifest.json'
successor_manifest = json.loads(manifest_path.read_text())
successor_manifest['steps'][-1]['patch'] = str(
    arguments.output.resolve() / 'service-worker-start-admission.patch'
)
parent_files = {record['path']: record for record in parent_manifest['files']}
successor_files = {record['path']: record for record in successor_manifest['files']}
assert len(successor_files) == len(successor_manifest['files']) == 781
for source_path, record in parent_files.items():
    assert successor_files[source_path] == record, source_path
assert (
    successor_manifest['binaryAssets'] == parent_manifest['binaryAssets']
    and successor_manifest['steps'][:-1] == parent_manifest['steps']
)
manifest_path.write_text(json.dumps(successor_manifest, indent=2) + '\n')
print(json.dumps(
    {
        'parentSourcesPreserved': 778,
        'successorSources': 781,
        'unchangedAssets': 23,
        'successorManifestSha256': sha256(manifest_path.read_bytes()),
        'nativeApplied': False,
        'workerStopped': False,
    },
    indent=2,
))
