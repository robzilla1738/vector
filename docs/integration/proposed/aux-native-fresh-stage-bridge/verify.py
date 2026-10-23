#!/usr/bin/env python3
"""Pin actual source, recovered factory bodies and private-FD mechanics; no calls."""
import hashlib,json
from pathlib import Path
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[3]
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
m=json.loads((HERE/'source-pins.json').read_text())
for item in m['sourceFiles']+m['reusedBaselines']:assert sha(HERE/item['path'])==item['sha256'],item['path']
for item in m['dependencies']:assert sha(ROOT/item['path'])==item['sha256'],item['path']
f=(HERE/'source/AuxNativeFreshBootstrapFactory.swift').read_text();baseline=(HERE/'baseline/AuxFreshInstallationFactory.swift').read_text()
assert f.split('        let root = SymmetricKey',1)[1]==baseline.split('        let root = SymmetricKey',1)[1]
assert f.index('capture.takeAbsentForGeneration()')<f.index('SecureEnclave.isAvailable')<f.index('let material=try generate')
assert 'CallerAsserted' not in f and 'newScopeExplicitlyReviewed' not in f
store=(HERE/'source/PrivateNativeFreshBootstrapJournalStore.swift').read_text()
old=(HERE/'baseline/PrivateFreshSecureStageBindingStore.swift').read_text()
mechanics=lambda s:s.split('    private static func statFD',1)[1].split('    private func decode',1)[0]
assert mechanics(store).replace('NativeFreshBootstrapStoreError','SecureStageBindingStoreError')==mechanics(old)
coordinator=(HERE/'source/AuxNativeFreshStageCoordinator.swift').read_text()
assert 'CallerAsserted' not in coordinator and 'newScopeReviewId' not in coordinator
assert coordinator.count('SecItemAdd(')==1
assert 'private init(capture:AuxFreshNativeSecureCapture' in coordinator
assert coordinator.index('let checkpoint=try store.publish()')<coordinator.index('func submitStageOnce()')<coordinator.index('SecItemAdd(')
assert 'attempted=true;lock.unlock()' in coordinator
for forbidden in ['SecItemDelete','SecItemUpdate','prepare(admission:','exclusiveStoppedStartup','legacyObservedAbsentRoles']:
 assert forbidden not in coordinator,forbidden
record=(HERE/'source/NativeFreshBootstrapJournal.swift').read_text()
assert 'aux.install.native-fresh.initial-journal.v2' in record
assert 'newScopeReviewId' not in record and 'legacyObservedAbsentRoles' not in record
print('PASS:source/dependency pins, exact recovered generation bodies, exact private-FD mechanics, nativev2 lineage and one-shot add ordering')
