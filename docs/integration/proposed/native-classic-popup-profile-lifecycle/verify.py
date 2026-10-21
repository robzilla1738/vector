#!/usr/bin/env python3
"""Bounded exact patch replay; not runtime/import acceptance."""
import hashlib,json,subprocess,tempfile
from pathlib import Path
here=Path(__file__).resolve().parent
entries=json.loads((here/'files.json').read_text())['files']
with tempfile.TemporaryDirectory(prefix='aux-import-scope-') as directory:
 root=Path(directory)
 for f in entries:
  old=(here/'baseline'/f['path']).read_bytes();new=(here/'source'/f['path']).read_bytes()
  assert hashlib.sha256(old).hexdigest()==f['baselineSha256']
  assert hashlib.sha256(new).hexdigest()==f['outputSha256']
  target=root/f['path'];target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(old)
 subprocess.run(['git','apply',str(here/'native.patch')],cwd=root,check=True)
 for f in entries:assert (root/f['path']).read_bytes()==(here/'source'/f['path']).read_bytes()
print(f'{len(entries)} exact pinned files and replay PASS; native/runtime acceptance pending')
