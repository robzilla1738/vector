#!/usr/bin/env python3
import hashlib,json
from pathlib import Path
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[3]
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
m=json.loads((HERE/'source-pins.json').read_text())
for item in m['sourceFiles']+m['reusedBaselines']:assert sha(HERE/item['path'])==item['sha256'],item['path']
for item in m['dependencies']:assert sha(ROOT/item['path'])==item['sha256'],item['path']
assert sha(ROOT/m['historicalSourcePins']['path'])==m['historicalSourcePins']['sha256']
s=(HERE/'source/AuxNativeFreshStageCoordinator.swift').read_text()
def production(source):
    result=[];stack=[];enabled=True
    for line in source.splitlines():
        if line.startswith('#if '):
            condition=line[4:].strip();assert condition in ['AUX_NATIVE_FRESH_STAGE_FIXTURE','!AUX_NATIVE_FRESH_STAGE_FIXTURE']
            stack.append((enabled,condition.startswith('!')));enabled=enabled and condition.startswith('!')
        elif line=='#else':
            parent,value=stack[-1];enabled=parent and not value
        elif line=='#endif':
            enabled=stack.pop()[0]
        elif enabled:result.append(line)
    assert not stack
    return '\n'.join(result)
p=production(s)
assert 'capturedFixture' not in p and 'NativeFreshStageFixtureEffects' not in p
assert 'private let capture:AuxFreshNativeSecureCapture' in p
assert p.count('SecItemAdd(')==1 and p.count('SecItemCopyMatching(')==1
body=p.split('func submitStageOnce()',1)[1].split('func observeStageWithoutReplay()',1)[0]
assert body.index('attempted=true')<body.index('for binding in record.targetBindings')<body.index('read(record.stageSelector)')<body.rindex('try revalidate()')<body.index('let status=addStage()')
assert 'guard status==errSecSuccess else{return .unresolved(' in body
assert 'return block(status==' not in body
assert 'case .absent:return .unresolved("stage-absent-no-replay")' in p
assert 'return block("stage-mismatch")' in p
assert 'SecItemDelete' not in p and 'SecItemUpdate' not in p
for name in ['AuxNativeFreshBootstrapFactory.swift','NativeFreshBootstrapJournal.swift','PrivateNativeFreshBootstrapJournalStore.swift']:
 assert (HERE/'source'/name).read_bytes()==(ROOT/'docs/integration/proposed/aux-native-fresh-stage-bridge/source'/name).read_bytes()
print('PASS:successor source pins, production-only preprocessing, one-shot unresolved Add/observe-only reconciliation and post-query reauthentication')
