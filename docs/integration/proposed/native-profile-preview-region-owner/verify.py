"""Bounded static source pins and exact mixed six-file replay; no target run."""
from pathlib import Path
import hashlib,json,subprocess,tempfile
r=Path(__file__).resolve().parent;m=json.loads((r/'manifest.json').read_text());e=json.loads((r/'source-evidence.json').read_text());sha=lambda b:hashlib.sha256(b).hexdigest()
b=Path(e['artifact']).read_bytes();assert sha(b)==e['sha256']
for x in e['extracts']:
 a,z=int(x['start'],16),int(x['stop'],16);assert sha(b[a:z])==x['bytesSha256'];assert sha((r/x['file']).read_bytes())==x['extractSha256']
with tempfile.TemporaryDirectory(prefix='aux-preview-owner-replay-') as d:
 root=Path(d);subprocess.run(['git','init','-q',d],check=True)
 for x in m['files']:
  if x['baselineSha256']:
   data=Path(x['baselineSource']).read_bytes();assert sha(data)==x['baselineSha256'];p=root/x['path'];p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(data)
 subprocess.run(['git','apply','--check',str(r/'native.patch')],cwd=d,check=True)
 subprocess.run(['git','apply',str(r/'native.patch')],cwd=d,check=True)
 for x in m['files']:assert sha((root/x['path']).read_bytes())==x['outputSha256'];assert sha((r/'port'/x['path']).read_bytes())==x['outputSha256']
print('Original page/cache/admission/live-fallback/dispatch pins and6-file owner replay PASS. No compile/runtime acceptance.')
