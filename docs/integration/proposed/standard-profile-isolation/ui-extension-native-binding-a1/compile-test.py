"""Compile the four focused native cases; no link, execution or signing."""
import hashlib
import json
import subprocess
from pathlib import Path

HERE = Path(__file__).resolve().parent
OUT = Path('/private/tmp/aux-extension-native-binding-test-compile-20261024-a1')
OUT.mkdir(mode=0o700)
sha = lambda path: hashlib.sha256(Path(path).read_bytes()).hexdigest()
receipt = json.loads((HERE / 'actual-compile-a1.json').read_text())
assert receipt['passed']
row = next(row for row in receipt['results'] if row['source'] == 'settings_storage_quota_enforcer')
args = row['command'].copy()
source = next(i for i, value in enumerate(args) if value.endswith('/settings_storage_quota_enforcer.cc'))
args[source] = str(HERE / 'migration_unittest.cc')
args[args.index('-o') + 1] = str(OUT / 'migration_unittest.o')
args[args.index('-MF') + 1] = str(OUT / 'migration_unittest.d')
args.insert(1, '-I../../third_party/googletest/src/googletest/include')
result = subprocess.run(args, cwd=receipt['cwd'], capture_output=True)
(OUT / 'stdout.txt').write_bytes(result.stdout)
(OUT / 'stderr.txt').write_bytes(result.stderr)
actual = {'format': 'aux.ui-extension-native-binding.fixture-compile.actual.v1',
          'passed': result.returncode == 0, 'exitCode': result.returncode,
          'command': args, 'cwd': receipt['cwd'], 'output': str(OUT),
          'testSourceSha256': sha(HERE / 'migration_unittest.cc'),
          'productionCompileSha256': sha(HERE / 'actual-compile-a1.json'),
          'testPlanSha256': sha(HERE / 'test-source-plan.json'),
          'testsExecuted': False, 'linked': False, 'productExecuted': False,
          'productSigned': False}
if result.returncode == 0:
    actual['objectSha256'] = sha(OUT / 'migration_unittest.o')
(HERE / 'actual-test-compile-a1.json').write_text(json.dumps(actual, indent=2) + '\n')
print(json.dumps({key: value for key, value in actual.items() if key != 'command'}), flush=True)
if result.returncode:
    print(result.stderr.decode('utf-8', errors='replace')[:6000])
    raise SystemExit(result.returncode)
