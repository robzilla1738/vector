#!/usr/bin/env python3
"""Source-only checks for the concrete compiler failures and exact resume pins."""
import argparse
import ast
import hashlib
import json
from pathlib import Path
here=Path(__file__).resolve().parent
repo=here.parents[3]
parser=argparse.ArgumentParser()
parser.add_argument('--reference-root',type=Path,default=repo)
args=parser.parse_args()
pins=json.loads((here/'inputs.json').read_text())
for section in ('files','baseline','mainPlanningInputs'):
    for name,expected in pins[section].items():
        base=args.reference_root if section=='mainPlanningInputs' else repo
        assert hashlib.sha256((base/name).read_bytes()).hexdigest()==expected,name
source=(here/'source/AuxNativePeerTransport.cc').read_text()
base=(repo/'docs/integration/proposed/aux-native-peer-link-boundary/source/AuxNativePeerTransport.cc').read_text()
assert 'memset_s(' not in source
assert source.count('WipeOwnedBytes(payload);')==2
assert source.count('WipeOwnedBytes(bytes);')==1
assert 'volatile uint8_t* output = bytes.data();' in source
assert 'output[index] = 0;' in source
assert source.count('code, policy.data_->requirement.get(), policy.data_->cd_hash.data(),')==1
assert 'AuxCopyAuthenticatedFreshChildParentDescriptor(' in source
assert (here/'source/AuxNativePeerTransport.h').read_bytes()==(repo/'docs/integration/proposed/aux-native-peer-link-boundary/source/AuxNativePeerTransport.h').read_bytes()
prior=Path(pins['priorOutput'])
assert hashlib.sha256((prior/'plan-or-build.json').read_bytes()).hexdigest()==pins['priorReceiptSha256']
receipt=json.loads((prior/'plan-or-build.json').read_text())
assert receipt['results']==[0]*9+[1] and receipt['inputsUnchanged'] is True and receipt['passed'] is False
for name,expected in pins['reusableObjects'].items():
    assert hashlib.sha256((prior/name).read_bytes()).hexdigest()==expected,name
ast.parse((here/'resume-main.py').read_text())
print('PASS: exact ABI/wipe successor, frozen9-success/command9-failure receipt and9 owned object hashes; no compiler execution')
