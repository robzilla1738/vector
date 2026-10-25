"""Re-link the same complete daemon with one loader change, without signing."""
import hashlib
import json
from pathlib import Path
import subprocess

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[4]
OUT = Path('/private/tmp/aux-browser-only-daemon-build-20261024-a44')
sha = lambda path: hashlib.sha256(Path(path).read_bytes()).hexdigest()
prior = json.loads((HERE / 'actual-daemon-build-a4.json').read_text())
change = json.loads((HERE / 'actual-identity-reuse-projection-a4.json').read_text())
assert prior['passed'] and change['passed']
assert sha(change['input']) == change['inputSha256'] and sha(change['output']) == change['outputSha256']
OUT.mkdir(mode=0o700)
command = list(prior['results'][-1]['command'])
assert command.count(change['input']) == 1
command[command.index(change['input'])] = change['output']
command[command.index('-o') + 1] = str(OUT / 'Aux Daemon')
assert '-no_adhoc_codesign' in ' '.join(command) and 'AUX_BROWSER_ONLY_NATIVE_STARTUP' in command
frozen = {arg: sha(arg) for arg in command if Path(arg).is_file()}
result = subprocess.run(command,cwd=ROOT,capture_output=True)
(OUT / 'stdout.log').write_bytes(result.stdout)
(OUT / 'stderr.log').write_bytes(result.stderr)
receipt = dict(format='aux.ordinary-fresh.identity-reuse.daemon-build.v1',passed=result.returncode==0,
    command=command,exitCode=result.returncode,inputFiles=frozen,priorBuildSha256=sha(HERE / 'actual-daemon-build-a4.json'),
    sourceChangeSha256=sha(HERE / 'actual-identity-reuse-projection-a4.json'),
    cppObjectsReused=14,swiftSourceCount=sum(arg.endswith('.swift') for arg in command),
    productSigned=False,productExecuted=False,runtimeAcceptance=False,supervisedTasksEnabled=False)
if result.returncode==0:
    binary=OUT / 'Aux Daemon'
    inspection=subprocess.run(['/usr/bin/otool','-l',str(binary)],capture_output=True,check=True).stdout
    assert b'LC_CODE_SIGNATURE' not in inspection
    receipt.update(binary=str(binary),binarySha256=sha(binary),codeSignatureLoadCommandPresent=False)
for path,digest in frozen.items():assert sha(path)==digest,path
with (HERE / 'actual-daemon-identity-reuse-build-a4.json').open('x') as f:json.dump(receipt,f,indent=2);f.write('\n')
print(json.dumps(dict(passed=receipt['passed'],exitCode=result.returncode,swiftSources=receipt['swiftSourceCount'])))
if result.returncode:
    print(result.stderr.decode(errors='replace')[-6500:])
    raise SystemExit(result.returncode)
