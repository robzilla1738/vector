#!/usr/bin/env python3
import pathlib,json,hashlib,difflib
p=pathlib.Path(__file__).resolve().parent;repo=p.parents[3]
def sha(x):return hashlib.sha256(x.read_bytes()).hexdigest()
for name,digest in json.loads((p/'inputs.json').read_text()).items():assert sha(repo/name)==digest,name
pins=json.loads((p/'source-pins.json').read_text())
for group in ('swiftInputs','nativeSources'):
 for name,digest in pins[group].items():assert sha(repo/name)==digest,name
patch=''.join(''.join(difflib.unified_diff(f.read_text().splitlines(True),(p/'source'/f.name).read_text().splitlines(True),fromfile='baseline/'+f.name,tofile='source/'+f.name)) for f in sorted((p/'baseline').iterdir()) if f.suffix in ('.cc','.h'))
assert patch==(p/'worker-successor.patch').read_text()
s=(p/'source/AuxDevelopmentWorkerHost.cc').read_text()
assert 'AuxDevelopmentWorkerHost::AuxDevelopmentWorkerHost() : state_(std::make_shared<State>()) {}' in s
assert s.index('if (state_->closed) return napi_closing;')<s.index('AuxCreatePreparedFreshRuntimeOwner(state_->prepared_fresh_provider')
assert s.count('AuxCreatePreparedFreshRuntimeOwner(state_->prepared_fresh_provider')==1
print('PASS: exact source pins, default native constructor, closed-before-factory ordering and explicit provider caller pair')

routing=json.loads((p/'deferred-check-routing.json').read_text())
for pathKey,hashKey in [('original31Recipe','original31RecipeSha256'),('deferredEntry','deferredEntrySha256'),('finalRecipe','finalRecipeSha256')]:assert sha(repo/routing[pathKey])==routing[hashKey],pathKey
print('PASS: preserved31 recipe and same-session deferred36 route pins')
