"""Typecheck the private journal with the exact 48-source production context."""
import hashlib
import json
import subprocess
from pathlib import Path

HERE = Path(__file__).resolve().parent
OUT = Path('/private/tmp/aux-ui-native-capture-journal-typecheck-20261024-a2')
OUT.mkdir(mode=0o700)
sha = lambda path: hashlib.sha256(Path(path).read_bytes()).hexdigest()
inputs = json.loads((HERE / 'inputs.json').read_text())
plan = json.loads((HERE / 'source-plan.json').read_text())
for row in inputs['sourceFiles']:
    assert sha(row['path']) == row['sha256']
projected = {row['path']: row['output'] for row in plan['files']}
for row in plan['files']:
    assert sha(row['output']) == row['outputSha256']
original = inputs['originalCommand']
args = [original[0], '-typecheck']
take_value = {'-sdk', '-target', '-module-name', '-D', '-I', '-F', '-Xcc',
              '-swift-version', '-import-objc-header'}
index = 1
while index < len(original):
    value = original[index]
    if value in take_value:
        args.extend(original[index:index + 2]);index += 2;continue
    if value == '-parse-as-library':
        args.append(value)
    index += 1
args.extend(['-module-cache-path', str(OUT / 'module-cache')])
args.extend(projected.get(row['path'], row['path'])
            for row in inputs['sourceFiles'])
(HERE / 'typecheck-command.json').write_text(json.dumps({
    'command': args, 'compilerSha256': sha(args[0]),
    'predecessorManifestSha256': inputs['predecessorManifestSha256'],
    'sourcePlanSha256': sha(HERE / 'source-plan.json')}, indent=2) + '\n')
result = subprocess.run(args, capture_output=True)
(OUT / 'stdout.txt').write_bytes(result.stdout)
(OUT / 'stderr.txt').write_bytes(result.stderr)
for row in inputs['sourceFiles']:
    assert sha(row['path']) == row['sha256']
receipt = {'format': 'aux.ui-native-capture-journal.typecheck.actual.v1',
           'passed': result.returncode == 0, 'exitCode': result.returncode,
           'sourceFiles': len(inputs['sourceFiles']), 'changedSources': len(projected),
           'sourcePlanSha256': sha(HERE / 'source-plan.json'),
           'commandSha256': sha(HERE / 'typecheck-command.json'), 'output': str(OUT),
           'originalNativeSourcesChanged': False, 'nativeApiExecuted': False,
           'filesystemFixtureExecuted': False, 'linked': False,
           'productSigned': False, 'productExecuted': False,
           'migrationActivationAuthorized': False, 'runtimeAcceptance': False}
(HERE / 'actual-typecheck-a2.json').write_text(json.dumps(receipt, indent=2) + '\n')
print(json.dumps(receipt), flush=True)
if result.returncode:
    print(result.stderr.decode('utf-8', errors='replace')[:7000])
    raise SystemExit(result.returncode)
