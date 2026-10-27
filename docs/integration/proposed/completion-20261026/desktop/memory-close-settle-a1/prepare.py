#!/usr/bin/env python3
"""Let in-flight memory requests settle before the native memory close."""
import hashlib, json, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[6]
APP = ROOT/'out/provided-candidate-completion-20261026-a1/Aux.app'
DAEMON = 'Contents/Resources/aux/apps/daemon/Aux Daemon.app/Contents/Resources/node-development/'
RECEIPT = Path(sys.argv[1]).resolve()
OUT = ROOT/'out/live-inputs/completion-20261026/memory-close-settle-a1'
sha = lambda data: hashlib.sha256(data).hexdigest()
# Quitting while a startup index write was in flight made the native close fail
# ("Memory process closed before write completion"), so shutdown retained the
# owner. Wait up to 3 s, inside the browser's 5 s shutdown deadline; requests
# made meanwhile queue behind the close as before.
EDITS = [
    ("close(){if(this.#n)return this.#n;let Cn=this.#t;if(!Cn&&!this.#auxNativeClose)return Promise.resolve();",
     "async #auxSettlePending(){for(let Cn=Date.now()+3e3;this.#i.size&&Date.now()<Cn;)await new Promise(Cn=>setTimeout(Cn,25))}close(){if(this.#n)return this.#n;let Cn=this.#t;if(!Cn&&!this.#auxNativeClose)return Promise.resolve();"),
    ("return this.#n=this.#auxNativeClose().then(value=>{auxDaemonClosing&&auxShutdownDiagnostic('memory.native-close.settled')",
     "return this.#n=this.#auxSettlePending().then(()=>this.#auxNativeClose()).then(value=>{auxDaemonClosing&&auxShutdownDiagnostic('memory.native-close.settled')"),
]
rows = {row['path']: row for row in json.loads(RECEIPT.read_text())['files']}
OUT.mkdir(parents=True, exist_ok=False)
result = {'format': 'aux.memory-close-settle.v1', 'signedReceipt': {'path': str(RECEIPT), 'sha256': sha(RECEIPT.read_bytes())}, 'outputs': {}}
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
