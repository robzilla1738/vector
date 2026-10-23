#!/usr/bin/env python3
"""Compile changed production queue TU in private overlay, never link/launch."""
from pathlib import Path

import json, shlex, subprocess, argparse, hashlib, time

PROPOSAL_ROOT = Path(__file__).resolve().parent
parser = argparse.ArgumentParser()
parser.add_argument('--output', type=Path, required=True)
arguments = parser.parse_args()
compile_pins = json.loads((PROPOSAL_ROOT / 'compile-inputs.json').read_text())
native_root = Path(compile_pins['nativeSourceRoot'])
build_root = native_root / 'out/AuxFast'
output_root = arguments.output.resolve()
assert not output_root.exists() and native_root not in output_root.parents
for item in compile_pins['inputs']:
    assert (
        hashlib.sha256((native_root / item['path']).read_bytes()).hexdigest()
        == item['sha256']
    ), item['path']

gn_variables = {}
for line in (native_root / compile_pins['gn']).read_text().splitlines():
    if ' = ' in line and not line.startswith(' '):
        key, value = line.split(' = ', 1)
        gn_variables[key] = value.replace('$:', ':')

output_root.mkdir(parents=True)
command = [
    str(native_root / 'third_party/llvm-build/Release+Asserts/bin/clang++'),
    '-I' + str(PROPOSAL_ROOT / 'source'),
]
for key in ['defines', 'include_dirs', 'cflags', 'cflags_cc', 'module_deps']:
    command += shlex.split(gn_variables[key])
command += [
    '-fmodule-name=' + gn_variables['cc_module_name'] + '_Private',
    '-c',
    str(PROPOSAL_ROOT / 'source/extensions/browser/service_worker/service_worker_task_queue.cc'),
    '-o',
    str(output_root / 'service_worker_task_queue.o'),
]
started = time.monotonic()
result = subprocess.run(command, cwd=build_root, capture_output=True, text=True)
(output_root / 'compile.log').write_text(result.stdout + result.stderr)
(output_root / 'result.json').write_text(
    json.dumps(
        {
            'exitCode': result.returncode,
            'seconds': time.monotonic() - started,
            'command': command,
        },
        indent=2,
    ) + '\n'
)
print(result.stdout + result.stderr)
raise SystemExit(result.returncode)
