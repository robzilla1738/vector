#!/usr/bin/env python3
"""Focused compile only: actual Chromium command, no checkout/IPC execution."""
import argparse
import hashlib
import json
from pathlib import Path
import shlex
import subprocess

HERE = Path(__file__).resolve().parent
NATIVE = Path('/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src')
BUILD = NATIVE / 'out/AuxFast'

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    output = args.output.resolve()
    if output.exists() or NATIVE == output or NATIVE in output.parents:
        raise SystemExit('Fresh external output required')
    output.mkdir(parents=True)
    ninja = BUILD / 'obj/base/base.ninja'
    variables = {}
    for line in ninja.read_text().splitlines():
        if ' = ' in line and not line.startswith(' '):
            key, value = line.split(' = ', 1)
            variables[key] = value.replace('$:', ':')
    compiler = NATIVE / 'third_party/llvm-build/Release+Asserts/bin/clang++'
    results = []
    for name in ['AuxNativePeerTransport.cc', 'AuxNativeParentConnectionBridge.cc',
                 'AuxOwnedNativePeerChild.cc', 'AuxNativeEndpointDelivery.cc']:
        command = [str(compiler)]
        for key in ['defines', 'include_dirs', 'cflags', 'cflags_cc', 'module_deps']:
            command += shlex.split(variables[key])
        # These inactive component sources explicitly use exception-safe native
        # error boundaries. No current Chromium TU or shared GN flag changes.
        exception_override = name != 'AuxNativeEndpointDelivery.cc'
        if exception_override:
            assert command.count('-fno-exceptions') == 1
            command.remove('-fno-exceptions')
            command.append('-fexceptions')
        source = HERE / 'source' / name
        command += ['-I', str(HERE / 'source'),
                    '-fmodule-name=' + variables['cc_module_name'] + '_Private',
                    '-c', str(source), '-o', str(output / (name + '.o'))]
        result = subprocess.run(command, cwd=BUILD, capture_output=True, text=True)
        (output / (name + '.log')).write_text(result.stdout + result.stderr)
        results.append({'source': name, 'sourceSha256': sha(source),
                        'gnCommandInputSha256': sha(ninja),
                        'exceptionModeOverride': exception_override,
                        'command': command, 'exitCode': result.returncode})
        (output / 'results.json').write_text(json.dumps(results, indent=2) + '\n')
        if result.returncode:
            print((result.stdout + result.stderr)[-8000:])
            raise SystemExit(result.returncode)
    print('PASS: four actual native TUs compiled; no link/IPC/Security/Node execution')

if __name__ == '__main__':
    main()
