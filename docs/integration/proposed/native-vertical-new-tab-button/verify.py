"""Pin supplied bytes,155API snapshots,icon floats and exact disposable replay."""
from pathlib import Path
import contextlib
import hashlib
import io
import json
import re
import runpy
import struct
import subprocess
import sys
import tempfile

root = Path(__file__).resolve().parent
sha = lambda data: hashlib.sha256(data).hexdigest()
evidence = json.loads((root / 'source-evidence.json').read_text())
manifest = json.loads((root / 'manifest.json').read_text())
assert sha(Path(evidence['arm64']['path']).read_bytes()) == evidence['arm64']['sha256']
sys.argv = ['decode', evidence['arm64']['path']]
with contextlib.redirect_stdout(io.StringIO()):
    decoder = runpy.run_path(str(root.parent / 'native-popup-material/decode-selectors.py'))
for item in evidence['functions']:
    assert sha(decoder['read'](int(item['rva'], 16), item['bytes'])) == item['sha256']
    assert sha((root / 'evidence' / (item['name'] + '.asm')).read_bytes()) == item['assemblySha256']
for item in evidence['literals']:
    assert decoder['cstr'](int(item['rva'], 16)) == item['value']
for item in evidence['data']:
    raw = decoder['read'](int(item['rva'], 16), item['bytes'])
    assert raw.hex() == item['hex'] and sha(raw) == item['sha256']
for item in evidence['apiInputs']:
    assert sha((root / item['snapshotPath']).read_bytes()) == item['sha256']
names = ['NEW_PATH','FILL_RULE_NONZERO','PATH_COLOR_ALPHA','PATH_COLOR_ARGB','PATH_MODE_CLEAR','STROKE','CAP_SQUARE','MOVE_TO','R_MOVE_TO','ARC_TO','R_ARC_TO','LINE_TO','R_LINE_TO','H_LINE_TO','R_H_LINE_TO','V_LINE_TO','R_V_LINE_TO','CUBIC_TO','R_CUBIC_TO','CUBIC_TO_SHORTHAND','QUADRATIC_TO','R_QUADRATIC_TO','QUADRATIC_TO_SHORTHAND','R_QUADRATIC_TO_SHORTHAND','CIRCLE','OVAL','ROUND_RECT','CLOSE','CANVAS_DIMENSIONS','CLIP','DISABLE_AA','FLIPS_IN_RTL']
icon = evidence['icons'][0]
text = (root / 'source/chrome/browser/ui/views/frame/aux_vertical_new_tab_icon.inc').read_text()
body = re.search(r'kNewTabPlusPath\[\] = \{(.*?)\};', text, re.S).group(1)
encoded = b''.join(struct.pack('<I', names.index(token.strip()[5:])) if token.strip().startswith('gfx::') else struct.pack('<f', float(token.strip()[:-1])) for token in body.split(',') if token.strip())
assert len(encoded) == 78 * 4
assert encoded == decoder['read'](int(icon['pathRva'], 16), len(encoded))
assert sha(encoded) == icon['sha256']
assert decoder['qword'](int(icon['descriptorRva'],16)) & 0xfffffffff == int(icon['representationRva'],16)
assert decoder['qword'](int(icon['representationRva'],16)) & 0xfffffffff == int(icon['pathRva'],16)
# The two immutable radius tables are independently decoded, not inferred from155.
assert struct.unpack('<6f', decoder['read'](0xcf06638, 24)) == (8,8,0,8,0,8)
# Original label-elide argument is6; pinned155public enum is FADE_TAIL6.
assert 'mov\tw1, #0x6' in (root/'evidence/section-elide.asm').read_text()
with tempfile.TemporaryDirectory(prefix='aux-new-tab-replay-') as temp:
    subprocess.run(['git','apply','--check',str((root/'native.patch').resolve())],cwd=temp,check=True)
    subprocess.run(['git','apply',str((root/'native.patch').resolve())],cwd=temp,check=True)
    for item in manifest['files']:
        assert item['baselineSha256'] is None
        assert sha((Path(temp)/item['path']).read_bytes()) == item['outputSha256']
        assert sha((root/'source'/item['path']).read_bytes()) == item['outputSha256']
print('PASS:17 supplied byte ranges,8 data ranges,78 icon elements,16 API snapshots;3-file disposable replay. No native/runtime acceptance.')
