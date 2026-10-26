#!/usr/bin/env python3
"""Prepare a versioned manifest derivative; never edit an app or profile."""
import argparse,hashlib,json,re
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('--candidate',type=Path,required=True);p.add_argument('--previous-receipt',type=Path);p.add_argument('--bootstrap-version');p.add_argument('--output',type=Path,required=True);a=p.parse_args()
root=a.candidate.resolve();manifest_path=root/'manifest.json';raw=manifest_path.read_bytes();manifest=json.loads(raw)
sha=lambda b:hashlib.sha256(b).hexdigest()
semantic={k:v for k,v in manifest.items() if k not in ('version','version_name')}
items=[{'path':'manifest.json (without version fields)','sha256':sha(json.dumps(semantic,sort_keys=True,separators=(',',':')).encode())}]
for file in sorted(root.rglob('*')):
 assert not file.is_symlink(),f'Symlink refused: {file.name}'
 if file.is_file() and file!=manifest_path:items.append({'path':file.relative_to(root).as_posix(),'sha256':sha(file.read_bytes())})
fingerprint=sha(json.dumps(items,sort_keys=True,separators=(',',':')).encode())
if a.previous_receipt:
 assert not a.bootstrap_version
 prior=json.loads(a.previous_receipt.read_text());previous=prior['version'];changed=prior['payloadSha256']!=fingerprint
else:
 assert a.bootstrap_version,'First preparation requires exact reviewed current version'
 previous=a.bootstrap_version;changed=True
assert manifest['version']==previous,'Candidate must start from previous delivered manifest version'
parts=previous.split('.');assert len(parts)==4 and all(x.isdigit() and 0<=int(x)<=65535 for x in parts)
if changed:
 assert int(parts[-1])<65535,'Version series exhausted; explicit version plan required'
 parts[-1]=str(int(parts[-1])+1)
version='.'.join(parts)
text=raw.decode();pattern=r'("version"\s*:\s*")'+re.escape(previous)+r'(")';matches=list(re.finditer(pattern,text));assert len(matches)==1
result=re.sub(pattern,lambda m:m.group(1)+version+m.group(2),text).encode();after=json.loads(result)
assert {**manifest,'version':version}==after
assert after.get('version_name')==manifest.get('version_name')
assert not a.output.exists();a.output.mkdir(mode=0o700)
(a.output/'manifest.json').write_bytes(result)
receipt={'format':'aux.component-worker-update.v1','version':version,'previousVersion':previous,'versionAdvanced':changed,'sourceVersionName':after.get('version_name'),'payloadSha256':fingerprint,'payloadInventory':items,'manifest':{'path':str(manifest_path),'beforeSha256':sha(raw),'afterSha256':sha(result)},'appModified':False,'signed':False}
(a.output/'receipt.json').write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps({k:receipt[k] for k in ['version','previousVersion','versionAdvanced','payloadSha256','manifest']},indent=2))
