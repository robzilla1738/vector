from pathlib import Path
import json,hashlib,copy
HERE=Path(__file__).resolve().parent;ROOT=Path('/Users/rcourson/Documents/Vibe/web');TARGET=ROOT/'docs/integration/proposed/completion-20261026/runtime/exec-task-envelope'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
execbase=HERE.parent/'exec-producer-join';retire=HERE.parent/'fixed-pty-retirement';workspace=HERE.parent/'selected-exec-workspace'
for name in ['AuxSelectedBuiltinOwner.inc','AuxPtyPhysicalRetirement.inc']:(HERE/'source'/name).write_bytes((execbase/'source'/name).read_bytes())
source=(execbase/'source/AuxSelectedExecProducer.inc').read_text();a=json.loads((workspace/'exec-consumer.anchors.json').read_text());assert sha(execbase/'source/AuxSelectedExecProducer.inc')==a['inputSha256']
for pair in a['anchors']:assert source.count(pair['before'])==1;source=source.replace(pair['before'],pair['after'])
assert hashlib.sha256(source.encode()).hexdigest()==a['outputSha256'];(HERE/'source/AuxSelectedExecProducer.inc').write_text(source)
recipe=json.loads((execbase/'worker-repair-recipe.json').read_text());original=json.loads((execbase/'compile-recipe.json').read_text())
ptyreceipt=ROOT/'docs/integration/proposed/profile-isolation-next/spawn-custody/evidence/compile-final.json';pty=json.loads(ptyreceipt.read_text());out='/private/tmp/aux-exec-task-envelope-compile-20261026-a1'
commands=[];cwds=[]
for i,name in enumerate(['process_wrap.cc','spawn_sync.cc']):
 command=copy.deepcopy(original['commands'][i]);source=next(x for x in command if x.endswith('.cc'));command[command.index(source)]=str(TARGET/'source'/name);command.insert(1,'-I'+str(TARGET/'source'))
 for flag,suffix in [('-o','.o'),('-MF','.d')]:command[command.index(flag)+1]=out+'/'+name+suffix
 commands.append(command);cwds.append(original['commandWorkingDirectories'][i])
item=next(x for x in pty['commands'] if x['name']=='pty-addon');command=copy.deepcopy(item['command']);command[command.index(next(x for x in command if x.endswith('.cc')))]=str(TARGET/'source/pty-linked.cc');command.insert(1,'-I'+str(TARGET/'source'))
for flag,name in [('-o','pty-linked.o'),('-MF','pty-linked.d')]:command[command.index(flag)+1]=out+'/'+name
commands.append(command);cwds.append(item['cwd'])
command=copy.deepcopy(recipe['commands'][0]);command[command.index(next(x for x in command if x.endswith('.cc')))]=str(TARGET/'source/AuxDevelopmentWorkerHost.cc');command.insert(1,'-I'+str(TARGET/'source'))
for flag,name in [('-o','worker-host.o'),('-MF','worker-host.d')]:command[command.index(flag)+1]=out+'/'+name
assert '-DAUX_BROWSER_ONLY_NATIVE_STARTUP=0' in command;commands.append(command);cwds.append(recipe['commandWorkingDirectories'][0])
pins=dict(recipe['inputHashes'])
# These old proposal sources remain historicalpredecessors; final source copies override them by quote search.
for f in (HERE/'source').iterdir():
 if f.suffix in ['.cc','.h','.inc']:pins[str(TARGET/'source'/f.name)]=sha(f)
for path in [execbase/'worker-repair-recipe.json',execbase/'compile-recipe.json',workspace/'exec-consumer.anchors.json',ptyreceipt]:
 canonical=ROOT/path.relative_to(HERE.parents[6]) if path.is_relative_to(HERE.parents[6]) else path
 if str(path).startswith('/Users/rcourson/Documents/Vibe/aux-completion-20261026/runtime/'):
  canonical=ROOT/str(path).split('/runtime/',1)[1]
 pins[str(canonical)]=sha(path)
# Actual current contained PTY source and its emittedheader graph belong to the original retained producer.
for path,digest in pty['actualDependencies'].items():
 assert sha(Path(path))==digest,path;pins[path]=digest
for path,digest in pty.get('frozenFiles',{}).items():
 if path.endswith('/check.py'):continue
 assert Path(path).is_file() and sha(Path(path))==digest,path
 pins[path]=digest
value={'format':'aux.exec-task-envelope-four-object-proposal.v1','commands':commands,'commandWorkingDirectories':cwds,'inputHashes':pins,'output':out,'EntitlementRequired':True,'privateProofVariant':'AUX_BROWSER_ONLY_NATIVE_STARTUP=0 only on private Worker object','linked':False,'archivesChanged':False,'candidateChanged':False,'reviewChanged':False,'policyGate':'Distinct fixed-linked helper-only policy is not implemented/activated in this object proposal'}
(HERE/'compile-recipe.json').write_text(json.dumps(value,indent=2)+'\n')
(HERE/'compile.py').write_text((execbase/'compile.py').read_text().replace('aux.selected-exec-producer-object-check.v1','aux.exec-task-envelope-object-check.v1'))
(HERE/'source-pins.json').write_text(json.dumps({str(f.relative_to(HERE)):sha(f) for f in (HERE/'source').iterdir()},indent=2)+'\n')
