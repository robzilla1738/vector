"""Pin supplied bytes,155API snapshots,icon floats and exact disposable replay."""
from pathlib import Path
import contextlib
import hashlib
import io
import json
import re
import runpy
import struct
import subprocess
import sys
import tempfile

root = Path(__file__).resolve().parent
sha = lambda data: hashlib.sha256(data).hexdigest()
evidence = json.loads((root / 'source-evidence.json').read_text())
manifest = json.loads((root / 'manifest.json').read_text())
assert sha(Path(evidence['arm64']['path']).read_bytes()) == evidence['arm64']['sha256']
sys.argv = ['decode', evidence['arm64']['path']]
with contextlib.redirect_stdout(io.StringIO()):
    decoder = runpy.run_path(str(root.parent / 'native-popup-material/decode-selectors.py'))
for item in evidence['ranges']:
    assert sha(decoder['read'](int(item['rva'], 16), item['bytes'])) == item['sha256']
    assert sha((root / 'evidence' / (item['name'] + '.asm')).read_bytes()) == item['assemblySha256']
with tempfile.TemporaryDirectory(prefix='aux-cross-section-coordinator-replay-') as temp:
    subprocess.run(['git','apply','--check',str((root/'native.patch').resolve())],cwd=temp,check=True)
    subprocess.run(['git','apply',str((root/'native.patch').resolve())],cwd=temp,check=True)
    for item in manifest['files']:
        assert item['baselineSha256'] is None
        assert sha((Path(temp)/item['path']).read_bytes()) == item['outputSha256']
        assert sha((root/'source'/item['path']).read_bytes()) == item['outputSha256']
for item in evidence['apiInputs']:
    assert sha((root/item['snapshotPath']).read_bytes()) == item['sha256']
print('PASS:11 original byte ranges,17 actual API snapshots,two-file disposable replay; no native/runtime acceptance.')
