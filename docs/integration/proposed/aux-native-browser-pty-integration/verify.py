#!/usr/bin/env python3
"""Review staged composition metadata only; no native apply/build/load."""
from pathlib import Path
import hashlib
import json
here=Path(__file__).resolve().parent
repo=here.parents[3]
def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()
pins=json.loads((here/'inputs.json').read_text())
for name,expected in pins['workspaceInputs'].items():
    assert sha(repo/name)==expected,name
base_dir=repo/pins['base']
assert sha(base_dir/'manifest.json')==pins['baseManifestSha256']
base=json.loads((base_dir/'manifest.json').read_text())
metadata=json.loads((here/'metadata.json').read_text())
assert sha(here/'native.patch')==metadata['patchSha256']
output_dir=repo/'out/native-reuse-composition-aux-browser-pty-policy'
output=json.loads((output_dir/'manifest.json').read_text())
assert output['parentCompositionSha256']==pins['baseManifestSha256']
assert len(output['files'])==len(base['files'])==826
assert len(output['binaryAssets'])==len(base['binaryAssets'])==23
assert output['binaryAssets']==base['binaryAssets']
a={row['path']:row for row in base['files']}
b={row['path']:row for row in output['files']}
assert a.keys()==b.keys()
changed={path for path in a if a[path]!=b[path]}
assert changed=={row['path'] for row in metadata['files']}
for row in metadata['files']:
    path=row['path']
    assert a[path]['outputSha256']==row['baselineSha256']
    assert b[path]['outputSha256']==row['outputSha256']==sha(repo/row['source'])
assert output['combinedPatchSha256']==sha(output_dir/'combined.patch')
assert output['steps'][-1]['sha256']==metadata['patchSha256']
assert output['steps'][-1]['metadataSha256']==sha(here/'metadata.json')
assert output['compiled'] is False and output['appliedToNative'] is False
assert metadata['compiled'] is False and metadata['applied'] is False
assert pins['startupHookDefaultOff'] is True and pins['futureSignedArtifactsAvailable'] is False
print('PASS: actual unapplied826/23 composition; exact2 parent Swift changes,824 source records and23 assets unchanged; no build/load')
