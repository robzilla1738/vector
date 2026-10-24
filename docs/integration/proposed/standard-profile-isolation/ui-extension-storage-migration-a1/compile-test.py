"""Compile the focused native fixture; do not link, sign or execute it."""
import hashlib
import json
import subprocess
from pathlib import Path

HERE = Path(__file__).resolve().parent
OUT = Path('/private/tmp/aux-extension-storage-migration-test-compile-20261024-a1')
OUT.mkdir(mode=0o700)
sha = lambda path: hashlib.sha256(Path(path).read_bytes()).hexdigest()
command = json.loads((HERE / 'compiler-command.json').read_text())
cwd = Path(command['cwd'])
args = command['command'].copy()
index = [i for i, value in enumerate(args) if value.endswith('/leveldb_value_store.cc')]
assert len(index) == 1
args[index[0]] = str(HERE / 'migration_unittest.cc')
args[args.index('-o') + 1] = str(OUT / 'migration_unittest.o')
args[args.index('-MF') + 1] = str(OUT / 'migration_unittest.d')
args.insert(1, '-I../../third_party/googletest/src/googletest/include')
result = subprocess.run(args, cwd=cwd, capture_output=True)
(OUT / 'stdout.txt').write_bytes(result.stdout)
(OUT / 'stderr.txt').write_bytes(result.stderr)
receipt = {'format': 'aux.extension-storage-migration.fixture-compile.actual.v1',
           'passed': result.returncode == 0, 'exitCode': result.returncode,
           'command': args, 'cwd': str(cwd), 'output': str(OUT),
           'testSourceSha256': sha(HERE / 'migration_unittest.cc'),
           'linked': False, 'testsExecuted': False, 'appExecuted': False,
           'productSigned': False}
if result.returncode == 0:
    receipt['objectSha256'] = sha(OUT / 'migration_unittest.o')
(HERE / 'actual-test-compile-a1.json').write_text(json.dumps(receipt, indent=2) + '\n')
print(json.dumps({key: value for key, value in receipt.items()
                  if key != 'command'}), flush=True)
if result.returncode:
    print(result.stderr.decode('utf-8', errors='replace')[:5000])
    raise SystemExit(result.returncode)
