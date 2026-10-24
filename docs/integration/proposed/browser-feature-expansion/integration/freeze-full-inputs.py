#!/usr/bin/env python3
"""Freeze current exact reviewed feature/native inputs without changing source."""
import hashlib,json
from pathlib import Path
here=Path(__file__).resolve().parent
native=Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
sha=lambda path:hashlib.sha256(path.read_bytes()).hexdigest()
old_receipt=native.parent/'unsigned-final-native-successor-build-20261023/receipt.json'
old=json.loads(old_receipt.read_text())
pins=native.parent/'final-native-input-pins.json'
if not old['passed'] or sha(pins)!=old['nativeInputPinsSha256']:raise RuntimeError('Exact successful predecessor required')
baseline=json.loads(pins.read_text())
if baseline!=old['nativeInputPins']:raise RuntimeError('Predecessor pin mismatch')
composition=here/'composition.json'
features=json.loads(composition.read_text())
files=dict(baseline['files']);files.update(features['inputPins'])
for name,digest in files.items():
 path=native/name
 if path.is_symlink() or not path.resolve().is_relative_to(native) or sha(path)!=digest:raise RuntimeError('Native input differs: '+name)
result={'format':'aux.chromium.final-native-inputs.v1','files':dict(sorted(files.items())),
 'predecessorNativeReceipt':str(old_receipt),'predecessorNativeReceiptSha256':sha(old_receipt),
 'predecessorInputPinsSha256':sha(pins),'featureCompositionSha256':sha(composition)}
out=here/'full-native-input-pins.json'
if out.exists():raise RuntimeError('Do not replace an existing frozen build input manifest')
out.write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({'frozen':True,'path':str(out),'inputs':len(files),'sourceMutated':False}))
