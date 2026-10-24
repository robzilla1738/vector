"""Compile the exact six real SDK owners and, only if coherent, link unsigned."""
import hashlib
import json
from pathlib import Path
import subprocess

HERE = Path(__file__).resolve().parent
sha = lambda p: hashlib.sha256(Path(p).read_bytes()).hexdigest()
plan_path = HERE / 'sdk-compile-plan.json'
plan = json.loads(plan_path.read_text())
OUT = Path(plan['outputDirectory'])
OUT.mkdir(mode=0o700)
assert sha(plan['compiler']) == plan['compilerSha256']
for row in plan['inputs']:
    assert sha(row['path']) == row['sha256'], row['path']
results = []
for row in plan['commands']:
    assert sha(row['source']) == row['sourceSha256']
    run = subprocess.run(row['argv'], capture_output=True)
    (OUT / (row['name'] + '.stdout')).write_bytes(run.stdout)
    (OUT / (row['name'] + '.stderr')).write_bytes(run.stderr)
    result = {'name': row['name'], 'exitCode': run.returncode,
              'passed': not run.returncode, 'command': row['argv']}
    if not run.returncode:
        result['objectSha256'] = sha(row['output'])
    else:
        print(run.stderr.decode(errors='replace')[:5000], flush=True)
    results.append(result)
    print(json.dumps({k:v for k,v in result.items() if k != 'command'}), flush=True)
passed = len(results) == 6 and all(r['passed'] for r in results)
link = None
if passed:
    command = plan['optionalUnsignedNativeOnlyLinkArgv']
    assert '-Wl,-no_adhoc_codesign' in command
    run = subprocess.run(command, capture_output=True)
    (OUT / 'link.stdout').write_bytes(run.stdout)
    (OUT / 'link.stderr').write_bytes(run.stderr)
    link = {'command': command, 'exitCode': run.returncode, 'passed': not run.returncode}
    passed = not run.returncode
    if passed:
        binary = Path(command[command.index('-o') + 1])
        load = subprocess.run(['/usr/bin/otool', '-l', str(binary)], check=True, capture_output=True).stdout
        assert b'LC_CODE_SIGNATURE' not in load
        link.update(binarySha256=sha(binary), codeSignatureLoadCommandPresent=False)
    else:
        print(run.stderr.decode(errors='replace')[:5000], flush=True)
for row in plan['inputs']:
    assert sha(row['path']) == row['sha256'], row['path']
receipt = {'format': 'aux.cli-native-open.sdk-compile.actual.v1', 'passed': passed,
           'planSha256': sha(plan_path), 'results': results, 'link': link,
           'signed': False, 'productExecuted': False, 'nativeApiExecuted': False,
           'profileAuthorityGranted': False, 'runtimeAcceptance': False}
(HERE / 'actual-sdk-compile-a1.json').write_text(json.dumps(receipt, indent=2) + '\n')
raise SystemExit(0 if passed else 1)
