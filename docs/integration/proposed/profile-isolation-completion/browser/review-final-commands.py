#!/usr/bin/env python3
"""Bind a completed final build to the actual post-regeneration command graph."""
import hashlib
import json
from pathlib import Path
import re
import subprocess

root = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023')
source = root / 'src'
build = source / 'out/AuxFast'
receipt_root = root / 'unsigned-final-native-successor-build-20261023'
receipt_path = receipt_root / 'receipt.json'
sha = lambda path: hashlib.sha256(path.read_bytes()).hexdigest()
receipt = json.loads(receipt_path.read_text())
if not receipt.get('passed') or not receipt.get('allInspectedMachoUnsigned'):
    raise SystemExit('Successful unsigned final build required')
output = receipt_root / 'post-build-commands.log'
review = receipt_root / 'post-build-command-review.json'
if output.exists() or review.exists():
    raise SystemExit('Fresh post-build review required')
graph_before = sha(build / 'build.ninja')
with output.open('wb') as log:
    result = subprocess.run([str(source / 'third_party/ninja/ninja'), '-C', str(build),
                             '-t', 'commands', 'chrome'], cwd=source, stdout=log,
                            stderr=subprocess.PIPE)
if result.returncode:
    raise SystemExit('Actual final command inventory failed')
commands = output.read_text(errors='replace').splitlines()
for command in commands:
    if re.search(r'(^|[ /])(?:codesign|productsign)(?:\s|$)|notarytool', command):
        raise SystemExit('Actual final signing action refused')
links = [command for command in commands if 'linker_driver.py' in command]
if not links or any('-no_adhoc_codesign' not in command for command in links):
    raise SystemExit('Actual final unsigned link flag missing')
pins = root / 'final-native-input-pins.json'
inputs = json.loads(pins.read_text())
if sha(pins) != receipt['nativeInputPinsSha256']:
    raise SystemExit('Final native manifest changed')
for name, digest in inputs['files'].items():
    if sha(source / name) != digest:
        raise SystemExit('Final native source changed: ' + name)
record = {'format': 'aux.chromium.final-post-build-command-review.v1',
          'buildReceiptSha256': sha(receipt_path),
          'nativeInputPinsSha256': sha(pins),
          'initialCommandInventorySha256': receipt['commandInventorySha256'],
          'postBuildCommandInventorySha256': sha(output),
          'graphBeforeSha256': graph_before, 'graphAfterSha256': sha(build / 'build.ninja'),
          'reviewedCommandCount': len(commands), 'reviewedLinkCount': len(links),
          'productSigned': False, 'appExecuted': False}
record['passed'] = (record['postBuildCommandInventorySha256'] == receipt['commandInventorySha256']
                    and record['graphBeforeSha256'] == record['graphAfterSha256']
                    == receipt['currentBuildGraphSha256'])
review.write_text(json.dumps(record, indent=2) + '\n')
print(json.dumps(record))
if not record['passed']:
    raise SystemExit('Actual final graph differs from initial command review')
