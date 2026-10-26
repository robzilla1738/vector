from pathlib import Path
import copy,hashlib,json
HERE=Path(__file__).resolve().parent;ROOT=Path('/Users/rcourson/Documents/Vibe/web');TARGET=ROOT/'docs/integration/proposed/completion-20261026/runtime/exec-producer-join'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
base=ROOT/'docs/integration/proposed/completion-20261026/runtime/fixed-pty-retirement/compile-recipe.json';b=json.loads(base.read_text())
actual=ROOT/'docs/integration/proposed/profile-isolation-next/spawn-custody/evidence/compile-r3.json';a=json.loads(actual.read_text())
out='/private/tmp/aux-selected-exec-producer-compile-20261026-a1'
commands=[]
for name,source in [('process-wrap','process_wrap.cc'),('spawn-sync','spawn_sync.cc')]:
 c=copy.deepcopy(next(x['command'] for x in a['commands'] if x['name']==name));oldsource=next(x for x in c if x.endswith('/'+source));c[c.index(oldsource)]=str(TARGET/'source'/source);c.insert(1,'-I'+str(TARGET/'source'))
 for flag,suffix in [('-o','.o'),('-MF','.d')]:c[c.index(flag)+1]=out+'/'+name+suffix
 commands.append(c)
c=copy.deepcopy(b['commands'][-1]);oldsource=next(x for x in c if x.endswith('.cc'));c[c.index(oldsource)]=str(TARGET/'source/AuxDevelopmentWorkerHost.cc');c.insert(1,'-I'+str(TARGET/'source'))
for flag,name in [('-o','worker-host.o'),('-MF','worker-host.d')]:c[c.index(flag)+1]=out+'/'+name
assert '-DAUX_BROWSER_ONLY_NATIVE_STARTUP=0' in c;commands.append(c)
pins=dict(b['inputHashes']);pins.update(a['frozenFiles']);pins[str(base)]=sha(base);pins[str(actual)]=sha(actual)
# Original producer graph stays pinned; new source/header quotes override only these exact leaves.
for path in (HERE/'source').iterdir():
 if path.suffix in ['.cc','.h','.inc']:pins[str(TARGET/'source'/path.name)]=sha(path)
proof=HERE/'archive-proof.json';pins[str(TARGET/'archive-proof.json')]=sha(proof)
for c in commands:pins[c[0]]=sha(Path(c[0]))
(HERE/'compile-recipe.json').write_text(json.dumps({'format':'aux.selected-exec-producer-object-only.v1','commands':commands,'output':out,'inputHashes':pins,'EntitlementRequired':True,'proofFlagVariant':'AUX_BROWSER_ONLY_NATIVE_STARTUP=0; private objects only','linked':False,'archivesChanged':False,'candidateChanged':False,'reviewChanged':False},indent=2)+'\n')
runner=(HERE.parent/'fixed-pty-retirement/compile.py').read_text().replace('aux.fixed-pty-retirement-object-check.v1','aux.selected-exec-producer-object-check.v1')
(HERE/'compile.py').write_text(runner)
