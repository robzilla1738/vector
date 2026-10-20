#!/usr/bin/env python3
"""Source-only verification against the immutable parent's output."""
import hashlib
import json
from pathlib import Path
import subprocess
import tempfile


def sha(data):
    return hashlib.sha256(data).hexdigest()


def main():
    here = Path(__file__).resolve().parent
    evidence = json.loads((here / 'source-evidence.json').read_text())
    parent = here.parent / evidence['parentDirectory']
    manifest = json.loads((here / 'manifest.json').read_text())
    assembly = (parent / 'frame-state.asm').read_bytes()
    assert sha(assembly) == evidence['parentFrameAssemblySha256']
    text = assembly.decode()
    assert '4381324:' in text and 'cbz\tx0, 0x4381398' in text
    assert '4381398:' in text and 'brk\t#0' in text
    sdk = evidence['appKitStyleHeader']
    sdk_bytes = Path(sdk['path']).read_bytes()
    assert sha(sdk_bytes) == sdk['sha256']
    assert b'- (nullable NSButton *)standardWindowButton:(NSWindowButton)b;' in sdk_bytes
    with tempfile.TemporaryDirectory(prefix='aux-popup-buttons-') as directory:
        temporary = Path(directory)
        for item in manifest['files']:
            baseline = (parent / 'source' / item['path']).read_bytes()
            assert sha(baseline) == item['baselineSha256']
            target = temporary / item['path']
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(baseline)
        subprocess.run(['git', 'apply', str(here / 'native.patch')], cwd=temporary, check=True)
        for item in manifest['files']:
            output = (temporary / item['path']).read_bytes()
            assert sha(output) == item['outputSha256']
            assert output == (here / 'source' / item['path']).read_bytes()
            text = output.decode()
            start = text.index('- (void)maybeShowTrafficLights {')
            end = text.index('\n- (void)updateTrafficLightButtons', start)
            body = text[start:end]
            prefix = ('  if (_hasExplicitPopupTrafficLightState) {\n'
                      '    [self updateTrafficLightButtons];\n'
                      '    return;\n'
                      '  }\n')
            assert body.count(prefix) == 1
            assert sha(body.replace(prefix, '', 1).encode()) == evidence['stockMethodSha256']
    print('PASS: original assert/nullable SDK/non-popup body and parent-output patch replay')


if __name__ == '__main__':
    main()
