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

path = manifest['files'][0]['path']
before = (root / 'baseline' / path).read_text()
after = (root / 'source' / path).read_text()
old_disable = "      registered_ = false;\n      Hide();\n    }\n    return std::nullopt;"
new_disable = "      registered_ = false;\n      accelerator_ = ui::Accelerator();\n      Hide();\n      DestroyWindows();\n      dismiss_.Stop();\n      size_ = gfx::Size(440, 92);\n    }\n    return std::nullopt;"
old_profile = "    dismiss_.Stop();\n    profile_ = profile->GetWeakPtr();"
new_profile = "    dismiss_.Stop();\n    size_ = gfx::Size(440, 92);\n    profile_ = profile->GetWeakPtr();"
assert before.count(old_disable) == before.count(old_profile) == 1
assert after == before.replace(old_disable, new_disable, 1).replace(old_profile, new_profile, 1)
# Normal Hide and same-profile early return retain the page/size; reset only at
# the two proven coordinator-retirement boundaries.
start, end = '  void Hide()', '  void DestroyWindows()'
assert before[before.index(start):before.index(end)] == after[after.index(start):after.index(end)]
bind = after[after.index('  void BindProfile('):after.index('  void ShowFor(')]
assert bind.index('return;') < bind.index('Hide();') < bind.index('DestroyWindows();') < bind.index('size_ = gfx::Size(440, 92);') < bind.index('profile_ = profile->GetWeakPtr();')
assert after.count('size_ = gfx::Size(440, 92);') == 2
# Getter/startup dependency, real gates and all APIs are intentionally unchanged.
start = 'ExtensionFunction::ResponseAction AuxMiniPopupFunction::RunAux()'
assert before[before.index(start):] == after[after.index(start):]
assert len(manifest['files']) == 1
print('Verified original retirement/fresh-state pins, exact one-file replay and reset-only-at-retirement boundaries. No native shortcut actions or runtime acceptance.')
