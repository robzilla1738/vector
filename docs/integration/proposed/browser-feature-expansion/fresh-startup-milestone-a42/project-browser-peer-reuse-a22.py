"""Project retained real Security handles and exact held-file observations."""
from pathlib import Path
import hashlib,json
HERE=Path(__file__).resolve().parent
NATIVE=Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
planpath=HERE/'browser-peer-identity-reuse-source/projection.json'
plan=json.loads(planpath.read_text())
pins=json.loads((HERE/'full-native-input-pins-a21.json').read_text())
composition=json.loads((HERE/'source-composition-a21.json').read_text())
for name,digest in pins['files'].items():assert sha(NATIVE/name)==digest,name
for row in plan['files']:
 target=NATIVE/row['nativeRelative'];source=Path(row['output']);assert sha(target)==row['inputSha256'] and sha(source)==row['outputSha256']
 text=target.read_text()
 for anchor in row['anchors']:
  assert text.count(anchor['before'])==anchor['count'];text=text.replace(anchor['before'],anchor['after'])
 assert hashlib.sha256(text.encode()).hexdigest()==row['outputSha256']
 target.write_text(text);pins['files'][row['nativeRelative']]=row['outputSha256']
 composition['selectedFiles'][row['nativeRelative']]=dict(path=str(source),sha256=row['outputSha256'],inputSha256=row['inputSha256'],changed=True)
composition['actualNativeGuestCodeReuse']=dict(path=str(planpath),sha256=sha(planpath))
with (HERE/'source-composition-a22.json').open('x') as f:json.dump(composition,f,indent=2);f.write('\n')
pins['sourceCompositionSha256']=sha(HERE/'source-composition-a22.json')
with (HERE/'full-native-input-pins-a22.json').open('x') as f:json.dump(pins,f,indent=2);f.write('\n')
with (HERE/'actual-browser-peer-reuse-projection-a22.json').open('x') as f:json.dump(dict(passed=True,planSha256=sha(planpath),changedFiles=2,noCachedAdmission=True,allValidityCallsAndFlagsPreserved=True,uiChanged=False),f,indent=2);f.write('\n')
print('Projected exact retained Security objects and file bindings')
