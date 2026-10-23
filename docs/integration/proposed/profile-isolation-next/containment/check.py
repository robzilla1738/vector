#!/usr/bin/env python3
"""Run with scripts/native-build.py; uses only synthetic disposable files."""
import argparse
import hashlib
import json
import pathlib
import subprocess
import tempfile

parser = argparse.ArgumentParser()
parser.add_argument('--uv-include', required=True)
parser.add_argument('--reservation-include', required=True)
parser.add_argument('--evidence', required=True)
args = parser.parse_args()
source = pathlib.Path(__file__).resolve().parent / 'source'
with tempfile.TemporaryDirectory(prefix='aux-envelope-') as temporary:
    base = pathlib.Path(temporary).resolve()
    binary = base / 'envelope-check'
    command = ['/usr/bin/clang++', '-std=c++20', '-fno-exceptions',
               '-I', str(pathlib.Path(args.uv_include).resolve()),
               '-I', str(pathlib.Path(args.reservation_include).resolve()),
               str(source / 'envelope-check.cc'), '-o', str(binary)]
    compiled = subprocess.run(command, capture_output=True, text=True)
    receipt = {'scope': 'synthetic filesystem policy only; not root provenance or custody',
               'compilerExit': compiled.returncode, 'compilerStderr': compiled.stderr,
               'sources': {p.name: hashlib.sha256(p.read_bytes()).hexdigest()
                           for p in source.iterdir() if p.is_file()}}
    abi = pathlib.Path(args.reservation_include) / 'AuxNativeExecReservation.h'
    receipt['reservationHeaderSha256'] = hashlib.sha256(abi.read_bytes()).hexdigest()
    if compiled.returncode == 0:
        roots = [base / name for name in ('private', 'browser-data', 'browser-cache', 'work')]
        for root in roots:
            root.mkdir()
        for root in roots[:3]:
            (root / 'secret').write_text('synthetic-only\n')
        result = subprocess.run([str(binary), *map(str, roots)], capture_output=True, text=True)
        receipt.update(exit=result.returncode, stdout=result.stdout, stderr=result.stderr,
                       allowedOutput=(roots[3] / 'allowed-output').read_text()
                           if (roots[3] / 'allowed-output').exists() else None,
                       deniedWritesAbsent=all(not (p / 'write').exists() for p in roots[:3]))
    destination = pathlib.Path(args.evidence)
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(json.dumps(receipt, indent=2) + '\n')
    passed = (receipt.get('exit') == 0 and receipt.get('allowedOutput') == 'allowed'
              and receipt.get('deniedWritesAbsent') is True)
    print(json.dumps({'passed': passed, 'evidence': str(destination)}))
    raise SystemExit(0 if passed else 1)
