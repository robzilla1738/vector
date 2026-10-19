"""Static source-pinned popup transparency replay; no browser or native execution."""
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
with tempfile.TemporaryDirectory(prefix='aux-popup-transparency-') as name:
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
    patch = str(root / 'native-mini-popup-transparency.patch')
    subprocess.run(['git', 'apply', '--check', patch], cwd=replay, check=True)
    subprocess.run(['git', 'apply', patch], cwd=replay, check=True)
    for row in manifest['files']:
        assert digest(replay / row['path']) == row['outputSha256'], row['path']

source = (root / 'source' / manifest['files'][1]['path']).read_text()
main_apply = source.index('ApplyTransparentPopupBackground(webview_->GetWebContents(url))')
assert main_apply < source.index('delegate_->SetContentsView(std::move(webview))')
child_apply = source.index('ApplyTransparentPopupBackground(new_contents.get())')
assert child_apply < source.index('options_webview_->SetOwnedWebContents(std::move(new_contents))')
helper = source[source.index('void ApplyTransparentPopupBackground('):
                source.index('base::ListValue ProfileIdentity(')]
assert 'Background::CreateForWebContentsWithColor(contents, SK_ColorTRANSPARENT)' in helper
assert 'contents->SetPageBaseBackgroundColor(SK_ColorTRANSPARENT)' in helper
assert 'view->SetBackgroundColor(SK_ColorTRANSPARENT)' in helper
assert 'existing && existing->color() != SK_ColorTRANSPARENT' in helper
assert 'contents->RemoveUserData(Background::UserDataKey())' in helper
assert 'class ' not in helper
print('Verified original/upstream source pins, exact two-file replay, persistent observer and before-attachment color setup. No native execution.')
