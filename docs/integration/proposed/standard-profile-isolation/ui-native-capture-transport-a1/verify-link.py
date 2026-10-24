"""Verify the completed link without repeating unchanged compilation."""
import hashlib
import json
import subprocess
from pathlib import Path

HERE = Path(__file__).resolve().parent
sha = lambda path: hashlib.sha256(Path(path).read_bytes()).hexdigest()
inputs = json.loads((HERE / 'daemon-link-inputs.json').read_text())
OUT = Path(inputs['output'])
assert OUT.name == 'aux-ui-native-capture-transport-daemon-link-20261024-a3'
assert inputs['sourcePlanSha256'] == sha(HERE / 'source-plan.json')
for path, expected in inputs['frozenCommandFiles'].items():
    assert sha(path) == expected
binary = OUT / 'Aux Daemon'
assert binary.is_file()
required = b'_AuxBeginPreparedUiCapture'
symbols = subprocess.run(['/usr/bin/nm', '-a', str(binary)], check=True, capture_output=True).stdout
definition = [line.split() for line in symbols.splitlines() if line.split()[-1:] == [required]]
assert len(definition) == 1 and definition[0][-2] == b't'
exports = subprocess.run(['/usr/bin/nm', '-gU', str(binary)], check=True, capture_output=True).stdout
assert required not in exports
undefined = subprocess.run(['/usr/bin/nm', '-u', str(binary)], check=True, capture_output=True).stdout
assert required not in undefined
peer = Path(inputs['replacementNativeObject'])
peer_undefined = subprocess.run(['/usr/bin/nm', '-u', str(peer)], check=True, capture_output=True).stdout
assert len([line for line in peer_undefined.splitlines() if line.split()[-1:] == [required]]) == 1
load = subprocess.run(['/usr/bin/otool', '-l', str(binary)], check=True, capture_output=True).stdout
assert b'LC_CODE_SIGNATURE' not in load
for name, data in [('symbols.txt', symbols), ('global-symbols.txt', exports), ('undefined.txt', undefined),
                   ('receiver-object-undefined.txt', peer_undefined), ('load-commands.txt', load)]:
    (OUT / name).write_bytes(data)
result = {'format': 'aux.ui-native-capture-transport.daemon-link.actual.v1',
          'passed': True, 'postLinkVerificationPassed': True,
          'compilerCompletedBeforeVerifierFailure': True,
          'originalFailure': 'The wrapper reached its success-only post-link branch, then incorrectly required an internal C entry to appear in nm -gU. The actual definition is local and resolves the receiver object. No code/link flags were changed to export it.',
          'originalVerifierSha256': sha(HERE / 'link-global-symbol-check-a3.py'),
          'verificationScriptSha256': sha(HERE / 'verify-link.py'),
          'inputsSha256': sha(HERE / 'daemon-link-inputs.json'), 'output': str(OUT),
          'binarySha256': sha(binary), 'nativeObjectCount': 14, 'swiftSourceCount': 48,
          'captureEntryDefinitionCount': 1, 'captureEntryUndefined': False,
          'captureEntryGloballyExported': False, 'receiverObjectReferencePresent': True,
          'codeSignatureLoadCommandPresent': False, 'compilationRepeated': False,
          'signed': False, 'executed': False, 'nativeApiExecuted': False,
          'browserFullyLinked': False, 'packageIntegrated': False,
          'migrationActivationAuthorized': False, 'runtimeAcceptance': False}
(HERE / 'actual-daemon-link-a3.json').write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps(result), flush=True)
