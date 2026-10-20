from pathlib import Path
import hashlib,json,subprocess,tempfile
root=Path(__file__).resolve().parent
manifest=json.loads((root/'manifest.json').read_text());anchors=json.loads((root/'anchors.json').read_text());sha=lambda b:hashlib.sha256(b).hexdigest()
assert len(anchors)==7
for item in manifest['files']:
 data=(root/'baseline'/item['path']).read_text();assert sha(data.encode())==item['baselineSha256']
 for anchor in anchors:
  assert data.count(anchor['before'])==anchor['count'];data=data.replace(anchor['before'],anchor['after'])
 assert data==(root/'source'/item['path']).read_text();assert sha(data.encode())==item['outputSha256']
with tempfile.TemporaryDirectory(prefix='aux-frozen-check-replay-') as directory:
 for item in manifest['files']:
  path=Path(directory)/item['path'];path.parent.mkdir(parents=True,exist_ok=True);path.write_bytes((root/'baseline'/item['path']).read_bytes())
 subprocess.run(['git','apply','--check',str(root/'checker.patch')],cwd=directory,check=True)
 subprocess.run(['git','apply',str(root/'checker.patch')],cwd=directory,check=True)
 for item in manifest['files']:assert sha((Path(directory)/item['path']).read_bytes())==item['outputSha256']
print('PASS: seven checker anchors, immutable original/output pins and disposable replay')
