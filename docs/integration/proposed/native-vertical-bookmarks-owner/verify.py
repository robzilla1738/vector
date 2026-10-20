"""Static supplied source pins and exact disposable patch replay; no native execution."""
from pathlib import Path
import contextlib
import hashlib
import io
import json
import runpy
import subprocess
import sys
import tempfile

root = Path(__file__).resolve().parent
sha = lambda data: hashlib.sha256(data).hexdigest()
evidence = json.loads((root / 'source-evidence.json').read_text())
manifest = json.loads((root / 'manifest.json').read_text())
assert sha(Path(evidence['arm64']['path']).read_bytes()) == evidence['arm64']['sha256']
sys.argv = ['decode', evidence['arm64']['path']]
with contextlib.redirect_stdout(io.StringIO()):
    decoder = runpy.run_path(str(root.parent / 'native-popup-material/decode-selectors.py'))
for item in evidence['functions']:
    assert sha(decoder['read'](int(item['rva'], 16), item['bytes'])) == item['sha256']
    assert sha((root / 'evidence' / (item['name'] + '.asm')).read_bytes()) == item['assemblySha256']
for item in evidence['literals']:
    assert decoder['read'](int(item['rva'],16),(len(item['value'])+1)*2).decode('utf-16le').rstrip('\0') == item['value']
for item in evidence['nativeMessages']:
    assert decoder['stub'](int(item['rva'],16))==item['value']
for item in evidence['nativeClassRefs']:
    assert decoder['imp'](decoder['qword'](int(item['rva'],16)))==item['value']
for item in evidence['data']:
    raw=decoder['read'](int(item['rva'],16),item['bytes'])
    assert raw.hex()==item['hex'] and sha(raw)==item['sha256']
for item in evidence['apiInputs']:
    assert sha((root/item['snapshotPath']).read_bytes())==item['sha256']
for item in evidence['inputs']:
    assert sha(Path(item['path']).read_bytes()) == item['sha256']
with tempfile.TemporaryDirectory(prefix='aux-bookmark-drag-contract-replay-') as temp:
    for item in manifest['files']:
        if item['baselineSha256'] is not None:
            baseline = root / 'baseline' / item['path']
            assert sha(baseline.read_bytes()) == item['baselineSha256']
            target = Path(temp) / item['path']
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(baseline.read_bytes())
    subprocess.run(['git', 'apply', '--check', str(root / 'native.patch')], cwd=temp, check=True)
    subprocess.run(['git', 'apply', str(root / 'native.patch')], cwd=temp, check=True)
    for item in manifest['files']:
        assert sha((Path(temp) / item['path']).read_bytes()) == item['outputSha256']
        assert sha((root / 'source' / item['path']).read_bytes()) == item['outputSha256']
source=(root/'source/chrome/browser/ui/views/frame/aux_vertical_tab_bookmarks_view.cc').read_text()
assert 'TabMenuModelDelegate::From(&browser_)' in source
assert 'item.url.EqualsIgnoringRef(url)' in source
assert 'IsBookmarkTabExcluded(tab, tabs_)' in source
assert 'begin_drag_.Run(drag_node_, row.GetDragImageModel(),' in source
assert 'base::SingleThreadTaskRunner::GetCurrentDefault()->PostTask' in source
assert 'bookmarks::OpenAllIfAllowed' in source
assert 'ConvertBookmarkToPinnedEntry' not in source  # genuine region owns that transition
assert 'NSAlertFirstButtonReturn' in (root/'source/chrome/browser/ui/views/frame/aux_bookmark_confirmation_mac.mm').read_text()
print('PASS: original model/layout/action/drag/confirmation byte pins, menu literals/data, 155 API snapshots, six-file disposable replay; uncompiled/unmounted')
