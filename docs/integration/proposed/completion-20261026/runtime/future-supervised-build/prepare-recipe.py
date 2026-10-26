from pathlib import Path
import copy,hashlib,json
HERE=Path(__file__).resolve().parent;ROOT=Path('/Users/rcourson/Documents/Vibe/web');TARGET=ROOT/'docs/integration/proposed/completion-20261026/runtime/future-supervised-build'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
basepath=ROOT/'docs/integration/proposed/completion-20261026/runtime/final-daemon/daemon-recipe.json';base=json.loads(basepath.read_text())
fixedpath=ROOT/'docs/integration/proposed/completion-20261026/runtime/fixed-builtins/daemon-recipe.json';fixed=json.loads(fixedpath.read_text())
taskpath=ROOT/'docs/integration/proposed/completion-20261026/runtime/exec-task-envelope/compile-recipe.json';task=json.loads(taskpath.read_text());taskreceipt=Path('/private/tmp/aux-exec-task-envelope-compile-20261026-a1/receipt.json');proof=json.loads(taskreceipt.read_text());assert proof['passed'] and proof['recipeSha256']==sha(taskpath)
v11path=ROOT/'docs/integration/proposed/completion-20261026/runtime/fixed-linked-policy/typecheck-recipe.json';v11=json.loads(v11path.read_text());v11receipt=Path('/private/tmp/aux-fixed-linked-v11-typecheck-20261026-a1/receipt.json');vproof=json.loads(v11receipt.read_text());assert vproof['passed'] and vproof['recipeSha256']==sha(v11path)
out='/private/tmp/aux-future-supervised-native-20261026-a1'
main=copy.deepcopy(fixed['commands'][0]);source=next(x for x in main if x.endswith('.cc'));main[main.index(source)]=str(TARGET/'source/AuxNativeDaemonMain.cc');main.insert(1,'-DAUX_FIXED_LINKED_PTY_POLICY=1')
assert main.count('-DAUX_BROWSER_ONLY_NATIVE_STARTUP=1')==1
for flag,name in [('-o','main.o'),('-MF','main.d')]:main[main.index(flag)+1]=out+'/'+name
worker=copy.deepcopy(task['commands'][-1]);source=next(x for x in worker if x.endswith('.cc'));worker[worker.index(source)]=str(TARGET/'source/AuxDevelopmentWorkerHost.cc');worker.insert(1,'-I'+str(TARGET/'source'));worker.insert(1,'-DAUX_FIXED_LINKED_PTY_POLICY=1');assert worker.count('-DAUX_BROWSER_ONLY_NATIVE_STARTUP=0')==1;worker[worker.index('-DAUX_BROWSER_ONLY_NATIVE_STARTUP=0')]='-DAUX_BROWSER_ONLY_NATIVE_STARTUP=1'
for flag,name in [('-o','worker-host.o'),('-MF','worker-host.d')]:worker[worker.index(flag)+1]=out+'/'+name
parent=copy.deepcopy(v11['commands'][1]);parent.remove('-typecheck');parent+=['-whole-module-optimization','-emit-object','-o',out+'/parent-policy.o']
parent[parent.index('-module-cache-path')+1]=out+'/swift-cache'
link=copy.deepcopy(base['commands'][-1]);link+=['-D','AUX_FIXED_LINKED_PTY_POLICY']
link[link.index('-o')+1]=out+'/Aux Daemon';link[link.index('-module-cache-path')+1]=out+'/swift-cache'
source_changes={str(ROOT/'docs/integration/proposed/completion-20261026/integrator/fresh-successor-scope/source/daemon/AuxFreshBootstrapPolicy.swift'):str(ROOT/'docs/integration/proposed/completion-20261026/runtime/fixed-linked-policy/source/AuxFreshBootstrapPolicy.swift'),str(ROOT/'docs/integration/proposed/completion-20261026/runtime/fixed-builtins/source/AuxSignedFreshBootstrapPolicyLoader.swift'):str(ROOT/'docs/integration/proposed/completion-20261026/runtime/fixed-linked-policy/source/AuxSignedFreshBootstrapPolicyLoader.swift'),str(ROOT/'docs/integration/proposed/completion-20261026/runtime/selected-builtin-owner/source/AuxSelectedAccountOwner.swift'):str(ROOT/'docs/integration/proposed/completion-20261026/runtime/selected-exec-workspace/source/AuxSelectedAccountOwner.swift'),'/private/tmp/aux-completion-daemon-fixed-builtins-20261026-a1/main.o':out+'/main.o','/private/tmp/aux-completion-final-daemon-20261026-a1/worker-host.o':out+'/worker-host.o','/private/tmp/aux-isolated-node-archives-20261023/libnode_base.a':out+'/libnode_base.a'}
link=[source_changes.get(x,x) for x in link]
pty='/private/tmp/aux-exec-task-envelope-compile-20261026-a1/pty-linked.o';assert sha(Path(pty))==proof['outputs'][pty];link.insert(1,pty)
assert sum(x.endswith('.swift') for x in link)==54
# Parent is a separate existing browser target, never linked into the child daemon.
commands=[main,worker,parent,link]
pins={str(basepath):sha(basepath),str(fixedpath):sha(fixedpath),str(taskpath):sha(taskpath),str(v11path):sha(v11path),str(taskreceipt):sha(taskreceipt),str(v11receipt):sha(v11receipt)}
for group in ['headerAndIncludePins','closureInputHashes','retainedObjectAndLibraryHashes']:pins.update(base[group])
pins.update(task['inputHashes']);pins.update(v11['inputHashes'])
# Pin all three reused exact passed objects; old Worker is lineage only and deliberately NOT linked.
for path,digest in proof['outputs'].items():assert sha(Path(path))==digest;pins[path]=digest
for f in (HERE/'source').iterdir():pins[str(TARGET/'source'/f.name)]=sha(f)
for c in commands:
 pins[c[0]]=sha(Path(c[0]))
 for x in c:
  if x.endswith(('.swift','.cc','.inc','.h')) and Path(x).is_file():pins[x]=sha(Path(x))
