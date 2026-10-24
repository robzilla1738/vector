#!/usr/bin/env python3
"""Focused inert fixtures only; never stage, build, run or assemble a product."""
import importlib.util
from pathlib import Path
import tempfile
import json
import os
import shutil
import subprocess
import sys
sys.dont_write_bytecode = True
p = Path(__file__).with_name('feature_package.py')
spec = importlib.util.spec_from_file_location('feature_package', p)
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)

def refused(callback, message):
    try:
        callback()
    except ValueError:
        return
    raise AssertionError(message)

with tempfile.TemporaryDirectory(prefix='aux-feature-package-fixture-') as temp:
    r = Path(temp); baseline = r/'baseline'; feature = r/'feature'; app = r/'Aux.app'
    for stage, profile in [(baseline, 'baseline'), (feature, 'desktop-v1')]:
        stage.mkdir()
        (stage/'manifest.json').write_text(json.dumps(dict(implementation='supplied', identityProfile='aux-v1',
            stateIdentityVersion=2, featureProfile=profile, productionReady=False,
            adaptationInputs=[], brandInputs=[], cloudPolicy=m.DEVELOPMENT_POLICY, finalApp=str(app))))
        for rel, data, mode in [('ui/agent/entry.js', b'old' if profile=='baseline' else b'new', 0o644),
                                ('ui/agent/style.css', b'unchanged', 0o644),
                                (m.CLI, b'old-sea' if profile=='baseline' else b'new-sea', 0o755)]:
            target=stage/rel;target.parent.mkdir(parents=True, exist_ok=True);target.write_bytes(data);os.chmod(target,mode)
    for rel, data, mode in [('apps/extension/dist/entry.js', b'old', 0o644),
                            (m.CLI+'-sea', b'old-sea', 0o755)]:
        target=app/m.RESOURCES/rel;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(data);os.chmod(target,mode)
    changed_manifest=m.read(feature/'manifest.json')
    changed_manifest['cloudPolicy']={'mode':'local'}
    (feature/'manifest.json').write_text(json.dumps(changed_manifest))
    refused(lambda:m.resource_deltas(baseline,feature,app), 'Different service policy accepted')
    changed_manifest['cloudPolicy']=m.DEVELOPMENT_POLICY
    (feature/'manifest.json').write_text(json.dumps(changed_manifest))
    changes=m.resource_deltas(baseline, feature, app)
    assert len(changes)==2 and all(x['path'] != m.CLI for x in changes)
    (feature/'ui/agent/style.css').write_bytes(b'changed')
    refused(lambda:m.resource_deltas(baseline,feature,app), 'CSS mutation accepted')
    (feature/'ui/agent/style.css').write_bytes(b'unchanged')
    (app/m.RESOURCES/(m.CLI+'-sea')).write_bytes(b'wrong-predecessor')
    refused(lambda:m.resource_deltas(baseline,feature,app), 'Unrelated CLI predecessor accepted')
refused(lambda:m.verify_feature_native({'format':'aux.browser-features.native-compile.v1','passed':True},{}),
        'Object-only native receipt accepted')
original=(m.PACKAGE/'prepare.py').read_text()
needle="spec=importlib.util.spec_from_file_location('aux_assemble',P(__file__).with_name('assemble.py'));m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)"
assert original.count(needle)==1
assert Path(__file__).with_name('prepare_base.py').read_text()==original.replace(needle,
    'import feature_package\nm = feature_package.legacy\nm.verify_frozen_native = feature_package.verify_guarded_native')
review=m.read(Path(__file__).with_name('guard-transition.json'))
patch=Path(__file__).with_name('guard-transition.patch').resolve()
m.legacy.pin(patch,review['patchSha256'])
with tempfile.TemporaryDirectory(prefix='aux-feature-guard-check-') as temp:
    tree=Path(temp)
    for item in review['files']:
        m.legacy.pin(m.ROOT/item['baseline'],item['beforeSha256'])
        m.legacy.pin(m.ROOT/item['source'],item['afterSha256'])
        target=tree/item['path'];target.parent.mkdir(parents=True,exist_ok=True)
        shutil.copyfile(m.ROOT/item['baseline'],target)
    subprocess.run(['git','apply','--check',str(patch)],cwd=tree,check=True)
    subprocess.run(['git','apply',str(patch)],cwd=tree,check=True)
    for item in review['files']:m.legacy.pin(tree/item['path'],item['afterSha256'])
print(json.dumps({'focusedInertChecks':'passed','fixtureDeltaLeaves':2,'refusalCases':4,'guardReplayFiles':3,
                  'originalPreparationLogicPreserved':True,'productAssembled':False,'appExecuted':False}))
