#!/usr/bin/env python3
"""Read-only completed source/native checks; no package review or browser receipt."""
import copy
import hashlib
import importlib.util
import inspect
import json
from pathlib import Path
import runpy
import sys
import time
sys.dont_write_bytecode = True
ROOT = Path('/Users/rcourson/Documents/Vibe/web')
SCOPE = ROOT/'docs/integration/proposed/standard-profile-isolation'
HERE = Path(__file__).resolve().parent
read = lambda p: json.loads(Path(p).read_text())
sha = lambda p: hashlib.sha256(Path(p).read_bytes()).hexdigest()
started = time.monotonic()
record = {'format':'aux.standard-package.source-native-preflight.v1','passed':False,
          'browserReceiptRead':False,'reviewFrozen':False,'packageExecuted':False,
          'stageRepeated':False,'productExecuted':False,'signed':False,'checks':[]}
try:
    # Execute tool definitions only. Neither module's CLI/main entrypoint runs.
    sys.path.insert(0,str(SCOPE/'package-v6'))
    old = runpy.run_path(str(SCOPE/'package-v6/cache_package.py'),run_name='aux_readonly_predecessor')
    previous = read(SCOPE/'package-v6/review.json')
    old['verify_research_projection'](previous)
    record['checks'].append('genuine-v6-source-history')
    inputs, link = old['verify_link'](previous['inputs']['standardCompileResult']['path'],
        SCOPE/'integration/native-build-a2.json',previous)
    record['checks'].append('genuine-v6-native-history')
    source_closure = inspect.getclosurevars(old['verify_research_projection']).nonlocals
    link_closure = inspect.getclosurevars(old['verify_link']).nonlocals
    review = read(SCOPE/'package-v9/review.template.json')
    # Only completed, existing documents are pinned in memory. No new review is
    # written; absent browser/standard-review inputs remain untouched and unread.
    for name in ['successorContract','nativeCredentialActual','nativeObserverActual',
                 'nativeCrashActual','standardProjectionV5Immutable','projection',
                 'previousNativeComposition']:
        item = review['inputs'][name]
        actual = sha(item['path'])
        assert item['sha256'] in [None,actual],name
        item['sha256'] = actual
    projection = source_closure['document'](review['inputs']['projection'])
    composition = read(Path(projection['output'])/'composition.json')
    assert sha(Path(projection['output'])/'composition.json') == projection['compositionSha256']
    previous_standard = source_closure['standard'](previous)
    current_source = { 'sourceProjection':projection,
        'runtimeArtifacts':composition['artifacts'],
        'exactSourceStages':previous_standard['exactSourceStages']+['native-credential-lock','meta-connection-lifetime'] }
    def source_only_standard(value):
        if value is review:
            return current_source
        assert value is previous
        return source_closure['standard'](value)
    spec = importlib.util.spec_from_file_location('aux_successor_readonly',SCOPE/'package-v9/successor_verify.py')
    module = importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
    successors = module.Successors(old,source_only_standard,source_closure['pinned'],
        source_closure['document'],source_closure['replay'],link_closure['pin_native'],
        link_closure['dependencies'])
    successors.verify_source(review,previous)
    record['checks'].append('actual-v5-source-successor')
    final_inputs, final_link = successors.verify_native(review,inputs,link)
    record['checks'].append('actual-a4-a5-a6-native-successors')
    record.update(passed=True,sourceProjection=review['inputs']['projection'],
        finalNativeManifest={'path':str(final_inputs),'sha256':sha(final_inputs)},
        finalNativeLink={'path':str(final_link),'sha256':sha(final_link)},
        tool={'path':str(SCOPE/'package-v9/successor_verify.py'),'sha256':sha(SCOPE/'package-v9/successor_verify.py')})
except Exception as error:
    record['error'] = type(error).__name__+': '+str(error)
finally:
    record['seconds'] = time.monotonic()-started
    with (HERE/'actual-a1.json').open('x') as output:json.dump(record,output,indent=2);output.write('\n')
    print(json.dumps(record,indent=2))
if not record['passed']:raise SystemExit(1)
