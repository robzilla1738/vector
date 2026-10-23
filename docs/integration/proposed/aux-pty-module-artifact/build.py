#!/usr/bin/env python3
"""Retain one unsigned current PTY module for metadata-only main pairing."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import stat
import subprocess

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

parser = argparse.ArgumentParser()
parser.add_argument('--workspace', type=Path, required=True)
parser.add_argument('--node-source', type=Path, required=True)
parser.add_argument('--addon-headers', type=Path, required=True)
parser.add_argument('--output', type=Path, required=True)
args = parser.parse_args()
here = Path(__file__).resolve().parent
control_hashes = {path: sha(path) for path in [here / 'build.py', here / 'inputs.json']}
workspace = args.workspace.resolve(strict=True)
node = args.node_source.resolve(strict=True)
addon = args.addon_headers.resolve(strict=True)
output = args.output
if not output.is_absolute() or output.parent.resolve(strict=True) != output.parent:
    raise SystemExit('Output requires an absolute canonical parent and a fresh final directory')
output.mkdir(mode=0o700)
output_stat = output.stat()
if output.is_symlink() or output_stat.st_uid != os.getuid() or stat.S_IMODE(output_stat.st_mode) != 0o700:
    raise SystemExit('Output must be a fresh private owned directory')

pins = json.loads((here / 'inputs.json').read_text())
roots = {'workspace': workspace, 'node': node, 'addon': addon}

inputs = [(roots[item['root']] / item['path'], item) for item in pins['inputs']]
if not all(sha(path) == item['sha256'] for path, item in inputs):
    raise SystemExit('Exact source/header input mismatch')
commands = []
logs = []

def run(command):
    commands.append([str(part) for part in command])
    result = subprocess.run(command, capture_output=True, text=True)
    logs.append(result.stdout + result.stderr)
    (output / 'build.log').write_text('\n'.join(logs))
    if result.returncode:
        raise SystemExit(result.returncode)
    return result.stdout

compiler = run(['xcrun', '--find', 'clang++']).strip()
sdk = run(['xcrun', '--show-sdk-path']).strip()
compiler_version = run([compiler, '--version']).strip()
producer = workspace / 'docs/integration/proposed/aux-node-pty-direct-child/source/pty.cc'
reservation = workspace / 'docs/integration/proposed/aux-native-pty-helper-host/source'
run([compiler, '-std=c++17', '-fexceptions', '-DNAPI_CPP_EXCEPTIONS',
     '-DNAPI_VERSION=8', '-DNODE_GYP_MODULE_NAME=pty',
     '-mmacosx-version-min=13.5', '-isysroot', sdk,
     '-I', str(addon), '-I', str(reservation), '-idirafter', str(node / 'src'),
     '-c', str(producer), '-o', str(output / 'pty.o')])
run([compiler, '-bundle', '-undefined', 'dynamic_lookup',
     '-Wl,-no_adhoc_codesign', '-mmacosx-version-min=13.5',
     str(output / 'pty.o'), '-o', str(output / 'pty.node')])
load_commands = run(['otool', '-l', str(output / 'pty.node')])
(output / 'load-commands.txt').write_text(load_commands)
if 'LC_CODE_SIGNATURE' in load_commands:
    raise SystemExit('Unexpected module signature')
undefined = run(['nm', '-u', str(output / 'pty.node')])
defined = run(['nm', '-gU', str(output / 'pty.node')])
(output / 'undefined-symbols.txt').write_text(undefined)
(output / 'defined-symbols.txt').write_text(defined)
imports = sorted(line.split()[-1] for line in undefined.splitlines() if line.strip())
exports = sorted(line.split()[-1] for line in defined.splitlines() if line.strip())
required = ['_AuxNativePty' + suffix for suffix in [
    'BeginCurrent', 'CanSpawn', 'CopyHelperPath', 'SpawnFailed',
    'ChildCreated', 'DirectWaitResult',
]]
if not all(symbol in imports for symbol in required):
    raise SystemExit('Missing actual native reservation imports')
if '_napi_register_module_v1' not in exports:
    raise SystemExit('Missing actual N-API module registration export')
if not all(sha(path) == item['sha256'] for path, item in inputs):
    raise SystemExit('Source/header inputs changed while compiling')
if not all(sha(path) == expected for path, expected in control_hashes.items()):
    raise SystemExit('Recipe or input manifest changed while compiling')
if output.stat().st_ino != output_stat.st_ino:
    raise SystemExit('Output directory changed while compiling')
receipt = {
    'format': 'aux.pty.module.artifact.v1', 'compiler': compiler_version,
    'sdk': sdk, 'commands': commands, 'inputs': pins['inputs'],
    'sourceInputsMatchedBeforeAndAfterCompilation': True,
    'recipeControlsMatchedBeforeAndAfterCompilation': True,
    'recipeSha256': control_hashes[here / 'build.py'],
    'inputManifestSha256': control_hashes[here / 'inputs.json'],
    'outputDirectory': str(output),
    'object': {'path': str(output / 'pty.o'), 'sha256': sha(output / 'pty.o'),
               'bytes': (output / 'pty.o').stat().st_size},
    'module': {'path': str(output / 'pty.node'), 'sha256': sha(output / 'pty.node'),
               'bytes': (output / 'pty.node').stat().st_size},
    'undefinedSymbols': imports, 'definedSymbols': exports,
    'nativeHostImports': required,
    'nodeApiImports': [symbol for symbol in imports if symbol.startswith(('_napi_', '_node_api_'))],
    'moduleCodeSignatureAbsent': True, 'moduleLoadedOrExecuted': False,
    'hostSymbolSatisfactionEstablished': False, 'helperRebuilt': False,
    'activePolicyOrAcceptedRuntimeChanged': False,
}
(output / 'artifact-receipt.json').write_text(json.dumps(receipt, indent=2) + '\n')
print(json.dumps({'module': receipt['module'], 'receipt': str(output / 'artifact-receipt.json'),
                  'executed': False, 'hostPairingEstablished': False}))
