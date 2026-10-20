"""Pin/replay popup retirement state without native shortcut or window actions."""
import hashlib
import json
from pathlib import Path
import struct
import subprocess
import tempfile

root = Path(__file__).resolve().parent
manifest = json.loads((root / 'manifest.json').read_text())
evidence = json.loads((root / 'source-evidence.json').read_text())

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

for row in evidence['inputs']:
    assert sha(Path(row['path'])) == row['sha256'], row['path']
framework = Path(evidence['framework']['path'])
assert sha(framework) == evidence['framework']['sha256']
universal = framework.read_bytes()
for i in range(struct.unpack_from('>I', universal, 4)[0]):
    cpu, _, offset, size, _ = struct.unpack_from('>IIIII', universal, 8 + i * 20)
    if cpu == 0x100000c:
        arm = universal[offset:offset + size]
        break
else:
    raise AssertionError('Missing arm64 input')
assert hashlib.sha256(arm).hexdigest() == evidence['framework']['arm64Sha256']
sections = []
pos = 32
for _ in range(struct.unpack_from('<I', arm, 16)[0]):
    cmd, size = struct.unpack_from('<II', arm, pos)
    if cmd == 0x19:
        for i in range(struct.unpack_from('<I', arm, pos + 64)[0]):
            sections.append(struct.unpack_from('<QQI', arm, pos + 72 + i * 80 + 32))
    pos += size
for row in evidence['functions']:
    address = int(row['rva'], 16)
    start, _, offset = next(s for s in sections if s[0] <= address < s[0] + s[1])
    data = arm[offset + address - start:offset + address - start + row['bytes']]
    assert hashlib.sha256(data).hexdigest() == row['sha256']
with tempfile.TemporaryDirectory(prefix='aux-popup-reopen-') as directory:
    replay = Path(directory)
    subprocess.run(['git', 'init', '-q', directory], check=True)
    for row in manifest['files']:
        path = row['path']
        assert sha(root / 'baseline' / path) == row['baselineSha256']
        assert sha(root / 'source' / path) == row['outputSha256']
        out = replay / path
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_bytes((root / 'baseline' / path).read_bytes())
    subprocess.run(['git', 'apply', '--check', str(root / 'native.patch')], cwd=replay, check=True)
    subprocess.run(['git', 'apply', str(root / 'native.patch')], cwd=replay, check=True)
    for row in manifest['files']:
        assert sha(replay / row['path']) == row['outputSha256']

import re
native = Path('/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src')
header = (native / 'ui/gfx/vector_icon_types.h').read_text()
commands = header[header.index('#define DECLARE_VECTOR_COMMANDS'):header.index('#define DECLARE_VECTOR_COMMAND(x) x,')]
commands = {name: i for i, name in enumerate(re.findall(r'DECLARE_VECTOR_COMMAND\(([A-Z_]+)\)', commands))}
icon = re.sub(r'//[^\n]*', '', (native / 'components/vector_icons/close.icon').read_text())
tokens = [token.strip() for token in icon.split(',') if token.strip()]
encoded = b''.join(struct.pack('<I', commands[t]) if t in commands else struct.pack('<f', float(t.rstrip('f'))) for t in tokens)
def read(address, count):
    start, _, offset = next(s for s in sections if s[0] <= address < s[0] + s[1])
    return arm[offset + address - start:offset + address - start + count]
assert len(encoded) == 552 and encoded == read(0xd3f36e0, 552)
assert struct.unpack('<4i', read(0xdf47ab0, 16)) == (10, 12, 8, 12)
assert read(0xd6e52e0, 20).decode('utf-16-le') == 'Agent Tabs'
assert read(0xd6e537a, 62).decode('utf-16-le') == 'Background tabs opened for work'
assert read(0xdf88022, 18).decode('utf-16-le') == 'Close tab'
path = manifest['files'][0]['path']
before = (root / 'baseline' / path).read_text()
after = (root / 'source' / path).read_text()
assert 'SetAccessibleTitle(u"Agent Tabs")' in after and 'SetShowTitle(false)' in after
assert 'gfx::Insets::TLBR(10, 12, 8, 12)' in after
assert '14 - title->font_list().GetFontSize()' in after and 'title->SetLineHeight(20)' in after
assert '12 - subtitle->font_list().GetFontSize()' in after and 'subtitle->SetLineHeight(18)' in after
assert 'vector_icons::kCloseIcon, 16' in after and 'gfx::Size(22, 22)' in after
assert 'close->GetViewAccessibility().SetName(u"Close tab")' in after
# Action/scoping and actual owner retirement code remain byte-identical.
start = '  void Activate('
assert before[before.index(start):] == after[after.index(start):]
start, end = '  void Refresh()', '  void AddTab('
assert before[before.index(start):before.index(end)] == after[after.index(start):after.index(end)]
assert 'set_fixed_width(420)' in before and 'set_fixed_width(420)' in after
assert len(manifest['files']) == 1
print('Verified supplied header metrics/text, all552close-icon bytes, exact native replay and unchanged action/ownership/security bodies. No full surface parity or native runtime acceptance.')
