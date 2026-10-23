#!/usr/bin/env python3
import pathlib,json,hashlib,difflib
p=pathlib.Path(__file__).resolve().parent;repo=p.parents[3]
def sha(f):return hashlib.sha256(f.read_bytes()).hexdigest()
for name,h in json.loads((p/'inputs.json').read_text()).items():assert sha(repo/name)==h,name
pins=json.loads((p/'source-pins.json').read_text());assert len(pins['swiftInputs'])==42
for group in ('swiftInputs','nativePeerDependencies','ownNativeHeader'):
 for name,h in pins[group].items():assert sha(repo/name)==h,name
patch=''.join(''.join(difflib.unified_diff(f.read_text().splitlines(True),(p/'source'/f.name).read_text().splitlines(True),fromfile='baseline/'+f.name,tofile='source/'+f.name)) for f in sorted((p/'baseline').iterdir()))
assert patch==(p/'successors.patch').read_text()
s=(p/'source/AuxNativeFreshStageCoordinator.swift').read_text()
assert s.index('if let unavailable{return .deferredBeforeAdd(unavailable)}')<s.index('lock.lock();attempted=true;lock.unlock()')<s.index('let status=addStage()')
assert 'capture.home.targetProgressLease.tryAcquire()' in s
assert 'private var submitting=false' in s
s=(p/'source/AuxAuthenticatedFreshColdBootstrap.swift').read_text()
assert 'case .deferredBeforeAdd(let status):set(.prepared(coordinator));return .stageDeferredBeforeAdd(status)' in s
assert 'guard case .provider(let provider)=phase' in s
assert s.index('guard getpid()==process else{throw AuxFreshColdGuardError.wrongProcess}',s.index('func copySelectedHomeDescriptor'))<s.index('lock.lock()',s.index('func copySelectedHomeDescriptor'))
s=(p/'source/AuxPreparedFreshRuntimeProvider.swift').read_text()
a=s.index('descriptor=try current.owner.duplicateRetainedHomeDescriptor()')
assert s[:a].rfind('try current.revalidateCurrentCommandBinding()')>s.index('static func copyReadyHome')
assert 'try current.revalidateCurrentCommandBinding()' in s[a:]
s=(p/'source/AuxOwnedCommandDispatcher.swift').read_text()
assert s.count('nativeFreshRuntime=context.nativeFreshRuntime')==1
assert 'try self.guardedFreshAction(entry,before:.beforeAccountCallback' in s
assert 'entry.pendingPostGuardObservation=entry.pendingPostGuardObservation ?? failure' in s
assert 'if disposition == .retryableNoCommand || disposition == .unknownNoCommand{throw failure}' in s
assert 'if disposition == .provenBindingLoss{entry.macOSUtilities?.closeAdmission()}' in s
print('PASS:42 exact Swift inputs,5 exact peer dependencies; ready-only FD/guarded command/callback/typed pre-Add deferral source pairs (STATIC ONLY)')
