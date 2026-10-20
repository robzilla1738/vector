#!/usr/bin/env python3
import hashlib
import json
from pathlib import Path
import struct
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parent
sha = lambda data: hashlib.sha256(data).hexdigest()
evidence = json.loads((ROOT / 'source-evidence.json').read_text())
arm = Path(evidence['artifact']['path']).read_bytes()
assert sha(arm) == evidence['artifact']['sha256']
for function in evidence['functions']:
    start, stop = int(function['start'], 16), int(function['stopExclusive'], 16)
    assert sha(arm[start:stop]) == function['bytesSha256']
    assert sha((ROOT / (function['name'] + '.asm')).read_bytes()) == function['asmSha256']
assert struct.unpack_from('<i', arm, 0xced81c8 + 56 * 4)[0] + 0x503914 == 0x503924
assert struct.unpack_from('<I', arm, 0x503924)[0] == 0x52800100  # MOV W0,#8
assert struct.unpack_from('<d', arm, 0xdf4be70)[0] == 180.0
assert struct.unpack_from('<4i', arm, 0xdf3e700) == (0, 4, 0, 0)
commands = ['NEW_PATH','FILL_RULE_NONZERO','PATH_COLOR_ALPHA','PATH_COLOR_ARGB','PATH_MODE_CLEAR','STROKE','CAP_SQUARE','MOVE_TO','R_MOVE_TO','ARC_TO','R_ARC_TO','LINE_TO','R_LINE_TO','H_LINE_TO','R_H_LINE_TO','V_LINE_TO','R_V_LINE_TO','CUBIC_TO','R_CUBIC_TO','CUBIC_TO_SHORTHAND','QUADRATIC_TO','R_QUADRATIC_TO','QUADRATIC_TO_SHORTHAND','R_QUADRATIC_TO_SHORTHAND','CIRCLE','OVAL','ROUND_RECT','CLOSE','CANVAS_DIMENSIONS','CLIP','DISABLE_AA','FLIPS_IN_RTL']
code = (ROOT / 'port/chrome/browser/ui/views/frame/aux_section_icons.inc').read_text()
encoded = bytearray()
for token in code.split('kDisclosurePath[] = {', 1)[1].split('};', 1)[0].split(','):
    token = token.strip()
    if not token: continue
    encoded.extend(struct.pack('<I', commands.index(token[5:])) if token.startswith('gfx::')
                   else struct.pack('<f', float(token[:-1])))
assert len(encoded) == 53 * 4 and encoded == arm[0xd3dc800:0xd3dc800 + 53 * 4]
manifest = json.loads((ROOT / 'manifest.json').read_text())
with tempfile.TemporaryDirectory(prefix='aux-section-view-') as temporary:
    subprocess.run(['git', 'init', '-q', temporary], check=True)
    subprocess.run(['git', '-C', temporary, 'apply', '--check', str(ROOT / 'native.patch')], check=True)
    subprocess.run(['git', '-C', temporary, 'apply', str(ROOT / 'native.patch')], check=True)
    for entry in manifest['files']:
        assert entry['baselineSha256'] is None
        data = (Path(temporary) / entry['path']).read_bytes()
        assert sha(data) == entry['outputSha256']
        assert data == (ROOT / 'port' / entry['path']).read_bytes()
print('PASS: original section/header/chevron ranges, radius/rotation/margins, exact53-element icon and five-file replay; uncompiled/unmounted')
