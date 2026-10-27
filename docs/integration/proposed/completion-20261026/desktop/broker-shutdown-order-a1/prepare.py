#!/usr/bin/env python3
"""Let in-flight producer work finish its brokered writes before admission closes."""
import hashlib, json, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[6]
APP = ROOT/'out/provided-candidate-completion-20261026-a1/Aux.app'
DAEMON = 'Contents/Resources/aux/apps/daemon/Aux Daemon.app/Contents/Resources/node-development/'
RECEIPT = Path(sys.argv[1]).resolve()
OUT = ROOT/'out/live-inputs/completion-20261026/broker-shutdown-order-a1'
sha = lambda data: hashlib.sha256(data).hexdigest()
# beginShutdown refused every broker entry before calling producer stops, so a
# memory write already in flight failed (AUX_BROKER_CLOSED), its close rejected
# and the owner was retained. New resources are refused from the start; writes
# from running work are admitted until the producer stops settle.
EDITS = [
    ("let closing=false,shutdown,lifetimeFailure,operationFailure;",
     "let closing=false,stopping=false,shutdown,lifetimeFailure,operationFailure;"),
    ("const admit=()=>{if(closing)throw Error('AUX_BROKER_CLOSED');funcs.assertBrokerOwner()};",
     "const admit=()=>{if(closing)throw Error('AUX_BROKER_CLOSED');funcs.assertBrokerOwner()};\n const admitNew=()=>{if(stopping)throw Error('AUX_BROKER_CLOSED');admit()};"),
    ("function database(factory){\n  admit();", "function database(factory){\n  admitNew();"),
    ("function logStream(factory,endOnShutdown=true){\n  admit();", "function logStream(factory,endOnShutdown=true){\n  admitNew();"),
    ("function registerProducerStop(stop){admit();producerStops.add(stop)}", "function registerProducerStop(stop){admitNew();producerStops.add(stop)}"),
    ("function watcher(factory){\n  admit();", "function watcher(factory){\n  admitNew();"),
    ("  if(shutdown)return shutdown;\n  closing=true;\n  const report=", "  if(shutdown)return shutdown;\n  stopping=true;\n  const report="),
    ("   report('broker.producers.settled');\n", "   report('broker.producers.settled');\n   closing=true;\n"),
]
rows = {row['path']: row for row in json.loads(RECEIPT.read_text())['files']}
OUT.mkdir(parents=True, exist_ok=False)
result = {'format': 'aux.broker-shutdown-order.v1', 'signedReceipt': {'path': str(RECEIPT), 'sha256': sha(RECEIPT.read_bytes())}, 'outputs': {}}
for name in ('index.mjs', 'aux-native-entry.mjs'):
    data = (APP/DAEMON/name).read_bytes()
    if sha(data) != rows[DAEMON+name]['sha256']: raise SystemExit('Candidate preimage changed: '+name)
    text = data.decode()
    for old, new in EDITS:
        if text.count(old) != 1: raise SystemExit(f'{name}: anchor drift: {old[:50]}')
        text = text.replace(old, new)
    out = text.encode(); (OUT/name).write_bytes(out)
    result['outputs'][name] = {'path': str(OUT/name), 'beforeSha256': sha(data), 'sha256': sha(out)}
result['edits'] = [{'find': o, 'replace': n, 'count': 1} for o, n in EDITS]
(OUT/'preparation-receipt.json').write_text(json.dumps(result, indent=2)+'\n')
print(json.dumps(result['outputs'], indent=2))
