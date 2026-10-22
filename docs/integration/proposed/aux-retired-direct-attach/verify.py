#!/usr/bin/env python3
import difflib,hashlib,json
from pathlib import Path
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[3]
sha=lambda x:hashlib.sha256(x).hexdigest()
pins=json.loads((HERE/'source-pins.json').read_text());patch=''
for item in pins['files']:
    name=Path(item['path']).name;before=(HERE/'baseline'/name).read_bytes();after=(HERE/'source'/name).read_bytes()
    assert sha(before)==item['baselineSha256'] and sha(after)==item['outputSha256']
    assert (ROOT/item['path']).read_bytes()==before,'Baseline changed: '+item['path']
    patch+=''.join(difflib.unified_diff(before.decode().splitlines(keepends=True),after.decode().splitlines(keepends=True),fromfile='a/'+item['path'],tofile='b/'+item['path']))
for item in pins['dependencies']:
    raw=(ROOT/item['path']).read_bytes();assert sha(raw)==item['sha256'];assert raw.decode().count(item['anchor'])==item['count']
assert patch==(HERE/'native.patch').read_text() and sha(patch.encode())==pins['patchSha256']
cc=(HERE/'source/aux-development-host-attach.cc').read_text()
for forbidden in ['AuxCreateSignedDevelopmentOwner(', 'AuxAttachOwnedDispatcher(', 'AuxReleaseSignedDevelopmentOwner(', 'napi_define_properties(', 'napi_create_function(']:assert forbidden not in cc
print('PASS: exact two-file tombstone patch; unchanged WorkerHost/protected producer/cold refusal pinned')
