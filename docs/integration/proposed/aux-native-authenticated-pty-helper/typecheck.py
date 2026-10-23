#!/usr/bin/env python3
"""Typecheck the actual pinned graph, replacing only its policy loader."""
import hashlib
import json
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[4]
PROPOSAL = Path(__file__).resolve().parent
PINS = json.loads((PROPOSAL / 'source-pins.json').read_text())
MANIFEST = ROOT / 'docs/integration/proposed/aux-native-daemon-main/inputs.json'
OLD = 'docs/integration/proposed/aux-native-embedded-pty-policy/source/AuxSignedFreshBootstrapPolicyLoader.swift'
NEW = PROPOSAL / 'source/AuxSignedFreshBootstrapPolicyLoader.swift'
EVIDENCE = PROPOSAL / 'evidence'
EVIDENCE.mkdir(exist_ok=True)

def verify():
    for name, expected in PINS['files'].items():
        if hashlib.sha256((ROOT / name).read_bytes()).hexdigest() != expected:
            raise SystemExit('Changed pinned source: ' + name)

verify()
manifest = json.loads(MANIFEST.read_text())
assert len(manifest['swiftSources']) == 46
assert manifest['swiftSources'].count(OLD) == 1
command = ['xcrun', 'swiftc', '-typecheck', '-parse-as-library',
           '-target', 'arm64-apple-macos13.5',
           '-module-cache-path', '/tmp/aux-pty-helper-capability-swift-cache-20261023',
           '-module-name', 'AuxNativeDaemonExecutable']
for define in manifest['swiftDefines']:
    command += ['-D', define]
for framework in ['Foundation', 'CoreFoundation', 'Security', 'AppKit',
                  'QuickLookThumbnailing', 'ImageIO']:
    command += ['-framework', framework]
command += [str(NEW if name == OLD else ROOT / name) for name in manifest['swiftSources']]
result = subprocess.run(command, text=True, capture_output=True)
(EVIDENCE / 'typecheck.log').write_text(result.stdout + result.stderr)
verify()
receipt = {
    'format': 'aux.authenticated-pty-helper.typecheck.v1',
    'command': command, 'sourceCount': 46,
    'sourcePinsVerifiedBeforeAndAfter': True,
    'exitCode': result.returncode, 'passed': result.returncode == 0,
    'frameworkRuntimeInvoked': False, 'executableOrModuleLoaded': False,
    'keychainInvoked': False, 'signed': False, 'mainGraphActivated': False,
    'runtimeAcceptance': False,
}
(EVIDENCE / 'typecheck.json').write_text(json.dumps(receipt, indent=2) + '\n')
print(json.dumps({k: v for k, v in receipt.items() if k != 'command'}))
raise SystemExit(result.returncode)
