"""Verify the exact158 API correction; no target compilation/execution."""
import hashlib
import json
from pathlib import Path
import re
import subprocess
import tempfile

root = Path(__file__).resolve().parent
manifest = json.loads((root / 'manifest.json').read_text())
pins = json.loads((root / 'platform-source-pins.json').read_text())

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

for row in pins['inputs']:
    assert sha(Path(row['path'])) == row['sha256'], row['path']
with tempfile.TemporaryDirectory(prefix='aux-agent-api155-') as directory:
    replay = Path(directory)
    subprocess.run(['git', 'init', '-q', directory], check=True)
    for row in manifest['files']:
        path = row['path']
        assert sha(root / 'baseline' / path) == row['baselineSha256']
        assert sha(root / 'source' / path) == row['outputSha256']
        out = replay / path
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_bytes((root / 'baseline' / path).read_bytes())
    subprocess.run(['git', 'apply', '--check', str(root / 'native.patch')], cwd=replay, check=True)
    subprocess.run(['git', 'apply', str(root / 'native.patch')], cwd=replay, check=True)
    for row in manifest['files']:
        assert sha(replay / row['path']) == row['outputSha256']

path = manifest['files'][0]['path']
before = (root / 'baseline' / path).read_text()
after = (root / 'source' / path).read_text()
def body(source, class_name, method):
    start = source.index('class ' + class_name + ' :')
    start = source.index(method, start)
    start = source.index('{', start)
    depth = 1
    end = start+1
    while depth:
        depth += (source[end] == '{') - (source[end] == '}')
        end += 1
    return re.sub(r'\s+', '', source[start:end])

for name in ['AgentTabsRow', 'AgentTabsCommandRow', 'AgentTabsButton']:
    assert body(before, name, 'void OnPaint(') == body(after, name, 'void PaintButtonContents(')
assert body(before, 'AgentTabsSeparator', 'void OnPaint(') == body(after, 'AgentTabsSeparator', 'void OnPaint(')
assert after.count('void PaintButtonContents(') == 3
assert after.count('void OnPaint(') == 1
assert 'base::ScopedObservation<TabStripModel,' not in after
assert after.count('model_->AddObserver(this);') == 2
assert after.count('TabStripModelObserver::StopObservingAll(this);') == 2
assert 'base::ScopedObservation<views::FocusManager' in after
assert 'public views::BubbleDialogDelegate,' in after
assert 'BubbleDialogDelegateView' not in after
assert 'contents_ = SetContentsView(std::make_unique<views::View>())' in after
assert 'CreateBubbleDeprecated(' in after
assert 'NATIVE_WIDGET_OWNS_WIDGET' in after
assert 'set_fixed_width(225)' in after
assert 'return gfx::Size(126, 28)' in after and after.count('return gfx::Size(217, 32)') == 2
assert after.count('rows_->RemoveAllChildViews();') == before.count('rows_->RemoveAllChildViews();')
assert after.count('owner.browser.get() == browser') == 1
headers = {Path(row['path']).name: Path(row['path']).read_text() for row in pins['inputs']}
assert 'void OnPaint(gfx::Canvas* canvas) final;' in headers['button.h']
assert 'virtual void PaintButtonContents(gfx::Canvas* canvas);' in headers['button.h']
paint = headers['button.cc'].split('void Button::OnPaint(gfx::Canvas* canvas) {')[1].split('}')[0]
assert paint.index('View::OnPaint(canvas)') < paint.index('PaintButtonContents(canvas)') < paint.index('PaintFocusPainter')
assert 'explicit ScopedObservation(TabStripModelObserver* observer) = delete;' in headers['tab_strip_model.h']
assert 'model->RemoveObserver(this);\n  OnTabStripModelDestroyed(model);' in headers['tab_strip_model_observer.cc']
print('Verified six158 API corrections, unchanged recovered paint bodies/geometry, native model observation and exact one-file replay. Native recompile remains integrator work.')
