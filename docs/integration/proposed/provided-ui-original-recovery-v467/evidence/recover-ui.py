from pathlib import Path
import json,hashlib,collections
root=Path('/Users/rcourson/Documents/Vibe/web');stage=root/'out/provided-reuse-v241-brand/ui';pins=json.loads((root/'docs/source/provided-ui-inputs.json').read_text());m=json.loads((stage/'manifest.json').read_text());snap=root/'out/provided-ui-original-1.26.1016.1852';snap.mkdir(exist_ok=True)
sha=lambda b:hashlib.sha256(b).hexdigest();records=[];missing=[]
for comp, v in pins['components'].items():
 rows={r.get('sourcePath',r['path']):r for r in m['components'][comp]['files']}
 for f in v['files']:
  rel=f['path'];expected=f['sourceSha256'];row=rows.get(rel);dest=snap/comp/rel;data=None;method=None
  if dest.is_file() and sha(dest.read_bytes())==expected:data=dest.read_bytes();method='existing-verified'
  elif row:
   src=stage/comp/row['path'];original=src.read_bytes()
   assert sha(original)==row['outputSha256']
   if sha(original)==expected:data=original;method='unchanged-staged'
   elif row.get('anchors'):
    try:
     text=original.decode();rev=[]
     for a in reversed(row['anchors']):
      if a['replace']=='' or text.count(a['replace'])!=a['count']:raise ValueError('inverse anchor ambiguous')
      text=text.replace(a['replace'],a['find']);rev.append(a)
     candidate=text.encode()
     if sha(candidate)==expected:data=candidate;method='exact-inverse-stage-anchors'
    except (UnicodeError,ValueError):pass
  if data is None:missing.append({'component':comp,'path':rel,'sha256':expected,'row':row});continue
  dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(data);records.append({'component':comp,'path':rel,'sha256':expected,'size':len(data),'method':method})
(snap/'recovery-inventory.json').write_text(json.dumps({'pinFileSha256':sha((root/'docs/source/provided-ui-inputs.json').read_bytes()),'stageManifestSha256':sha((stage/'manifest.json').read_bytes()),'records':records,'missing':missing},indent=2)+'\n')
print('Recovered',len(records),'Missing',len(missing));print(json.dumps([{'component':r['component'],'path':r['path'],'sha256':r['sha256']} for r in missing],indent=2))
