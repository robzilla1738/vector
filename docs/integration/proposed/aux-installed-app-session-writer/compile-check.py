#!/usr/bin/env python3
"""Compile only the changed real TUs, then the actual-source captured fixture."""
import argparse
import hashlib
import json
from pathlib import Path
import shlex
import subprocess
import time

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
    assert not output.exists() and NATIVE not in output.parents
    subprocess.run(['python3', str(HERE / 'verify.py')], check=True)
    output.mkdir(parents=True)
    overlay = {'version': 0, 'roots': [{
        'type': 'file', 'name': str(NATIVE / path),
        'external-contents': str(HERE / 'source' / path),
    } for path in [
        'chrome/browser/ui/aux_session_writer_participant.h',
    ]]}
    (output / 'overlay.json').write_text(json.dumps(overlay))
    gn = BUILD / 'obj/chrome/browser/ui/ui.ninja'
    variables = {}
    for line in gn.read_text().splitlines():
        if ' = ' in line and not line.startswith(' '):
            key, value = line.split(' = ', 1)
            variables[key] = value.replace('$:', ':')
    results = []
    compiler = NATIVE / 'third_party/llvm-build/Release+Asserts/bin/clang++'
    for name in ['aux_profile_switch_session_rebuild.cc']:
        source = HERE / 'source/chrome/browser/ui' / name
        command = [str(compiler)]
        for key in ['defines', 'include_dirs', 'cflags', 'cflags_cc', 'module_deps']:
            command += shlex.split(variables[key])
        command += ['-ivfsoverlay', str(output / 'overlay.json'),
                    '-fmodule-name=' + variables['cc_module_name'] + '_Private',
                    '-c', str(source), '-o', str(output / (name + '.o'))]
        started = time.monotonic()
        result = subprocess.run(command, cwd=BUILD, capture_output=True, text=True)
        log = output / (name + '.log')
        log.write_text(result.stdout + result.stderr)
        results.append({'source': name, 'sourceSha256': sha(source),
                        'gnSha256': sha(gn), 'exitCode': result.returncode,
                        'seconds': time.monotonic() - started, 'command': command})
        (output / 'results.json').write_text(json.dumps(results, indent=2) + '\n')
        if result.returncode:
            print((result.stdout + result.stderr)[-7000:])
            raise SystemExit(result.returncode)
    fixture_command = [
        str(compiler), '-std=c++20', '-Wall', '-Wextra', '-Werror', '-pthread',
        '-I', str(HERE / 'source'), '-I', str(NATIVE),
        str(HERE / 'tests/accounting.cc'), '-o', str(output / 'admission'),
    ]
    subprocess.run(fixture_command, check=True)
    subprocess.run([str(output / 'admission')], check=True)
    (output / 'fixture.json').write_text(json.dumps({
        'exitCode': 0, 'command': fixture_command,
        'fixtureSha256': sha(HERE / 'tests/accounting.cc'),
        'artifactSha256': sha(output / 'admission'),
        'actualProductionSource': True, 'actualBrowserOrRendererExecuted': False,
    }, indent=2) + '\n')
    print('PASS: one changed real Chromium TU and one actual-source captured '
          'fixture; no checkout apply, browser link or protected execution')


if __name__ == '__main__':
    main()
