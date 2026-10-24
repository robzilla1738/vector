#!/usr/bin/env python3
"""Read-only Agent resource equivalence check after the real fresh stage receipt."""
from pathlib import Path
import hashlib
import json

HERE = Path(__file__).resolve().parent
ROOT = Path('/Users/rcourson/Documents/Vibe/web')
OLD = ROOT/'out/standard-profile-stage-pair-20261024-a1'
NEW = ROOT/'out/standard-profile-finish-stage-pair-20261024'
FINAL = ROOT/'out/provided-candidate-standard-profile-finish-20261024/Aux.app'


def read(path):
    return json.loads(path.read_text())


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def inventory(path):
    result = {}
    for leaf in sorted(path.rglob('*')):
        assert not leaf.is_symlink(), 'Unexpected Agent resource alias'
        if leaf.is_file():
            result[str(leaf.relative_to(path))] = {'sha256':sha(leaf),'mode':leaf.stat().st_mode & 0o777}
    return result


receipt = read(NEW/'receipt.json')
assert receipt['passed'] is True and receipt['productExecuted'] is False
assert receipt['finalApp'] == str(FINAL) and not FINAL.exists()
assert receipt['sourceSnapshot'] == read(OLD/'receipt.json')['sourceSnapshot']
records = []
for profile in ['baseline','desktop-v1']:
    old, new = read(OLD/profile/'manifest.json'), read(NEW/profile/'manifest.json')
    for key in ['implementation','identityProfile','stateIdentityVersion','featureProfile',
                'productionReady','brandInputs','adaptationInputs','cloudPolicy']:
        assert old[key] == new[key], key
    assert new['finalApp'] == str(FINAL) and new['productionReady'] is False
    before, after = inventory(OLD/profile/'ui/agent'), inventory(NEW/profile/'ui/agent')
    assert before == after, 'Agent UI bytes differ from the accepted revision inputs'
    version = read(NEW/profile/'ui/agent/manifest.json')['version']
    if profile == 'desktop-v1':
        assert version == '1.26.1016.1869'
    records.append({'profile':profile,'agentVersion':version,'agentResourceCount':len(after),
                    'agentResourceBytesAndModesIdentical':True,
                    'priorManifestSha256':sha(OLD/profile/'manifest.json'),
                    'freshManifestSha256':sha(NEW/profile/'manifest.json')})
report = {'format':'aux.standard-final-resource-stage.equivalence.v1','passed':True,
          'receipt':str(NEW/'receipt.json'),'receiptSha256':sha(NEW/'receipt.json'),
          'profiles':records,'appAssembled':False,'appExecuted':False,'signed':False,
          'runtimeAcceptance':False,'scope':'Exact current Agent UI resources and stage input association only'}
with (HERE/'equivalence-a1.json').open('x') as output:
    output.write(json.dumps(report,indent=2)+'\n')
print('Both fresh Agent resource trees exactly match prior bytes and modes; revision17 retained.')
