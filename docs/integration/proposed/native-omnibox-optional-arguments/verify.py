#!/usr/bin/env python3
import hashlib
import json
from pathlib import Path
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parent
sha = lambda data: hashlib.sha256(data).hexdigest()
evidence = json.loads((ROOT / 'source-evidence.json').read_text())
sources = {}
for item in evidence['sources']:
    source = Path(item['path'])
    data = source.read_bytes()
    assert sha(data) == item['sha256'], str(source)
    sources[source.name] = data.decode()
original = json.loads(sources['idl-asideOmnibox.json'])
current = json.loads(sources['aux_omnibox.json'])[0]
positions = [('createSession', 'options', 0), ('queryAutocomplete', 'options', 2),
             ('addTabContext', 'delayUpload', 2), ('deleteContext', 'fromAutomaticChip', 2)]
for method, name, index in positions:
    for schema in [original, current]:
        function = next(f for f in schema['functions'] if f['name'] == method)
        parameter = function['parameters'][index]
        assert parameter['name'] == name and parameter['optional'] is True
assert 'S=await chrome.auxOmnibox?.createSession()' in sources['newtab-CnOLQ0yu.js']
assert 'void AddNull() override { list_value_.Append(base::Value()); }' in sources['api_signature.cc']
assert 'ExpectPass(*signature, "[]", "[null]"' in sources['api_signature_unittest.cc']
manifest = json.loads((ROOT / 'manifest.json').read_text())
with tempfile.TemporaryDirectory(prefix='aux-omnibox-optional-') as temporary:
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
print('PASS: four real optional signatures, supplied no-options caller, actual155 null normalization and exact patch replay; source-only')
