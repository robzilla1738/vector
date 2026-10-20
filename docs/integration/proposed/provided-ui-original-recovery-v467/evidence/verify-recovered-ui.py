from pathlib import Path
import json,hashlib,collections
root=Path('/Users/rcourson/Documents/Vibe/web');snap=root/'out/provided-ui-original-1.26.1016.1852';pins=json.loads((root/'docs/source/provided-ui-inputs.json').read_text());stage=root/'out/provided-reuse-v241-brand/ui';manifest=json.loads((stage/'manifest.json').read_text());sha=lambda b:hashlib.sha256(b).hexdigest();receipt=snap/'recovery-inventory.json';d=json.loads(receipt.read_text());assert not d['missing'];counts={};replays=0
for comp,v in pins['components'].items():
 expected={f['path'] for f in v['files']};actual={str(p.relative_to(snap/comp)) for p in (snap/comp).rglob('*') if p.is_file()};assert actual==expected
 for f in v['files']:
  p=snap/comp/f['path'];assert not p.is_symlink();b=p.read_bytes();assert len(b)==f['size'];assert sha(b)==f['sourceSha256']
 for row in manifest['components'][comp]['files']:
  p=snap/comp/row.get('sourcePath',row['path']);b=p.read_bytes();assert sha(b)==row['sourceSha256']
  if row.get('anchors'):
   s=b.decode()
   for a in row['anchors']:
    assert s.count(a['find'])==a['count'],(comp,row['path'],a['find'][:25])
    s=s.replace(a['find'],a['replace'])
   assert sha(s.encode())==row['outputSha256'];replays+=1
  elif row['sourceSha256']==row['outputSha256']:assert sha(b)==row['outputSha256']
  else:assert row['path'].endswith('.png') # genuine logo replacement; source hash verified above
 counts[comp]=len(expected)
d['version']=1;d['kind']='provided-ui-original-recovery';d['sourceVersion']='1.26.1016.1852';d['complete']=True;d['counts']=counts;d['countCheckedTextReplays']=replays;d['exactOriginalInventory']='PASS';d['pinFile']='docs/source/provided-ui-inputs.json';d['missing']=[];d['methodCounts']=dict(collections.Counter(x['method'] for x in d['records']));d['records'].sort(key=lambda x:(x['component'],x['path']));receipt.write_text(json.dumps(d,indent=2)+'\n')
print(json.dumps({'counts':counts,'replays':replays,'methods':d['methodCounts'],'inventorySha256':sha(receipt.read_bytes()),'totalBytes':sum(x['size'] for x in d['records'])},indent=2))
