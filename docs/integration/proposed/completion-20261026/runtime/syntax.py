#!/usr/bin/env python3
"""Syntax-check the actual four changed translation units using a read-only VFS."""
import hashlib
import json
from pathlib import Path
import shlex
import subprocess

ROOT = Path(__file__).resolve().parent
SOURCE = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
BUILD = SOURCE / 'out/AuxFast'
plan = json.loads((ROOT / 'changes.json').read_text())
for item in plan['files']:
    if hashlib.sha256((SOURCE / item['path']).read_bytes()).hexdigest() != item['before']:
        raise RuntimeError('Native input changed: ' + item['path'])
overlay = {'version': 0, 'case-sensitive': 'true', 'roots': [
    {'type': 'file', 'name': str(SOURCE / item['path']),
     'external-contents': str(ROOT / 'source' / item['path'])}
    for item in plan['files']]}
(ROOT / 'vfs.json').write_text(json.dumps(overlay, indent=2) + '\n')
variables = {}
for line in (BUILD / 'obj/chrome/browser/extensions/api/messaging/messaging.ninja').read_text().splitlines():
    if line and not line.startswith(' ') and ' = ' in line:
        key, value = line.split(' = ', 1)
        variables[key] = value.replace('$:', ':')
flags = []
for key in ['defines', 'include_dirs', 'cflags', 'cflags_cc', 'module_deps']:
    flags.extend(shlex.split(variables[key]))
results = []
for item in plan['files']:
    if not item['path'].endswith('.cc'):
        continue
    args = [str(SOURCE / 'third_party/llvm-build/Release+Asserts/bin/clang++'),
            *flags, '-fmodule-name=' + variables['cc_module_name'] + '_Private',
            '-ivfsoverlay', str(ROOT / 'vfs.json'), '-fsyntax-only',
            str(SOURCE / item['path'])]
    result = subprocess.run(args, cwd=BUILD, capture_output=True, text=True)
    log = ROOT / (Path(item['path']).stem + '.syntax.txt')
    log.write_text(result.stdout + result.stderr)
    results.append({'path': item['path'], 'exitCode': result.returncode,
                    'log': log.name, 'command': args})
    print(item['path'], result.returncode, flush=True)
(ROOT / 'syntax.json').write_text(json.dumps({'sourceRoot': str(SOURCE), 'buildRoot': str(BUILD),
    'nativeTreeChanged': False, 'objectBuild': False, 'results': results}, indent=2) + '\n')
raise SystemExit(any(x['exitCode'] != 0 for x in results))
