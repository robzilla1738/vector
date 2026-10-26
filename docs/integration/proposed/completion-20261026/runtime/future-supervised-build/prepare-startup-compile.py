from pathlib import Path
import json,copy,hashlib
HERE=Path(__file__).resolve().parent;ROOT=Path('/Users/rcourson/Documents/Vibe/web');TARGET=ROOT/'docs/integration/proposed/completion-20261026/runtime/future-supervised-build';r=json.loads((HERE/'recipe.json').read_text());out='/private/tmp/aux-future-supervised-startup-objects-20261026-a1'
commands=copy.deepcopy(r['commands'][:2])
for c in commands:
 for i,x in enumerate(c):
  if x.startswith(r['output']+'/'):c[i]=out+x[len(r['output']):]
value={'format':'aux.future-supervised-startup-object-proposal.v1','commands':commands,'commandWorkingDirectories':r['commandWorkingDirectories'][:2],'output':out,'inputHashes':r['inputHashes'],'linked':False,'activated':False,'candidateChanged':False,'reviewChanged':False,'EntitlementRequired':True}
(HERE/'startup-compile-recipe.json').write_text(json.dumps(value,indent=2)+'\n')
source=(HERE.parent/'exec-producer-join/compile.py').read_text().replace("HERE/'compile-recipe.json'","HERE/'startup-compile-recipe.json'").replace('aux.selected-exec-producer-object-check.v1','aux.future-supervised-startup-object-check.v1');(HERE/'compile-startup.py').write_text(source)
