"""Recheck changed Swift only, associating the unchanged four compiled objects."""
import hashlib
import json
import subprocess
from pathlib import Path

HERE = Path(__file__).resolve().parent
OUT = Path('/private/tmp/aux-ui-native-capture-transport-typecheck-20261024-a2')
OUT.mkdir(mode=0o700)
sha = lambda path: hashlib.sha256(Path(path).read_bytes()).hexdigest()
plan = json.loads((HERE / 'source-plan.json').read_text())
old = json.loads((HERE / 'source-plan-a1.json').read_text())
compiled = json.loads((HERE / 'actual-compile-a1.json').read_text())
assert compiled['passed'] and compiled['sourcePlanSha256'] == sha(HERE / 'source-plan-a1.json')
old_files = {row['path']: row for row in old['files']}
for row in plan['files']:
    assert sha(row['input']) == row['inputSha256']
    assert sha(row['output']) == row['outputSha256']
    if not row['path'].endswith('.swift'):
        assert row == old_files[row['path']]
prior = HERE.parent / 'ui-native-capture-journal-a1/typecheck-command.json'
args = list(json.loads(prior.read_text())['command'])
replacement = {row['input']: row['output'] for row in plan['files'] if row['path'].endswith('.swift')}
args = [replacement.get(arg, arg) for arg in args]
args[args.index('-module-cache-path') + 1] = str(OUT / 'module-cache')
assert sum(arg.endswith('.swift') for arg in args) == 48
command = {'command': args, 'compilerSha256': sha(args[0]),
           'sourcePlanSha256': sha(HERE / 'source-plan.json'), 'predecessorCommandSha256': sha(prior)}
(HERE / 'typecheck-command-a2.json').write_text(json.dumps(command, indent=2) + '\n')
run = subprocess.run(args, capture_output=True)
(OUT / 'stdout.txt').write_bytes(run.stdout)
(OUT / 'stderr.txt').write_bytes(run.stderr)
receipt = {'format': 'aux.ui-native-capture-transport.typecheck.actual.v1',
           'passed': run.returncode == 0, 'exitCode': run.returncode,
           'sourcePlanSha256': sha(HERE / 'source-plan.json'),
           'commandSha256': sha(HERE / 'typecheck-command-a2.json'), 'sourceCount': 48,
           'cppCompileReceiptSha256': sha(HERE / 'actual-compile-a1.json'),
           'cppCompiledInputsUnchanged': True, 'cppRecompiled': False,
           'output': str(OUT), 'linked': False, 'productExecuted': False,
           'nativeApiExecuted': False, 'migrationActivationAuthorized': False, 'runtimeAcceptance': False}
(HERE / 'actual-typecheck-a2.json').write_text(json.dumps(receipt, indent=2) + '\n')
print(json.dumps(receipt), flush=True)
if run.returncode:
    errors = run.stderr.decode(errors='replace').splitlines()
    print('\n'.join(line for line in errors if 'error:' in line), flush=True)
    raise SystemExit(run.returncode)
for row in plan['files']:
    assert sha(row['input']) == row['inputSha256']
    assert sha(row['output']) == row['outputSha256']
