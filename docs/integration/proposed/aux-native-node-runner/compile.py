#!/usr/bin/env python3
"""Actual single-TU compile only; no Node/native execution."""
import hashlib
import json
from pathlib import Path
import subprocess
import tempfile

proposal = Path(__file__).resolve().parent
repo = proposal.parents[3]
pins = json.loads((proposal / 'inputs.json').read_text())['files']
def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()
for name, digest in pins.items():
    assert sha(repo / name) == digest, name
headers = repo / 'out/provided-source-snapshot-1.26.1016.1852/runtime/node/include/node'
header_pins = {str(p.relative_to(headers)): sha(p) for p in sorted(headers.rglob('*')) if p.is_file()}
assert 'node.h' in header_pins and 'v8.h' in header_pins
with tempfile.TemporaryDirectory(prefix='aux-node-runner-') as temporary:
    obj = Path(temporary) / 'runner.o'
    command = ['xcrun', 'clang++', '-std=c++20', '-arch', 'arm64',
               '-mmacosx-version-min=13.0', '-DNAPI_VERSION=8', '-fPIC',
               '-I', str(headers),
               '-I', str(proposal.parent / 'aux-native-environment-preload/source'),
               '-I', str(proposal.parent / 'aux-native-fresh-runtime-provider-quarantine/source'),
               '-c', str(proposal / 'source/AuxNativeNodeRunner.cc'), '-o', str(obj)]
    result = subprocess.run(command, capture_output=True, text=True)
    for name, digest in pins.items():
        assert sha(repo / name) == digest, name
    for name, digest in header_pins.items():
        assert sha(headers / name) == digest, name
    output = repo / 'out/aux-native-node-runner-compile'
    output.mkdir(parents=True, exist_ok=True)
    (output / 'compiler.log').write_text(result.stdout + result.stderr)
    (output / 'receipt.json').write_text(json.dumps({
        'format': 'aux.native-node-runner.actual-compile.v1',
        'inputsBeforeAndAfter': pins, 'headersBeforeAndAfter': header_pins,
        'command': command, 'exitCode': result.returncode,
        'objectSha256': sha(obj) if result.returncode == 0 else None,
        'linked': False, 'executed': False, 'protectedOperations': 0,
    }, indent=2) + '\n')
    print(result.stdout + result.stderr, end='')
    if result.returncode:
        raise SystemExit(result.returncode)
    print('PASS: actual Node runner object compiled; no link/load/runtime claim')
