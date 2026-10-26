"""Build the approved fixed disposable paths; never sign or launch."""
from pathlib import Path
import hashlib
import json
import shutil
import subprocess
import time

HERE = Path(__file__).resolve().parent
OUT = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/unsigned-disposable-location-build-20261025-a71')
sha = lambda path: hashlib.sha256(Path(path).read_bytes()).hexdigest()
pins = json.loads((HERE / 'browser-native-input-pins-a5.json').read_text())
source = Path(pins['source'])
assert not OUT.exists(), 'Fresh build receipt directory required'
for name, digest in pins['files'].items():
    assert sha(source / name) == digest, name
OUT.mkdir(mode=0o700)
command = [str(source / 'third_party/ninja/ninja'), '-C', str(source / 'out/AuxFast'), '-j4', 'chrome', 'native_cli_open']
start = time.monotonic()
with (OUT / 'build.stdout').open('wb') as stdout, (OUT / 'build.stderr').open('wb') as stderr:
    done = subprocess.run(command, cwd=source, stdout=stdout, stderr=stderr)
result = dict(passed=done.returncode == 0, command=command, exitCode=done.returncode,
              seconds=time.monotonic() - start, pinsSha256=sha(HERE / 'browser-native-input-pins-a5.json'),
              appExecuted=False, signed=False, release=False)
try:
    if done.returncode == 0:
        review = json.loads((HERE.parent / 'signing-review.json').read_text())
        targets = [row for row in review['targetsInSigningOrder'] if row['identifier'] in ['dev.aux.browser.framework', 'dev.aux.browser']]
        result['artifacts'] = []
        for row in targets:
            original = source / 'out/AuxFast/Aux.app' / row['executable']
            frozen = OUT / row['executable']
            frozen.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(original, frozen)
            assert sha(original) == sha(frozen)
            load = subprocess.run(['/usr/bin/otool', '-l', str(frozen)], check=True, capture_output=True).stdout
            assert b'LC_CODE_SIGNATURE' not in load, 'Product must remain unsigned'
            result['artifacts'].append(dict(path=str(frozen), executable=row['executable'], sha256=sha(frozen), unsigned=True))
        for name, digest in pins['files'].items():
            assert sha(source / name) == digest, name
finally:
    (OUT / 'receipt.json').write_text(json.dumps(result, indent=2) + '\n')
    (HERE / 'actual-browser-build-a5.json').write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps(result))
raise SystemExit(done.returncode)
