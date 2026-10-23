#!/usr/bin/env python3
import pathlib,json,hashlib,difflib
p=pathlib.Path(__file__).resolve().parent;repo=p.parents[3]
def sha(x):return hashlib.sha256(x.read_bytes()).hexdigest()
for name,digest in json.loads((p/'inputs.json').read_text()).items():assert sha(repo/name)==digest,name
pins=json.loads((p/'source-pins.json').read_text())
for group in ('swiftInputs','nativeSources'):
 for name,digest in pins[group].items():assert sha(repo/name)==digest,name
patch=''.join(''.join(difflib.unified_diff(f.read_text().splitlines(True),(p/'source'/f.name).read_text().splitlines(True),fromfile='baseline/'+f.name,tofile='source/'+f.name)) for f in sorted((p/'baseline').iterdir()) if (p/'source'/f.name).exists())
assert patch==(p/'source.patch').read_text()
s=(p/'source/AuxPreparedFreshRuntimeProvider.swift').read_text()
assert 'if let owner,preparationSucceeded,!entry.closed' in s
assert 'if !e.quarantinedOwners.isEmpty{return 2}' in s
assert 'catch{unresolved=owner}' in s
assert 'try? owner.retire()' not in s
assert 'creation < 0 || creation == 2' in (p/'source/AuxDevelopmentWorkerHost.cc').read_text()
print('PASS: exact source graph and late-owner publication/quarantine/host status pairs')
