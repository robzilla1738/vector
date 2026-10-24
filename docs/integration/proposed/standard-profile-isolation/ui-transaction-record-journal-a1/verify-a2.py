"""Verify the completed link using the established private-symbol contract."""
import hashlib
import json
from pathlib import Path
import subprocess

HERE = Path(__file__).resolve().parent
sha = lambda p: hashlib.sha256(Path(p).read_bytes()).hexdigest()
input_path = HERE / 'daemon-link-inputs-a2.json'
inputs = json.loads(input_path.read_text())
command = inputs['command']
binary = Path(command[command.index('-o') + 1])
assert binary.parent.name == 'aux-ui-transaction-record-daemon-link-20261024-a2'
assert inputs['sourcePlanSha256'] == sha(HERE / 'source-plan-a2.json')
for name, expected in inputs['frozenFiles'].items(): assert sha(name) == expected, name
required = b'_AuxBeginPreparedUiCapture'
symbols = subprocess.run(['/usr/bin/nm', '-a', str(binary)], check=True, capture_output=True).stdout
definitions = [l.split() for l in symbols.splitlines() if l.split()[-1:] == [required]]
assert len(definitions) == 1 and definitions[0][-2] == b't'
exports = subprocess.run(['/usr/bin/nm', '-gU', str(binary)], check=True, capture_output=True).stdout
undefined = subprocess.run(['/usr/bin/nm', '-u', str(binary)], check=True, capture_output=True).stdout
assert required not in exports and required not in undefined
prior = json.loads((HERE.parent / 'ui-native-capture-transport-a1/daemon-link-inputs.json').read_text())
peer = Path(prior['replacementNativeObject'])
assert str(peer) in command and sha(peer) == inputs['frozenFiles'][str(peer)]
peer_undefined = subprocess.run(['/usr/bin/nm', '-u', str(peer)], check=True, capture_output=True).stdout
assert len([l for l in peer_undefined.splitlines() if l.split()[-1:] == [required]]) == 1
load = subprocess.run(['/usr/bin/otool', '-l', str(binary)], check=True, capture_output=True).stdout
assert b'LC_CODE_SIGNATURE' not in load
for name, data in [('symbols', symbols), ('exports', exports), ('undefined', undefined),
                   ('receiver-undefined', peer_undefined), ('load-commands', load)]:
    (binary.parent / name).write_bytes(data)
receipt = {'format': 'aux.ui-transaction-record-journal.daemon-link.actual.v1',
    'passed': True, 'postLinkVerificationPassed': True,
    'compilerCompletedBeforeVerifierFailure': True, 'compilationRepeated': False,
    'originalFailure': 'The copied success-only verifier incorrectly required an intentionally private C entry in global exports; actual local definition resolves the original receiver. No export or link flag changed.',
    'originalVerifierSha256': sha(HERE / 'compile-a2.py'), 'verifierSha256': sha(Path(__file__)),
    'inputManifestSha256': sha(input_path), 'output': str(binary.parent),
    'binarySha256': sha(binary), 'nativeObjectCount': 14, 'swiftSourceCount': 48,
    'captureEntryDefinitionCount': 1, 'captureEntryUndefined': False,
    'captureEntryGloballyExported': False, 'receiverObjectReferencePresent': True,
    'codeSignatureLoadCommandPresent': False, 'productSigned': False,
    'productExecuted': False, 'nativeApiExecuted': False, 'packageIntegrated': False,
    'migrationActivationAuthorized': False, 'runtimeAcceptance': False}
(HERE / 'actual-daemon-link-a2.json').write_text(json.dumps(receipt, indent=2) + '\n')
print(json.dumps(receipt), flush=True)
