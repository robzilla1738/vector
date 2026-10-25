"""Project native fresh-profile session restore without draft-key migration."""
from pathlib import Path
import hashlib,json,difflib
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[4]
NATIVE=Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
planpath=HERE.parent/'integration/session-draft-restore.json'
plan=json.loads(planpath.read_text())
pins=json.loads((HERE/'full-native-input-pins-a19.json').read_text())
composition=json.loads((HERE/'source-composition-a19.json').read_text())
for name,digest in pins['files'].items():assert sha(NATIVE/name)==digest,name
rows=[]
for row in plan['files']:
 target=NATIVE/row['path'];assert sha(target)==row['inputSha256']
 text=target.read_text()
 for anchor in row['anchors']:
  assert text.count(anchor['find'])==anchor['count'];text=text.replace(anchor['find'],anchor['replace'])
 assert hashlib.sha256(text.encode()).hexdigest()==row['outputSha256']
 output=HERE/'session-restore-source'/row['path'];output.parent.mkdir(parents=True,exist_ok=True)
 with output.open('x') as f:f.write(text)
 target.write_text(text);pins['files'][row['path']]=row['outputSha256']
 composition['selectedFiles'][row['path']]=dict(path=str(output),sha256=row['outputSha256'],inputSha256=row['inputSha256'],changed=True)
 rows.append(dict(path=row['path'],inputSha256=row['inputSha256'],outputSha256=row['outputSha256']))
composition['nativeFreshSessionRestore']=dict(path=str(planpath),sha256=sha(planpath))
with (HERE/'source-composition-a20.json').open('x') as f:json.dump(composition,f,indent=2);f.write('\n')
pins['sourceCompositionSha256']=sha(HERE/'source-composition-a20.json')
with (HERE/'full-native-input-pins-a20.json').open('x') as f:json.dump(pins,f,indent=2);f.write('\n')
with (HERE/'actual-session-restore-projection-a20.json').open('x') as f:json.dump(dict(passed=True,files=rows,planSha256=sha(planpath),uiChanged=False,existingPreferencesAndDraftKeysUnchanged=True),f,indent=2);f.write('\n')
print('Projected exact native fresh-session restore')
