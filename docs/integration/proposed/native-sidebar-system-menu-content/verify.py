#!/usr/bin/env python3
from pathlib import Path
import json,hashlib,subprocess,tempfile,shutil
p=Path(__file__).resolve().parent
m=json.loads((p/'manifest.json').read_text())
with tempfile.TemporaryDirectory(prefix='aux-system-content-') as td:
 w=Path(td)
 for item in m['files']:
  source=p/'baseline'/item['path']
  assert hashlib.sha256(source.read_bytes()).hexdigest()==item['baselineSha256']
  target=w/item['path'];target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(source,target)
 subprocess.run(['git','apply','--unsafe-paths',str(p/'native.patch')],cwd=w,check=True)
 for item in m['files']:
  assert hashlib.sha256((w/item['path']).read_bytes()).hexdigest()==item['outputSha256']
print('PASS: source baselines and independent system-menu content patch replay')
