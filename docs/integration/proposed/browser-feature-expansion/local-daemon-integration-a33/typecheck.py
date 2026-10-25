"""Check the actual paired Swift owners without emitting a host executable."""
from pathlib import Path
import hashlib
import json
import subprocess
import time

HERE = Path(__file__).resolve().parent
plan = json.loads((HERE/'typecheck-plan.json').read_text())
sha = lambda path: hashlib.sha256(Path(path).read_bytes()).hexdigest()
def verify():
    for name, digest in plan['sourcePins'].items():
        if sha(name) != digest:
            raise ValueError('Source changed: '+name)
    if sha(plan['actualBaseReceipt']) != plan['actualBaseLinkReceiptSha256']:
        raise ValueError('Actual base link receipt changed')

verify()
started = time.monotonic()
with (HERE/'typecheck.stdout').open('wb') as stdout, (HERE/'typecheck.stderr').open('wb') as stderr:
    result = subprocess.run(plan['command'], stdout=stdout, stderr=stderr)
verify()
receipt = dict(passed=result.returncode == 0, exitCode=result.returncode,
    planSha256=sha(HERE/'typecheck-plan.json'), seconds=time.monotonic()-started,
    sourceCount=plan['sourceCount'], hostExecutableEmitted=False, productLinked=False,
    productExecuted=False, productSigned=False)
(HERE/'actual-typecheck.json').write_text(json.dumps(receipt, indent=2)+'\n')
print(json.dumps(receipt))
raise SystemExit(result.returncode)
