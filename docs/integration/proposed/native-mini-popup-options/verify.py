"""Verify static source pins and replay this native proposal in disposable storage."""
import hashlib
import json
from pathlib import Path
import subprocess
import tempfile

root = Path(__file__).resolve().parent
manifest = json.loads((root / 'manifest.json').read_text())
evidence = json.loads((root / 'source-evidence.json').read_text())

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

for row in evidence['inputs']:
    assert digest(Path(row['path'])) == row['sha256'], row['path']
with tempfile.TemporaryDirectory(prefix='aux-mini-popup-replay-') as name:
    replay = Path(name)
    subprocess.run(['git', 'init', '-q', name], check=True)
    for row in manifest['files']:
        relative = row['path']
        before = root / 'baseline' / relative
        after = root / 'source' / relative
        assert digest(before) == row['baselineSha256'], relative
        assert digest(after) == row['outputSha256'], relative
        destination = replay / relative
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_bytes(before.read_bytes())
    patch = str(root / 'native-mini-popup-options.patch')
    subprocess.run(['git', 'apply', '--check', patch], cwd=replay, check=True)
    subprocess.run(['git', 'apply', patch], cwd=replay, check=True)
    for row in manifest['files']:
        assert digest(replay / row['path']) == row['outputSha256'], row['path']

source = (root / 'source' / manifest['files'][1]['path']).read_text()
option = source[source.index('  content::WebContents* AddNewContents('):
                source.index('  void CloseContents(')]
assert 'SetOwnedWebContents(std::move(new_contents))' in option
assert 'LoadInitialURL' not in option
for guard in ['IsMainContents(source)', 'WindowOpenDisposition::NEW_POPUP',
              'target_url.host() != aux::kAgentExtensionId']:
    assert guard in option, guard
assert 'ShowInactive()' in option
resize = source[source.index('  std::optional<std::string> ResizeOptions('):
                source.index('  void SetState(')]
assert 'IsOptionContents(source)' in resize
assert 'bounds.bottom() - size.height()' in resize
assert 'make_unique' not in resize
assert 'width <= 0 || height <= 0' in source
assert 'gfx::Size size_{440, 92}' in source
print('Verified supplied input hashes, two-file exact patch replay, child ownership and resize guards. No native execution.')
