"""Static supplied source pins and exact disposable patch replay; no native execution."""
from pathlib import Path
import contextlib
import hashlib
import io
import json
import runpy
import subprocess
import sys
import tempfile

root = Path(__file__).resolve().parent
sha = lambda data: hashlib.sha256(data).hexdigest()
manifest = json.loads((root / 'manifest.json').read_text())
with tempfile.TemporaryDirectory(prefix='aux-bookmark-drag-contract-replay-') as temp:
    for item in manifest['files']:
        if item['baselineSha256'] is not None:
            baseline = root / 'baseline' / item['path']
            assert sha(baseline.read_bytes()) == item['baselineSha256']
            target = Path(temp) / item['path']
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(baseline.read_bytes())
    subprocess.run(['git', 'apply', '--check', str(root / 'native.patch')], cwd=temp, check=True)
    subprocess.run(['git', 'apply', str(root / 'native.patch')], cwd=temp, check=True)
    for item in manifest['files']:
        assert sha((Path(temp) / item['path']).read_bytes()) == item['outputSha256']
        assert sha((root / 'source' / item['path']).read_bytes()) == item['outputSha256']
print('PASS: exact326 baseline + one-file API155 disposable replay; no new compile/runtime claim')
