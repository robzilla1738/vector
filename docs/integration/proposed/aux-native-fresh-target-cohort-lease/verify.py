#!/usr/bin/env python3
import hashlib,json
from pathlib import Path
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[3]
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
pins=json.loads((HERE/'source-pins.json').read_text())
for item in pins['files']:assert sha(HERE/item['path'])==item['sha256'],item['path']
for item in pins['productionInputs']:assert sha(ROOT/item['path'])==item['sha256'],item['path']
assert len(pins['productionInputs'])==23
assert sha(ROOT/pins['queuedDispatcher']['path'])==pins['queuedDispatcher']['sha256']
home=(HERE/'source/AuxFreshNativeHome.swift').read_text()
assert home.count('let targetProgressLease=AuxNativeFreshCohortLease()')==1
assert 'final class AuxNativeFreshCohortLease' in home and 'func tryAcquire()->AuxNativeFreshCohortOperation?' in home
source=(HERE/'source/AuxNativeFreshTargetCoordinator.swift').read_text()
assert 'cohortLease=context.capture.home.targetProgressLease' in source
assert 'guard let operation=cohortLease.tryAcquire()else{return .unresolved(' in source
assert 'defer{operation.finish()}' in source
assert 'private var advancing' not in source and 'operationLock' not in source
assert source.index('cohortLease.tryAcquire()')<source.index('        try validateContext()',source.index('func advanceOne()'))
assert source.index('if case .unresolved=preparation{return .unresolved("target-unavailable-no-head-change")}')<source.index('stored=try store.commit(draft,expectedHead:nil)')
assert 'case .unresolved:return .unresolved("target-unavailable-terminal-withheld")' in source
journal=(HERE/'source/NativeFreshTargetJournal.swift').read_text()
assert 'case .unavailable:continue' in journal and 'return "unavailable:"' not in journal
assert journal.count('if unavailable(captured){return .unresolved}')==2
boundary=ROOT/'docs/integration/proposed/aux-native-fresh-target-boundary/source/AuxNativeFreshTargetBoundary.swift'
text=boundary.read_text();body=text.split('    func addTarget(',1)[1].split('    func validateStageAndMakeCommandCore',1)[0]
assert body.rindex('try revalidateStage()')<body.index('SecItemAdd(') if 'SecItemAdd(' in body else True
assert 'aux-native-fresh-retained-journal/source/PrivateNativeFreshBootstrapJournalStore.swift' in '\n'.join(x['path']for x in pins['productionInputs'])
print('PASS:final23 input pins, actual home-owned shared lease, readonly transient deferral, final boundary recheck and deferred recipe')
