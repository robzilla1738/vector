#!/usr/bin/env python3
"""Run only under scripts/native-build.py, after the frozen a3 build finishes."""
from pathlib import Path
import subprocess
import sys

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[4]
subprocess.run([sys.executable, str(HERE / 'project-browser-a4.py')], cwd=ROOT, check=True)
raise SystemExit(subprocess.call([
    sys.executable,
    str(ROOT / 'docs/integration/proposed/browser-feature-expansion/integration/full-build.py'),
    '--snapshot', '/private/tmp/aux-chromium-recovery-snapshot-20261023',
    '--input-pins', str(HERE / 'full-native-input-pins-a4.json'),
    '--require-input-pins', '--build', '--jobs', '12',
    '--receipt-name', 'unsigned-standard-profile-browser-build-20261024-a4'], cwd=ROOT))
