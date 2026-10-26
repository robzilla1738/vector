"""Compile only the three changed desktop translation units through a read-only VFS."""
from pathlib import Path
import hashlib
import json
import shlex
import subprocess

HERE = Path(__file__).resolve().parent
DESKTOP = HERE.parent / 'desktop'
SOURCE = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
BUILD = SOURCE / 'out/AuxFast'
sha = lambda file: hashlib.sha256(file.read_bytes()).hexdigest()
files = []
for directory in [DESKTOP, DESKTOP / 'quick-window']:
    plan = json.loads((directory / 'source-plan.json').read_text())
    for record in plan['files']:
        original = SOURCE / record['path']
        successor = directory / 'source' / record['path']
        if sha(original) != record['inputSha256'] or sha(successor) != record['outputSha256']:
            raise ValueError('Native input or overlay changed: ' + record['path'])
        files.append(dict(path=record['path'], overlay=str(successor)))
overlay = HERE / 'desktop-vfs.json'
overlay.write_text(json.dumps({'version': 0, 'case-sensitive': 'true', 'roots': [
    {'type': 'file', 'name': str(SOURCE / file['path']), 'external-contents': file['overlay']}
    for file in files]}, indent=2) + '\n')
variables = {}
for line in (BUILD / 'obj/chrome/browser/ui/ui.ninja').read_text().splitlines():
    if line and not line.startswith(' ') and ' = ' in line:
        key, value = line.split(' = ', 1)
        variables[key] = value.replace('$:', ':')
flags = []
for key in ['defines', 'include_dirs', 'cflags', 'cflags_cc', 'module_deps']:
    flags.extend(shlex.split(variables[key]))
results = []
for file in files:
    if not file['path'].endswith('.cc'):
        continue
    command = [str(SOURCE / 'third_party/llvm-build/Release+Asserts/bin/clang++'),
               *flags, '-fmodule-name=' + variables['cc_module_name'] + '_Private',
               '-ivfsoverlay', str(overlay), '-fsyntax-only', str(SOURCE / file['path'])]
    done = subprocess.run(command, cwd=BUILD, capture_output=True, text=True)
    log = HERE / (Path(file['path']).stem + '.syntax.txt')
    log.write_text(done.stdout + done.stderr)
    results.append(dict(path=file['path'], exitCode=done.returncode, log=str(log), command=command))
    print(file['path'], done.returncode, flush=True)
(HERE / 'desktop-syntax.json').write_text(json.dumps(dict(
    passed=all(result['exitCode'] == 0 for result in results), results=results,
    nativeTreeChanged=False, productExecuted=False), indent=2) + '\n')
raise SystemExit(any(result['exitCode'] != 0 for result in results))
