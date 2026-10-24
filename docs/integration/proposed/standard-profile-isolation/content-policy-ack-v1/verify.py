#!/usr/bin/env python3
"""Static exact replay only; does not execute a child, sandbox, or product."""
import hashlib,json,pathlib
R=pathlib.Path(__file__).resolve().parent
m=json.loads((R/'manifest.json').read_text()); changes=json.loads((R/'anchors.json').read_text())
h=lambda b:hashlib.sha256(b).hexdigest()
assert h((R/'source.patch').read_bytes())==m['patchSha256']
assert len(changes)==m['countedAdaptations']
for entry in m['files']:
 p=entry['path']; expected=(R/'source'/p).read_bytes()
 assert h(expected)==entry['afterSha256'],p
 if entry['beforeSha256']:
  b=(R/'baseline'/p).read_bytes(); assert h(b)==entry['beforeSha256'],p
  text=b.decode()
  for c in changes:
   if c['path']==p:
    assert c['count']==1 and text.count(c['find'])==1,p
    text=text.replace(c['find'],c['replace'])
  assert text.encode()==expected,p
pin=json.loads((R/'policy-inputs.json').read_text())
for e in pin:
 assert h(pathlib.Path(e['path']).read_bytes())==e['sha256'],e['path']
print(f"Exact static replay passed: {len(m['files'])} files, {len(changes)} counted changes; policy inputs unchanged")
