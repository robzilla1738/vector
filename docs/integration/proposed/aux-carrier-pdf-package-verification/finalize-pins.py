#!/usr/bin/env python3
"""Pin successful root build only; never builds/packages/executes candidate."""
from pathlib import Path
import hashlib,json
here=Path(__file__).resolve().parent
root=Path('/Users/rcourson/Documents/Vibe/web')
pins=json.loads((here/'reviewed-pins.json').read_text())
raw=(root/'out/aux-carrier-native-build.json').read_bytes();receipt=json.loads(raw)
if receipt['buildExitCode']!=0 or receipt['compositionSha256']!=pins['compositionSha256']:
 raise ValueError('Native receipt is not successful exact successor')
name='Aux.app/Contents/Frameworks/Aux Framework.framework/Versions/155.0.8059.85/Aux Framework'
record=next(x for x in receipt['files'] if x['path']==name)
file=Path(receipt['buildRoot'])/name
h=hashlib.sha256()
with file.open('rb') as stream:
 for block in iter(lambda:stream.read(1024*1024),b''):h.update(block)
if h.hexdigest()!=record['sha256']:raise ValueError('Actual built framework differs')
pins['framework']=record['sha256'];pins['nativeBuildReceiptSha256']=hashlib.sha256(raw).hexdigest()
(here/'reviewed-pins.json').write_text(json.dumps(pins,indent=2)+'\n')
print(json.dumps({'framework':pins['framework'],'nativeBuildReceiptSha256':pins['nativeBuildReceiptSha256']},indent=2))
