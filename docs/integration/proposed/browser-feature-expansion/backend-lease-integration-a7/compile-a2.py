"""Compile the changed native owners once with all four lanes' headers paired."""
import hashlib
import json
import shlex
import subprocess
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
CWD = ROOT / 'out/AuxFast'
OUT = Path('/private/tmp/aux-feature-completion-native-compile-20261024-backend-lease-a7b')
OUT.mkdir(mode=0o700)
sha = lambda path: hashlib.sha256(Path(path).read_bytes()).hexdigest()
composition = json.loads((HERE / 'source-composition-a2.json').read_text())
overlay = Path(composition['overlay'])
for name, row in composition['selectedFiles'].items():
    assert sha(row['path']) == row['sha256'] == sha(ROOT / name), name
sources = [name for name in composition['laneFiles'] if name.endswith(('.cc', '.mm'))]
assert len(sources) == 4
targets = {}
for ninja in (CWD / 'obj').rglob('*.ninja'):
    with ninja.open(encoding="utf-8", errors="replace") as stream:
        for line in stream:
            if ': cxx ' not in line and ': objcxx ' not in line:
                continue
            before = line.split('|', 1)[0].split()
            if len(before) != 4 or not before[0] == 'build':
                continue
            source = before[-1].removeprefix('../../')
            if source in sources:
                assert source not in targets, source
                targets[source] = before[1].removesuffix(':')
assert len(targets) == len(sources), (len(targets), set(sources) - targets.keys())
discovery = subprocess.run([str(ROOT / 'third_party/ninja/ninja'), '-t', 'commands', '-s',
                            *(targets[source] for source in sources)], cwd=CWD, capture_output=True, check=True)
(HERE / 'compiler-commands-original.txt').write_bytes(discovery.stdout)
commands = [shlex.split(line) for line in discovery.stdout.decode().splitlines()]
assert len(commands) == len(sources)
results, dependencies = [], set()
for source, args in zip(sources, commands):
    assert args[args.index('-c') + 1] == '../../' + source
    output_name = Path(source).stem
    args[args.index('-c') + 1] = str(ROOT / source)
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
    if run.returncode:
        break
passed = len(results) == len(sources) and all(row['passed'] for row in results)
receipt = {'format': 'aux.feature-completion.compile.actual.v1', 'passed': passed,
           'sourceCompositionSha256': sha(HERE / 'source-composition-a2.json'),
           'results': results, 'dependencyInputs': {path: sha(path) for path in sorted(dependencies)},
           'output': str(OUT), 'nativeCheckoutChanged': False, 'fullBrowserBuilt': False,
           'productExecuted': False, 'runtimeAcceptance': False}
for name, row in composition['selectedFiles'].items():
    assert sha(row['path']) == row['sha256'] == sha(ROOT / name), name
(HERE / 'actual-compile-a2.json').write_text(json.dumps(receipt, indent=2) + '\n')
if not passed:
    raise SystemExit(1)
