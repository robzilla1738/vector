from pathlib import Path
import hashlib
import json
import subprocess
import tempfile

root = Path(__file__).resolve().parent
sha = lambda data: hashlib.sha256(data).hexdigest()
manifest = json.loads((root / 'manifest.json').read_text())
anchors = json.loads((root / 'anchors.json').read_text())
evidence = json.loads((root / 'source-evidence.json').read_text())
for item in evidence['ranges']:
    assert sha((root / 'evidence' / item['listing']).read_bytes()) == item['listingSha256']
for item in evidence['api']:
    assert sha((root / 'evidence' / item['snapshot']).read_bytes()) == item['sha256']
for item in evidence['data']:
    assert sha(bytes.fromhex(item['hex'])) == item['sha256']
for item in manifest['files']:
    before = (root / 'baseline' / item['path']).read_text()
    assert sha(before.encode()) == item['baselineSha256']
    after = before
    for anchor in (a for a in anchors if a['path'] == item['path']):
        assert after.count(anchor['before']) == anchor['count'], anchor['name']
        after = after.replace(anchor['before'], anchor['after'])
    assert sha(after.encode()) == item['outputSha256']
    assert after == (root / 'source' / item['path']).read_text()
with tempfile.TemporaryDirectory(prefix='aux-top-controls-replay-') as temp:
    for item in manifest['files']:
        target = Path(temp) / item['path']
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes((root / 'baseline' / item['path']).read_bytes())
    patch = str((root / 'native.patch').resolve())
    subprocess.run(['git', 'apply', '--check', patch], cwd=temp, check=True)
    subprocess.run(['git', 'apply', patch], cwd=temp, check=True)
    for item in manifest['files']:
        assert sha((Path(temp) / item['path']).read_bytes()) == item['outputSha256']
cc = (root / 'source' / manifest['files'][0]['path']).read_text()
assert 'combo_button_->SetVisible(false)' not in cc
assert 'aux_pill_' not in cc and 'aux_agent_tabs_' not in cc
assert 'CreateAuxAgentTabsButton' not in cc
assert cc.count('gfx::Rect bounds(left_alignment,') == 2
assert cc.count('combo_button_->GetVisible()') >= 3
assert cc.count('SetAuxProfilePreviewPresentation(') == 1
print(f'PASS: {len(anchors)} counted anchors, six native source ranges, API/data pins, four-file disposable replay. No native compile/runtime claim.')
