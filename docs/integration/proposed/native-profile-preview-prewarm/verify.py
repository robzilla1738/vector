"""Bounded original pins and isolated exact source replay; no target execution."""
from pathlib import Path
import hashlib,json,subprocess,tempfile
r=Path(__file__).resolve().parent;m=json.loads((r/'manifest.json').read_text());e=json.loads((r/'source-evidence.json').read_text());sha=lambda b:hashlib.sha256(b).hexdigest()
b=Path(e['artifact']).read_bytes();assert sha(b)==e['sha256']
for x in e['extracts']:
 a,z=int(x['start'],16),int(x['stop'],16);assert sha(b[a:z])==x['bytesSha256'];assert sha((r/x['file']).read_bytes())==x['extractSha256']
with tempfile.TemporaryDirectory(prefix='aux-preview-prewarm-replay-') as d:
 root=Path(d);subprocess.run(['git','init','-q',d],check=True)
 for x in m['files']:
  b=Path(x['baselineSource']).read_bytes();assert sha(b)==x['baselineSha256'];p=root/x['path'];p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(b)
 subprocess.run(['git','apply','--check',str(r/'native.patch')],cwd=d,check=True)
 subprocess.run(['git','apply',str(r/'native.patch')],cwd=d,check=True)
 for x in m['files']:assert sha((root/x['path']).read_bytes())==x['outputSha256'];assert sha((r/'port'/x['path']).read_bytes())==x['outputSha256']
print('Original loader/prewarm/callback pins and3-file replay PASS; no compile/runtime acceptance.')
