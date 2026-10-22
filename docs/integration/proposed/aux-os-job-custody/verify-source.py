#!/usr/bin/env python3
import hashlib,json,re
from pathlib import Path
p=Path(__file__).resolve().parent
root=p.parents[3]
r=json.loads((p/'source-pins.json').read_text())
for entry in r['source']:
    path=root/entry['path']
    assert hashlib.sha256(path.read_bytes()).hexdigest()==entry['sha256'],path
before=(p/'evidence/owned-dispatcher-before.swift.txt').read_text()
assert hashlib.sha256(before.encode()).hexdigest()==r['priorOwnedDispatcherSHA256']
after=(root/'docs/integration/proposed/aux-owned-dispatch-lifetime/source/AuxOwnedCommandDispatcher.swift').read_text()
def project(text,flags):
    active=[True];parts=[]
    for line in text.splitlines():
        if line.startswith('#if '):
            cond=line[4:].strip();neg=cond.startswith('!');key=cond[1:] if neg else cond
            assert re.fullmatch('[A-Z_]+',key)
            active.append(active[-1] and ((key not in flags) if neg else (key in flags)))
        elif line=='#endif':active.pop()
        elif line=='#else':active[-1]=active[-2] and not active[-1]
        elif line.startswith('#'):raise AssertionError(line)
        elif all(active):parts.append(line)
    assert len(active)==1
    return re.sub(r'\s+','','\n'.join(parts))
additive='funccloseOSAdmissionAndDrain(timeout:TimeInterval)->AuxOSDrainResult{.notPresent}'
for flags in [set(),{'AUX_MINIMAL_RUNTIME_DISPATCH'}, {'AUX_MINIMAL_RUNTIME_DISPATCH','AUX_SCOPED_SECURE_STORE_DISPATCH'}, {'AUX_RECOVERED_FRESH_DISPATCH','AUX_SCOPED_SECURE_STORE_DISPATCH'}]:
    current=project(after,flags)
    assert current.count(additive)==1
    assert current.replace(additive,'')==project(before,flags),flags
print('Final source pins and existing no-OS call-body preservation verified')
