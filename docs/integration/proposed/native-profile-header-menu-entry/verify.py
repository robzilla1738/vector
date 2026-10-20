"""Check the genuine menu forwarding and source-proven distinct context menu."""
from pathlib import Path
import hashlib
import json
import struct
import subprocess
import tempfile

root = Path(__file__).resolve().parent
sha = lambda data: hashlib.sha256(data).hexdigest()
proof = json.loads((root / 'source-evidence.json').read_text())
manifest = json.loads((root / 'manifest.json').read_text())
binary = Path(proof['arm64']['path']).read_bytes()
assert sha(binary) == proof['arm64']['sha256']
for row in proof['functions']:
    start = int(row['rva'], 16)
    assert sha(binary[start:start + row['bytes']]) == row['sha256']
    assert sha((root / 'evidence' / (row['name'] + '.asm')).read_bytes()) == row['assemblySha256']
sections = []
position = 32
for _ in range(struct.unpack_from('<I', binary, 16)[0]):
    command, size = struct.unpack_from('<II', binary, position)
    if command == 0x19:
        for index in range(struct.unpack_from('<I', binary, position + 64)[0]):
            sections.append(struct.unpack_from('<QQI', binary, position + 72 + index * 80 + 32))
    position += size


def read(address, count):
    start, length, offset = next(row for row in sections if row[0] <= address < row[0] + row[1])
    assert address + count <= start + length
    return binary[offset + address - start:offset + address - start + count]


assert 0x4574474 + struct.unpack('<i', read(0xd6e3084 + 6 * 4, 4))[0] == 0x45760d4
for address, text in [(0xdf87416, 'Change Icon'), (0xdf8742e, 'Sign Out'),
                      (0xdf870f2, 'Settings'), (0xdf87026, 'Profile indicator menu')]:
    assert read(address, (len(text) + 1) * 2) == (text + '\0').encode('utf-16le')
assert struct.unpack_from('<I', binary, 0x45760ec)[0] == 0x52801900  #Actual200px panel.
with tempfile.TemporaryDirectory(prefix='aux-header-menu-entry-') as directory:
    for row in manifest['files']:
        old = (root / 'baseline' / row['path']).read_bytes()
        assert sha(old) == row['baselineSha256']
        path = Path(directory) / row['path']
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(old)
    subprocess.run(['git', 'apply', str(root / 'native.patch')], cwd=directory,
                   check=True, capture_output=True)
    for row in manifest['files']:
        result = (Path(directory) / row['path']).read_bytes()
        assert sha(result) == row['outputSha256']
        assert result == (root / 'source' / row['path']).read_bytes()
old = (root / 'baseline/chrome/browser/ui/views/frame/aux_sidebar_view.cc').read_text()
new = (root / 'source/chrome/browser/ui/views/frame/aux_sidebar_view.cc').read_text()
addition = '''\nvoid ShowAuxProfileMenu(BrowserWindowInterface* browser, views::View* anchor) {
  if (browser && anchor && anchor->GetWidget()) {
    AuxProfileMenu::Show(browser, anchor);
  }
}
'''
assert new.replace(addition, '', 1) == old
assert 'void ShowAuxProfileActions(' not in new
print('PASS: direct primary-menu export, original distinct200px context menu pins and2-file replay; uncompiled')
