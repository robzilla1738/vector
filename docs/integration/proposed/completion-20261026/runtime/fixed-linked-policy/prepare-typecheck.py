from pathlib import Path
import copy,hashlib,json
HERE=Path(__file__).resolve().parent;ROOT=Path('/Users/rcourson/Documents/Vibe/web');TARGET=ROOT/'docs/integration/proposed/completion-20261026/runtime/fixed-linked-policy';sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
original=ROOT/'docs/integration/proposed/completion-20261026/runtime/selected-builtin-owner/swift-typecheck-command.json';command=json.loads(original.read_text())
# Canonicalize only exact managed worker prefixes from the recorded already-passed54source recipe.
for worker in ['runtime','integration']:
 prefix='/Users/rcourson/Documents/Vibe/aux-completion-20261026/'+worker+'/'
 command=[str(ROOT)+'/'+x[len(prefix):] if x.startswith(prefix) else x for x in command]
command+=['-D','AUX_FIXED_LINKED_PTY_POLICY']
for i,x in enumerate(command):
 if x.endswith('/AuxFreshBootstrapPolicy.swift'):command[i]=str(TARGET/'source/AuxFreshBootstrapPolicy.swift')
 if x.endswith('/AuxSignedFreshBootstrapPolicyLoader.swift'):command[i]=str(TARGET/'source/AuxSignedFreshBootstrapPolicyLoader.swift')
 if x.endswith('/AuxSelectedAccountOwner.swift'):command[i]=str(ROOT/'docs/integration/proposed/completion-20261026/runtime/selected-exec-workspace/source/AuxSelectedAccountOwner.swift')
# Fixed roots stay the root's already-selected fresh namespace, inherited parser source.
assert sum(x.endswith('.swift') for x in command)==54
parent=[x for x in command if not x.endswith('.swift')];parent[parent.index('-module-name')+1]='AuxParentSealedPolicy'
parent += [str(TARGET/'source/ParentAuxFreshBootstrapPolicy.swift'),str(TARGET/'source/AuxAuthenticatedChildParentPolicyReader.swift'),'/private/tmp/aux-chromium-recovery-snapshot-20261023/src/chrome/browser/aux/native_peer_policy/AuxStrictEnvelopeObject.swift']
pins={str(original):sha(original)}
for c in [command,parent]:
 for value in c:
  if value.endswith('.swift'):
   f=Path(value);local=HERE/f.relative_to(TARGET) if f.is_relative_to(TARGET) else f;pins[value]=sha(local)
 pins[c[0]]=sha(Path(c[0]))
policy=ROOT/'docs/integration/proposed/completion-20261026/integrator/fresh-successor-scope/source-plan.json';pins[str(policy)]=sha(policy)
proofs={}
for name in ['inactive-task-envelope-compile-a1.json','inactive-workspace-typecheck-a1.json']:
 path=ROOT/'docs/integration/proposed/completion-20261026/integrator'/name;actual=json.loads(path.read_text());assert actual['passed'] is True and actual['activated'] is False;proofs[name]={'path':str(path),'sha256':sha(path)};pins[str(path)]=sha(path)
 if 'outputs' in actual:
  for output,digest in actual['outputs'].items():assert sha(Path(output))==digest; pins[output]=digest
workspace=str(ROOT/'docs/integration/proposed/completion-20261026/runtime/selected-exec-workspace/source/AuxSelectedAccountOwner.swift')
assert workspace in command and pins[workspace]==json.loads((ROOT/'docs/integration/proposed/completion-20261026/integrator/inactive-workspace-typecheck-a1.json').read_text())['inputHashes'][workspace]
(HERE/'typecheck-recipe.json').write_text(json.dumps({'format':'aux.fixed-linked-v11-paired-policy-typecheck.v1','commands':[command,parent],'inputHashes':pins,'requiredExistingProofs':proofs,'output':'/private/tmp/aux-fixed-linked-v11-typecheck-20261026-a1','variant':'Swift native-current-user implementation retained; AUX_FIXED_LINKED_PTY_POLICY permits only newv11+genuineESentitlement; C++futuremain/Worker wouldbeESvariant0, notbuilt here','EntitlementRequired':True,'candidateChanged':False,'activated':False},indent=2)+'\n')
