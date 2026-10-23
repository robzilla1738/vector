#!/usr/bin/env python3
"""Quarantine exact inherited retired runtime outputs; run under native-build.py."""
import hashlib
import json
import os
from pathlib import Path
import re
import stat

root = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023')
build = root / 'src/out/AuxFast'
original = Path('/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src/out/AuxFast')
review = root / 'unsigned-recovered-base-build-20261023'
output = root / 'retired-output-quarantine-20261023'
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
receipt = json.loads((review / 'receipt.json').read_text())
if receipt.get('error') != 'native app contains signed Mach-O or none inspected' or not any(
    run['name'] == 'full-build' and run['exitCode'] == 0 for run in receipt['runs']
):
    raise SystemExit('Exact completed but signature-refused base required')
if output.exists():
    raise SystemExit('Fresh quarantine required')
if sha(review / 'commands.log') != receipt['commandInventorySha256']:
    raise SystemExit('Reviewed command inventory changed')
names = [
    'Aux.app/Contents/Helpers/Aux Runtime',
    'Aux.app/Contents/Resources/aux-runtime',
    'Aux.app/Contents/Frameworks/Aux Framework.framework/Versions/155.0.8059.85/Helpers/aux_owned_headless_launcher',
    'Aux Framework.framework/Versions/155.0.8059.85/Helpers/aux_owned_headless_launcher',
]
tokens = ['aux_owned_headless_launcher', 'Contents/Resources/aux-runtime',
          'Contents/Helpers/Aux Runtime']
graph = {}
pending = ['build.ninja']
while pending:
    name = pending.pop()
    if name in graph:
        continue
    path = build / name
    if path.is_symlink() or not path.resolve().is_relative_to(build):
        raise SystemExit('Unexpected Ninja include boundary')
    text = path.read_text(errors='replace')
    graph[name] = sha(path)
    pending.extend(re.findall(r'^(?:subninja|include) (.+)$', text, re.MULTILINE))
for path in [review / 'commands.log', *(build / n for n in graph)]:
    text = path.read_text(errors='replace').replace('$ ', ' ')
    if any(token in text for token in tokens):
        raise SystemExit('Retired output still belongs to current graph: ' + str(path))
leaves = []
for name in names:
    path = build / name
    if path.is_symlink() or not path.resolve().is_relative_to(build):
        raise SystemExit('Unexpected output boundary')
    paths = sorted(path.rglob('*')) if path.is_dir() else [path]
    for leaf in paths:
        if leaf.is_dir() and not leaf.is_symlink():
            continue
        if leaf.is_symlink() or not leaf.is_file():
            raise SystemExit('Only pinned regular inherited output leaves expected')
        relative = str(leaf.relative_to(build))
        old = original / relative
        digest = sha(leaf)
        mode = stat.S_IMODE(leaf.stat().st_mode)
        if old.is_symlink() or not old.is_file() or sha(old) != digest or stat.S_IMODE(old.stat().st_mode) != mode:
            raise SystemExit('Inherited snapshot provenance mismatch: ' + relative)
        leaves.append({'path': relative, 'sha256': digest, 'mode': mode, 'bytes': leaf.stat().st_size})
record = {'format': 'aux.chromium.retired-output-quarantine.v1', 'passed': False,
          'baseReceiptSha256': sha(review / 'receipt.json'),
          'cloneReceiptSha256': sha(root / 'receipt.json'),
          'commandInventorySha256': receipt['commandInventorySha256'],
          'graphFiles': graph, 'paths': names, 'leaves': leaves,
          'originalBytesModesMatch': True, 'absentCurrentGraph': True,
          'signaturesStripped': False, 'sourceChanged': False,
          'sharedCheckoutChanged': False, 'appExecuted': False}
output.mkdir()
(output / 'receipt.json').write_text(json.dumps(record, indent=2) + '\n')
for name in names:
    destination = output / 'files' / name
    destination.parent.mkdir(parents=True, exist_ok=True)
    os.rename(build / name, destination)
for leaf in leaves:
    path = output / 'files' / leaf['path']
    if sha(path) != leaf['sha256'] or stat.S_IMODE(path.stat().st_mode) != leaf['mode']:
        raise SystemExit('Quarantine byte/mode mismatch')
if any(sha(build / name) != digest for name, digest in graph.items()):
    raise SystemExit('Native graph changed during quarantine')
record['passed'] = True
(output / 'receipt.json').write_text(json.dumps(record, indent=2) + '\n')
print(json.dumps({'passed': True, 'receipt': str(output / 'receipt.json'), 'preservedLeaves': len(leaves)}))
