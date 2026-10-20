#!/usr/bin/env python3
import hashlib
import json
from pathlib import Path
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parent
sha = lambda data: hashlib.sha256(data).hexdigest()
evidence = json.loads((ROOT / 'source-evidence.json').read_text())
for source in evidence['sources']:
    assert sha(Path(source['path']).read_bytes()) == source['sha256'], source['path']
for namespace in evidence['namespaces']:
    assert namespace['originalOptionalPositions'] == namespace['currentOptionalPositions']
    expected = ([{'method':'startSubscriptionUpdate', 'index':0, 'name':'options'}]
                if namespace['namespace'] == 'auxAdblock' else [])
    assert namespace['currentOptionalPositions'] == expected
    assert namespace['suppliedCallers']
    for caller in namespace['suppliedCallers']:
        path = Path(caller['path'])
        assert sha(path.read_bytes()) == caller['sha256']
        assert caller['excerpt'] in path.read_text()
caller = evidence['positiveCaller']
assert caller['find'] in Path(caller['path']).read_text()
manifest = json.loads((ROOT / 'manifest.json').read_text())
with tempfile.TemporaryDirectory(prefix='aux-adblock-optional-') as temporary:
    stage = Path(temporary)
    for entry in manifest['files']:
        data = (ROOT / 'baseline' / entry['path']).read_bytes()
        assert sha(data) == entry['baselineSha256']
        target = stage / entry['path']
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(data)
    subprocess.run(['git', 'init', '-q', str(stage)], check=True)
    subprocess.run(['git', '-C', str(stage), 'apply', '--check', str(ROOT / 'native.patch')], check=True)
    subprocess.run(['git', '-C', str(stage), 'apply', str(ROOT / 'native.patch')], check=True)
    for entry in manifest['files']:
        output = (stage / entry['path']).read_bytes()
        assert sha(output) == entry['outputSha256']
        assert output == (ROOT / 'port' / entry['path']).read_bytes()
print('PASS: six schema/caller audits, sole optional adblock position and exact patch replay; no native/runtime calls')
