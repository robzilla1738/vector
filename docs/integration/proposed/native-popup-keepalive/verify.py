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

cc_path = 'chrome/browser/extensions/api/aux_mini_popup/aux_mini_popup_api.cc'
before = (root / 'baseline' / cc_path).read_text()
after = (root / 'source' / cc_path).read_text()
assert after.count('std::make_unique<ScopedKeepAlive>') == 1
assert after.count('keep_alive_.reset();') == 4
configure = after[after.index('  std::optional<std::string> Configure('):after.index('  void BindProfile(')]
assert configure.index('RegisterAccelerator') < configure.index('registered_ = true;') < configure.index('std::make_unique<ScopedKeepAlive>')
assert 'KeepAliveRestartOption::ENABLED' in configure and 'KeepAliveOrigin::AUX_MINI_POPUP' in configure
assert configure.index('DestroyWindows();') < configure.index('keep_alive_.reset();')
shutdown = after[after.index('  void Shutdown()'):after.index('  std::optional<std::string> Configure(')]
assert shutdown.index('DestroyWindows();') < shutdown.index('keep_alive_.reset();')
for start, end in [('  void Hide()', '  void DestroyWindows()'), ('  void ShowFor(', '  void RequestHide()')]:
    assert before[before.index(start):before.index(end)] == after[after.index(start):after.index(end)]
import re
h = 'components/keep_alive_registry/keep_alive_types.h'
def origins(text):
    block = text.split('enum class KeepAliveOrigin {', 1)[1].split('};', 1)[0]
    return re.findall(r'^  ([A-Z][A-Z_]+),', block, re.M)
old = origins((root / 'baseline' / h).read_text())
new = origins((root / 'source' / h).read_text())
assert new == old + ['AUX_MINI_POPUP']
cpp = (root / 'source/components/keep_alive_registry/keep_alive_types.cc').read_text()
assert cpp.count('case KeepAliveOrigin::AUX_MINI_POPUP:') == 1
assert len(manifest['files']) == 3
print('Verified original registration lifetime pins, three exact native replays, success-only acquisition, four retirement releases and preserved existing enum ordinals. No native runtime acceptance.')
