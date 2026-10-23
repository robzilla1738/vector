#!/usr/bin/env python3
"""Append native parent entry to one explicitly selected frozen cold graph."""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess
import tempfile

here = Path(__file__).resolve().parent
repo = here.parents[3]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--cold-proposal', type=Path, required=True)
args = parser.parse_args()
cold = args.cold_proposal.resolve(strict=True)
assert cold.parent == here.parent
pins = json.loads((cold / 'source-pins.json').read_text())['swiftInputs']
own = json.loads((here / 'inputs.json').read_text())['files']
def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()
all_pins = {**pins, **own}
for name, digest in all_pins.items():
    assert sha(repo / name) == digest, name
sources = [str(repo / name) for name in pins]
sources.append(str(here / 'source/AuxSealedOuterBrowserParent.swift'))
with tempfile.TemporaryDirectory(prefix='aux-sealed-parent-types-') as temp:
    command = ['xcrun', 'swiftc', '-typecheck', '-target', 'arm64-apple-macos13.0',
               '-module-name', 'AuxSealedParentEntry', '-module-cache-path', temp + '/cache']
    for flag in ['AUX_NATIVE_FRESH_RUNTIME_CONSUMER', 'AUX_MINIMAL_RUNTIME_DISPATCH',
                 'AUX_SCOPED_SECURE_STORE_DISPATCH', 'AUX_ATOMIC_CSK_DISPATCH',
                 'AUX_MACOS_UTILITY_DISPATCH']:
        command += ['-D', flag]
    command += sources
    result = subprocess.run(command, capture_output=True, text=True)
    for name, digest in all_pins.items():
        assert sha(repo / name) == digest, name
    output = repo / 'out/aux-native-sealed-parent-entry-typecheck'
    output.mkdir(parents=True, exist_ok=True)
    (output / 'compiler.log').write_text(result.stdout + result.stderr)
    (output / 'receipt.json').write_text(json.dumps({
        'format': 'aux.sealed-parent.actual-typecheck.v1',
        'inputsBeforeAndAfter': all_pins, 'command': command,
        'coldProposal': str(cold.relative_to(repo)), 'swiftInputCount': len(sources),
        'exitCode': result.returncode, 'linked': False, 'executed': False,
        'protectedCalls': 0,
    }, indent=2) + '\n')
    print(result.stdout + result.stderr, end='')
    if result.returncode:
        raise SystemExit(result.returncode)
    print(f'PASS: {len(sources)} actual Swift source inputs; no link or execution')
