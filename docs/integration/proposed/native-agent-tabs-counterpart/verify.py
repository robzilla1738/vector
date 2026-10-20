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

for row in evidence['agent1852']:
    source = Path(row['path'])
    assert sha(source) == row['sha256']
    text = source.read_text()
    for anchor in row['anchors']:
        assert text.count(anchor['find']) == anchor['count']
        assert text.index(anchor['find']) == anchor['offset']
# Decode the actual direct call/branch sites independently of decompiler names.
def read(address, count):
    start, _, offset = next(s for s in sections if s[0] <= address < s[0] + s[1])
    return arm[offset + address - start:offset + address - start + count]
def branch(address):
    instruction = struct.unpack('<I', read(address, 4))[0]
    assert instruction & 0x7c000000 == 0x14000000
    immediate = instruction & 0x3ffffff
    if immediate & 0x2000000:
        immediate -= 0x4000000
    return address + immediate * 4
assert branch(0x45d78f0) == branch(0x45df220) == 0x4684340
assert branch(0x4684c64) == 0x2c1d388
assert branch(0x4687378) == 0x468727c
assert struct.unpack('<Q', read(0xe732f48, 8))[0] & 0xfffffffff == 0x4687378
path = manifest['files'][0]['path']
before = (root / 'baseline' / path).read_text()
after = (root / 'source' / path).read_text()
old = '        auto bubble = std::make_unique<AgentTabsBubble>(owner.get(), anchor);'
new = '        for (const auto& existing : AgentTabsBubbleOwners()) {\n          if (existing.browser.get() == owner.get()) {\n            existing.widget->CloseWithReason(\n                views::Widget::ClosedReason::kUnspecified);\n            return;\n          }\n        }\n        auto bubble = std::make_unique<AgentTabsBubble>(owner.get(), anchor);'
assert before.count(old) == 1
assert after == before.replace(old, new, 1)
assert len(manifest['files']) == 1
print('Verified original native counterpart/constructor/press/vtable and Agent1852 producer pins, exact one-file replay and existing-widget toggle only. No full surface parity or native runtime acceptance.')
