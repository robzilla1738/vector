#!/usr/bin/env python3
"""Remove the last Aside brand string from delivered extension code, keeping behavior."""
import hashlib, json, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[6]
APP = ROOT/'out/provided-candidate-completion-20261026-a1/Aux.app'
LEAF = 'Contents/Resources/aux/apps/extension/dist/assets/experimental-Xq3YsEPK.js'
RECEIPT = Path(sys.argv[1]).resolve()
OUT = ROOT/'out/live-inputs/completion-20261026/identity-residuals-a1'
sha = lambda data: hashlib.sha256(data).hexdigest()
# Experimental UI was shown only to Aside staff accounts. No Aux account has that
# domain, so the gate is already closed; the reserved .invalid domain keeps it
# closed without naming Aside.
FIND, REPLACE = '.endsWith("@at.studio")', '.endsWith("@aux.invalid")'
row = {r['path']: r for r in json.loads(RECEIPT.read_text())['files']}[LEAF]
data = (APP/LEAF).read_bytes()
if sha(data) != row['sha256']: raise SystemExit('Candidate preimage changed')
text = data.decode()
if text.count(FIND) != 1: raise SystemExit('Anchor drift')
out = text.replace(FIND, REPLACE).encode()
OUT.mkdir(parents=True, exist_ok=False); (OUT/Path(LEAF).name).write_bytes(out)
(OUT/'preparation-receipt.json').write_text(json.dumps({'format': 'aux.identity-residuals.v1', 'leaf': LEAF,
    'beforeSha256': sha(data), 'sha256': sha(out), 'edit': {'find': FIND, 'replace': REPLACE, 'count': 1}}, indent=2)+'\n')
print(sha(out))
