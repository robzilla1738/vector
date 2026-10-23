#!/usr/bin/env python3
"""Check frozen source/seam bytes, not native behavior or admission."""
import hashlib
import json
from pathlib import Path

proposal = Path(__file__).resolve().parent
root = proposal.parents[3]
manifest = json.loads((proposal / 'source-pins.json').read_text())
for relative, digest in manifest['sourceInputs'].items():
    assert hashlib.sha256((root / relative).read_bytes()).hexdigest() == digest, relative
for absolute, digest in manifest['nativeSeamInputs'].items():
    assert hashlib.sha256(Path(absolute).read_bytes()).hexdigest() == digest, absolute
contract = json.loads((proposal / 'integration-contract.json').read_text())
assert contract['stateHomeAnchorCount'] == 1
source = (proposal / 'source/AuxNativePeerTransport.cc').read_text()
assert source.count('++state->snapshot.authenticated_ready_home_exports;') == 1
assert source.index('reply_cleanup.Disarm();\n  state->child_pid_version') < source.index('++state->snapshot.authenticated_ready_home_exports;')
holder = (proposal / 'source/AuxSelectedStateHome.cc').read_text()
assert 'GetVar' not in holder and 'AUX_HOME' not in holder
assert holder.count('state.selected_route = true;') == 1
assert 'state.selected_route = false;' not in holder
assert 'std::chrono::seconds(10)' in holder
assert 'state.monitor_creator == base::PlatformThread::CurrentRef()' in holder
assert 'current->generation != pulse->generation' in holder
assert 'current->exports < pulse->exports' in holder
assert 'ExchangeStatus::timedOut) continue;' in holder
print('Selected-home pulse/holder source and actual startup seams pinned; no compilation/execution.')
