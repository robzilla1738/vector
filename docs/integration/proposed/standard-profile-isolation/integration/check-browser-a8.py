#!/usr/bin/env python3
"""Compile the changed native boundaries after exact source and command checks."""
from pathlib import Path
import hashlib
import json
import re
import subprocess
import time
HERE = Path(__file__).resolve().parent
TREE = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
OUT = TREE.parent / 'unsigned-standard-profile-browser-focused-20261024-a8'
PIN = HERE / 'full-native-input-pins-a7.json'

def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()

pins = json.loads(PIN.read_text())
previous = TREE.parent / 'unsigned-standard-profile-browser-focused-20261024-a7/receipt.json'
targets = json.loads(previous.read_text())['targets'] + [
 'obj/content/browser/browser/aux_child_process_drain.o',
 'obj/third_party/crashpad/crashpad/client/client/crashpad_client_mac.o',
 'obj/third_party/crashpad/crashpad/util/util/spawn_subprocess.o',
 'obj/chrome/chrome_app_executable/chrome_exe_main_mac.o',
 'obj/chrome/chrome_helper_app_default_executable/chrome_exe_main_mac.o',
 'obj/chrome/browser/ui/ui/aux_browser_shutdown_drain.o',
 'obj/base/aux_browser_descendant_engine/aux_browser_descendant_bridge.o',
 'obj/base/aux_browser_descendant_engine/aux_browser_descendant_engine.o',
 'obj/chrome/browser/extensions/api/messaging/messaging/native_message_process_host.o',
 'obj/chrome/browser/extensions/api/messaging/messaging/launch_context_posix.o',
 'obj/chrome/browser/aux/platform/AuxOwnedNativePeerChild.o',
 'obj/chrome/browser/aux/platform/AuxSelectedStateHome.o',
 'obj/components/crash/core/app/app/crashpad.o',
]
result = {'format': 'aux.standard-browser-focused.actual.v3', 'passed': False,
 'source': str(TREE), 'targets': targets, 'runs': [],
 'nativeInputPinsPath': str(PIN), 'nativeInputPinsSha256': sha(PIN),
 'appExecuted': False, 'productSigned': False, 'fullBrowserBuilt': False}

def verify():
    assert sha(PIN) == result['nativeInputPinsSha256']
    for name, expected in pins['files'].items():
        assert sha(TREE / name) == expected, name

def run(name, command):
    start = time.monotonic()
    with (OUT / (name + '.log')).open('xb') as log:
        completed = subprocess.run(command, cwd=TREE, stdout=log, stderr=subprocess.STDOUT)
    result['runs'].append({'name': name, 'command': command, 'exitCode': completed.returncode,
                          'seconds': time.monotonic() - start})
    assert completed.returncode == 0, name + ' failed'

assert not OUT.exists()
verify()
OUT.mkdir()
try:
    ninja, build = str(TREE / 'third_party/ninja/ninja'), str(TREE / 'out/AuxFast')
    run('commands', [ninja, '-C', build, '-t', 'commands', *targets])
    raw = (OUT / 'commands.log').read_bytes()
    assert not re.search(rb'(^|[ /])(?:codesign|productsign|notarytool)(?:\s|$)', raw, re.M)
    links = [line for line in raw.splitlines() if b'linker_driver.py' in line]
    assert all(b'-no_adhoc_codesign' in line for line in links)
    result['commandInventorySha256'] = sha(OUT / 'commands.log')
    run('compile', [ninja, '-C', build, '-j8', *targets])
    verify()
    result.update(passed=True, objects={name: sha(TREE / 'out/AuxFast' / name) for name in targets})
except Exception as error:
    result['error'] = str(error)
finally:
    with (OUT / 'receipt.json').open('x') as stream:
        stream.write(json.dumps(result, indent=2) + '\n')
print(json.dumps({key: result.get(key) for key in ['passed', 'error', 'fullBrowserBuilt']}))
raise SystemExit(0 if result['passed'] else 1)
