"""Original expansion-state proof and new-file replay, without any profile access."""
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
sha = lambda b: hashlib.sha256(b).hexdigest()
evidence = json.loads((root / 'source-evidence.json').read_text())
manifest = json.loads((root / 'manifest.json').read_text())
assert sha(Path(evidence['arm64']['path']).read_bytes()) == evidence['arm64']['sha256']
sys.argv = ['decode', evidence['arm64']['path']]
with contextlib.redirect_stdout(io.StringIO()):
    decoder = runpy.run_path(str(root.parent / 'native-popup-material/decode-selectors.py'))
for row in evidence['functions']:
    assert sha(decoder['read'](int(row['rva'], 16), row['bytes'])) == row['sha256']
    assert sha((root / 'evidence' / (row['name'] + '.asm')).read_bytes()) == row['assemblySha256']
for row in evidence['inputs']:
    assert sha(Path(row['path']).read_bytes()) == row['sha256']
key = evidence['prefKey']
assert decoder['read'](int(evidence['prefKeyRva'], 16), len(key)) == key.encode()
read = (root / 'evidence/read-expanded-folders.asm').read_text()
assert '0x10a11bc' in read and '0x16cecd4' in read
write = (root / 'evidence/toggle-folder-branch.asm').read_text()
assert '0x190d6a4' in write and '0x15098a8' in write
observe = (root / 'evidence/observe-expanded-folders.asm').read_text()
assert '0x461dd0c' in observe and '0x10eac30' in observe
with tempfile.TemporaryDirectory(prefix='aux-bookmark-expansion-replay-') as directory:
    subprocess.run(['git', 'apply', '--check', str(root / 'native.patch')], cwd=directory, check=True)
    subprocess.run(['git', 'apply', str(root / 'native.patch')], cwd=directory, check=True)
    for row in manifest['files']:
        assert row['baselineSha256'] is None and row['newFile']
        assert sha((Path(directory) / row['path']).read_bytes()) == row['outputSha256']
        assert sha((root / 'source' / row['path']).read_bytes()) == row['outputSha256']
code = (root / 'source/chrome/browser/ui/views/frame/aux_vertical_tab_bookmark_expansion.cc').read_text()
assert 'value.is_string()' in code and 'base::StringToInt64' in code
assert 'expanded_ids_.insert(id)' in code
assert 'ancestor && ancestor->is_folder()' in code
assert 'expanded_ids_.erase(folder->id())' in code
assert 'values.Append(base::NumberToString(id))' in code
assert 'rebuild_.Run(false)' in code and 'rebuild_.Run(true)' in code
assert 'RegisterListPref(kExpandedBookmarkFolderIdsPref)' in code
assert 'SetBoolean' not in code and 'RegisterBooleanPref' not in code
print('PASS: original reader/writer/registration/observer pins and 2-new-file replay; not compiled or mounted')
