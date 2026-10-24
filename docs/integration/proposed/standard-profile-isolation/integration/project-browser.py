#!/usr/bin/env python3
"""Integrator-only projection into the selected isolated build tree."""
from pathlib import Path
import hashlib,json,os
here=Path(__file__).resolve().parent
repo=here.parents[4]
snapshot=Path('/private/tmp/aux-chromium-recovery-snapshot-20261023')
actual=snapshot/'src';review=Path('/private/tmp/aux-standard-browser-source-20261023-a2')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
checkpoint=repo/'out/provided-candidate-browser-features-followup-20261023/receipt.json'
r=json.loads(checkpoint.read_text());assert r['passed'] and not r['appExecuted'] and not r['productSigned']
compo=json.loads((review/'composition.json').read_text());rows=[x for x in compo['files'] if not x['path'].startswith('daemon/')]
# Validate the complete prospective operation before any mutation.
for row in rows:
 p=actual/row['path'];assert sha(review/row['path'])==row['afterSha256']
 if row['beforeSha256'] is None:assert not p.exists()
 else:assert p.is_file() and not p.is_symlink() and sha(p)==row['beforeSha256'],row['path']
old=repo/'docs/integration/proposed/browser-feature-expansion/integration'
pins=json.loads((old/'full-native-input-pins-a21.json').read_text())
for name,digest in pins['files'].items():assert sha(actual/name)==digest,name
feature=json.loads((old/'composition.json').read_text());feature['files']=[]
for row in rows:
 source=review/row['path'];feature['inputPins'][row['path']]=row['afterSha256'];pins['files'][row['path']]=row['afterSha256']
 feature['files'].append(dict(row,source=str(source)))
for row in rows:
 p=actual/row['path'];p.parent.mkdir(parents=True,exist_ok=True);temporary=p.with_name(p.name+'.aux-standard-projection')
 with temporary.open('xb') as f:f.write((review/row['path']).read_bytes())
 os.replace(temporary,p)
 assert sha(p)==row['afterSha256']
featurePath=here/'browser-composition-a1.json';assert not featurePath.exists();featurePath.write_text(json.dumps(feature,indent=2)+'\n')
pins['featureCompositionSha256']=sha(featurePath)
pinPath=here/'full-native-input-pins-a1.json';assert not pinPath.exists();pinPath.write_text(json.dumps(pins,indent=2)+'\n')
receipt={'format':'aux.standard-browser-source-projection.v1','checkpointReceiptSha256':sha(checkpoint),'sourceCompositionSha256':sha(review/'composition.json'),'filesProjected':len(rows),'nativeInputCount':len(pins['files']),'featurePins':len(feature['inputPins']),'source':str(actual),'ownerCheckoutChanged':False,'appExecuted':False,'productSigned':False}
(here/'browser-projection-a1.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt))
