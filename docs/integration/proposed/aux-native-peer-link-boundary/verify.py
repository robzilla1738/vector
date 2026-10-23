#!/usr/bin/env python3
"""Verify exact read-only dependency extraction and child-only guard successor."""
from pathlib import Path
import hashlib
import json

here = Path(__file__).resolve().parent
repo = here.parents[3]
pins = json.loads((here / 'inputs.json').read_text())
for section in ('files', 'baseline'):
    for path, expected in pins[section].items():
        assert hashlib.sha256((repo / path).read_bytes()).hexdigest() == expected, path
old = repo / 'docs/integration/proposed/aux-native-daemon-authority-transport/source'
cc = (old / 'AuxNativePeerTransport.cc').read_text()
include = '#include "AuxFreshColdBootstrapNativeBridge.h"'
cc = cc.replace(include, '#if defined(AUX_NATIVE_DAEMON_AUTHORITY_SERVER)\n' + include + '\n#endif')
start = cc.index('ParentExchange AuthenticatedNativeParentConnection::SendSelectedHome(')
end = cc.index('\n#if defined(AUX_NATIVE_DAEMON_AUTHORITY_SERVER)', start)
cc = cc[:start] + '#if defined(AUX_NATIVE_DAEMON_AUTHORITY_SERVER)\n' + cc[start:end] + '#endif\n' + cc[end:]
assert cc == (here / 'source/AuxNativePeerTransport.cc').read_text()
header = (old / 'AuxNativePeerTransport.h').read_text()
anchor = '  // Descriptor source is ONLY actual ready-service C producer, never a caller FD.\n  ParentExchange SendSelectedHome(uint64_t ready_service, uint32_t timeout_ms);'
assert header.count(anchor) == 1
assert header.replace(anchor, '#if defined(AUX_NATIVE_DAEMON_AUTHORITY_SERVER)\n' + anchor + '\n#endif') == (here / 'source/AuxNativePeerTransport.h').read_text()
loader = (repo / 'docs/integration/proposed/aux-native-embedded-image-preparation/source/AuxSignedFreshBootstrapPolicyLoader.swift').read_text()
reader = (here / 'source/AuxAuthenticatedChildParentPolicyReader.swift').read_text()
for name in ('canonical', 'metadata', 'sameEntry', 'signingInfo', 'signature', 'resource'):
    start = loader.index('    private static func ' + name + '(')
    lines = loader[start:].splitlines(keepends=True)
    end = next(i for i, line in enumerate(lines[1:], 1) if line.startswith('    ') and not line.startswith('        ') and line.strip() and not line.startswith('    }'))
    text = ''.join(lines[:end])
    method = text[:text.rfind('    }\n') + 6]
    assert reader.count(method) == 1, name
start = loader.index('    fileprivate static func authenticatedGuestParent(')
end = loader.index('\n}\n\n// No C++ objects', start)
assert loader[start:end] in reader
start = loader.index('@_cdecl("AuxCopyAuthenticatedFreshChildParentDescriptor")')
end = loader.index('\n// This entry', start)
assert loader[start:end].strip().replace('AuxSignedFreshBootstrapPolicyLoader.authenticatedGuestParent(', 'AuxAuthenticatedChildParentPolicyReader.authenticatedGuestParent(') in reader
assert not any(token in reader for token in ('AuxFreshNativeHome', 'developmentImportedSecuritySymbol', 'SecItem', 'SecKey', 'dlopen(', 'createFreshHome('))
assert (here / 'source/AuxFreshBootstrapPolicy.swift').read_bytes() == (repo / 'docs/integration/proposed/aux-native-embedded-image-preparation/source/AuxFreshBootstrapPolicy.swift').read_bytes()
assert cc.count('NativeOperations::AuthenticatedGuestParent(') == 2
assert cc.count('AuxCopyAuthenticatedFreshChildParentDescriptor(') == 1
assert cc.count('AuxCopyAuthenticatedFreshColdHomeDescriptor(') == 1
print('PASS: exact child-only guards + two-file read-only parent Swift dependency subset; uncompiled/unlinked/unexecuted')
