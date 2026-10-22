#!/usr/bin/env python3
from pathlib import Path
import hashlib,json,re
p=Path(__file__).resolve().parent
root=p.parents[3]
r=json.loads((p/'source-pins.json').read_text())
for entry in r['source']+r['fixture']:
    f=root/entry['path']
    assert hashlib.sha256(f.read_bytes()).hexdigest()==entry['sha256'],f'Composition source changed: {f}'
before=(p/'evidence/owned-dispatcher-before.swift.txt').read_text()
assert hashlib.sha256(before.encode()).hexdigest()==r['priorOwnedDispatcherSHA256']
after=(root/'docs/integration/proposed/aux-owned-dispatch-lifetime/source/AuxOwnedCommandDispatcher.swift').read_text()
def project(text,flags):
    active=[True];parts=[]
    for line in text.splitlines():
        if line.startswith('#if '):
            condition=line[4:].strip();negative=condition.startswith('!');key=condition[1:] if negative else condition
            assert re.fullmatch(r'[A-Z_]+',key),condition
            value=key in flags
            active.append(active[-1] and (not value if negative else value))
        elif line=='#endif': active.pop()
        elif line.startswith('#'): raise AssertionError('Unreviewed directive '+line)
        elif all(active): parts.append(line)
    assert len(active)==1
    return re.sub(r'\s+','', '\n'.join(parts))
# Default (no optional OS capability) source remains semantically text-identical
# for each existing declaration composition; no broad legacy fixtures repeated.
for flags in [set(),{'AUX_MINIMAL_RUNTIME_DISPATCH'}, {'AUX_MINIMAL_RUNTIME_DISPATCH','AUX_SCOPED_SECURE_STORE_DISPATCH'}, {'AUX_RECOVERED_FRESH_DISPATCH','AUX_SCOPED_SECURE_STORE_DISPATCH'}]:
    assert project(before,flags)==project(after,flags),flags
assert 'AUX_MACOS_UTILITY_DISPATCH' in after
print('Pinned composition and unchanged capability-absent dispatcher projections verified')
