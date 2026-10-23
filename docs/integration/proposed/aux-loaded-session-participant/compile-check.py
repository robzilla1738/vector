#!/usr/bin/env python3
"""Compile the two changed real TUs with pinned existing GN flags, no linking."""
import argparse
import hashlib
import json
from pathlib import Path
import shlex
import subprocess
import time

HERE = Path(__file__).resolve().parent
sha = lambda raw: hashlib.sha256(raw).hexdigest()

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    pins = json.loads((HERE / 'compile-inputs.json').read_text())
    native = Path(pins['nativeSourceRoot']).resolve()
    build = native / pins['buildDirectory']
    output = args.output.resolve()
    if output.exists() or output == native or native in output.parents or output in native.parents:
        raise ValueError('Fresh output outside the native checkout required')
    subprocess.run(['python3', str(HERE / 'verify.py')], check=True)
    for item in pins['gnInputs']:
        assert sha((native / item['path']).read_bytes()) == item['sha256'], item['path']
    output.mkdir(parents=True)
    results = []
    for item in pins['translationUnits']:
        variables = {}
        for line in (build / item['gn']).read_text().splitlines():
            if ' = ' in line and not line.startswith(' '):
                key, value = line.split(' = ', 1)
                variables[key] = value.replace('$:', ':')
        command = [str(native / 'third_party/llvm-build/Release+Asserts/bin/clang++'),
                   '-I' + str(HERE / 'source')]
        for key in ['defines', 'include_dirs', 'cflags', 'cflags_cc', 'module_deps']:
            command += shlex.split(variables[key])
        command += ['-fmodule-name=' + variables['cc_module_name'] + '_Private',
                    '-c', str(HERE / 'source' / item['path']),
                    '-o', str(output / (Path(item['path']).stem + '.o'))]
        started = time.monotonic()
        result = subprocess.run(command, cwd=build, capture_output=True, text=True)
        (output / (Path(item['path']).stem + '.log')).write_text(result.stdout + result.stderr)
        results.append({'path': item['path'], 'exitCode': result.returncode,
                        'seconds': time.monotonic() - started,
                        'command': command})
        (output / 'results.json').write_text(json.dumps(results, indent=2) + '\n')
        if result.returncode:
            raise SystemExit(result.returncode)
    print('PASS:2 real changed Chromium TUs compiled; no link, browser, backend I/O or protected execution')

if __name__ == '__main__':
    main()
