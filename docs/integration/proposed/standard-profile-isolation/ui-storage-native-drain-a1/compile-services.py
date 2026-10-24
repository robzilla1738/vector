"""Compile two actual storage-service callers with the paired drain overlay."""
import hashlib
import json
import shlex
import subprocess
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
CWD = ROOT / 'out/AuxFast'
OUT = Path('/private/tmp/aux-dom-storage-service-compile-20261024-a1')
OUT.mkdir(mode=0o700)
sha = lambda path: hashlib.sha256(Path(path).read_bytes()).hexdigest()
plan = json.loads((HERE / 'service-source-plan.json').read_text())
overlay = Path(plan['overlay'])
for file in plan['files']:
    assert sha(ROOT / file['path']) == file['inputSha256']
    assert sha(overlay / file['path']) == file['outputSha256']
targets = [f'obj/components/services/storage/storage/{name}.o'
           for name in ['local_storage_impl', 'session_storage_impl']]
discovery = subprocess.run([str(ROOT / 'third_party/ninja/ninja'), '-t',
                            'commands', '-s', *targets], cwd=CWD, capture_output=True)
(OUT / 'discovery.stdout').write_bytes(discovery.stdout)
(OUT / 'discovery.stderr').write_bytes(discovery.stderr)
discovery.check_returncode()
commands = discovery.stdout.decode('utf-8', errors='strict').splitlines()
assert len(commands) == 2
(HERE / 'service-compiler-commands-original.txt').write_text('\n'.join(commands) + '\n')
results = []
for name in ['local_storage_impl', 'session_storage_impl']:
    matching = [line for line in commands if f'/{name}.cc ' in line]
    assert len(matching) == 1
    args = shlex.split(matching[0])
    assert Path(args[0]).name == 'clang++'
    index = [i for i, value in enumerate(args) if value.endswith(f'/{name}.cc')]
    assert len(index) == 1
    args[index[0]] = str(overlay / f'components/services/storage/dom_storage/{name}.cc')
    args[args.index('-o') + 1] = str(OUT / (name + '.o'))
    args[args.index('-MF') + 1] = str(OUT / (name + '.d'))
    args[1:1] = ['-I' + str(overlay), '-I' + str(HERE / 'source')]
    result = subprocess.run(args, cwd=CWD, capture_output=True)
    (OUT / (name + '.stdout')).write_bytes(result.stdout)
    (OUT / (name + '.stderr')).write_bytes(result.stderr)
    row = {'source': name, 'command': args, 'exitCode': result.returncode,
           'passed': result.returncode == 0}
    if result.returncode == 0:
        row['objectSha256'] = sha(OUT / (name + '.o'))
        symbols = subprocess.run(['/usr/bin/nm', '-gU', str(OUT / (name + '.o'))],
                                 capture_output=True, check=True).stdout
        assert b'DrainLoadedAreasForAuxMigration' in symbols
        (OUT / (name + '.symbols')).write_bytes(symbols)
        deps = shlex.split((OUT / (name + '.d')).read_text()
                           .replace('\\\n', ' ').split(':', 1)[1])
        row['dependencyInputs'] = [
            {'path': path, 'sha256': sha(path)} for path in
            sorted({str((CWD / path).resolve()) for path in deps})]
    else:
        print(result.stderr.decode('utf-8', errors='replace')[:5000], flush=True)
    results.append(row)
for file in plan['files']:
    assert sha(ROOT / file['path']) == file['inputSha256']
receipt = {'format': 'aux.storage-service-drain.compile.actual.v1',
           'passed': all(row['passed'] for row in results), 'results': results,
           'sourcePlanSha256': sha(HERE / 'service-source-plan.json'),
           'pairedDatabasePlanSha256': sha(HERE / 'source-plan.json'),
           'cwd': str(CWD), 'output': str(OUT), 'nativeRootChanged': False,
           'productExecuted': False, 'fullBrowserBuilt': False,
           'browserImporterIntegrated': False, 'runtimeAcceptance': False}
(HERE / 'actual-service-compile-a1.json').write_text(json.dumps(receipt, indent=2) + '\n')
print(json.dumps({'passed': receipt['passed'], 'output': str(OUT),
                  'objects': [{key: value for key, value in row.items()
                               if key not in ['command', 'dependencyInputs']}
                              for row in results]}), flush=True)
raise SystemExit(0 if receipt['passed'] else 1)
