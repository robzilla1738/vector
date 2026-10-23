#!/usr/bin/env python3
"""Compile isolated parent/child ABI graphs, never link or execute native code."""
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


def verify_pins(inputs):
    expected = {entry['path'] for entry in inputs['files']}
    actual = {str(path.relative_to(HERE)) for path in (HERE / 'source').iterdir()
              if path.suffix in {'.cc', '.h'}}
    if actual != expected:
        raise ValueError('Source/header inventory differs from reviewed inputs')
    for entry in inputs['files']:
        if sha(HERE / entry['path']) != entry['outputSha256']:
            raise ValueError('Source pin differs: ' + entry['path'])
    for entry in inputs['referenceInputs'] + inputs['compileInputs']:
        if sha(Path(entry['path'])) != entry['sha256']:
            raise ValueError('Reference/config pin differs: ' + entry['path'])
    if sha(HERE / 'gn/BUILD.gn') != inputs['proposedGnSha256']:
        raise ValueError('Proposed GN pin differs')
    if sha(HERE / 'compile-check.py') != inputs['compileRecipeSha256']:
        raise ValueError('Compile recipe pin differs')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--remaining-after-85029', action='store_true',
                        help='Compile only corrected delivery and the two not-yet-run Node objects')
    args = parser.parse_args()
    output = args.output.resolve()
    if output.exists() or NATIVE == output or NATIVE in output.parents:
        raise SystemExit('Fresh external output required')
    output.mkdir(parents=True)
    results = {'format': 'aux.native-child-handoff.compile.v2', 'commands': [],
               'linked': False, 'nativeCodeExecuted': False, 'passed': False}
    error = None
    inputs_bytes = (HERE / 'inputs.json').read_bytes()
    inputs = json.loads(inputs_bytes)
    results['inputsSha256'] = hashlib.sha256(inputs_bytes).hexdigest()
    try:
        verify_pins(inputs)
        results['prePinsVerified'] = True
        results['mode'] = 'remaining-after-85029' if args.remaining_after_85029 else 'full'
        if args.remaining_after_85029:
            prior = HERE.parent / 'aux-native-endpoint-delivery-fix' / 'results.json'
            if sha(prior) != inputs['endpointDeliverySuccessor']['priorResultSha256']:
                raise ValueError('Failed85029 evidence changed')
            previous = json.loads(prior.read_text())
            if not previous.get('prePinsVerified') or not previous.get('postPinsVerified'):
                raise ValueError('Previous graph was not source-pinned')
            expected = [('AuxNativePeerTransport.cc', 0), ('AuxOwnedNativePeerChild.cc', 0),
                        ('AuxNativeEndpointDelivery.cc', 1)]
            if [(entry['source'], entry['exitCode']) for entry in previous['commands']] != expected:
                raise ValueError('Unexpected prior graph result')
            for entry in previous['commands'][:2]:
                if sha(HERE / 'source' / entry['source']) != entry['sourceSha256']:
                    raise ValueError('Previously passed source changed')
            results['priorPassedObjects'] = previous['commands'][:2]
            results['priorResultSha256'] = sha(prior)
        variables = {}
        for line in (BUILD / 'obj/base/base.ninja').read_text().splitlines():
            if ' = ' in line and not line.startswith(' '):
                key, value = line.split(' = ', 1)
                variables[key] = value.replace('$:', ':')
        parent = [str(NATIVE / 'third_party/llvm-build/Release+Asserts/bin/clang++')]
        for key in ['defines', 'include_dirs', 'cflags', 'cflags_cc', 'module_deps']:
            parent += shlex.split(variables[key])
        if parent.count('-fno-exceptions') != 1 or '-fexceptions' in parent:
            raise ValueError('Actual reviewed parent exception mode changed')
        parent += ['-fmodule-name=' + variables['cc_module_name'] + '_Private']
        child = [inputs['nodeCompiler'], '-std=c++20', '-Wall', '-Wextra', '-Werror',
                 '-arch', 'arm64', '-mmacosx-version-min=13.0', '-fPIC']
        graphs = [
            ('chromium', parent, ['AuxNativePeerTransport.cc',
                                  'AuxOwnedNativePeerChild.cc',
                                  'AuxNativeEndpointDelivery.cc']),
            ('node-system-libcxx', child, ['AuxNativePeerTransport.cc',
                                         'AuxNativeParentConnectionBridge.cc']),
        ]
        for graph, prefix, names in graphs:
            if args.remaining_after_85029 and graph == 'chromium':
                names = ['AuxNativeEndpointDelivery.cc']
            for name in names:
                source = HERE / 'source' / name
                stem = graph + '-' + name
                command = prefix + ['-I', str(HERE / 'source'), '-c', str(source),
                                    '-o', str(output / (stem + '.o'))]
                result = subprocess.run(command, cwd=BUILD, capture_output=True, text=True)
                (output / (stem + '.log')).write_text(result.stdout + result.stderr)
                results['commands'].append({'graph': graph, 'source': name,
                                            'sourceSha256': sha(source),
                                            'command': command, 'exitCode': result.returncode})
                if result.returncode:
                    raise RuntimeError('Compile failed: ' + stem)
        results['passed'] = True
    except Exception as caught:
        error = caught
        results['error'] = str(caught)
    finally:
        try:
            if (HERE / 'inputs.json').read_bytes() != inputs_bytes:
                raise ValueError('Inputs changed during compile')
            verify_pins(inputs)
            results['postPinsVerified'] = True
        except Exception as caught:
            error = caught
            results['passed'] = False
            results['postPinError'] = str(caught)
        (output / 'results.json').write_text(json.dumps(results, indent=2) + '\n')
    if error:
        raise SystemExit(str(error))
    count = 3 if args.remaining_after_85029 else 5
    print(f'PASS: {count} newly compiled objects, two ABI graphs; no link/native execution')


if __name__ == '__main__':
    main()
