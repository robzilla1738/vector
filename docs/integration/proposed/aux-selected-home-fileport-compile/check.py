#!/usr/bin/env python3
"""Compile the pinned selected-home successor without linking or native execution."""
import argparse
import hashlib
import json
from pathlib import Path
import shlex
import subprocess

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]
NATIVE = Path('/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src')
BUILD = NATIVE / 'out/AuxFast'
PROPOSALS = ROOT / 'docs/integration/proposed'
SOURCE = PROPOSALS / 'aux-selected-home-fileport-retry/source'


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def verify(manifest):
    for relative, expected in manifest['workspaceInputs'].items():
        if sha(ROOT / relative) != expected:
            raise ValueError('Workspace input changed: ' + relative)
    for row in manifest['nativeConfigInputs']:
        if sha(Path(row['path'])) != row['sha256']:
            raise ValueError('Compiler/configuration input changed: ' + row['path'])
    if sha(HERE / 'check.py') != manifest['recipeSha256']:
        raise ValueError('Compile recipe changed')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    output = args.output.resolve()
    if output.exists() or NATIVE == output or NATIVE in output.parents:
        raise SystemExit('Fresh external output required')
    output.mkdir(parents=True)
    manifest_bytes = (HERE / 'inputs.json').read_bytes()
    manifest = json.loads(manifest_bytes)
    receipt = {'format': 'aux.selected-home-fileport.compile.v1', 'commands': [],
               'inputsSha256': hashlib.sha256(manifest_bytes).hexdigest(),
               'passed': False, 'linked': False, 'nativeCodeExecuted': False,
               'ipcOrSecurityExecuted': False}
    error = None
    try:
        verify(manifest)
        receipt['prePinsVerified'] = True
        variables = {}
        for line in (BUILD / 'obj/base/base.ninja').read_text().splitlines():
            if ' = ' in line and not line.startswith(' '):
                key, value = line.split(' = ', 1)
                variables[key] = value.replace('$:', ':')
        parent = [str(NATIVE / 'third_party/llvm-build/Release+Asserts/bin/clang++')]
        for key in ('defines', 'include_dirs', 'cflags', 'cflags_cc', 'module_deps'):
            parent += shlex.split(variables[key])
        if parent.count('-fno-exceptions') != 1 or '-fexceptions' in parent:
            raise ValueError('Actual Chromium exception mode changed')
        parent += ['-fmodule-name=' + variables['cc_module_name'] + '_Private']
        child = [manifest['nodeCompiler'], '-std=c++20', '-Wall', '-Wextra', '-Werror',
                 '-arch', 'arm64', '-mmacosx-version-min=13.0', '-fPIC']
        includes = ['-I', str(SOURCE), '-I', str(PROPOSALS / 'aux-native-child-handoff/source'),
                    '-I', str(PROPOSALS / 'aux-native-fresh-cold-bootstrap/source')]
        jobs = []
        for name in ('AuxNativePeerTransport.cc', 'AuxOwnedNativePeerChild.cc'):
            jobs.append(('chromium-' + name, parent + includes + ['-c', str(SOURCE / name)]))
        jobs.append(('chromium-AuxNativeEndpointDelivery.cc', parent + includes + ['-c',
                     str(PROPOSALS / 'aux-native-child-handoff/source/AuxNativeEndpointDelivery.cc')]))
        for name in ('AuxNativePeerTransport.cc', 'AuxNativeParentConnectionBridge.cc'):
            jobs.append(('node-' + name, child + includes + ['-c', str(SOURCE / name)]))
        jobs = [(name, command + ['-o', str(output / (name + '.o'))]) for name, command in jobs]
        jobs.append(('pure-wire-predicate', child + includes + ['-fsyntax-only',
                     str(PROPOSALS / 'aux-selected-home-fileport-retry/tests/wire-contract.cc')]))
        swift = ['xcrun', 'swiftc', '-typecheck', '-target', 'arm64-apple-macos13.0',
                 '-module-name', 'AuxFileportReadyHome', '-module-cache-path', str(output / 'swift-cache')]
        for flag in ('AUX_NATIVE_FRESH_RUNTIME_CONSUMER', 'AUX_MINIMAL_RUNTIME_DISPATCH',
                     'AUX_SCOPED_SECURE_STORE_DISPATCH', 'AUX_ATOMIC_CSK_DISPATCH', 'AUX_MACOS_UTILITY_DISPATCH'):
            swift += ['-D', flag]
        jobs.append(('swift-actual-loader-successor', swift + [str(ROOT / path) for path in manifest['swiftInputs']]))
        for name, command in jobs:
            result = subprocess.run(command, cwd=BUILD, capture_output=True, text=True)
            log = output / (name + '.log')
            log.write_text(result.stdout + result.stderr)
            receipt['commands'].append({'name': name, 'command': command,
                                        'exitCode': result.returncode, 'logSha256': sha(log)})
            artifact = output / (name + '.o')
            if artifact.is_file():
                receipt['commands'][-1]['objectSha256'] = sha(artifact)
            if result.returncode:
                raise RuntimeError('Compile failed: ' + name)
        receipt['passed'] = True
    except Exception as caught:
        error = caught
        receipt['error'] = str(caught)
    finally:
        try:
            if (HERE / 'inputs.json').read_bytes() != manifest_bytes:
                raise ValueError('Manifest changed during compile')
            verify(manifest)
            receipt['postPinsVerified'] = True
        except Exception as caught:
            error = caught
            receipt['passed'] = False
            receipt['postPinError'] = str(caught)
        (output / 'results.json').write_text(json.dumps(receipt, indent=2) + '\n')
    if error:
        raise SystemExit(str(error))
    print('PASS: five objects/two ABI graphs, pure wire predicate and actual Swift loader successor; no link/native execution')


if __name__ == '__main__':
    main()
