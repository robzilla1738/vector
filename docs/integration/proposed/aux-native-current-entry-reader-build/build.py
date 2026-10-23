#!/usr/bin/env python3
"""Reuse all11 actual68715 objects; replace only fixed reader in46Swift link."""
import argparse
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import sys

HERE = Path(__file__).resolve().parent
LOCAL_REPOSITORY = HERE.parents[3]

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    recipe_sha = sha(HERE / 'build.py')
    inputs_sha = sha(HERE / 'inputs.json')
    pins = json.loads((HERE / 'inputs.json').read_text())
    root = Path(pins['sourceWorkspace'])
    prior = Path(pins['priorOutput'])
    tree = Path(pins['nodeTree'])
    reader = LOCAL_REPOSITORY / pins['reader']
    output = args.output.resolve()
    if output.exists() or root == output or root in output.parents or LOCAL_REPOSITORY in output.parents:
        raise SystemExit('Fresh external output required')

    def verify():
        if sha(HERE / 'build.py') != recipe_sha or sha(HERE / 'inputs.json') != inputs_sha:
            raise ValueError('Immutable successor recipe/inputs changed')
        for path, expected in pins['sourceFiles'].items():
            if sha(root / path) != expected:
                raise ValueError('Frozen source graph differs: ' + path)
        for path, expected in pins['externalReferences'].items():
            if sha(Path(path)) != expected:
                raise ValueError('External static reference differs: ' + path)
        if sha(reader) != pins['readerSha256']:
            raise ValueError('Exact four-literal reader successor required')
        for name, key in [('results.json', 'priorReceiptSha256'), ('original-verified-plan.json', 'priorPlanSha256'), ('Aux Daemon', 'priorExecutableSha256')]:
            if sha(prior / name) != pins[key]:
                raise ValueError('Actual68715 predecessor differs: ' + name)
        for name, expected in pins['objects'].items():
            if sha(prior / name) != expected:
                raise ValueError('Actual reused object differs: ' + name)
        if sha(root / pins['nodeReceipt']) != pins['nodeReceiptSha256'] or sha(tree / 'config.gypi') != pins['nodeConfigSha256']:
            raise ValueError('Original Node receipt/config differs')
        for path, expected in pins['nodeArchives'].items():
            if sha(tree / path) != expected:
                raise ValueError('Actual Node archive differs: ' + path)

    verify()
    previous = json.loads((prior / 'results.json').read_text())
    if previous['passed'] is not True or previous['executed'] is not True or previous['inputsUnchanged'] is not True or previous['results'] != [{'command': 9, 'exitCode': 0}, {'command': 11, 'exitCode': 0}]:
        raise SystemExit('Exact actual68715 successful receipt required')
    # The original planner verifies its exact public Node API, archive order,
    # source graph and tool inputs; planning does not compile any C++/Node.
    subprocess.run([sys.executable, str(root / 'docs/integration/proposed/aux-native-daemon-main/build.py'),
                    '--node-tree', str(tree), '--node-receipt', str(root / pins['nodeReceipt']),
                    '--node-receipt-sha256', pins['nodeReceiptSha256'], '--output', str(output)], check=True)
    planned = json.loads((output / 'plan-or-build.json').read_text())
    original_plan = json.loads((prior / 'original-verified-plan.json').read_text())
    expected = [[value.replace(str(prior), str(output)) for value in command] for command in original_plan['commands']]
    if planned['commands'] != expected or len(planned['commands']) != 12:
        raise SystemExit('Original planner no longer matches actual68715 plan')
    command = planned['commands'][11]
    old_reader = str(root / 'docs/integration/proposed/aux-native-sealed-parent-entry/source/AuxSealedNativeDaemonEntry.swift')
    if command.count(old_reader) != 1 or sum(value.endswith('.swift') for value in command) != 46:
        raise SystemExit('Exactly one logical reader among46 Swift sources required')
    command[command.index(old_reader)] = str(reader)
    for name, expected_hash in pins['objects'].items():
        shutil.copyfile(prior / name, output / name)
        if sha(output / name) != expected_hash:
            raise SystemExit('Copied actual object differs')
    (output / 'plan-or-build.json').rename(output / 'original-verified-plan.json')
    result = {'format': 'aux.current-native-reader.build.v1', 'passed': False,
              'priorReceiptSha256': pins['priorReceiptSha256'], 'readerSha256': pins['readerSha256'],
              'recipeSha256': sha(HERE / 'build.py'), 'inputsSha256': sha(HERE / 'inputs.json'),
              'reusedObjects': pins['objects'], 'nodeArchivesChecked': len(pins['nodeArchives']),
              'commands': [command], 'results': [], 'cppRecompiled': False, 'nodeRebuilt': False,
              'executableRun': False, 'moduleLoaded': False, 'signed': False}
    failure = None
    try:
        verify()
        process = subprocess.run(command, capture_output=True, text=True)
        (output / 'link.log').write_text(process.stdout + process.stderr)
        result['results'].append({'command': 11, 'exitCode': process.returncode})
        if process.returncode:
            raise RuntimeError('Actual reader successor Swift/link failed')
        result['executableSha256'] = sha(output / 'Aux Daemon')
        result['executableBytes'] = (output / 'Aux Daemon').stat().st_size
        reference = json.loads((root / 'docs/integration/proposed/aux-native-daemon-main/inputs.json').read_text())['ptyImportReference']
        check = subprocess.run([sys.executable, str(root / 'docs/integration/proposed/aux-native-embedded-pty-policy/check-final-exports.py'),
                                '--main', str(output / 'Aux Daemon'), '--main-sha256', result['executableSha256'],
                                '--module', str(root / reference['path']), '--module-sha256', reference['sha256'],
                                '--module-reference', '--output', str(output / 'pty-main-exports.json')], capture_output=True, text=True)
        (output / 'exports.log').write_text(check.stdout + check.stderr)
        result['ptyExportMetadataExitCode'] = check.returncode
        if check.returncode:
            raise RuntimeError('Actual export metadata check failed')
        result['ptyExportMetadataSha256'] = sha(output / 'pty-main-exports.json')
        result['passed'] = True
    except Exception as error:
        failure = error
        result['error'] = str(error)
    finally:
        try:
            verify()
            for name, expected_hash in pins['objects'].items():
                if sha(output / name) != expected_hash:
                    raise ValueError('Reused output object changed')
            result['inputsUnchanged'] = True
        except Exception as error:
            failure = error
            result['passed'] = False
            result['pinError'] = str(error)
        (output / 'results.json').write_text(json.dumps(result, indent=2) + '\n')
    if failure:
        raise SystemExit(str(failure))
    print('PASS: actual46Swift link,11 objects reused, metadata only; executable not run')

if __name__ == '__main__':
    main()
