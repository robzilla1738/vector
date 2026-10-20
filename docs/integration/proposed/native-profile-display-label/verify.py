"""Static source pins and independent patch replay; no native execution."""
import hashlib
import json
from pathlib import Path
import subprocess
import tempfile
root = Path(__file__).resolve().parent
sha = lambda data: hashlib.sha256(data).hexdigest()
e = json.loads((root/'source-evidence.json').read_text())
b = Path(e['artifact']).read_bytes()
assert sha(b) == e['sha256']
for row in e['extracts']:
    assert sha(b[int(row['start'],16):int(row['stop'],16)]) == row['bytesSha256']
    assert sha((root/row['file']).read_bytes()) == row['extractSha256']
for row in e['literals']:
    assert b[int(row['rva'],16):int(row['rva'],16)+len(bytes.fromhex(row['bytes']))].hex() == row['bytes']
for row in e['currentInputs']:
    assert sha(Path(row['path']).read_bytes()) == row['sha256']
m = json.loads((root/'manifest.json').read_text())
with tempfile.TemporaryDirectory(prefix='aux-preview-coordinates-') as directory:
    out = Path(directory)
    subprocess.run(['git','init','-q',directory],check=True)
    for row in m['files']:
        assert row['baselineSha256'] is None
    subprocess.run(['git','apply','--check',str(root/'native.patch')],cwd=out,check=True)
    subprocess.run(['git','apply',str(root/'native.patch')],cwd=out,check=True)
    for row in m['files']:
        assert sha((out/row['path']).read_bytes()) == row['outputSha256']
        assert sha((root/'port'/row['path']).read_bytes()) == row['outputSha256']
print('Original label/getter/literal pins and two-file replay PASS. No compile or UI claim.')
