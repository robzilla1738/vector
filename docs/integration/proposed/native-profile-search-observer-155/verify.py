from pathlib import Path
import hashlib,json,subprocess,tempfile
r=Path(__file__).resolve().parent;sha=lambda b:hashlib.sha256(b).hexdigest()
for p in json.loads((r/'source-evidence.json').read_text())['upstream']:
 assert sha(Path(p['path']).read_bytes())==p['sha256']
m=json.loads((r/'manifest.json').read_text())
with tempfile.TemporaryDirectory(prefix='aux-search-observer-replay-') as d:
 t=Path(d);subprocess.run(['git','init','-q',d],check=True)
 for f in m['files']:
  old=Path(f['baselineSource']).read_bytes();assert sha(old)==f['baselineSha256'];p=t/f['path'];p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(old)
 subprocess.run(['git','apply','--check',str(r/'native.patch')],cwd=t,check=True)
 subprocess.run(['git','apply',str(r/'native.patch')],cwd=t,check=True)
 for f in m['files']:
  assert sha((t/f['path']).read_bytes())==f['outputSha256']
  assert sha((r/'port'/f['path']).read_bytes())==f['outputSha256']
print('155 native-observer pins and exact one-output replay PASS; compilation pending.')
