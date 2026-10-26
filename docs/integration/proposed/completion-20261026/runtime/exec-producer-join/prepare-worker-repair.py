from pathlib import Path
import copy,json,hashlib
HERE=Path(__file__).resolve().parent;ROOT=Path('/Users/rcourson/Documents/Vibe/web');TARGET=ROOT/'docs/integration/proposed/completion-20261026/runtime/exec-producer-join'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
recipe=json.loads((HERE/'compile-recipe.json').read_text());failed=Path('/private/tmp/aux-selected-exec-producer-compile-20261026-a1/receipt.json');receipt=json.loads(failed.read_text())
assert not receipt['passed'] and [x['exitCode'] for x in receipt['commands']]==[0,0,1]
assert receipt['recipeSha256']==sha(HERE/'compile-recipe.json')
assert [x['argv'] for x in receipt['commands']]==recipe['commands']
out='/private/tmp/aux-selected-exec-producer-compile-20261026-a2'
r=copy.deepcopy(recipe);c=r['commands'][-1]
for flag,name in [('-o','worker-host.o'),('-MF','worker-host.d')]:c[c.index(flag)+1]=out+'/'+name
r['commands']=[c];r['commandWorkingDirectories']=r['commandWorkingDirectories'][-1:];r['output']=out
r['format']='aux.selected-exec-producer-worker-repair-object-only.v1'
r['failedAttemptReceipt']={'path':str(failed),'sha256':sha(failed)}
r['retainedPassedObjects']={}
for index in [0,1]:
 command=recipe['commands'][index]
 for flag in ['-o','-MF']:
  path=Path(command[command.index(flag)+1]);r['retainedPassedObjects'][str(path)]=sha(path);r['inputHashes'][str(path)]=sha(path)
r['inputHashes'][str(failed)]=sha(failed)
r['inputHashes'][str(TARGET/'compile-recipe.json')]=sha(HERE/'compile-recipe.json')
for f in (HERE/'source').iterdir():
 if f.suffix in ['.cc','.h','.inc']:r['inputHashes'][str(TARGET/'source'/f.name)]=sha(f)
(HERE/'worker-repair-recipe.json').write_text(json.dumps(r,indent=2)+'\n')
runner=(HERE/'compile.py').read_text().replace("HERE/'compile-recipe.json'","HERE/'worker-repair-recipe.json'").replace('aux.selected-exec-producer-object-check.v1','aux.selected-exec-producer-worker-repair-check.v1')
(HERE/'compile-worker-repair.py').write_text(runner)