manifest=json.loads((HERE/'archive-members.json').read_text());source=manifest['source'];assert sha(Path(source))==manifest['sha256'];pins[source]=manifest['sha256']
replacements={}
for member,name in [('process_wrap.o','process_wrap.cc.o'),('spawn_sync.o','spawn_sync.cc.o')]:
 path='/private/tmp/aux-exec-task-envelope-compile-20261026-a1/'+name;replacements[member]={'path':path,'sha256':proof['outputs'][path]}
for f in ['archive-members.json','archive-format.py','source-plan.json','build.py','remaining-source-joins.json']:pins[str(TARGET/f)]=sha(HERE/f)
for tool in ['/usr/bin/ar','/usr/bin/otool','/usr/bin/nm']:pins[tool]=sha(Path(tool))
recipe={'format':'aux.future-supervised-inactive-build-recipe.v1','output':out,'commands':commands,'commandWorkingDirectories':[str(ROOT)]*4,'inputHashes':pins,'archive':{'source':source,'sourceSha256':manifest['sha256'],'output':out+'/libnode_base.a','originalMembers':manifest['members'],'replacements':replacements,'preserveOtherMemberBytesAndOrder':True,'originalArchivesMutated':False},'reuseObjects':{path:proof['outputs'][path] for path in [pty]+[x['path'] for x in replacements.values()]},'olderWorkerProofLineageOnly':{'path':'/private/tmp/aux-exec-task-envelope-compile-20261026-a1/worker-host.o','sha256':proof['outputs']['/private/tmp/aux-exec-task-envelope-compile-20261026-a1/worker-host.o'],'notLinked':True},'existingESObserverObject':'/private/tmp/aux-daemon-observer-reverse-a1/observer.o','sourceReplacements':source_changes,'nativeCoherentRoles':{'main':'current-user/no-addons/parent-birth + real early ES initialize/drain under fixed-linked flag','worker':'native-current-user identity true; browser-only execution restriction false only fixed-linked variant','swift':'existing54-source native-current-user graph + v11 strict ES policy + actualrole3owner','parent':'separate3-source authenticated browser guest reader, existinglayout9; parent object not in childlink'},'proofReceipts':[{'path':str(taskreceipt),'sha256':sha(taskreceipt)},{'path':str(v11receipt),'sha256':sha(v11receipt)}],'sourceGatesClosed':False,'sourceGateEvidence':str(TARGET/'remaining-source-joins.json'),'EntitlementRequired':True,'AppleRequest':'2H4D7KNGUP','productSigned':False,'productExecuted':False,'activated':False,'candidateChanged':False,'reviewChanged':False,'requiresBeforeRuntime':['Apple actual daemon ES entitlement/profile approval + independently reviewed signatures','exact signed spawn-helper v11 descriptor/resource before containing seals','future browser GN parent Swift reader variant replacing its existing object, not duplicate C symbols','fixed linked loader/selectedexec resource anchors applied through root source composer','fresh reviewed state namespace; no v9/v10 policy adoption','account-change physical cancellation and general CLI REPL selected adapter acceptance']}
(HERE/'recipe.json').write_text(json.dumps(recipe,indent=2)+'\n')
