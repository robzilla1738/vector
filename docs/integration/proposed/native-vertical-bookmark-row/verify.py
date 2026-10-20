"""Replay the original row proposal and decode literal/glyph/color source pins."""
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
sha = lambda value: hashlib.sha256(value).hexdigest()
evidence = json.loads((root / 'source-evidence.json').read_text())
manifest = json.loads((root / 'manifest.json').read_text())
assert sha(Path(evidence['arm64']['path']).read_bytes()) == evidence['arm64']['sha256']
sys.argv = ['decode', evidence['arm64']['path']]
with contextlib.redirect_stdout(io.StringIO()):
    decoder = runpy.run_path(str(root.parent / 'native-popup-material/decode-selectors.py'))
read = decoder['read']
for item in evidence['functions']:
    assert sha(read(int(item['rva'], 16), item['bytes'])) == item['sha256']
    assert sha((root / 'evidence' / (item['name'] + '.asm')).read_bytes()) == item['assemblySha256']
for item in evidence['inputs']:
    assert sha(Path(item['path']).read_bytes()) == item['sha256']
for item in evidence['insets']:
    assert list(struct.unpack('<4i', read(int(item['rva'], 16), 16))) == item['value']
arrow = evidence['arrow']
assert decoder['qword'](int(arrow['secondaryVtable'], 16) + arrow['slot']) & 0xfffffffff == int(arrow['target'], 16)
assert read(int(arrow['target'], 16), 8).hex() == '80008052c0035fd6'
# Decode pinned AArch64 MOVZ/MOVN/MOVK/CMP/CSEL constants, never execute target.
def color(start, length, dark, result=21):
    registers = {20: int(dark), 31: 0}
    equal = False
    for (word,) in struct.iter_unpack('<I', read(start, length)):
        dest, source, other = word & 31, word >> 5 & 31, word >> 16 & 31
        immediate, shift = word >> 5 & 65535, (word >> 21 & 3) * 16
        op = word & 0xff800000
        if op == 0x52800000:
            registers[dest] = immediate << shift
        elif op == 0x12800000:
            registers[dest] = ~(immediate << shift) & 0xffffffff
        elif op == 0x72800000:
            registers[dest] = (registers[dest] & ~(65535 << shift) | immediate << shift) & 0xffffffff
        elif word & 0xffc0001f == 0x7100001f:
            equal = registers[source] == word >> 10 & 4095
        elif word & 0x7fe00c00 == 0x1a800000:
            condition = word >> 12 & 15
            assert condition in (0, 1)
            registers[dest] = registers[source] if (equal if condition == 0 else not equal) else registers[other]
        else:
            raise AssertionError(hex(word))
    return registers[result]
code = (root / 'source/chrome/browser/ui/views/frame/aux_vertical_bookmark_row_view.cc').read_text()
for rva, size, dark, light, register in [
    (0x35e7650, 24, 0xa6fafafa, 0xb80a0a0a, 21),
    (0x35e78b4, 24, 0xfffafafa, 0xff0a0a0a, 21),
    (0x35e7174, 20, 0x0afafafa, 0x8cffffff, 21),
    (0x35e730c, 24, 0xd9fafafa, 0xd90a0a0a, 22),
    (0x35e73e0, 24, 0x8cfafafa, 0x8c0a0a0a, 27),
]:
    assert color(rva, size, True, register) == dark
    assert color(rva, size, False, register) == light
    assert f'0x{dark:08x}' in code and f'0x{light:08x}' in code
names = ['NEW_PATH','FILL_RULE_NONZERO','PATH_COLOR_ALPHA','PATH_COLOR_ARGB','PATH_MODE_CLEAR','STROKE','CAP_SQUARE','MOVE_TO','R_MOVE_TO','ARC_TO','R_ARC_TO','LINE_TO','R_LINE_TO','H_LINE_TO','R_H_LINE_TO','V_LINE_TO','R_V_LINE_TO','CUBIC_TO','R_CUBIC_TO','CUBIC_TO_SHORTHAND','QUADRATIC_TO','R_QUADRATIC_TO','QUADRATIC_TO_SHORTHAND','R_QUADRATIC_TO_SHORTHAND','CIRCLE','OVAL','ROUND_RECT','CLOSE','CANVAS_DIMENSIONS','CLIP','DISABLE_AA','FLIPS_IN_RTL']
glyphs = json.loads((root / 'icons-source.json').read_text())
icon_code = (root / 'source/chrome/browser/ui/views/frame/aux_vertical_bookmark_row_icons.inc').read_text()
arrays = re.findall(r'constexpr gfx::PathElement k\w+Path\[\] = \{(.*?)\};', icon_code, re.S)
assert len(arrays) == len(glyphs) == 2
for body, item in zip(arrays, glyphs):
    encoded = bytearray()
    for token in body.split(','):
        token = token.strip()
        if not token:
            continue
        encoded.extend(struct.pack('<I', names.index(token[5:])) if token.startswith('gfx::') else struct.pack('<f', float(token[:-1])))
    assert len(encoded) == item['elements'] * 4
    assert bytes(encoded) == read(int(item['pathRva'], 16), len(encoded))
    assert sha(encoded) == item['sha256']
assert sum(item['elements'] for item in glyphs) == 403
anchors = json.loads((root / 'anchors.json').read_text())
assert len(anchors) == 6
for path in {item['path'] for item in anchors}:
    expected = (root / 'baseline' / path).read_text()
    for item in anchors:
        if item['path'] == path:
            assert expected.count(item['before']) == 1
            expected = expected.replace(item['before'], item['after'], 1)
    assert expected == (root / 'source' / path).read_text()
with tempfile.TemporaryDirectory(prefix='aux-bookmark-row-replay-') as temp:
    for item in manifest['files']:
        if item['baselineSha256'] is not None:
            original = (root / 'baseline' / item['path']).read_bytes()
            assert sha(original) == item['baselineSha256']
            target = Path(temp) / item['path']
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(original)
    subprocess.run(['git', 'apply', '--check', str(root / 'native.patch')], cwd=temp, check=True)
    subprocess.run(['git', 'apply', str(root / 'native.patch')], cwd=temp, check=True)
    for item in manifest['files']:
        assert sha((Path(temp) / item['path']).read_bytes()) == item['outputSha256']
        assert sha((root / 'source' / item['path']).read_bytes()) == item['outputSha256']
assert 'views::style::CONTEXT_LABEL' in code
assert 'ShouldPaintAsActive()' in code and 'CalculateTargetColors(' in code
assert 'SetCapture(this)' in code and 'auto weak = weak_factory_.GetWeakPtr()' in code
assert 'return views::BubbleBorder::LEFT_TOP' in code
assert 'BookmarkRowCaptureLost(*this)' in code
assert 'OpenURL' not in code and 'SimpleMenuModel' not in code
print('PASS: original row/palette/arrow pins, 403 glyph elements, six anchors and five-file replay; unmounted and uncompiled')
