"""Run one complete unsigned build after the affected owners compile."""
import json
from pathlib import Path
import subprocess
import sys

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[4]

for name in ['actual-browser-compile-a2.json', 'actual-daemon-build-a4.json']:
    assert json.loads((HERE / name).read_text())['passed'], name
command = [sys.executable, str(HERE / 'full-build.py'),
    '--snapshot', '/private/tmp/aux-chromium-recovery-snapshot-20261023',
    '--input-pins', str(HERE / 'full-native-input-pins-a2.json'),
    '--require-input-pins', '--build', '--jobs', '12',
    '--receipt-name', 'unsigned-ordinary-fresh-browser-build-20261024-a42']
(HERE / 'full-build-command.json').write_text(json.dumps(dict(command=command,
    productSigned=False, productExecuted=False, ordinaryFreshNativeStartup=True,
    privilegedTasksEnabled=False), indent=2) + '\n')
raise SystemExit(subprocess.call(command, cwd=REPO))
