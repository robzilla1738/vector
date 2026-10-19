#!/usr/bin/env python3
"""Build an applied composition and record actual artifacts and generated-key proof.

Compilation uses scripts/native-build.py; this command never applies source patches.
"""
import argparse
from datetime import datetime, timezone
import hashlib
import json
import os
from pathlib import Path
import plistlib
import subprocess
import sys
import tempfile

repository = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('composition', type=Path)
parser.add_argument('--depot-tools', type=Path, required=True)
parser.add_argument('--build-dir', default='out/AuxFast')
parser.add_argument('--jobs', type=int, default=10)
parser.add_argument('--receipt', type=Path, required=True)
options = parser.parse_args()
if not 1 <= options.jobs <= 32:
    raise ValueError('Invalid native build job limit')
composition_bytes = (options.composition.resolve() / 'manifest.json').read_bytes()
composition = json.loads(composition_bytes)
native = Path(composition['sourceRoot']).resolve()
build = (native / options.build_dir).resolve()
if native not in build.parents:
    raise ValueError('Native output must be within its checkout')
receipt = options.receipt.resolve()
if receipt.exists():
    raise ValueError('Native build receipt must be new')

def digest(path):
    value = hashlib.sha256()
    with path.open('rb') as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b''):
            value.update(chunk)
    return value.hexdigest()

def verify_sources():
    for item in composition['files']:
        relative = Path(item['path'])
        if relative.is_absolute() or '..' in relative.parts:
            raise ValueError('Unsafe native composition path')
        path = native / relative
        if path.resolve() != path or not path.is_file() or digest(path) != item['outputSha256']:
            raise ValueError(f'Applied source does not match composition: {item["path"]}')
    for item in composition['binaryAssets']:
        relative = Path(item['target'])
        if relative.is_absolute() or '..' in relative.parts or (native / relative).resolve() != native / relative:
            raise ValueError('Unsafe native artwork path')
        if digest(native / relative) != item['replacementSha256']:
            raise ValueError('Applied native artwork differs from composition')

verify_sources()
args_file = build / 'args.gn'
args_bytes = args_file.read_bytes()
args_text = args_bytes.decode()
import re
for name, value in [('enable_aux_browser', 'true'), ('enable_aux_shell', 'false'), ('is_component_build', 'false'), ('aux_test_hooks', 'false')]:
    if not re.search(rf'^\s*{name}\s*=\s*{value}\s*$', args_text, re.M):
        raise ValueError(f'Native GN setting required: {name}={value}')
command = [str(options.depot_tools.resolve() / 'autoninja'), '-C', str(build.relative_to(native)),
           'chrome', 'auth_scheme_probe', '-j', str(options.jobs)]
subprocess.run([sys.executable, str(repository / 'scripts/native-build.py'), *command], cwd=native, check=True)
verify_sources()
if args_file.read_bytes() != args_bytes:
    raise ValueError('Native build flags changed during compilation')

# This fixture generates its own keys with upstream crypto; no native carrier,
# owner profile, Keychain item or service is involved.
probe = build / 'auth_scheme_probe'
with tempfile.TemporaryDirectory(prefix='aux-native-crypto-proof-') as scratch:
    subprocess.run([str(probe)], cwd=scratch,
                   env={'HOME': scratch, 'TMPDIR': scratch, 'PATH': '/usr/bin:/bin'},
                   check=True, timeout=30)

app = build / 'Aux.app'
artifacts = [app / 'Contents/MacOS/Aux', probe]
frameworks = list((app / 'Contents/Frameworks').glob('*.framework'))
if not frameworks:
    raise ValueError('Built native browser framework is absent')
for framework in frameworks:
    info = plistlib.loads((framework / 'Resources/Info.plist').read_bytes())
    executable = info.get('CFBundleExecutable')
    if not isinstance(executable, str) or '/' in executable or executable in ['', '.', '..']:
        raise ValueError('Invalid native framework executable')
    code = (framework / executable).resolve()
    if app not in code.parents:
        raise ValueError('Native framework is not self-contained in the app')
    artifacts.append(code)
files = []
for path in artifacts:
    if build not in path.resolve().parents or not path.is_file():
        raise ValueError('Native build artifact is missing or escapes output')
    files.append({'path': str(path.relative_to(build)), 'sha256': digest(path)})
app_files = []
for directory, directories, names in os.walk(app, followlinks=False):
    for name in sorted(directories + names):
        path = Path(directory) / name
        relative = str(path.relative_to(app))
        mode = path.lstat().st_mode & 0o777
        if path.is_symlink():
            link = os.readlink(path)
            if os.path.isabs(link) or app not in path.resolve(strict=True).parents:
                raise ValueError('Native app contains an escaping dependency link')
            app_files.append({'path': relative, 'type': 'symlink', 'linkTarget': link, 'mode': mode})
        elif path.is_file():
            app_files.append({'path': relative, 'type': 'file', 'sha256': digest(path), 'mode': mode})
        elif not path.is_dir():
            raise ValueError('Native app contains an unsupported object')
app_files.sort(key=lambda item: item['path'])
record = {
    'version': 1, 'implementation': 'supplied', 'productionReady': False,
    'nativeRoot': str(native), 'buildRoot': str(build), 'app': 'Aux.app',
    'compositionSha256': hashlib.sha256(composition_bytes).hexdigest(),
    'argsSha256': hashlib.sha256(args_bytes).hexdigest(),
    'command': command, 'buildExitCode': 0, 'generatedKeyProbePassed': True,
    'files': files, 'appFiles': app_files, 'recordedAt': datetime.now(timezone.utc).isoformat(),
    'remaining': ['Guarded original-native loading and common Aux authority', 'Explicit local signing', 'Disposable packaged UI/runtime and functional acceptance'],
}
receipt.parent.mkdir(parents=True, exist_ok=True)
with receipt.open('x') as stream:
    json.dump(record, stream, indent=2)
    stream.write('\n')
print(json.dumps({'receipt': str(receipt), 'artifacts': len(files), 'generatedKeyProbePassed': True, 'productionReady': False}))
