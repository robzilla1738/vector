"""Compile only the changed backend against its real Chromium target command."""
import hashlib
import json
import shlex
import subprocess
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
CWD = ROOT / 'out/AuxFast'
OUT = Path('/private/tmp/aux-extension-storage-migration-compile-20261024-a2')
OUT.mkdir(mode=0o700)
sha = lambda path: hashlib.sha256(Path(path).read_bytes()).hexdigest()
plan = json.loads((HERE / 'source-plan.json').read_text())
for file in plan['files']:
    assert sha(ROOT / file['path']) == file['inputSha256']
    assert sha(HERE / 'source' / file['path']) == file['outputSha256']
target = 'obj/components/value_store/value_store/leveldb_value_store.o'
command_pin = json.loads((HERE / 'compiler-command-failed-a1.json').read_text())
assert sha(HERE / 'compiler-command-original.txt') == command_pin['originalCommandSha256']
commands = (HERE / 'compiler-command-original.txt').read_text().splitlines()
assert len(commands) == 1 and '/leveldb_value_store.cc ' in commands[0]
(HERE / 'compiler-command-original.txt').write_text(commands[0] + '\n')
args = shlex.split(commands[0])
assert Path(args[0]).name == 'clang++'
index = [i for i, arg in enumerate(args) if arg.endswith('/leveldb_value_store.cc')]
assert len(index) == 1
args[index[0]] = str(HERE / 'source/components/value_store/leveldb_value_store.cc')
args[args.index('-o') + 1] = str(OUT / 'leveldb_value_store.o')
args[args.index('-MF') + 1] = str(OUT / 'leveldb_value_store.d')
args.insert(1, '-I' + str(HERE / 'source'))
(HERE / 'compiler-command.json').write_text(json.dumps({
    'cwd': str(CWD), 'target': target, 'command': args,
    'originalCommandSha256': sha(HERE / 'compiler-command-original.txt'),
    'compilerSha256': sha((CWD / args[0]).resolve())}, indent=2) + '\n')
result = subprocess.run(args, cwd=CWD, capture_output=True)
(OUT / 'stdout.txt').write_bytes(result.stdout)
(OUT / 'stderr.txt').write_bytes(result.stderr)
receipt = {'format': 'aux.extension-storage-migration.compile.actual.v1',
           'passed': result.returncode == 0, 'exitCode': result.returncode,
           'output': str(OUT), 'nativeTreeChanged': False,
           'appExecuted': False, 'productSigned': False,
           'callerIntegrated': False, 'fullBrowserBuilt': False,
           'testsExecuted': False, 'sourcePlanSha256': sha(HERE / 'source-plan.json'),
           'compilerCommandSha256': sha(HERE / 'compiler-command.json')}
if result.returncode == 0:
    obj = OUT / 'leveldb_value_store.o'
    assert obj.stat().st_size > 0
    receipt['objectSha256'] = sha(obj)
    symbols = subprocess.run(['/usr/bin/nm', '-gU', str(obj)],
                             check=True, capture_output=True).stdout
    (OUT / 'symbols.txt').write_bytes(symbols)
    for symbol in [b'CaptureAuxUiPreferencesForMigration',
                   b'CommitAuxUiPreferenceMigration']:
        assert symbol in symbols
    dependencies = shlex.split((OUT / 'leveldb_value_store.d').read_text()
                              .replace('\\\n', ' ').split(':', 1)[1])
    receipt['dependencyInputs'] = [
        {'path': path, 'sha256': sha(path)} for path in
        sorted({str((CWD / path).resolve()) for path in dependencies})]
for file in plan['files']:
    assert sha(ROOT / file['path']) == file['inputSha256']
(HERE / 'actual-compile-a2.json').write_text(json.dumps(receipt, indent=2) + '\n')
print(json.dumps({key: value for key, value in receipt.items()
                  if key != 'dependencyInputs'}), flush=True)
if result.returncode:
    print(result.stderr.decode('utf-8', errors='replace')[:5000])
    raise SystemExit(result.returncode)
