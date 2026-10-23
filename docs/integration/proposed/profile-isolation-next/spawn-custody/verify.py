#!/usr/bin/env python3
"""Check exact source patch application only; do not load any native artifact."""
import hashlib,json,subprocess,tempfile
from pathlib import Path
H=Path(__file__).resolve().parent
sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
j=json.loads((H/'integration.json').read_text())
with tempfile.TemporaryDirectory(prefix='aux-spawn-source-') as work:
    for e in j['replacements']:
        base=H/'baseline'/e['name'];source=H/'source'/e['name']
        assert sha(base)==e['originalSha256'] and sha(source)==e['successorSha256']
        (Path(work)/e['name']).write_bytes(base.read_bytes())
    r=subprocess.run(['/usr/bin/patch','--batch','--forward','--fuzz=0','-p1','-i',str(H/'source.patch')],cwd=work,capture_output=True,text=True)
    if r.returncode:raise SystemExit(r.stdout+r.stderr)
    for e in j['replacements']:assert sha(Path(work)/e['name'])==e['successorSha256']
print('PASS: six pinned actual source replacements, zero-fuzz patch, byte-identical successors; no native execution')
