from pathlib import Path
import hashlib
import json
import subprocess
import tempfile
root=Path(__file__).resolve().parent
sha=lambda b:hashlib.sha256(b).hexdigest()
manifest=json.loads((root/'manifest.json').read_text())
evidence=json.loads((root/'evidence.json').read_text())
assert sha((root/'evidence/v376-focused-build.txt').read_bytes())==evidence['buildLogSha256']
assert evidence['diagnostic'] in (root/'evidence/v376-focused-build.txt').read_text()
assert evidence['diagnostic'] in (root/'evidence/base/functional/bind_internal.h').read_text()
with tempfile.TemporaryDirectory(prefix='aux-nonvoid-weak-replay-') as temp:
    for item in manifest['files']:
        data=(root/'baseline'/item['path']).read_bytes()
        assert sha(data)==item['baselineSha256']==evidence['nativeInputSha256']
        target=Path(temp)/item['path'];target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(data)
    patch=str((root/'native.patch').resolve())
    subprocess.run(['git','apply','--check',patch],cwd=temp,check=True)
    subprocess.run(['git','apply',patch],cwd=temp,check=True)
    for item in manifest['files']:
        assert sha((Path(temp)/item['path']).read_bytes())==item['outputSha256']
        assert sha((root/'source'/item['path']).read_bytes())==item['outputSha256']
print('PASS: actual diagnostic/API pin and one-file disposable replay; native compile remains root-owned.')
