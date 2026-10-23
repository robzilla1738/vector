#!/usr/bin/env python3
from pathlib import Path
import hashlib,json
here=Path(__file__).resolve().parent
pins=json.loads((here/'inputs.json').read_text())
native=Path(pins['sourceRoot'])
sha=lambda raw:hashlib.sha256(raw).hexdigest()
for item in pins['files']:
 output=(here/'source'/Path(item['path']).name).read_bytes()
 assert sha(output)==item['outputSha256'],item['path']
 if item['inputSha256'] is not None:
  actual=(native/item['path']).read_bytes();assert sha(actual)==item['inputSha256'],item['path']
  edits=pins['profileImpl']['edits'] if item.get('additionalPinnedNativeInput') else pins['edits']
  text=actual.decode()
  for e in edits:
   assert text.count(e['find'])==e['count'],e['name'];text=text.replace(e['find'],e['replace'])
  assert text.encode()==output,item['path']
assert sha((here/'followup.patch').read_bytes())==pins['patchSha256']
print('PASS: four source pins, eleven exact native anchors, complete successor bytes; native checkout remains unchanged')
