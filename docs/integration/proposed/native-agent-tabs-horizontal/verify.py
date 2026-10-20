"""Pin and replay original horizontal agent-button mounts without target execution."""
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

def read(address, count):
    start, _, offset = next(s for s in sections if s[0] <= address < s[0] + s[1])
    return arm[offset + address - start:offset + address - start + count]
def word(address):
    return struct.unpack('<I', read(address, 4))[0]
assert read(0xdeca8cd, 31).split(b'\0')[0] == b'HorizontalTabStripRegionViewOld'
assert read(0xdeca8ed, 31).split(b'\0')[0] == b'HorizontalTabStripRegionViewNew'
assert struct.unpack('<Q', read(0xe714e50 + 0x418, 8))[0] & 0xfffffffff == 0x45d77e0
assert struct.unpack('<Q', read(0xe7155b0 + 0x4e8, 8))[0] & 0xfffffffff == 0x45deeb0
assert struct.unpack('<4i', read(0xdf40090, 16)) == (0, 0, 0, 8)
for address in [0x45d78f0, 0x45df220]:
    ins = word(address); immediate = ins & 0x3ffffff
    if immediate & 0x2000000: immediate -= 0x4000000
    assert ins & 0xfc000000 == 0x94000000 and address + immediate * 4 == 0x4684340
# Old's actual nullable context and New's exact null argument.
assert word(0x45d78e4) == 0xf9423663
assert word(0x45df21c) == 0xd2800003
path = 'chrome/browser/ui/views/frame/horizontal_tab_strip_region_view.cc'
source = (root/'source'/path).read_text()
assert source.count('GetIndexOf(reserved_grab_handle_space_).value()') == 2
assert source.count('gfx::Insets::TLBR(0, 0, 0, 8)') == 2
assert source.count('CreateAuxAgentTabsButton(browser, tab_strip_)') == 1
assert source.count('CreateAuxAgentTabsButton(browser, nullptr)') == 1
assert source.count('if (!aux_agent_tabs_ && browser &&') == 2
for method in ['InitializeTabStrip()', 'OnTabStripViewSet()']:
    part=source[source.index('::'+method):]
    assert part.index('CreateAuxAgentTabsButton') < part.index('\n}')
bubble=(root/'source/chrome/browser/ui/views/frame/aux_agent_tabs_bubble.cc').read_text()
assert 'tab_strip ? tab_strip->AsWeakPtr() : base::WeakPtr<TabStrip>()' in bubble
assert 'std::make_unique<AgentTabsBubble>(owner.get(), anchor, tab_strip)' in bubble
before=(root/'baseline/chrome/browser/ui/views/frame/aux_agent_tabs_bubble.cc').read_text()
for start,end in [('  void Refresh()', '  void AddTab('), ('  void Activate(', '  // Supplied Old')]:
    if end in before:
        assert before[before.index(start):before.index(end)] == bubble[bubble.index(start):bubble.index(end)]
    else:
        assert before[before.index(start):before.index('  std::unique_ptr<ExpandOnHoverLock>')] == bubble[bubble.index(start):bubble.index(end)]
print('Verified original parent metadata, exact mount calls/nullability, 8px margin, four-file replay and retained scoped action bodies. No native build or runtime parity claimed.')
