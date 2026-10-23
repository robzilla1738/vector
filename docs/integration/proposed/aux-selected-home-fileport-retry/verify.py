#!/usr/bin/env python3
"""Static verification only; does not run the wire fixture or native code."""
import hashlib
import json
from pathlib import Path

proposal = Path(__file__).resolve().parent
root = proposal.parents[3]
manifest = json.loads((proposal / 'source-pins.json').read_text())
for section in ('files', 'productionDependencies'):
    for relative, digest in manifest[section].items():
        assert hashlib.sha256((root / relative).read_bytes()).hexdigest() == digest, relative
for relative, call in manifest['timeoutCallerContracts'].items():
    assert (root / relative).read_text().count(call) == 1, relative
source = (proposal / 'source/AuxNativePeerTransport.cc').read_text()
assert source.count('!ValidTimeout(timeout_ms)') == 5
assert source.count('state->accepted_home = selected;') == 1
assert source.count('if (selected_request && !retry)') == 1
assert source.count('SameDirectory(state->accepted_home->state_->home, selected->state_->home)') == 1
assert source.count('SameDirectory(state->accepted_home->state_->parent, selected->state_->parent)') == 1
assert source.index('fileport_makefd(') < source.index('const bool retry =')
assert source.index('NativeOperations::AuthenticatedGuestParent(audit,') < source.index('const bool retry =')
assert source.count('accepted_home.reset();') == 2
print('Static retry/timeout source pins and actual 2000ms caller constants verified; fixture not executed.')
