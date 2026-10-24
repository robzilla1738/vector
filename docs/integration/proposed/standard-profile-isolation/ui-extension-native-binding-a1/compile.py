"""Compile actual storage frontend/decorators and both sides of the opaque ABI."""
import hashlib
import json
import shlex
import subprocess
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
CWD = ROOT / 'out/AuxFast'
OUT = Path('/private/tmp/aux-extension-native-binding-compile-20261024-a1')
OUT.mkdir(mode=0o700)
sha = lambda path: hashlib.sha256(Path(path).read_bytes()).hexdigest()
plan = json.loads((HERE / 'source-plan.json').read_text())
overlay = Path(plan['overlay'])
for row in plan['files']:
    assert sha(ROOT / row['path']) == row['originalSha256']
    assert sha(overlay / row['path']) == row['outputSha256']
    if 'predecessor' in row:
        assert sha(row['predecessor']) == row['inputSha256']
names = ['value_store', 'leveldb_value_store', 'settings_storage_quota_enforcer',
         'weak_unlimited_settings_storage', 'storage_frontend']
targets = [(f'obj/components/value_store/value_store/{name}.o' if name in names[:2]
            else f'obj/extensions/browser/api/storage/storage/{name}.o') for name in names]
discovery = subprocess.run([str(ROOT / 'third_party/ninja/ninja'), '-t',
                            'commands', '-s', *targets], cwd=CWD, capture_output=True)
(OUT / 'discovery.stdout').write_bytes(discovery.stdout)
(OUT / 'discovery.stderr').write_bytes(discovery.stderr)
discovery.check_returncode()
commands = discovery.stdout.decode('utf-8', errors='strict').splitlines()
assert len(commands) == len(names)
(HERE / 'compiler-commands-original.txt').write_text('\n'.join(commands) + '\n')
dependencies = set()
results = []
for name in names:
    selected = [line for line in commands if f'/{name}.cc ' in line]
    assert len(selected) == 1
    args = shlex.split(selected[0])
    assert Path(args[0]).name == 'clang++'
    index = [i for i, value in enumerate(args) if value.endswith(f'/{name}.cc')]
    assert len(index) == 1
    relative = next(row['path'] for row in plan['files'] if row['path'].endswith('/' + name + '.cc'))
    args[index[0]] = str(overlay / relative)
    args[args.index('-o') + 1] = str(OUT / (name + '.o'))
    args[args.index('-MF') + 1] = str(OUT / (name + '.d'))
    args.insert(1, '-I' + str(overlay))
    result = subprocess.run(args, cwd=CWD, capture_output=True)
    (OUT / (name + '.stdout')).write_bytes(result.stdout)
    (OUT / (name + '.stderr')).write_bytes(result.stderr)
    row = {'source': name, 'command': args, 'exitCode': result.returncode,
           'passed': result.returncode == 0}
    if result.returncode == 0:
        row['objectSha256'] = sha(OUT / (name + '.o'))
        depfile = OUT / (name + '.d')
        row['depfileSha256'] = sha(depfile)
        paths = shlex.split(depfile.read_text().replace('\\\n', ' ').split(':', 1)[1])
        current = {str((CWD / path).resolve()) for path in paths}
        row['dependencyCount'] = len(current)
        dependencies.update(current)
        symbols = subprocess.run(['/usr/bin/nm', '-gU', str(OUT / (name + '.o'))],
                                 capture_output=True, check=True).stdout
        assert b'CaptureAuxUiPreferencesForMigration' in symbols
        assert b'CommitAuxUiPreferenceMigration' in symbols
        (OUT / (name + '.symbols')).write_bytes(symbols)
    else:
        print(result.stderr.decode('utf-8', errors='replace')[:6000], flush=True)
    results.append(row)
    print(json.dumps({key: value for key, value in row.items() if key != 'command'}), flush=True)
    if result.returncode:
        break
for row in plan['files']:
    assert sha(ROOT / row['path']) == row['originalSha256']
receipt = {'format': 'aux.ui-extension-native-binding.compile.actual.v1',
           'passed': len(results) == len(names) and all(row['passed'] for row in results),
           'results': results, 'sourcePlanSha256': sha(HERE / 'source-plan.json'),
           'compilerSha256': sha((CWD / shlex.split(commands[0])[0]).resolve()),
           'dependencyInputs': [{'path': path, 'sha256': sha(path)} for path in sorted(dependencies)],
           'cwd': str(CWD), 'output': str(OUT), 'nativeRootChanged': False,
           'productExecuted': False, 'fullBrowserBuilt': False,
           'writerAdmissionImplemented': False, 'browserImporterIntegrated': False,
           'runtimeAcceptance': False}
(HERE / 'actual-compile-a1.json').write_text(json.dumps(receipt, indent=2) + '\n')
print(json.dumps({'passed': receipt['passed'], 'objects': len(results),
                  'dependencyInputs': len(dependencies), 'output': str(OUT)}), flush=True)
raise SystemExit(0 if receipt['passed'] else 1)
