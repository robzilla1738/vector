"""Compile the changed native owners once with all four lanes' headers paired."""
import hashlib
import json
import shlex
import subprocess
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
CWD = ROOT / 'out/AuxFast'
OUT = Path('/private/tmp/aux-feature-completion-native-compile-20261024-phase-a24')
OUT.mkdir(mode=0o700)
sha = lambda path: hashlib.sha256(Path(path).read_bytes()).hexdigest()
composition = json.loads((HERE / 'source-composition.json').read_text())
overlay = Path(composition['overlay'])
for name, row in composition['selectedFiles'].items():
    assert sha(row['path']) == row['sha256'] == sha(ROOT / name), name
sources = list(composition['laneFiles'])
assert len(sources) == 3
command_files = [HERE.parent / 'native-recovery-integration-a22/compiler-commands-original.txt']
all_commands = []
for file in command_files:
    all_commands.extend(shlex.split(line) for line in file.read_text().splitlines())
commands, targets = [], {}
for source in sources:
    name = '../../' + source if not source.startswith('gen/') else source
    args = next(args for args in all_commands if args[args.index('-c') + 1] == name)
    commands.append(args)
    targets[source] = args[args.index('-o') + 1]
results, dependencies = [], set()
for source, args in zip(sources, commands):
    assert args[args.index('-c') + 1] == ('../../' + source if not source.startswith('gen/') else source)
    output_name = Path(source).stem
    # Keep the exact real relative source spelling so the owned-path unsafe-buffer checker runs.
    args[args.index('-o') + 1] = str(OUT / (output_name + '.o'))
    args[args.index('-MF') + 1] = str(OUT / (output_name + '.d'))
    # Compile projected real paths once; duplicate pragma-once header copies are not a source API failure.
    run = subprocess.run(args, cwd=CWD, capture_output=True)
    (OUT / (output_name + '.stdout')).write_bytes(run.stdout)
    (OUT / (output_name + '.stderr')).write_bytes(run.stderr)
    result = {'source': source, 'target': targets[source], 'command': args,
              'exitCode': run.returncode, 'passed': run.returncode == 0}
    if run.returncode == 0:
        result['objectSha256'] = sha(OUT / (output_name + '.o'))
        dep = OUT / (output_name + '.d')
        result['depfileSha256'] = sha(dep)
        paths = shlex.split(dep.read_text().replace('\\\n', ' ').split(':', 1)[1])
        dependencies.update(str((CWD / path).resolve()) for path in paths)
    else:
        print(run.stderr.decode(errors='replace')[:7000], flush=True)
    results.append(result)
    print(json.dumps({key: value for key, value in result.items() if key != 'command'}), flush=True)
passed = len(results) == len(sources) and all(row['passed'] for row in results)
receipt = {'format': 'aux.feature-completion.compile.actual.v1', 'passed': passed,
           'sourceCompositionSha256': sha(HERE / 'source-composition.json'),
           'results': results, 'dependencyInputs': {path: sha(path) for path in sorted(dependencies)},
           'output': str(OUT), 'nativeCheckoutChanged': False, 'fullBrowserBuilt': False,
           'productExecuted': False, 'runtimeAcceptance': False}
for name, row in composition['selectedFiles'].items():
    assert sha(row['path']) == row['sha256'] == sha(ROOT / name), name
(HERE / 'actual-compile-a1.json').write_text(json.dumps(receipt, indent=2) + '\n')
if not passed:
    raise SystemExit(1)
