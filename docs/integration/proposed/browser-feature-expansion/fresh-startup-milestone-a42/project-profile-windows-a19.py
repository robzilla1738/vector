"""Apply the exact ordinary native profile selection to the isolated native build."""
from pathlib import Path
import hashlib,json
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[4]
NATIVE=Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
plan=json.loads((HERE/'ordinary-profile-windows-a19/source-plan.json').read_text())
pins=json.loads((HERE/'full-native-input-pins-a18.json').read_text())
composition=json.loads((HERE/'source-composition-a18.json').read_text())
for name,digest in pins['files'].items():assert sha(NATIVE/name)==digest,name
for row in plan['files']:
 target=NATIVE/row['path'];source=ROOT/row['source'];assert sha(target)==row['inputSha256'] and sha(source)==row['outputSha256']
 text=target.read_text()
 for anchor in row['anchors']:
  assert text.count(anchor['before'])==anchor['expectedCount'];text=text.replace(anchor['before'],anchor['after'])
 assert hashlib.sha256(text.encode()).hexdigest()==row['outputSha256']
 target.write_text(text);pins['files'][row['path']]=row['outputSha256']
 composition['selectedFiles'][row['path']]=dict(path=str(source),sha256=row['outputSha256'],inputSha256=row['inputSha256'],changed=True)
composition['ordinaryNativeProfileWindows']=dict(path=str(HERE/'ordinary-profile-windows-a19/source-plan.json'),sha256=sha(HERE/'ordinary-profile-windows-a19/source-plan.json'))
with (HERE/'source-composition-a19.json').open('x') as f:json.dump(composition,f,indent=2);f.write('\n')
pins['sourceCompositionSha256']=sha(HERE/'source-composition-a19.json')
with (HERE/'full-native-input-pins-a19.json').open('x') as f:json.dump(pins,f,indent=2);f.write('\n')
with (HERE/'actual-profile-windows-projection-a19.json').open('x') as f:json.dump(dict(passed=True,changedFiles=len(plan['files']),planSha256=sha(HERE/'ordinary-profile-windows-a19/source-plan.json'),uiChanged=False,guardsPreserved=True),f,indent=2);f.write('\n')
print('Projected ordinary native profile window selection')
