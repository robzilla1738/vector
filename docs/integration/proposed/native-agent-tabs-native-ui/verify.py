"""Pin and replay native agent-tabs controls without target execution."""
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
with tempfile.TemporaryDirectory(prefix='aux-agent-native-ui-') as directory:
    replay = Path(directory)
    subprocess.run(['git', 'init', '-q', directory], check=True)
    for row in manifest['files']:
        path = row['path']
        assert sha(root / 'baseline' / path) == row['baselineSha256']
        assert sha(root / 'source' / path) == row['outputSha256']
        out = replay / path
        out.parent.mkdir(parents=True, exist_ok=True)
        if not row.get('newFile'):
            out.write_bytes((root / 'baseline' / path).read_bytes())
    subprocess.run(['git', 'apply', '--check', str(root / 'native.patch')], cwd=replay, check=True)
    subprocess.run(['git', 'apply', str(root / 'native.patch')], cwd=replay, check=True)
    for row in manifest['files']:
        assert sha(replay / row['path']) == row['outputSha256']


import re
icons = json.loads((root / 'icons.json').read_text())
code = (root / 'source/chrome/browser/ui/views/frame/aux_agent_tabs_bubble.cc').read_text()
for row in icons['ranges']:
    name = row['name'].split()[0]
    body = code.split('constexpr gfx::PathElement k' + name + 'Path[] = {', 1)[1].split('};', 1)[0]
    encoded = bytearray()
    for command, scalar in re.findall(r'gfx::(\w+)|(-?\d+(?:\.\d+)?(?:e[+-]?\d+)?f)', body):
        if command:
            encoded += struct.pack('<I', icons['commands'].index(command))
        else:
            encoded += struct.pack('<f', float(scalar[:-1]))
    assert len(encoded) == row['bytes']
    assert hashlib.sha256(encoded).hexdigest() == row['sha256']
assert 'GetTabGroupFeatures()->is_agent_group()' in code
assert 'for (const auto id : groups->ListTabGroups())' in code
assert 'count = group->ListTabs().length();' in code
assert 'SetVisible(count > 0)' in code
assert 'const tabs::TabHandle tab_' in code
assert 'model_->GetIndexOfTab(tab)' in code
assert 'model_->ActivateTabAt(index)' in code
assert 'CLOSE_USER_GESTURE |' in code and 'CLOSE_CREATE_HISTORICAL_TAB' in code
assert 'model_->CloseAllTabsInGroup(group_)' in code
assert 'tab_strip_->tab_at(index)' in code and 'HoverCardUpdateType::kHover' in code
assert 'Contains(focus_manager->GetFocusedView())' in code
assert 'rows_->RemoveAllChildViews();\n    model_ = nullptr;' in code
assert 'owner.browser.get() == browser' in code
for absent in ['AuxNativeTaskFeed', 'RequestAgentTabs', 'set_fixed_width', 'ScrollView',
               'Loading owned', 'Refresh"', 'Checkbox', 'FindBrowserWithTab', 'GetForId']:
    assert absent not in code, absent
header = (root / 'source/chrome/browser/ui/views/frame/aux_agent_tabs_bubble.h').read_text()
assert 'std::unique_ptr<views::Button>' in header
strip_header = (root / 'source/chrome/browser/ui/views/frame/horizontal_tab_strip_region_view.h').read_text()
assert strip_header.count('raw_ptr<views::Button> aux_agent_tabs_') == 2
print('Verified native group/count/handle actions, exact copied icon float32 bytes, lifecycle guards and four-file replay. Not compiled or runtime/visual acceptance.')
