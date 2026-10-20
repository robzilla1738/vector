#!/usr/bin/env python3
"""Static original bytes and retained source only. Never execute importer code."""
import hashlib
import json
from pathlib import Path
HERE = Path(__file__).resolve().parent
sha = lambda b: hashlib.sha256(b).hexdigest()
e = json.loads((HERE/'source-evidence.json').read_text())
b = Path(e['original']['path']).read_bytes()
assert sha(b) == e['original']['sha256']
for row in e['ranges']:
    assert sha(b[int(row['start'],16):int(row['endExclusive'],16)]) == row['sha256']
    assert sha((HERE/row['assembly']).read_bytes()) == row['assemblySha256']
for row in e['currentNativeSnapshots']:
    assert sha((HERE/row['retained']).read_bytes()) == row['sha256']
header = (HERE/'current/chrome/browser/extensions/api/aux_browser_import/chromium_new_target_import.h').read_text()
assert header.rindex('WeakPtrFactory<ChromiumNewTargetImport>') > header.index('bool passwords_done_')
owner = (HERE/'current/chrome/browser/extensions/api/aux_browser_import/chromium_new_target_import.cc').read_text()
assert owner.count('ChromiumNewTargetImport::~ChromiumNewTargetImport() = default;') == 1
assert 'base::BindOnce(&ChromiumNewTargetImport::Captured, weak_.GetWeakPtr())' in owner
assert 'base::BindOnce(&ChromiumNewTargetImport::Prepared, weak_.GetWeakPtr())' in owner
assert 'base::BindOnce(&ChromiumNewTargetImport::Initialized, weak_.GetWeakPtr())' in owner
print('PASS original owner destruction/weak replies + retained native lifetime graph; no execution')
