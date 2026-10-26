"""Counted source/ownership checks only; native compilation belongs to integrator."""
from pathlib import Path
import hashlib,json
here=Path(__file__).resolve().parent;plan=json.loads((here/'plan.json').read_text())
for row in plan['files']:
 assert hashlib.sha256(Path(row['source']).read_bytes()).hexdigest()==row['beforeSha256']
 assert hashlib.sha256((here/'source'/row['successor']).read_bytes()).hexdigest()==row['afterSha256']
a=(here/'source/aux_account_api.cc').read_text();t=(here/'source/AuxNativePeerTransport.cc').read_text()
assert a.count('signing_challenge_ = challenge;')==1
assert a.count('signing_deadline_ = base::TimeTicks::Now() + base::Seconds(5);')==1
assert 'responded || base::TimeTicks::Now() >= deadline' in a
assert 'if (signing_response_sent_) return;\n  signing_response_sent_ = true;' in a
assert a.index('if (signing_response_sent_) return;',a.index('DidObserveInstallationSignature('))<a.index('DidSign(std::move(reply.signature))')
gate=t.index('if (observe_only && (!same || !client->attempted))')
assert t.index('if (client->pending && !same)')<gate<t.index('if (!same) {',gate)<t.index('client->pending = true;',gate)
assert 'const bool observe = same && client->attempted;' in t
assert 'request.wire.operation = acknowledging ? kAcknowledge : observe ? kObserve : operation;' in t
print('PASS pinned source and ownership invariants; no native compile/runtime claim')
