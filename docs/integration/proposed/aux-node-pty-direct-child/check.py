#!/usr/bin/env python3
"""Compile the real patched addon; exercise only the syscall-result decoder."""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess
import tempfile

parser = argparse.ArgumentParser()
parser.add_argument('--node-source', type=Path, required=True)
parser.add_argument('--addon-headers', type=Path, required=True)
parser.add_argument('--reservation-headers', type=Path, required=True)
args = parser.parse_args()
here = Path(__file__).resolve().parent
upstream = here.parent / 'aux-native-pty-custody-feasibility/upstream/pty.cc'
assert hashlib.sha256(upstream.read_bytes()).hexdigest() == '5e1005d6bdcfbe97b486ee415419fe7adae99035047f07340fbad36419e0bae6'

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

evidence = here / 'evidence'
evidence.mkdir(exist_ok=True)
logs = []
commands = []

def run(command, cwd=None):
    commands.append([str(part) for part in command])
    result = subprocess.run(command, cwd=cwd, capture_output=True, text=True)
    logs.append(result.stdout + result.stderr)
    (evidence / 'compile.log').write_text('\n'.join(logs))
    if result.returncode:
        raise SystemExit(result.returncode)
    return result.stdout

compiler = run(['xcrun', '--find', 'clang++']).strip()
sdk = run(['xcrun', '--show-sdk-path']).strip()
version = run([compiler, '--version']).strip()
node = args.node_source.resolve()
headers = args.addon_headers.resolve()
reservation_headers = args.reservation_headers.resolve()
source_pins = json.loads((here / 'source-pins.json').read_text())
input_hashes = {here / name: details['sha256']
                for name, details in source_pins['files'].items()}
input_hashes[reservation_headers / 'AuxNativePtyReservation.h'] = source_pins['requiredHostHeader']['sha256']
assert all(sha(path) == expected for path, expected in input_hashes.items())
with tempfile.TemporaryDirectory(prefix='aux-pty-compile-') as temporary:
    output = Path(temporary)
    patched = here / 'source/pty.cc'
    common = [compiler, '-std=c++17', '-fexceptions', '-DNAPI_CPP_EXCEPTIONS',
              '-DNAPI_VERSION=8', '-DNODE_GYP_MODULE_NAME=pty',
              '-mmacosx-version-min=13.5', '-isysroot', sdk]
    run(common + ['-I', str(headers), '-I', str(reservation_headers),
                  '-idirafter', str(node / 'src'),
                  '-c', str(patched), '-o', str(output / 'pty.o')])
    run([compiler, '-bundle', '-undefined', 'dynamic_lookup',
         '-Wl,-no_adhoc_codesign', '-mmacosx-version-min=13.5',
         str(output / 'pty.o'), '-o', str(output / 'pty.node')])
    run([compiler, '-std=c++17', '-c', str(here / 'check-wait.cc'),
         '-o', str(output / 'check-wait.o')])
    load_commands = run(['otool', '-l', str(output / 'pty.node')])
    assert 'LC_CODE_SIGNATURE' not in load_commands
    symbols = run(['nm', '-u', str(output / 'pty.node')])
    assert '_waitpid' in symbols
    bridge_symbols = [
        'AuxNativePtyBeginCurrent', 'AuxNativePtyCanSpawn',
        'AuxNativePtySpawnFailed', 'AuxNativePtyChildCreated',
        'AuxNativePtyDirectWaitResult',
    ]
    assert all('_' + symbol in symbols for symbol in bridge_symbols)
    with tempfile.TemporaryDirectory(prefix='aux-pty-patch-') as original:
        target = Path(original) / 'src/unix'
        target.mkdir(parents=True)
        (target / 'pty.cc').write_bytes(upstream.read_bytes())
        run(['patch', '-p1', '-i', str(here / 'pty.patch')], cwd=original)
        assert (target / 'pty.cc').read_bytes() == patched.read_bytes()
    receipt = {
        'format': 'aux.node-pty.direct-child.compile.v1',
        'compiler': version, 'sdk': sdk, 'commands': commands,
        'sourceSha256': sha(patched),
        'sourceInputsMatchedBeforeAndAfterCompilation': True,
        'waitHeaderSha256': sha(here / 'source/direct-child-wait.h'),
        'patchSha256': sha(here / 'pty.patch'),
        'upstreamSourceSha256': sha(upstream),
        'nodeVersionHeaderSha256': sha(node / 'src/node_version.h'),
        'nodeApiHeaderSha256': sha(node / 'src/node_api.h'),
        'reservationHeaderSha256': sha(reservation_headers / 'AuxNativePtyReservation.h'),
        'requiredNativeHostImports': bridge_symbols,
        'hostBridgeResolvedOrExecuted': False,
        'napiHeaderSha256': sha(headers / 'napi.h'),
        'napiInlineHeaderSha256': sha(headers / 'napi-inl.h'),
        'objectSha256': sha(output / 'pty.o'),
        'unsignedModuleSha256': sha(output / 'pty.node'),
        'actualAddonCompiledAndLinked': True,
        'addonLoadedOrExecuted': False,
        'compileTimeWaitResultChecksPassed': True,
        'runtimeWaitOrFailureInjectionPerformed': False,
        'moduleCodeSignatureAbsent': True,
        'realPtySpawnPerformed': False,
        'acceptedRuntimeOrPolicyChanged': False,
        'descendantCustodyEstablished': False,
        'temporaryOutputsRemovedAfterCheck': True,
    }
assert all(sha(path) == expected for path, expected in input_hashes.items())
(evidence / 'receipt.json').write_text(json.dumps(receipt, indent=2) + '\n')
print(json.dumps({'compiled': True, 'compileTimeWaitResultChecks': True, 'addonExecuted': False}))
