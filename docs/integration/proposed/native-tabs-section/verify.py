"""Static supplied source pins and exact disposable patch replay; no native execution."""
from pathlib import Path
import contextlib
import hashlib
import io
import json
import runpy
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
    raw=decoder['read'](int(item['rva'],16),item['bytes'])
    assert raw.hex()==item['hex'] and sha(raw)==item['sha256']
for item in evidence['apiInputs']:
    assert sha((root/item['snapshotPath']).read_bytes())==item['sha256']
for item in evidence.get('inputs', []):
    assert sha(Path(item['path']).read_bytes()) == item['sha256']
with tempfile.TemporaryDirectory(prefix='aux-bookmark-drag-contract-replay-') as temp:
    for item in manifest['files']:
        if item['baselineSha256'] is not None:
            baseline = root / 'baseline' / item['path']
            assert sha(baseline.read_bytes()) == item['baselineSha256']
            target = Path(temp) / item['path']
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(baseline.read_bytes())
    subprocess.run(['git', 'apply', '--check', str(root / 'native.patch')], cwd=temp, check=True)
    subprocess.run(['git', 'apply', str(root / 'native.patch')], cwd=temp, check=True)
    for item in manifest['files']:
        assert sha((Path(temp) / item['path']).read_bytes()) == item['outputSha256']
        assert sha((root / 'source' / item['path']).read_bytes()) == item['outputSha256']
for row in evidence['utf16']:
    raw = decoder['read'](int(row['rva'], 16), row['units'] * 2)
    assert sha(raw) == row['sha256'] and raw.decode('utf-16le') == row['value']
import re
import struct
names = ['NEW_PATH','FILL_RULE_NONZERO','PATH_COLOR_ALPHA','PATH_COLOR_ARGB','PATH_MODE_CLEAR','STROKE','CAP_SQUARE','MOVE_TO','R_MOVE_TO','ARC_TO','R_ARC_TO','LINE_TO','R_LINE_TO','H_LINE_TO','R_H_LINE_TO','V_LINE_TO','R_V_LINE_TO','CUBIC_TO','R_CUBIC_TO','CUBIC_TO_SHORTHAND','QUADRATIC_TO','R_QUADRATIC_TO','QUADRATIC_TO_SHORTHAND','R_QUADRATIC_TO_SHORTHAND','CIRCLE','OVAL','ROUND_RECT','CLOSE','CANVAS_DIMENSIONS','CLIP','DISABLE_AA','FLIPS_IN_RTL']
icons = (root / 'source/chrome/browser/ui/views/frame/aux_tabs_action_icons.inc').read_text()
for icon in evidence['icons']:
    identifier = 'k' + icon['name']
    body = re.search(r'constexpr gfx::PathElement ' + identifier + r'Path\[\] = \{(.*?)\};', icons, re.S).group(1)
    encoded = b''.join(struct.pack('<I', names.index(token.strip()[5:])) if token.strip().startswith('gfx::') else struct.pack('<f', float(token.strip()[:-1])) for token in body.split(',') if token.strip())
    assert len(encoded) == icon['elements'] * 4
    assert encoded == decoder['read'](int(icon['pathRva'],16),len(encoded))
    assert sha(encoded) == icon['sha256']
    assert decoder['qword'](int(icon['descriptorRva'],16)) & 0xfffffffff == int(icon['representationRva'],16)
    assert decoder['qword'](int(icon['representationRva'],16)) & 0xfffffffff == int(icon['pathRva'],16)
source = (root / 'source/chrome/browser/ui/views/frame/aux_tabs_section.cc').read_text()
assert 'SetElideBehavior(gfx::ELIDE_TAIL)' in source and 'FADE_TAIL' not in source
assert 'SetInteriorMargin(gfx::Insets::VH(2, 6))' in source
assert source.count('SetDefault(views::kMarginsKey, gfx::Insets::TLBR(0, 0, 0, 4))') == 2
assert 'cached_size_->set_height(24)' in source
assert 'GetViewAccessibility().SetName(busy ? u"Organizing tabs" : GetTooltipText())' in re.sub(r'\s+', ' ', source)
assert 'SetTooltipText(u"Organizing tabs")' not in source
assert 'SetHeaderAlwaysShowAccessory(busy)' in source
assert 'SetEnabled(!busy)' in source
assert 'views::Throbber::Start()' in source
assert 'RepeatingTimer' not in source
assert 'CHECK(actions.tidy)' in source and 'CHECK(actions.clear)' in source
assert 'AuxSectionView(u"Tabs",false,{},gfx::Insets::TLBR(4,0,0,0)' in re.sub(r'\s+', '', source)
for value in ['0x73fafafa','0x730a0a0a','0x26fafafa','0x1a0a0a0a','0x14fafafa','0x140a0a0a']:
    assert value in source
print('PASS: original Tabs/action state/layout/AX/palette/metadata pins,305 bit-identical glyph elements,155 API snapshots and three-file disposable replay; uncompiled/unmounted')
