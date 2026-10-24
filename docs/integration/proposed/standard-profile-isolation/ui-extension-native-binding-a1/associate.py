"""Associate unchanged compiled fixture bytes with corrected GN registration."""
import hashlib
import json
import subprocess
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[4]
ROOT = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
sha = lambda path: hashlib.sha256(Path(path).read_bytes()).hexdigest()
production = json.loads((HERE / 'source-plan.json').read_text())
tests = json.loads((HERE / 'test-source-plan-a2.json').read_text())
compiled = json.loads((HERE / 'actual-compile-a1.json').read_text())
fixture = json.loads((HERE / 'actual-test-compile-a1.json').read_text())
series = json.loads((HERE / 'actual-series-integration-a1.json').read_text())
assert compiled['passed'] and fixture['passed'] and series['passed']
assert compiled['sourcePlanSha256'] == sha(HERE / 'source-plan.json')
assert fixture['testSourceSha256'] == tests['files'][1]['outputSha256'] == sha(HERE / 'migration_unittest.cc')
assert fixture['testPlanSha256'] == sha(HERE / 'test-source-plan.json')
assert fixture['productionCompileSha256'] == sha(HERE / 'actual-compile-a1.json')
assert series['testSourcePlanSha256'] == sha(HERE / 'test-source-plan-a2.json')
overlay = Path(production['overlay'])
for row in production['files'] + tests['files']:
    assert sha(overlay / row['path']) == row['outputSha256']
formats = []
for name in ['extensions/browser/BUILD.gn', 'extensions/browser/api/storage/BUILD.gn']:
    command = ['python3', str(REPO / 'scripts/native-build.py'),
               str(ROOT / 'buildtools/mac/gn'), 'format', '--dry-run', str(overlay / name)]
    result = subprocess.run(command, capture_output=True)
    formats.append({'path': name, 'sha256': sha(overlay / name), 'command': command,
                    'exitCode': result.returncode, 'stdout': result.stdout.decode(), 'stderr': result.stderr.decode()})
    assert result.returncode == 0, formats[-1]
receipt = {'format': 'aux.ui-extension-binding.association.actual.v1', 'passed': True,
           'productionReceiptSha256': sha(HERE / 'actual-compile-a1.json'),
           'fixtureReceiptSha256': sha(HERE / 'actual-test-compile-a1.json'),
           'originalFixturePlanSha256': fixture['testPlanSha256'],
           'activeFixturePlanSha256': sha(HERE / 'test-source-plan-a2.json'),
           'seriesReceiptSha256': sha(HERE / 'actual-series-integration-a1.json'),
           'compiledFixtureBytesUnchanged': True, 'gnFormat': formats,
           'oldGnRegistrationAccepted': False, 'fixtureRecompiled': False,
           'testsExecuted': False, 'productExecuted': False, 'runtimeAcceptance': False}
(HERE / 'actual-association-a1.json').write_text(json.dumps(receipt, indent=2) + '\n')
print(json.dumps({'passed': True, 'gnFiles': len(formats), 'fixtureRecompiled': False}))
