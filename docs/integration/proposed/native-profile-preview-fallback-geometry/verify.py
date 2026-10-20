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
for item in evidence['api155']:
    assert sha((root / 'evidence' / item['snapshot']).read_bytes()) == item['sha256']
for item in manifest['files']:
    before = (root / 'baseline' / item['path']).read_text()
    assert sha(before.encode()) == item['baselineSha256']
    after = before
    for anchor in (a for a in anchors if a['path'] == item['path']):
        assert after.count(anchor['before']) == anchor['count'], anchor['name']
        after = after.replace(anchor['before'], anchor['after'])
    assert sha(after.encode()) == item['outputSha256']
    assert after == (root / 'source' / item['path']).read_text()
with tempfile.TemporaryDirectory(prefix='aux-preview-geometry-replay-') as temp:
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
assert 'page.SetFallbackGeometry(header, search, scroll);' in cc
assert 'relative_bounds(region->GetAuxSidebarProfileButton())' in cc
assert 'relative_bounds(region->GetAuxSidebarSearchButton())' in cc
assert 'relative_bounds(surfaces[2])' in cc
assert 'result.Offset(0, -bounds.y());' in cc
assert cc.count('UpdatePageGeometry(page)') == 1
assert cc.count('UpdatePageGeometry(*page)') == 1
print('PASS: five counted anchors, five supplied range pins, seven actual API snapshots and two-file disposable replay; no native compile/runtime claim.')
