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
    assert decoder['cstr'](int(item['rva'], 16)) == item['value']
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
source = (root / 'source/chrome/browser/ui/views/frame/aux_vertical_tab_bookmarks_view.cc').read_text()
helper = (root / 'source/chrome/browser/ui/views/frame/aux_saved_pin_bookmark_conversion.cc').read_text()
assert source.count('target.Offset(0, 36)') == 1
assert 'point.y() < rect.CenterPoint().y()' in source
assert 'node->is_folder() && rect.Contains(point)' in source
assert 'insertion = i + 1;' in source and 'index = 0;' in source
assert 'external_bounds_.emplace(node, row->second->bounds())' in source
assert 'gfx::Rect target(8, 1, std::max(0, contents_->width() - 16), 32)' in source
assert '(depth->second + 1) * 14' in source
assert 'ClearExternalInsertion(false);' in source
assert 'QueueNavigation(*created)' in source
assert helper.index('bookmarks.CommitExternalBookmark') < helper.index('model->SetTabPinned') < helper.index('RemoveFirstPinnedTabEntry')
assert 'GetIndexOfTab(tab)' in helper and 'GetBrowserContext() == profile' in helper
assert 'return std::ranges::none_of(entries' in helper
assert 'CloseWebContents' not in helper and 'CloseTab' not in helper
for name in ['UpdateExternalBookmarkInsertion', 'ClearExternalBookmarkInsertion', 'CommitExternalBookmark']:
    assert name in source
# Correct source constructor identities, not the unrelated Chats callback set.
ctor = (root / 'evidence/original-constructor.c').read_text()
assert '&LAB_0462b5c0' in ctor and 'FUN_0462ba98' in ctor and 'FUN_0462beac' in ctor
assert 'FUN_04606ee0(uVar41,pqVar46,pqVar36,pqVar21)' in ctor
print('PASS: original saved-pin callback/external insertion/default-parent/mutation pins, API snapshots and six-file disposable replay; uncompiled/unmounted')
