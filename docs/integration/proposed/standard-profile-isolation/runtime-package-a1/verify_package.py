#!/usr/bin/env python3
"""Read-only finite association check; reuse completed full-copy evidence."""
import importlib.util
import sys
from pathlib import Path

sys.dont_write_bytecode = True
HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('runtime_successor', HERE/'runtime_package.py')
p = importlib.util.module_from_spec(spec)
spec.loader.exec_module(p)
review = p.read(HERE/'review.json')
receipt = p.read(p.OUT/'receipt.json')
actual = p.read(HERE/'actual-package.json')
p.require(actual['passed'] is True and p.ref(p.OUT/'receipt.json') == actual['receipt'], 'Actual completed receipt required')
p.require(receipt['passed'] is True and receipt['reviewSha256'] == p.sha(HERE/'review.json') and
          receipt['inventorySha256'] == p.digest(receipt['files']) == actual['inventorySha256'], 'Receipt association differs')
p.require(all(receipt[key] is False and actual[key] is False for key in p.FLAGS), 'Authority flags changed')
for item in review['inputs']:
    p.pin(item)
before = p.read(p.BASE/'receipt.json')['files']
p.verify_delta(before, receipt['files'], review)
app = p.OUT/'Aux.app'
for item in review['replacements']+review['moves']:
    target = app/p.RES/item['path']
    p.require(target.is_file() and not target.is_symlink() and p.sha(target) == item['input']['sha256'] and
              target.stat().st_mode & 0o777 == item['mode'], 'Changed actual leaf differs')
for item in review['removals']:
    p.require(not (app/p.RES/item['path']).exists(), 'Obsolete seed helper retained')
for item in review['moves']:
    p.require(not (app/p.RES/item['previousPath']).exists(), 'Old memory runtime leaf retained')
marker = app/p.RES/'bundle.json'
leaves = {item['path']:item for item in receipt['files']}
p.require(p.sha(marker) == leaves[str(p.RES/'bundle.json')]['sha256'], 'Actual marker differs from completed inventory')
bundle = p.read(marker)
pair = p.read(p.pin(review['sourcePair']))
p.require(bundle['finalApp'] == str(app) and bundle['productionReady'] is False and
          bundle['runtimeSuccessorIntegration']['sourcePair'] == review['sourcePair'] and
          bundle['nativeEntryProjection']['sourceSha256'] == pair['sourceSha256'], 'Source/native/marker association differs')
for name, relative in [('daemon',p.DAEMON+'MacOS/aux-daemon'),('loader',p.DAEMON+'Resources/native/aux-owned-native.cjs'),
                       ('pty',p.DAEMON+'Resources/native/node-pty/prebuilds/darwin-arm64/pty.node')]:
    p.require(p.sha(app/p.RES/relative) == pair[name+'Sha256'], 'Retained native tuple differs')
p.write_new(HERE/'actual-verification-a1.json', dict(format='aux.runtime-package.readonly-verification.v1',passed=True,
    receipt=p.ref(p.OUT/'receipt.json'), inventorySha256=receipt['inventorySha256'], leaves=len(receipt['files']),
    finiteActualDeltaChecked=True, completedFullCopyEvidenceReused=True, fullBrowserRebuildRepeated=False,
    nativeTupleAssociationPassed=True, allUiCssAssetsPreservedByCompleteInventory=True, **{key:False for key in p.FLAGS}))
print('Read-only runtime package association passed; runtime acceptance remains unperformed')
