"""Prepare counted source/resource replacements only; never copy or change an app."""
from pathlib import Path
import argparse, hashlib, json, os, stat

parser=argparse.ArgumentParser()
parser.add_argument('--repository',type=Path,required=True)
parser.add_argument('--output',type=Path,required=True)
args=parser.parse_args()
repository=args.repository.resolve(strict=True)
accepted=repository/'out/provided-candidate-local-completion-20261025-a38/Aux.app'
final=repository/'out/provided-candidate-completion-20261026-a1/Aux.app'
if final.exists() or final.is_symlink():raise ValueError('Proposed successor must remain absent during preparation')
root=accepted/'Contents/Resources/aux'
native=root/'apps/daemon/Aux Daemon.app/Contents/Resources/native'
sha=lambda data:hashlib.sha256(data).hexdigest()
def read(path):
 if not stat.S_ISREG(path.lstat().st_mode):raise ValueError('Regular static input required: '+str(path))
 return path.read_bytes()
metadata=read(native/'runtime-text-root.json')
report=json.loads(metadata)
if set(report)!={'format','runtimeRoot'} or report['format']!='aux.runtime-text-root.v1':raise ValueError('Unsupported runtime metadata')
old=report['runtimeRoot'];new=str(final/'Contents/Resources/aux/agent-runtime')
pins_bytes=read(native/'runtime-source-pins.json');pins=json.loads(pins_bytes)
if sha(pins_bytes)!='7fa5c41acab7c3e9c052bf44b9daa4c0892e717f70718ca9f6a65b030e13bba8':raise ValueError('Original runtime inventory changed')
if pins['sourceVersion']!='1.26.1019.335' or len(pins['files'])!=10929:raise ValueError('Runtime inventory version changed')
outputs=[];inputs=[]
def add(source,target,before,after,anchors):
 inputs.append({'path':str(source),'sha256':sha(before),'bytes':len(before)})
 if before!=after:outputs.append({'source':source,'relative':target,'before':before,'after':after,'anchors':anchors})
for entry in pins['files']:
 if not entry.get('anchors'):continue
 path=root/'agent-runtime'/entry['path'];before=read(path);text=before.decode('utf8')
 for anchor in reversed(entry['anchors']):
  staged=old if anchor.get('replacement')=='runtimeRoot' else anchor['replace']
  if text.count(staged)!=anchor['count']:raise ValueError('Staged runtime anchor drift: '+entry['path'])
  text=text.replace(staged,anchor['find'])
 original=text.encode()
 if len(original)!=entry['size'] or sha(original)!=entry['sourceSha256']:raise ValueError('Original runtime pin mismatch: '+entry['path'])
 anchors=[]
 for anchor in entry['anchors']:
  if text.count(anchor['find'])!=anchor['count']:raise ValueError('Original runtime anchor drift')
  replacement=new if anchor.get('replacement')=='runtimeRoot' else anchor['replace']
  text=text.replace(anchor['find'],replacement)
  if anchor.get('replacement')=='runtimeRoot':anchors.append({'before':old,'after':new,'count':anchor['count'],'sourceFind':anchor['find']})
 add(path,'resources/agent-runtime/'+entry['path'],before,text.encode(),anchors)
new_metadata=(json.dumps({'format':'aux.runtime-text-root.v1','runtimeRoot':new},indent=2)+'\n').encode()
add(native/'runtime-text-root.json','resources/native/runtime-text-root.json',metadata,new_metadata,[{'before':old,'after':new,'count':1}])
bootstrap=read(native/'runtime-bootstrap.cjs');oldhash=sha(metadata)
if bootstrap.decode().count(oldhash)!=1:raise ValueError('Runtime bootstrap metadata anchor drift')
add(native/'runtime-bootstrap.cjs','resources/native/runtime-bootstrap.cjs',bootstrap,bootstrap.replace(oldhash.encode(),sha(new_metadata).encode()),[{'before':oldhash,'after':sha(new_metadata),'count':1}])
recipe_path=repository/'docs/integration/proposed/completion-20261026/runtime/selected-builtin-owner/daemon-recipe.json'
recipe=json.loads(read(recipe_path));matches=[(Path(p),h) for p,h in recipe['headerAndIncludePins'].items() if p.endswith('/AuxRuntimePublication.inc')]
if len(matches)!=1:raise ValueError('One exact native runtime publisher required')
publication,pinned=matches[0];before=read(publication)
if sha(before)!=pinned:raise ValueError('Native publication recipe pin changed')
needle='constexpr char kBundledTextRoot[] = '+json.dumps(old)+';'
if before.decode().count(needle)!=1:raise ValueError('Native runtime root declaration drift')
after=before.replace(needle.encode(),('constexpr char kBundledTextRoot[] = '+json.dumps(new)+';').encode())
add(publication,'source/AuxRuntimePublication.inc',before,after,[{'before':needle,'after':'constexpr char kBundledTextRoot[] = '+json.dumps(new)+';','count':1}])
args.output.mkdir(mode=0o700)
rows=[]
for row in outputs:
 target=args.output/row['relative'];target.parent.mkdir(parents=True,exist_ok=True)
 with target.open('xb') as stream:stream.write(row['after'])
 os.chmod(target,0o600)
 rows.append({'input':str(row['source']),'inputSha256':sha(row['before']),'output':str(target.resolve()),'outputSha256':sha(row['after']),'bytes':len(row['after']),'anchors':row['anchors']})
result={'format':'aux.successor.runtime-relocation.v1','acceptedApp':str(accepted),'proposedApp':str(final),'oldRuntimeTextRoot':old,'newRuntimeTextRoot':new,'inputs':inputs,'replacements':rows,'runtimeInventorySha256':sha(pins_bytes),'originalRuntimeInventoryChanged':False,'nativeRecipeInput':str(recipe_path),'recipeJoin':{'oldInclude':str(publication),'newInclude':str((args.output/'source/AuxRuntimePublication.inc').resolve()),'sha256':sha(after),'removeOldIncludePin':pinned,'required':'Select successor include directory before old include directory, replace headerAndIncludePins entry, and freeze this new source before compile.'},'appChanged':False,'assembled':False,'compiled':False,'signed':False,'executed':False,'ownerStateRead':False}
(args.output/'relocation.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({'output':str(args.output.resolve()),'replacements':len(rows),'nativeInclude':result['recipeJoin']}))
