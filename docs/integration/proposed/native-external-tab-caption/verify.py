from pathlib import Path
import contextlib
import hashlib
import io
import json
import runpy
import subprocess
import sys
import tempfile
root=Path(__file__).resolve().parent
sha=lambda b:hashlib.sha256(b).hexdigest()
evidence=json.loads((root/'source-evidence.json').read_text())
manifest=json.loads((root/'manifest.json').read_text())
assert sha(Path(evidence['arm64']['path']).read_bytes())==evidence['arm64']['sha256']
sys.argv=['decode',evidence['arm64']['path']]
with contextlib.redirect_stdout(io.StringIO()):
    d=runpy.run_path(str(root.parent/'native-popup-material/decode-selectors.py'))
for item in evidence['ranges']:
    assert sha(d['read'](int(item['rva'],16),item['bytes']))==item['sha256']
    assert sha((root/'evidence'/(item['name']+'.asm')).read_bytes())==item['assemblySha256']
for item in [*evidence['apiInputs'],evidence['providedUpstreamPolicy']]:
    assert sha((root/item['snapshotPath']).read_bytes())==item['sha256']
with tempfile.TemporaryDirectory(prefix='aux-caption-adapter-replay-') as temp:
    for item in manifest['files']:
        data=(root/'baseline'/item['path']).read_bytes()
        assert sha(data)==item['baselineSha256']
        f=Path(temp)/item['path'];f.parent.mkdir(parents=True,exist_ok=True);f.write_bytes(data)
    patch=str((root/'native.patch').resolve())
    subprocess.run(['git','apply','--check',patch],cwd=temp,check=True)
    subprocess.run(['git','apply',patch],cwd=temp,check=True)
    for item in manifest['files']:
        before=(root/'baseline'/item['path']).read_text()
        after=(root/'source'/item['path']).read_text()
        assert sha(after.encode())==item['outputSha256']
        assert sha((Path(temp)/item['path']).read_bytes())==item['outputSha256']
        # The untouched existing generic policy remains exact after this insertion.
        start='bool TabStripView::IsPositionInWindowCaption(const gfx::Point& point) {\n'
        end='\nviews::View* TabStripView::AddScrollViewContents('
        old=before.split(start,1)[1].split(end,1)[0]
        new=after.split(start,1)[1].split(end,1)[0]
        assert new.endswith(old)
        assert before.split(start,1)[0]==after.split(start,1)[0]
        assert before.split(end,1)[1]==after.split(end,1)[1]
print('PASS:4 original topology/focus ranges, API/source classification and one-file replay; existing default path exact. No native acceptance.')
