#!/usr/bin/env python3
"""Observe primary-only bridge exports in the actual unsigned linked bundle."""
from pathlib import Path
import hashlib
import json
import subprocess

HERE = Path(__file__).resolve().parent
BUILD = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/unsigned-standard-profile-browser-build-20261024-a8')
OUTPUT = HERE / 'browser-native-bridge-a8-a2.json'
BASELINE = HERE.parents[4] / 'out/provided-candidate-standard-profile-isolation-20261024/Aux.app'
SYMBOL = '_AuxGetBrowserDescendantBridgeV1'

def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()

assert not OUTPUT.exists()
receipt = json.loads((BUILD / 'receipt.json').read_text())
assert receipt['passed'] is True and receipt['allInspectedMachoUnsigned'] is True
assert receipt['appExecuted'] is False and receipt['signed'] is False
assert receipt['nativeInputPinsSha256'] == sha(HERE / 'full-native-input-pins-a8.json')
app = Path(receipt['appPath'])
inventory = json.loads((BUILD / 'app-inventory.json').read_text())
assert sha(BUILD / 'app-inventory.json') == receipt['appInventoryFileSha256']
rows = {row['path']: row for row in inventory if row['type'] == 'file'}
machos = sorted({row['path'] for row in json.loads((BUILD / 'macho-inventory.json').read_text())})
primary = 'Contents/MacOS/Aux'
assert primary in machos
record = {'format': 'aux.standard-browser-primary-bridge.actual.v1', 'passed': False,
    'inspectionToolSha256': sha(__file__),
    'nativeReceipt': str(BUILD / 'receipt.json'), 'nativeReceiptSha256': sha(BUILD / 'receipt.json'),
    'sourceCompositionSha256': sha(HERE / 'browser-composition-a8.json'),
    'expectedExport': SYMBOL, 'observations': [], 'appExecuted': False,
    'productSigned': False, 'runtimeAuthorityGranted': False, 'uiAccepted': False}
try:
    for name in machos:
        binary = app / name
        assert sha(binary) == rows[name]['sha256'], name
        command = ['/usr/bin/nm', '-gU', str(binary)]
        exported = subprocess.run(command, capture_output=True, text=True)
        assert exported.returncode == 0, (name, exported.stderr)
        symbols = [line.split()[-1] for line in exported.stdout.splitlines() if line.split()]
        count = symbols.count(SYMBOL)
        assert count == (1 if name == primary else 0), (name, count)
        # A global definition is insufficient for RTLD_MAIN_ONLY/dlsym. Read
        # the actual dynamic export trie as well; never execute the product.
        exports_command = ['/usr/bin/dyld_info', '-exports', str(binary)]
        exports = subprocess.run(exports_command, capture_output=True, text=True)
        assert exports.returncode == 0, (name, exports.stderr)
        dynamic_count = exports.stdout.split().count(SYMBOL)
        assert dynamic_count == (1 if name == primary else 0), (name, dynamic_count)
        libraries_command = ['/usr/bin/otool', '-L', str(binary)]
        libraries = subprocess.run(libraries_command, capture_output=True, text=True)
        assert libraries.returncode == 0, name
        added = [value for value in ['/usr/lib/libEndpointSecurity.dylib', '/usr/lib/libbsm.0.dylib']
                 if value in libraries.stdout]
        baseline_binary = BASELINE / name
        assert baseline_binary.is_file() and not baseline_binary.is_symlink(), name
        baseline_sha = sha(baseline_binary)
        baseline_command = ['/usr/bin/otool', '-L', str(baseline_binary)]
        baseline_libraries = subprocess.run(baseline_command, capture_output=True, text=True)
        assert baseline_libraries.returncode == 0, name
        prior = [value for value in ['/usr/lib/libEndpointSecurity.dylib', '/usr/lib/libbsm.0.dylib']
                 if value in baseline_libraries.stdout]
        assert '/usr/lib/libEndpointSecurity.dylib' not in prior, name
        expected = ['/usr/lib/libEndpointSecurity.dylib', '/usr/lib/libbsm.0.dylib'] if name == primary else prior
        assert added == expected, (name, added, expected)
        assert sha(baseline_binary) == baseline_sha, name
        assert sha(binary) == rows[name]['sha256'], name
        record['observations'].append({'path': name, 'sha256': rows[name]['sha256'],
            'nmCommand': command, 'nmExitCode': exported.returncode, 'bridgeDefinitionCount': count,
            'exportsCommand': exports_command, 'exportsExitCode': exports.returncode,
            'dynamicBridgeExportCount': dynamic_count,
            'libraryCommand': libraries_command, 'libraryExitCode': libraries.returncode,
            'custodySystemLibraries': added, 'baselinePath': str(baseline_binary),
            'baselineSha256': baseline_sha, 'baselineLibraryCommand': baseline_command,
            'baselineLibraryExitCode': baseline_libraries.returncode, 'priorSystemLibraries': prior})
    record['passed'] = True
except Exception as error:
    record['error'] = str(error)
finally:
    with OUTPUT.open('x') as stream:
        stream.write(json.dumps(record, indent=2) + '\n')
print(json.dumps({'passed': record['passed'], 'error': record.get('error')}))
raise SystemExit(0 if record['passed'] else 1)
