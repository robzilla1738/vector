#!/usr/bin/env python3
"""Static frozen source/finite pairing checks only; no native entry evaluation."""
from pathlib import Path
import hashlib
import json

here = Path(__file__).resolve().parent
repo = here.parents[3]
pins = json.loads((here / 'inputs.json').read_text())
for section in ['files', 'baseline']:
    for path, expected in pins[section].items():
        assert hashlib.sha256((repo / path).read_bytes()).hexdigest() == expected, path
source = (here / 'source/AuxNativePeerTransport.cc').read_text()
header = (here / 'source/AuxNativePeerTransport.h').read_text()
wire = (here / 'source/AuxNativePeerWire.h').read_text()
assert len(b'Aux Daemon Auth v1\0') == 19
assert 'message.size() != 51' in source
for method in ['SignDaemonChallenge', 'GetInstallationPublicKeys', 'GetAgentInboxV2MasterKey']:
    assert method in header and 'AuthenticatedSelectedHomeTransfer::' + method in source
for call in ['AuxBeginPreparedDaemonSignature', 'AuxBeginPreparedDaemonPublicKeys',
             'AuxBeginPreparedDaemonInboxKey', 'AuxObservePreparedDaemonAuthority',
             'AuxAckPreparedDaemonAuthority']:
    assert source.count(call + '(') == 1, call
assert 'kSign = 1, kPublicKeys = 2, kInboxKey = 3, kObserve = 4, kAcknowledge = 5' in wire
assert 'client->pending && !same' in source
assert 'const bool observe = same && client->attempted' in source
assert 'if (client->sequence == std::numeric_limits<uint64_t>::max())' in source
assert 'acknowledging = true;' in source
assert 'AcceptAuthorityReply(const DaemonAuthorityReply& reply' in header
assert 'DaemonAuthorityReply(const DaemonAuthorityReply&) = delete' in header
assert 'new DaemonAuthorityPublication(value, client)' in source
accept = source[source.index('DaemonAuthorityStatus AuthenticatedSelectedHomeTransfer::AcceptAuthorityReply'):]
assert 'client->completed != reply_value.payload' in accept
assert 'request.wire.operation = kAcknowledge' in accept
assert accept.index('publication->acknowledged = true') > accept.index('NativeOperations::Validate')
request = source[source.index('DaemonAuthorityReply AuthenticatedSelectedHomeTransfer::RequestAuthority'):source.index('DaemonAuthorityStatus AuthenticatedSelectedHomeTransfer::AcceptAuthorityReply')]
ready = request[request.index('DaemonAuthorityReply ready('):request.index('case 1:')]
assert 'client->pending = false' not in ready and 'acknowledging = true' not in ready
assert 'case 3:\n      client->closed = true;' in source
assert 'operation == kInboxKey && wire.length != 32' in source
assert 'memset_s' in source and source.count('PayloadWiper response_wiper(') == 3
assert 'All native\n  // registry/connection/server locks above have been released' in source
assert 'if (state_->authority_starting) return 1' in source
assert 'export_status == 1' in source and 'directory >= 0' in source
# No generic command/path/purpose fields enter the finite authority protocol.
part = wire[wire.index('struct AuthorityWire'):wire.index('// Apple libsyscall')]
assert not any(token in part for token in ['std::string', 'command', 'path', 'purpose'])
print('PASS: frozen finite3/sequence/ACK/ownership/source pairing; no compile, Mach, Security or protected execution')
