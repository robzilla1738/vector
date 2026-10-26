"""Build one frozen browser/CLI composition; never sign or execute the app."""
from pathlib import Path
import hashlib
import json
import shutil
import subprocess
import sys
import time

HERE = Path(__file__).resolve().parent
if len(sys.argv) != 2:
    raise SystemExit('Usage: build-browser.py FROZEN_PROJECTION_DIRECTORY')
OUT = Path(sys.argv[1]).resolve(strict=True)
projection = OUT / 'projection.json'
plan = json.loads(projection.read_text())
SOURCE = Path(plan['source'])
sha = lambda path: hashlib.sha256(Path(path).read_bytes()).hexdigest()
for row in plan['files']:
    if sha(SOURCE / row['path']) != row['outputSha256']:
        raise ValueError('Frozen browser source changed: ' + row['path'])
if (OUT / 'build-result.json').exists():
    raise ValueError('Preserve previous build receipt')
command = [str(SOURCE / 'third_party/ninja/ninja'), '-C', str(SOURCE / 'out/AuxFast'), '-k4', '-j4', 'chrome', 'native_cli_open']
start = time.monotonic()
with (OUT / 'build.stdout').open('xb') as stdout, (OUT / 'build.stderr').open('xb') as stderr:
    done = subprocess.run(command, cwd=SOURCE, stdout=stdout, stderr=stderr)
result = dict(format='aux.completion.browser-build.v1', passed=done.returncode == 0,
              exitCode=done.returncode, seconds=time.monotonic() - start, command=command,
              projection=str(projection), projectionSha256=sha(projection),
              productSigned=False, productExecuted=False, release=False)
for row in plan['files']:
    if sha(SOURCE / row['path']) != row['outputSha256']:
        raise ValueError('Frozen browser source changed during build: ' + row['path'])
if done.returncode == 0:
    app = SOURCE / 'out/AuxFast/Aux.app'
    frozen = OUT / 'Aux.app'
    subprocess.run(['/bin/cp', '-cRpP', str(app), str(frozen)], check=True)
    result['app'] = str(frozen)
    result['artifacts'] = []
    for relative in ['Contents/MacOS/Aux', 'Contents/Frameworks/Aux Framework.framework/Versions/155.0.8059.85/Aux Framework']:
        file = frozen / relative
        loads = subprocess.run(['/usr/bin/otool', '-l', str(file)], capture_output=True, check=True).stdout
        if b'LC_CODE_SIGNATURE' in loads:
            raise ValueError('Native build must remain unsigned: ' + relative)
        result['artifacts'].append(dict(path=str(file), relative=relative, sha256=sha(file), unsigned=True))
    cli = SOURCE / 'out/AuxFast/native_cli_open'
    if not cli.is_file():
        raise ValueError('Expected actual native_cli_open artifact')
    shutil.copy2(cli, OUT / 'native_cli_open')
    result['nativeCli'] = dict(path=str(OUT / 'native_cli_open'), sha256=sha(OUT / 'native_cli_open'))
(OUT / 'build-result.json').write_text(json.dumps(result, indent=2) + '\n')
(HERE / 'browser-build.json').write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps({key: result[key] for key in ['passed', 'exitCode', 'seconds', 'productSigned', 'productExecuted']}))
raise SystemExit(done.returncode)
