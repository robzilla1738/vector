#!/usr/bin/env python3
import hashlib,json
from pathlib import Path
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[3]
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
m=json.loads((HERE/'source-pins.json').read_text())
for item in m['sources']+m['baselines']+m['fixtureInputs']:assert sha(HERE/item['path'])==item['sha256'],item['path']
for item in m['dependencies']:assert sha(ROOT/item['path'])==item['sha256'],item['path']
assert sha(HERE/'context.patch')==m['contextPatchSha256']
def production(source):
 result=[];stack=[];enabled=True
 for line in source.splitlines():
  if line.startswith('#if '):
   condition=line[4:].strip();assert condition in ['AUX_NATIVE_FRESH_TARGET_FIXTURE','!AUX_NATIVE_FRESH_TARGET_FIXTURE','AUX_NATIVE_FRESH_STAGE_FIXTURE','!AUX_NATIVE_FRESH_STAGE_FIXTURE']
   stack.append((enabled,condition.startswith('!')));enabled=enabled and condition.startswith('!')
  elif line=='#else':parent,value=stack[-1];enabled=parent and not value
  elif line=='#endif':enabled=stack.pop()[0]
  elif enabled:result.append(line)
 assert not stack
 return '\n'.join(result)
s=production((HERE/'source/AuxNativeFreshTargetCoordinator.swift').read_text())
assert 'capturedFixture' not in s and 'FixtureEffects' not in s
assert s.count('AuxNativeFreshTargetWriteIntent(newlyCommitted:')==1
assert 'case .intent,.awaitingReadback:return try observe(stored)' in s
assert s.index('let committed=try persist(intended,after:stored)')<s.index('AuxNativeFreshTargetWriteIntent(newlyCommitted:')<s.index('do{status=try add(ticket)}')
assert 'current.sha256==intentJournalSha256,current.journal==expected' in s
assert 'private let store:PrivateNativeFreshTargetJournalStore' in s
assert 'validateStageAndMakeCommandCore()' in s and 'fileprivate init(core:AuxInstallationCommandCore,selection:AuxRuntimeSelection' in s
assert 'retainedRootDescriptor:fd' in s
context=production((HERE/'source/AuxNativeFreshStageCoordinator.swift').read_text())
assert context.count('retainedRootDescriptor:retainedRoot')==2
assert 'func revalidateNativeStageBinding()throws' in context
assert 'let capture:AuxFreshNativeSecureCapture' in context
journal=(HERE/'source/NativeFreshTargetJournal.swift').read_text()
assert 'aux.install.native-fresh.targets-journal.v2' in journal
for forbidden in ['CallerAsserted','newScopeReviewId','legacyObservedAbsentRoles']:
 assert forbidden not in s+journal+context,forbidden
store=(HERE/'source/PrivateNativeFreshTargetJournalStore.swift').read_text()
assert 'F_DUPFD_CLOEXEC' in store and store.index('try Self.requireRootIdentity(canonicalDisposableRoot,fd:rootFD)')<store.index('if mkdirat(')
old=(ROOT/'docs/integration/proposed/aux-native-fresh-stage-reconciliation/source/AuxNativeFreshStageCoordinator.swift').read_text()
new=(HERE/'source/AuxNativeFreshStageCoordinator.swift').read_text()
submit=lambda s:s.split('    func submitStageOnce()throws->NativeFreshStageSubmitOutcome {',1)[1].split('    // Matching observation after a lost/uncertain',1)[0]
assert submit(old)==submit(new)
observe=lambda s:s.split('    func observeStageWithoutReplay()throws->NativeFreshStageSubmitOutcome {',1)[1]
old_return='            return .staged(.init(journal:record,sha256:checkpoint.sha256,payload:bytes))'
new_return='#if AUX_NATIVE_FRESH_STAGE_FIXTURE\n            return .staged(.init(journal:record,sha256:checkpoint.sha256))\n#else\n            return .staged(.init(journal:record,sha256:checkpoint.sha256,capture:capture))\n#endif'
assert observe(old).replace(old_return,new_return)==observe(new)
print('PASS:current nativev2 source/FD pins, draft-only durable ticket, currentHEAD one-shot, loadedintent observationonly, typed actual-core terminal')
