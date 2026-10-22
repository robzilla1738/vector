import json,pathlib,hashlib
base=pathlib.Path(__file__).resolve().parent;record=json.loads((base/'source-map.json').read_text());root=pathlib.Path(record['sourceRoot'])
for item in record['sourceFiles']:
 data=(root/item['path']).read_bytes();assert hashlib.sha256(data).hexdigest()==item['sha256'],item['path'];assert len(data)==item['bytes'];text=data.decode()
 for entry in item['anchors']:
  assert text.count(entry['anchor'])==entry['count'],(item['path'],entry['anchor']);assert text[:text.index(entry['anchor'])].count('\n')+1==entry['firstLine']
assert record['allWriterCustodyClaimed'] is False
print(f"PASS: {len(record['sourceFiles'])} actual applied static source pins/anchors; no build, profile, process or OS operation")
