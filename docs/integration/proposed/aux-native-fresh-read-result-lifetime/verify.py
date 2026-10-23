#!/usr/bin/env python3
import pathlib,hashlib,json,difflib
p=pathlib.Path(__file__).resolve().parent;repo=p.parents[3]
def sha(q):return hashlib.sha256(q.read_bytes()).hexdigest()
r=json.loads((p/'source-pins.json').read_text());assert len(r['swiftInputs'])==42
for group in ('swiftInputs','baselineInputs','fixtureInputs','nativeUnchanged','nativeSources'):
 for name,h in r[group].items():assert sha(repo/name)==h,name
b=p/'baseline/AuxOwnedCommandDispatcher.swift';s=p/'source/AuxOwnedCommandDispatcher.swift'
assert ''.join(difflib.unified_diff(b.read_text().splitlines(True),s.read_text().splitlines(True),fromfile='baseline/'+b.name,tofile='source/'+s.name))==(p/'successor.patch').read_text()
assert s.read_text().count('withExtendedLifetime(entry)')==3
assert s.read_text().count('entry.retainedRead=nil')==3 # Reconciled + two proven-loss branches only.
assert 'check(auxNativeContextRetire(owner.handle ) == -2)' in (p/'tests/main.swift').read_text()
print('PASS: exact successor42 paths, retained secret reference release only on real loss/reconciliation and captured retirement reentry recipe; STATIC ONLY')
