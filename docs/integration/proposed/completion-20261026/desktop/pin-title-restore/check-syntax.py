from pathlib import Path
import hashlib
import json
import shlex
import subprocess

HERE = Path(__file__).resolve().parent
SOURCE = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
BUILD = SOURCE / 'out/AuxFast'
plan = json.loads((HERE / 'source-plan.json').read_text())
roots = []
for record in plan['files']:
    output = HERE / 'source' / record['path']
    if hashlib.sha256(output.read_bytes()).hexdigest() != record['outputSha256']:
        raise ValueError(record['path'])
    roots.append({'type': 'file', 'name': str(SOURCE / record['path']), 'external-contents': str(output)})
overlay = HERE / 'vfs.json'
overlay.write_text(json.dumps({'version': 0, 'case-sensitive': 'true', 'roots': roots}, indent=2) + '\n')
variables = {}
for line in (BUILD / 'obj/chrome/browser/ui/ui.ninja').read_text().splitlines():
    if line and not line.startswith(' ') and ' = ' in line:
        key, value = line.split(' = ', 1)
        variables[key] = value.replace('$:', ':')
flags = []
for key in ['defines', 'include_dirs', 'cflags', 'cflags_cc', 'module_deps']:
    flags.extend(shlex.split(variables[key]))
results = []
for record in plan['files']:
    if not record['path'].endswith('.cc'):
        continue
    command = [str(SOURCE / 'third_party/llvm-build/Release+Asserts/bin/clang++'),
               *flags, '-fmodule-name=' + variables['cc_module_name'] + '_Private',
               '-ivfsoverlay', str(overlay), '-fsyntax-only', str(SOURCE / record['path'])]
    done = subprocess.run(command, cwd=BUILD, capture_output=True, text=True)
    log = Path(record['path']).stem + '.syntax.txt'
    (HERE / log).write_text(done.stdout + done.stderr)
    results.append(dict(path=record['path'], sourceSha256=record['outputSha256'], exitCode=done.returncode, log=log, command=command))
    print(record['path'], done.returncode, flush=True)
(HERE / 'syntax.json').write_text(json.dumps(dict(passed=all(r['exitCode'] == 0 for r in results), results=results, nativeTreeChanged=False, appExecuted=False), indent=2) + '\n')
raise SystemExit(any(r['exitCode'] != 0 for r in results))
