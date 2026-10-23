#!/usr/bin/env python3
"""Link the checked PTY object unsigned; never load it. Use native-build.py."""
import hashlib
import json
import pathlib
import subprocess

root = pathlib.Path(__file__).resolve().parents[5]
source = root / 'docs/integration/proposed/profile-isolation-next/spawn-custody/evidence/compile-final.json'
proof = json.loads(source.read_text())
assert proof['passed'] and proof['inputsUnchanged'] and proof['previousInputsStillMatch']
command = proof['commands'][0]['command']
obj = pathlib.Path(command[command.index('-o') + 1])
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
expected = proof['objects'][obj.name]
assert sha(obj) == expected
out = pathlib.Path('/private/tmp/aux-contained-pty-module-20261023-r2')
out.mkdir(mode=0o700, exist_ok=False)
module = out / 'pty.node'
sdk = command[command.index('-isysroot') + 1]
link = [command[0], '-isysroot', sdk, '-bundle', '-undefined', 'dynamic_lookup',
        '-Wl,-no_adhoc_codesign', '-mmacosx-version-min=13.5', str(obj), '-o', str(module)]
run = subprocess.run(link, capture_output=True, text=True)
(out / 'link.log').write_text(run.stdout + run.stderr)
receipt = {'format': 'aux.contained-pty.link.v1', 'passed': False,
           'compileReceiptSha256': sha(source), 'objectSha256': expected,
           'command': link, 'exitCode': run.returncode, 'loaded': False, 'signed': False}
try:
    if run.returncode: raise RuntimeError('PTY link failed')
    loads = subprocess.check_output(['/usr/bin/otool', '-l', str(module)], text=True)
    imports = subprocess.check_output(['/usr/bin/nm', '-u', str(module)], text=True)
    exports = subprocess.check_output(['/usr/bin/nm', '-gU', str(module)], text=True)
    assert 'LC_CODE_SIGNATURE' not in loads and '_napi_register_module_v1' in exports
    native = sorted(line.split()[-1] for line in imports.splitlines() if '_AuxNative' in line)
    assert '_AuxNativeExecBeginCurrent' in native and '_AuxNativePtyBeginCurrent' in native
    assert sha(obj) == expected
    receipt.update(passed=True, module=str(module), moduleSha256=sha(module),
                   moduleBytes=module.stat().st_size, nativeImports=native,
                   codeSignatureAbsent=True, hostImportsResolved=False)
    (out / 'imports.txt').write_text(imports)
    (out / 'exports.txt').write_text(exports)
finally:
    (out / 'receipt.json').write_text(json.dumps(receipt, indent=2) + '\n')
print(json.dumps({'passed': receipt['passed'], 'receipt': str(out / 'receipt.json')}))
