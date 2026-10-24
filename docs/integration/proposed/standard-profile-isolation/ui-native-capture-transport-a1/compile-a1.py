"""Compile both native peer roles and typecheck the paired real Swift owner."""
import hashlib
import json
import shlex
import subprocess
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
CWD = ROOT / 'out/AuxFast'
OUT = Path('/private/tmp/aux-ui-native-capture-transport-compile-20261024-a1')
OUT.mkdir(mode=0o700)
sha = lambda path: hashlib.sha256(Path(path).read_bytes()).hexdigest()
plan = json.loads((HERE / 'source-plan.json').read_text())
overlay = HERE / 'source'
for row in plan['files']:
    assert sha(row['input']) == row['inputSha256']
    assert sha(row['output']) == row['outputSha256']
for row in plan['swiftSources']:
    assert sha(row['path']) == row['sha256']
names = ['AuxNativePeerTransport', 'AuxOwnedNativePeerChild', 'AuxSelectedStateHome']
targets = ['obj/chrome/browser/aux/platform/' + name + '.o' for name in names]
discovery = subprocess.run([str(ROOT / 'third_party/ninja/ninja'), '-t', 'commands', '-s', *targets],
                           cwd=CWD, check=True, capture_output=True)
(HERE / 'browser-commands-original.txt').write_bytes(discovery.stdout)
lines = discovery.stdout.decode().splitlines()
assert len(lines) == 3
commands = []
for name in names:
    args = shlex.split(next(line for line in lines if '/' + name + '.cc ' in line))
    commands.append({'name': 'browser-' + name, 'cwd': str(CWD), 'original': args})
server_receipt = Path('/private/tmp/aux-browser-roots-objects-20261023/receipt.json')
server = next(row for row in json.loads(server_receipt.read_text())['commands']
              if row['name'] == 'daemon-AuxNativePeerTransport')
commands.append({'name': server['name'], 'cwd': server['cwd'], 'original': server['command']})
dependencies, results = set(), []
for row in commands:
    args = list(row['original'])
    name = row['name'].split('-', 1)[1]
    args[args.index('-c') + 1] = str(overlay / 'chrome/browser/aux' / (name + '.cc'))
    obj, dep = OUT / (row['name'] + '.o'), OUT / (row['name'] + '.d')
    args[args.index('-o') + 1] = str(obj)
    if '-MF' in args:
        args[args.index('-MF') + 1] = str(dep)
    else:
        args.extend(['-MMD', '-MF', str(dep)])
    args[1:1] = ['-I' + str(overlay / 'chrome/browser/aux'), '-I' + str(overlay),
                 '-I' + str(ROOT / 'chrome/browser/aux')]
    run = subprocess.run(args, cwd=row['cwd'], capture_output=True)
    (OUT / (row['name'] + '.stdout')).write_bytes(run.stdout)
    (OUT / (row['name'] + '.stderr')).write_bytes(run.stderr)
    result = {'name': row['name'], 'command': args, 'cwd': row['cwd'],
              'exitCode': run.returncode, 'passed': run.returncode == 0}
    if run.returncode == 0:
        result['objectSha256'] = sha(obj)
        result['depfileSha256'] = sha(dep)
        paths = shlex.split(dep.read_text().replace('\\\n', ' ').split(':', 1)[1])
        dependencies.update(str((Path(row['cwd']) / path).resolve()) for path in paths)
    else:
        print(run.stderr.decode(errors='replace')[:6000], flush=True)
    results.append(result)
    print(json.dumps({key: value for key, value in result.items() if key not in ['command', 'cwd']}), flush=True)
    if run.returncode:
        break
passed = len(results) == 4 and all(row['passed'] for row in results)
receipt = {'format': 'aux.ui-native-capture-transport.compile.actual.v1', 'passed': passed,
           'sourcePlanSha256': sha(HERE / 'source-plan.json'), 'results': results,
           'dependencyInputs': {path: sha(path) for path in sorted(dependencies)},
           'serverPredecessorReceipt': str(server_receipt), 'serverPredecessorReceiptSha256': sha(server_receipt),
           'nativeCheckoutChanged': False, 'linked': False, 'productExecuted': False,
           'migrationActivationAuthorized': False, 'runtimeAcceptance': False}
(HERE / 'actual-compile-a1.json').write_text(json.dumps(receipt, indent=2) + '\n')
if not passed:
    raise SystemExit(1)

prior_command = HERE.parent / 'ui-native-capture-journal-a1/typecheck-command.json'
args = list(json.loads(prior_command.read_text())['command'])
replacement = {row['input']: row['output'] for row in plan['files'] if row['path'].endswith('.swift')}
args = [replacement.get(arg, arg) for arg in args]
args[args.index('-module-cache-path') + 1] = str(OUT / 'swift-module-cache')
assert sum(arg.endswith('.swift') for arg in args) == 48
command = {'command': args, 'compilerSha256': sha(args[0]), 'sourcePlanSha256': sha(HERE / 'source-plan.json'),
           'predecessorCommandSha256': sha(prior_command)}
(HERE / 'typecheck-command.json').write_text(json.dumps(command, indent=2) + '\n')
run = subprocess.run(args, capture_output=True)
(OUT / 'typecheck.stdout').write_bytes(run.stdout)
(OUT / 'typecheck.stderr').write_bytes(run.stderr)
typecheck = {'format': 'aux.ui-native-capture-transport.typecheck.actual.v1',
             'passed': run.returncode == 0, 'exitCode': run.returncode,
             'sourcePlanSha256': sha(HERE / 'source-plan.json'),
             'commandSha256': sha(HERE / 'typecheck-command.json'), 'sourceCount': 48,
             'output': str(OUT), 'linked': False, 'productExecuted': False,
             'nativeApiExecuted': False, 'migrationActivationAuthorized': False, 'runtimeAcceptance': False}
(HERE / 'actual-typecheck-a1.json').write_text(json.dumps(typecheck, indent=2) + '\n')
print(json.dumps(typecheck), flush=True)
if run.returncode:
    print(run.stderr.decode(errors='replace')[:6500], flush=True)
    raise SystemExit(run.returncode)
for row in plan['files']:
    assert sha(row['input']) == row['inputSha256']
    assert sha(row['output']) == row['outputSha256']
for row in plan['swiftSources']:
    assert sha(row['path']) == row['sha256']
