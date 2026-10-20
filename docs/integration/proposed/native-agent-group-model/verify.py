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
        if not row.get('newFile'):
            out.write_bytes((root / 'baseline' / path).read_bytes())
    subprocess.run(['git', 'apply', '--check', str(root / 'native.patch')], cwd=replay, check=True)
    subprocess.run(['git', 'apply', str(root / 'native.patch')], cwd=replay, check=True)
    for row in manifest['files']:
        assert sha(replay / row['path']) == row['outputSha256']

model=(root/'source/chrome/browser/ui/tabs/tab_strip_model.cc').read_text()
features=(root/'source/chrome/browser/ui/tabs/tab_group_features.h').read_text()
visual=(root/'source/components/tab_groups/tab_group_visual_data.h').read_text()
content=(root/'source/content/browser/devtools/devtools_agent_host_impl.cc').read_text()
assert 'impl.get() != host' in content
assert 'session->GetClient()->IsAuthenticatedRemoteDebuggingSession()' in content
assert 'IsTrusted' not in content[content.index('bool HasAuthenticatedRemoteDebuggingSession'):content.index('const char DevToolsAgentHost::kTypeTab')]
assert 'bool is_agent_group_ = false;' in features and 'bool is_agent_group_ = false;' in visual
producer=model[model.index('void TabStripModel::ChangeTabGroupVisuals('):model.index('void TabStripModel::NotifyTabGroupFocusChanged')]
assert producer.index('if (HasAgentGroupSession(this, tab_group))') < producer.index('visual_data.title() == u"Agent Tabs"')
assert 'if (is_agent && !was_agent && !visual_data.is_collapsed())' in producer
assert 'visual_data.SetIsAgentGroup(features->is_agent_group())' in producer
policy=model[model.index('void SetAgentGroupAudioMuted'):model.index('#endif  // BUILDFLAG(ENABLE_AUX_BROWSER)',model.index('void SetAgentGroupAudioMuted'))]
assert 'if (!contents->IsAudioMuted())' in policy
assert 'GetTabAudioMutedReason(contents) != TabMutedReason::kAgentGroup' in policy
assert 'CONTENT_SETTING_BLOCK' in policy and 'TabMutedReason::kContentSetting' in policy
membership=model[model.index('void TabStripModel::TabGroupStateChanged('):model.index('void TabStripModel::MaybeUpdateFocusModeForMovedTab(')]
assert membership.index('const bool was_agent_group') < membership.index('tab_group->RemoveTab()')
assert membership.rindex('SetAgentGroupAudioMuted') > membership.rindex('NotifyTabGroupVisualsChanged')
assert not any(row['path']=='content/public/browser/devtools_agent_host.h' for row in manifest['files'])
print('Verified supplied producer/marker/audio byte pins, guarded actual-client query, dedicated mute ownership, membership ordering and eight-file replay. No native compile or runtime acceptance.')
