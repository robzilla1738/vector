from pathlib import Path
import hashlib
import json
import shlex
import subprocess

HERE = Path(__file__).resolve().parent
SOURCE = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
BUILD = SOURCE / 'out/AuxFast'
plan = json.loads((HERE / 'source-plan.json').read_text())
files = []
for record in plan['files']:
    successor = HERE / 'source' / record['path']
    if hashlib.sha256(successor.read_bytes()).hexdigest() != record['outputSha256']:
        raise ValueError('Overlay changed: ' + record['path'])
    files.append({'type': 'file', 'name': str(SOURCE / record['path']), 'external-contents': str(successor)})
overlay = HERE / 'vfs.json'
overlay.write_text(json.dumps({'version': 0, 'case-sensitive': 'true', 'roots': files}, indent=2) + '\n')
variables = {}
for line in (BUILD / 'obj/chrome/browser/ui/ui.ninja').read_text().splitlines():
    if line and not line.startswith(' ') and ' = ' in line:
        key, value = line.split(' = ', 1)
        variables[key] = value.replace('$:', ':')
flags = []
for key in ['defines', 'include_dirs', 'framework_dirs', 'cflags', 'cflags_objcc']:
    flags.extend(shlex.split(variables.get(key, "")))
path = 'chrome/browser/aux/cli/AuxCliOpenCommand.mm'
command = [str(SOURCE / 'third_party/llvm-build/Release+Asserts/bin/clang++'),
           *flags, '-fmodule-name=' + variables['cc_module_name'] + '_Private',
           '-ivfsoverlay', str(overlay), '-fsyntax-only', str(SOURCE / path)]
done = subprocess.run(command, cwd=BUILD, capture_output=True, text=True)
(HERE / 'receiver-syntax.txt').write_text(done.stdout + done.stderr)
result = dict(path=path, exitCode=done.returncode, log='receiver-syntax.txt',
              sourceSha256=hashlib.sha256((HERE / 'source' / path).read_bytes()).hexdigest(),
              command=command, nativeTreeChanged=False, appExecuted=False)
(HERE / 'receiver-compile.json').write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps({key: value for key, value in result.items() if key != 'command'}))
raise SystemExit(done.returncode)
