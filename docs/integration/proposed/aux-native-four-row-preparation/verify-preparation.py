#!/usr/bin/env python3
"""Offline composition/source-pin check; no target, cryptography or state access."""
import hashlib,json,pathlib,re
ROOT=pathlib.Path(__file__).resolve().parent
manifest=json.loads((ROOT/'preparation-evidence.json').read_text())
for entry in manifest['files']:
    data=(ROOT/entry['path']).read_bytes()
    assert len(data)<=1024*1024 and hashlib.sha256(data).hexdigest()==entry['sha256']
source=(ROOT/'source/CapturedInstallation.swift').read_text()
assert not re.search(r'\bSecItem\w*\s*\(|FileHandle|FileManager|Data\(contentsOf|PrivateKey\(',source)
assert 'case .securityFailure(let status):blocked.append' in source
assert 'if !blocked.isEmpty { return .blocked(blocked) }' in source
assert 'let commitAuthorized=false' in source and 'let authorityProvenanceVerified=false' in source
assert 'snapshot.authorityMetadata.storage == .software' in source
print('PASS: composed source and recovery evidence pins, explicit failed-read handling and no new state/authority executor. No runtime operation.')
