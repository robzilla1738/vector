"""Static source pins and disposable patch replay; never creates a sync service."""
from pathlib import Path
import contextlib
import hashlib
import io
import json
import runpy
import struct
import subprocess
import sys
import tempfile

root = Path(__file__).resolve().parent
sha = lambda data: hashlib.sha256(data).hexdigest()
manifest = json.loads((root / 'manifest.json').read_text())
evidence = json.loads((root / 'source-evidence.json').read_text())
assert sha(Path(evidence['arm64']['path']).read_bytes()) == evidence['arm64']['sha256']
sys.argv = ['decode', evidence['arm64']['path']]
with contextlib.redirect_stdout(io.StringIO()):
    decoder = runpy.run_path(str(root.parent / 'native-popup-material/decode-selectors.py'))
read = decoder['read']
for row in evidence['functions']:
    assert sha(read(int(row['rva'], 16), row['bytes'])) == row['sha256']
    assert sha((root / 'evidence' / (row['name'] + '.asm')).read_bytes()) == row['assemblySha256']
for row in evidence['inputs']:
    assert sha(Path(row['path']).read_bytes()) == row['sha256']
for row in evidence['literals']:
    text = row['utf16']
    assert read(int(row['rva'], 16), len(text) * 2) == text.encode('utf-16-le')
assert decoder['cstr'](0xda4cfa5) == 'SyncService'
assert decoder['cstr'](0xd3ae20f) == 'disable-sync'
assert struct.unpack('<4i', read(0xdf40090, 16)) == (0, 0, 0, 8)
assert struct.unpack('<4i', read(0xdf40c70, 16)) == (2, 4, 4, 4)
# Exact native state changes: inner row hides and spinner stops; outer card
# hides on state update and collapse, while the container gets compact bool.
assert struct.unpack('<I', read(0x4244d6c, 4))[0] == 0x52800001
assert struct.unpack('<I', read(0x4244f3c, 4))[0] == 0x95920c4f
assert struct.unpack('<I', read(0x4245120, 4))[0] == 0x52800001
state = (root / 'evidence/state-observers.asm').read_text()
assert '4245090:' in state and '424544c:' in state
with tempfile.TemporaryDirectory(prefix='aux-bottom-sync-replay-') as directory:
    for row in manifest['files']:
        p = row['path']
        old, new = (root / 'baseline' / p).read_bytes(), (root / 'source' / p).read_bytes()
        assert sha(old) == row['baselineSha256']
        assert sha(new) == row['outputSha256']
        target = Path(directory) / p
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(old)
    subprocess.run(['git', 'apply', '--check', str(root / 'native.patch')], cwd=directory, check=True)
    subprocess.run(['git', 'apply', str(root / 'native.patch')], cwd=directory, check=True)
    for row in manifest['files']:
        assert sha((Path(directory) / row['path']).read_bytes()) == row['outputSha256']
code = (root / 'source' / manifest['files'][1]['path']).read_text()
header = (root / 'source' / manifest['files'][0]['path']).read_text()
assert 'GetTypesWithPendingDownloadForInitialSync()' in code
assert 'sync_observation_.Observe(sync_service_)' in code
assert 'sync_observation_.Reset();\n  sync_service_ = nullptr;\n  UpdateSyncState();' in code
assert 'base::ScopedObservation<syncer::SyncService, syncer::SyncServiceObserver>' in header
assert 'sync_row_->SetVisible(false)' in code and 'sync_throbber_->Stop()' in code
assert 'SetVisible(collapsed)' in code and 'UpdateButtonStyles(sync_compact_)' in code
assert 'SyncServiceFactory::GetForProfile(browser_->GetProfile())' in code
assert '#else\n  auto new_tab_button' in code
print('PASS: original code/literal/API pins and 2-file disposable replay; no compilation or service execution')
