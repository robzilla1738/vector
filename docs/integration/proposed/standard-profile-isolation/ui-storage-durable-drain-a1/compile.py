"""Focused real-target compilation; no link, product execution or signing."""
import hashlib
import json
import shlex
import subprocess
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
CWD = ROOT / 'out/AuxFast'
PREVIOUS = HERE.parent / 'ui-storage-native-drain-a1'
OUT = Path('/private/tmp/aux-dom-storage-durable-compile-20261024-a2')
OUT.mkdir(mode=0o700)
sha = lambda path: hashlib.sha256(Path(path).read_bytes()).hexdigest()
plan = json.loads((HERE / 'source-plan.json').read_text())
overlay = Path(plan['overlay'])
service_plan = json.loads((PREVIOUS / 'service-source-plan.json').read_text())
service_overlay = Path(service_plan['overlay'])
for file in plan['files']:
    assert sha(ROOT / file['path']) == file['originalSha256']
    assert sha(overlay / file['path']) == file['outputSha256']
    if 'predecessor' in file:
        assert sha(file['predecessor']) == file['inputSha256']
for file in service_plan['files']:
    assert sha(ROOT / file['path']) == file['inputSha256']
    assert sha(service_overlay / file['path']) == file['outputSha256']
names = ['dom_storage_database', 'database', 'sqlite_database_utils',
         'dom_storage_database_leveldb', 'local_storage_leveldb',
         'session_storage_leveldb',
         'local_storage_sqlite', 'session_storage_sqlite',
         'async_dom_storage_database', 'local_storage_impl', 'session_storage_impl']
targets = [('obj/sql/sql/database.o' if name == 'database' else
            f'obj/components/services/storage/storage/{name}.o') for name in names]
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
    relative = next(file['path'] for file in
                    (service_plan['files'] if name.endswith('_impl') else plan['files'])
                    if file['path'].endswith('/' + name + '.cc'))
    args[index[0]] = str((service_overlay if name.endswith('_impl') else overlay) / relative)
    args[args.index('-o') + 1] = str(OUT / (name + '.o'))
    args[args.index('-MF') + 1] = str(OUT / (name + '.d'))
    args[1:1] = ['-I' + str(overlay), '-I' + str(service_overlay),
                 '-I' + str(PREVIOUS / 'source')]
    run = subprocess.run(args, cwd=CWD, capture_output=True)
    (OUT / (name + '.stdout')).write_bytes(run.stdout)
    (OUT / (name + '.stderr')).write_bytes(run.stderr)
    row = {'source': name, 'passed': run.returncode == 0,
           'exitCode': run.returncode, 'command': args}
    if run.returncode == 0:
        row['objectSha256'] = sha(OUT / (name + '.o'))
        depfile = OUT / (name + '.d')
        row['depfileSha256'] = sha(depfile)
        deps = shlex.split(depfile.read_text().replace('\\\n', ' ').split(':', 1)[1])
        current = {str((CWD / path).resolve()) for path in deps}
        dependencies.update(current)
        row['dependencyCount'] = len(current)
        symbols = subprocess.run(['/usr/bin/nm', '-gU', str(OUT / (name + '.o'))],
                                 check=True, capture_output=True).stdout
        (OUT / (name + '.symbols')).write_bytes(symbols)
        if name == 'sqlite_database_utils':
            assert b'SyncDatabaseForAuxMigration' in symbols
        elif name == 'database':
            assert b'SyncOpenFilesForAuxMigration' in symbols
        elif name in ['dom_storage_database', 'dom_storage_database_leveldb',
                      'local_storage_leveldb', 'session_storage_leveldb',
                      'local_storage_sqlite', 'session_storage_sqlite']:
            assert b'SyncForAuxMigration' in symbols
        elif name.endswith('_impl'):
            assert b'DrainLoadedAreasForAuxMigration' in symbols
        else:
            assert b'DrainCommitsForAuxMigration' in symbols
    else:
        print(run.stderr.decode('utf-8', errors='replace')[:6000], flush=True)
    results.append(row)
    print(json.dumps({key: value for key, value in row.items()
                      if key != 'command'}), flush=True)
    if run.returncode:
        break
for file in plan['files']:
    assert sha(ROOT / file['path']) == file['originalSha256']
for file in service_plan['files']:
    assert sha(ROOT / file['path']) == file['inputSha256']
receipt = {'format': 'aux.dom-storage-durable-drain.compile.actual.v1',
           'passed': len(results) == len(names) and all(row['passed'] for row in results), 'results': results,
           'sourcePlanSha256': sha(HERE / 'source-plan.json'),
           'servicePlanSha256': sha(PREVIOUS / 'service-source-plan.json'),
           'compilerSha256': sha((CWD / shlex.split(commands[0])[0]).resolve()),
           'dependencyInputs': [{'path': path, 'sha256': sha(path)}
                                for path in sorted(dependencies)],
           'cwd': str(CWD), 'output': str(OUT), 'nativeRootChanged': False,
           'productExecuted': False, 'fullBrowserBuilt': False,
           'browserImporterIntegrated': False, 'runtimeAcceptance': False}
(HERE / 'actual-compile-a2.json').write_text(json.dumps(receipt, indent=2) + '\n')
print(json.dumps({'passed': receipt['passed'], 'objects': len(results),
                  'dependencyInputs': len(dependencies), 'output': str(OUT)}), flush=True)
raise SystemExit(0 if receipt['passed'] else 1)
