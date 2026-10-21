#!/usr/bin/env python3
from pathlib import Path
import hashlib,json
root=Path(__file__).resolve().parent
evidence=json.loads((root/'source-evidence.json').read_text())
for item in evidence['files']:
 data=Path(item['path']).read_bytes()
 assert hashlib.sha256(data).hexdigest()==item['sha256'],item['path']
 for anchor in item['anchors']:assert data.decode().count(anchor['text'])==anchor['count']==1
for item in evidence['idl']:
 data=Path(item['path']).read_bytes()
 assert hashlib.sha256(data).hexdigest()==item['sha256']
 doc=json.loads(data);doc=doc[0] if isinstance(doc,list) else doc
 assert [f['name'] for f in doc['functions']]==item['functions']
 assert 'show' not in item['functions'] and 'toggle' not in item['functions']
assert evidence['idl'][0]['functions']==evidence['idl'][1]['functions']
print('PASS: pinned startup/registrar/show/shutdown anchors and original/current public method lists')
