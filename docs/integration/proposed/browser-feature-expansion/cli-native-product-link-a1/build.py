"""Build the final native CLI product in its real graph, without executing it."""
import hashlib
import json
from pathlib import Path
import subprocess

HERE = Path(__file__).resolve().parent
ROOT = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
OUT = ROOT.parent / 'native-cli-product-link-20261024-a1'
OUT.mkdir(mode=0o700)
sha = lambda p: hashlib.sha256(Path(p).read_bytes()).hexdigest()
composition_path = HERE.parent / 'document-cli-integration-a13/source-composition.json'
composition = json.loads(composition_path.read_text())
for name, row in composition['selectedFiles'].items():
    assert sha(ROOT / name) == row['sha256'] == sha(row['path']), name
assert json.loads((HERE.parent / 'document-cli-integration-a13/actual-compile-a1.json').read_text())['passed']
command = [str(ROOT / 'third_party/ninja/ninja'), '-C', str(ROOT / 'out/AuxFast'), '-j4', 'native_cli_open']
run = subprocess.run(command, cwd=ROOT, capture_output=True)
(OUT / 'stdout').write_bytes(run.stdout)
(OUT / 'stderr').write_bytes(run.stderr)
result = {'format': 'aux.native-cli.product-link.actual.v1', 'passed': not run.returncode,
          'exitCode': run.returncode, 'command': command,
          'sourceCompositionSha256': sha(composition_path),
          'productSigned': False, 'productExecuted': False, 'nativeApiExecuted': False,
          'profileAuthorityGranted': False, 'runtimeAcceptance': False}
if not run.returncode:
    binary = ROOT / 'out/AuxFast/native_cli_open'
    assert binary.is_file()
    load = subprocess.run(['/usr/bin/otool', '-l', str(binary)], check=True, capture_output=True).stdout
    undefined = subprocess.run(['/usr/bin/nm', '-u', str(binary)], check=True, capture_output=True).stdout
    assert b'LC_CODE_SIGNATURE' not in load
    assert b'node' not in undefined and b'v8::' not in undefined
    (OUT / 'load-commands').write_bytes(load)
    (OUT / 'undefined').write_bytes(undefined)
    result.update(binary=str(binary), binarySha256=sha(binary), codeSignatureLoadCommandPresent=False)
for name, row in composition['selectedFiles'].items():
    assert sha(ROOT / name) == row['sha256'] == sha(row['path']), name
(HERE / 'actual-link-a1.json').write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps(result), flush=True)
if run.returncode:
    print((run.stdout + run.stderr).decode(errors='replace')[-7000:], flush=True)
    raise SystemExit(run.returncode)
