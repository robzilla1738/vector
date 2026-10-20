from pathlib import Path
import hashlib
import json
import subprocess
import tempfile
root=Path(__file__).resolve().parent
sha=lambda b:hashlib.sha256(b).hexdigest()
manifest=json.loads((root/'manifest.json').read_text())
evidence=json.loads((root/'evidence.json').read_text())
assert sha((root/'evidence/view_tracker.h').read_bytes())==evidence['apiSha256']
assert sha((root/'evidence/v377-focused-build.txt').read_bytes())==evidence['buildLogSha256']
with tempfile.TemporaryDirectory(prefix='aux-drag-const-replay-') as temp:
    for item in manifest['files']:
        b=(root/'baseline'/item['path']).read_bytes()
        assert sha(b)==item['baselineSha256']==evidence['nativeInputSha256']
        f=Path(temp)/item['path'];f.parent.mkdir(parents=True,exist_ok=True);f.write_bytes(b)
    patch=str((root/'native.patch').resolve())
    subprocess.run(['git','apply','--check',patch],cwd=temp,check=True)
    subprocess.run(['git','apply',patch],cwd=temp,check=True)
    for item in manifest['files']:
        assert sha((Path(temp)/item['path']).read_bytes())==item['outputSha256']
        assert sha((root/'source'/item['path']).read_bytes())==item['outputSha256']
print('PASS: actual377 log/ViewTracker API pins and one-file disposable replay; no native compile claim.')
