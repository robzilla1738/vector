"""Run one complete unsigned build after the affected owners compile."""
import json
import hashlib
import os
from pathlib import Path
import subprocess
import sys

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[4]
ROOT = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')

for name in ['actual-browser-compile-a2.json', 'actual-daemon-build-a4.json']:
    assert json.loads((HERE / name).read_text())['passed'], name
pins = json.loads((HERE / 'full-native-input-pins-a2.json').read_text())
refreshed = []
for relative in ['third_party/blink/public/mojom/dom_storage/storage_area.mojom',
                 'components/services/storage/public/mojom/local_storage_control.mojom',
                 'components/services/storage/public/mojom/session_storage_control.mojom']:
    path = ROOT / relative
    assert hashlib.sha256(path.read_bytes()).hexdigest() == pins['files'][relative]
    before = path.stat().st_mtime_ns
    os.utime(path, None)
    refreshed.append(dict(path=relative, sha256=pins['files'][relative],
        beforeMtimeNs=before, afterMtimeNs=path.stat().st_mtime_ns))
(HERE / 'generated-interface-refresh-a2.json').write_text(json.dumps(dict(
    sourceBytesChanged=False, refreshed=refreshed,
    reason='Restored A24 source timestamps predated newer deferred generated interfaces.'), indent=2) + '\n')
command = [sys.executable, str(HERE / 'full-build.py'),
    '--snapshot', '/private/tmp/aux-chromium-recovery-snapshot-20261023',
    '--input-pins', str(HERE / 'full-native-input-pins-a2.json'),
    '--require-input-pins', '--build', '--jobs', '12',
    '--receipt-name', 'unsigned-ordinary-fresh-browser-build-20261024-a42b']
(HERE / 'full-build-command-a2.json').write_text(json.dumps(dict(command=command,
    productSigned=False, productExecuted=False, ordinaryFreshNativeStartup=True,
    privilegedTasksEnabled=False), indent=2) + '\n')
raise SystemExit(subprocess.call(command, cwd=REPO))
