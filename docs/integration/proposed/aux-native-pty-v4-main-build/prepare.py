#!/usr/bin/env python3
"""Freeze the actual coherent objects and explicit v4 policy and enforcing loader substitutions."""
import hashlib
import json
from pathlib import Path
H = Path(__file__).resolve().parent
W = H.parents[3]
ROOT = Path('/Users/rcourson/Documents/Vibe/web')
OLD = Path('/private/tmp/aux-native-pty-coherent-main-20261023')
OUT = Path('/private/tmp/aux-native-pty-v4-main-20261023')
def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()
p = json.loads((W / 'docs/integration/proposed/aux-native-pty-coherent-main-build/inputs.json').read_text())
m = json.loads((W / 'docs/integration/proposed/aux-native-pty-coherent-main-build/metadata-inputs.json').read_text())
r = json.loads((OLD / 'results.json').read_text())
a = json.loads((OLD / 'post-link-metadata.json').read_text())
assert r['results'] == [{'command':'compile','exitCode':0},{'command':'link','exitCode':0}] and r['inputsUnchanged']
assert not r['passed'] and r['error'] == 'Missing paired native symbols'
assert a['passed'] and a['frozenInputsAndDependenciesUnchanged']
assert sha(OLD / 'Aux Daemon') == a['mainSha256'] == 'd76ef82d4b8bbad476fb70f09561351dc32da219860e33cf1b12eb58ab413efd'
files = dict(p['frozenFiles'])
files.update(m['frozenFiles'])
dependencies = json.loads((OLD / 'actual-dependencies.json').read_text())
files.update(dependencies)
for name in ['results.json','post-link-metadata.json','actual-dependencies.json']:
    files[str(OLD / name)] = sha(OLD / name)
objects = {f'{n}.o':sha(OLD / f'{n}.o') for n in range(11)}
for name, value in objects.items():
    files[str(OLD / name)] = value
policy = W / 'docs/integration/proposed/aux-native-rebuilt-pty-policy/source/AuxFreshBootstrapPolicy.swift'
loader = W / 'docs/integration/proposed/aux-native-rebuilt-pty-policy/source/AuxSignedFreshBootstrapPolicyLoader.swift'
files[str(policy)] = sha(policy)
files[str(loader)] = sha(loader)
link = [v.replace(str(OLD),str(OUT)) for v in p['link']]
oldpolicy = str(ROOT / 'docs/integration/proposed/aux-native-embedded-pty-policy/source/AuxFreshBootstrapPolicy.swift')
assert link.count(oldpolicy) == 1
link[link.index(oldpolicy)] = str(policy)
oldloader = p['sourceSubstitutions']['policyLoader']
assert link.count(oldloader) == 1
link[link.index(oldloader)] = str(loader)
assert sum(v.endswith('.swift') for v in link) == 46
assert link.count('-no_adhoc_codesign') == 1
for tool in m['tools'].values():
    files[tool] = sha(Path(tool))
for path,value in files.items():
    assert sha(Path(path)) == value, path
pins = {
 'format':'aux.pty-v4-native-main.inputs.v1','output':str(OUT),'priorOutput':str(OLD),
 'frozenFiles':files,'reusedObjects':objects,'cppRecompiled':False,'link':link,
 'policySource':str(policy),'policySourceSha256':sha(policy),
 'loaderSource':str(loader),'loaderSourceSha256':sha(loader),'policyFormat':'aux.fresh.bootstrap.policy.v4',
 'fixedReaderPreserved':p['fixedReaderPreserved'],'nodeArchivesChecked':42,
 'priorActualHeaderDependenciesChecked':len(dependencies),'automaticAdHocSigningDisabled':True,
 'tools':m['tools'],'expectedFlatImports':m['expectedFlatImports'],'ptyImports':m['ptyImports'],
 'swiftInternalDefinitions':m['swiftInternalDefinitions'],'module':m['module'],
 'moduleSha256':'5b703ca2ae0901cc2b8e8e1064aaf4b78a386f402578a995834a8024de433726'
}
(H / 'inputs.json').write_text(json.dumps(pins,indent=2)+'\n')
print('Frozen exact11 reused objects,46Swift link,42Node archives; policy parser and enforcing loader are the only source substitutions')
