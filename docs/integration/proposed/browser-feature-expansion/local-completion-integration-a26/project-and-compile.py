"""Project reviewed local fixes and compile changed owners under native-build.py."""
from pathlib import Path
import hashlib,json,subprocess,time
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[4]
NATIVE=Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
FEATURE=HERE.parent
PREVIOUS=FEATURE/'fresh-startup-milestone-a42'
def sha(path): return hashlib.sha256(path.read_bytes()).hexdigest()
pins=json.loads((PREVIOUS/'full-native-input-pins-a25.json').read_text())
composition=json.loads((PREVIOUS/'source-composition-a25.json').read_text())
for name,digest in pins['files'].items():
 if sha(NATIVE/name)!=digest: raise ValueError('Native input changed: '+name)
plans=[FEATURE/'navigation-local-completion-a26/source-plan.json',FEATURE/'organization-local-completion-a26/source-plan.json',FEATURE/'preview-close-local-completion-a26/source-plan.json']
changes=[]
for planpath in plans:
 plan=json.loads(planpath.read_text())
 rows=plan.get('files') or [dict(path=plan['path'],inputSha256=plan['beforeSha256'],outputSha256=plan['afterSha256'],source=str(planpath.parent/'source'/plan['path']))]
 for row in rows:
  name=row['path'];target=NATIVE/name
  source=Path(row['source'])
  if 'docs/' in str(source): source=ROOT/str(source)[str(source).index('docs/'):]
  if sha(target)!=row['inputSha256'] or sha(source)!=row['outputSha256']: raise ValueError('Projection input mismatch: '+name)
  text=target.read_text()
  for anchor in row.get('anchors',[]):
   before=anchor.get('before',anchor.get('find'));after=anchor.get('after',anchor.get('replace'));count=anchor.get('expectedCount',anchor.get('count'))
   if text.count(before)!=count: raise ValueError('Projection anchor changed: '+name)
   text=text.replace(before,after)
  if row.get('anchors') and text!=source.read_text(): raise ValueError('Counted result mismatch: '+name)
  changes.append((name,source,row['inputSha256'],row['outputSha256']))
for name,source,before,after in changes:
 target=NATIVE/name;target.write_bytes(source.read_bytes());pins['files'][name]=after
 composition['selectedFiles'][name]=dict(path=str(source),sha256=after,inputSha256=before,changed=True)
composition['localCompletionFixesA26']=[dict(path=str(path),sha256=sha(path)) for path in plans]
with (HERE/'source-composition.json').open('x') as f: json.dump(composition,f,indent=2);f.write('\n')
pins['sourceCompositionSha256']=sha(HERE/'source-composition.json')
with (HERE/'full-native-input-pins.json').open('x') as f:json.dump(pins,f,indent=2);f.write('\n')
receipt=dict(passed=False,projected=True,changedFiles=[name for name,*_ in changes],sourceCompositionSha256=sha(HERE/'source-composition.json'),uiChanged=False,appExecuted=False,signing=False)
(HERE/'actual-projection-and-compile.json').write_text(json.dumps(receipt,indent=2)+'\n')
targets=['obj/chrome/browser/ui/ui/'+Path(name).stem+'.o' for name,*_ in changes]
command=[str(NATIVE/'third_party/ninja/ninja'),'-C',str(NATIVE/'out/AuxFast'),'-j4',*targets]
start=time.monotonic()
with (HERE/'compile.log').open('w') as log: result=subprocess.run(command,cwd=NATIVE,stdout=log,stderr=subprocess.STDOUT)
receipt.update(passed=result.returncode==0,command=command,exitCode=result.returncode,seconds=time.monotonic()-start)
for name,digest in pins['files'].items():
 if sha(NATIVE/name)!=digest:raise ValueError('Input changed during compile: '+name)
(HERE/'actual-projection-and-compile.json').write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps({k:v for k,v in receipt.items() if k!='command'}))
raise SystemExit(result.returncode)
