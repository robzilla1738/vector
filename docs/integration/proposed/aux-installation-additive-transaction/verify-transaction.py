#!/usr/bin/env python3
"""Static composition check only; no Security, crypto or persistence execution."""
import hashlib,json,pathlib,re
ROOT=pathlib.Path(__file__).resolve().parent
manifest=json.loads((ROOT/'source-pins.json').read_text())
for entry in manifest['files']:
    data=(ROOT/entry['path']).read_bytes()
    assert len(data)<=1024*1024 and hashlib.sha256(data).hexdigest()==entry['sha256']
source=(ROOT/'source/AdditiveInstallationTransaction.swift').read_text()
assert not re.search(r'\bSecItem\w*\s*\(|FileHandle|FileManager|Data\(contentsOf|PrivateKey\(',source)
assert 'let overwritePermitted=false' in source and 'let deletePermitted=false' in source
assert 'let authorityProvenanceVerified=false' in source and 'let activeSelectionPerformed=false' in source
assert 'target-missing-after-success:' in source and 'target-unknown:' in source
assert 'journal.phase != .abandoned,journal.phase != .blocked' in source
print('PASS: candidate-bound transaction source/fixture/dependency pins; no Security, state or authority executor.')
