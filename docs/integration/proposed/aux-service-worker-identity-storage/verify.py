#!/usr/bin/env python3
import hashlib,json,subprocess
from pathlib import Path
HERE=Path(__file__).resolve().parent
REPO=HERE.parents[3]
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
pins=json.loads((HERE/'inputs.json').read_text())
prior=REPO/pins['predecessor']
subprocess.run(['python3',str(prior/'verify.py')],check=True)
for row in pins['files']:
 before=prior/'source'/row['path'];after=HERE/'source'/row['path']
 assert sha(before)==row['inputSha256'] and sha(after)==row['outputSha256']
 text=before.read_text()
 for edit in row['edits']:
  assert text.count(edit['find'])==edit['count']==1
  text=text.replace(edit['find'],edit['replace'])
 assert text==after.read_text()
assert sha(HERE/'followup.patch')==pins['patchSha256']
print('PASS: seven exact address-identity storage edits; no dereference or lifetime claim')

fixture=pins["fixture"]
original=REPO/fixture["predecessor"];current=HERE/fixture["path"]
assert sha(original)==fixture["predecessorSha256"] and sha(current)==fixture["sha256"]
edit=fixture["edit"];text=original.read_text();assert text.count(edit["find"])==edit["count"]==1
assert text.replace(edit["find"],edit["replace"])==current.read_text()
