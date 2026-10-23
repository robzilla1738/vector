#!/usr/bin/env python3
"""Static source verification, no native/Security/fixture execution."""
from pathlib import Path
import hashlib,json
p=Path(__file__).resolve().parent;r=p.parents[3]
m=json.loads((p/'inputs.json').read_text())
for f,h in m['files'].items():assert hashlib.sha256((r/f).read_bytes()).hexdigest()==h,f
s=(p/'source/chrome/browser/notifications/aux_legacy_inbox_captured_read.cc').read_text()
for forbidden in ['SecItemCopyMatching(', 'SecItemAdd(', 'SecItemUpdate(', 'SecItemDelete(', 'SecRandomCopyBytes(', 'withCskPublicationRoot', 'RunCarrier']:
 assert forbidden not in s,forbidden
assert s.count('captured.status == errSecItemNotFound')==1
assert s.count('captured.status != errSecSuccess')==1
assert s.count('base::Base64Encode(*decoded) == captured.data')==1
assert s.count('DecodeExplicitLegacyInboxV1(record, &key.bytes)')==1
assert s.count('DecodeExplicitLegacyInboxV1(record, nullptr)')==1
print(f"{len(m['files'])} source pins passed; read producer absent; native fixture deferred")
